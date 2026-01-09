import { FormEvent, useEffect, useMemo, useState } from "react";
import { submitCheckin } from "../api/checkins";
import { fetchExams } from "../api/exams";
import { fetchRoster } from "../api/seating";
import { submitViolation } from "../api/violations";

type ExamOption = { id: number; title: string };
type RosterItem = { student_id: number; student: { full_name: string; student_number: string } };

export default function CheckIn() {
  const [exams, setExams] = useState<ExamOption[]>([]);
  const [examId, setExamId] = useState<string>("");
  const [roster, setRoster] = useState<RosterItem[]>([]);
  const [search, setSearch] = useState("");
  const [studentId, setStudentId] = useState<string>("");
  const [seatCode, setSeatCode] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loggingViolation, setLoggingViolation] = useState(false);

  const filteredRoster = useMemo(
    () =>
      roster.filter((r) =>
        `${r.student.full_name} ${r.student.student_number}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [roster, search]
  );

  useEffect(() => {
    fetchExams()
      .then((items) => setExams(items || []))
      .catch(() => setExams([]));
  }, []);

  useEffect(() => {
    if (!examId) return;
    fetchRoster(Number(examId))
      .then((items) => setRoster(items || []))
      .catch(() => setRoster([]));
  }, [examId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    setResult(null);
    if (!photo) {
      setMessage("Photo is required");
      return;
    }
    setLoading(true);
    try {
      const res = await submitCheckin({
        exam_id: Number(examId),
        student_id: Number(studentId),
        entered_seat_code: seatCode,
        photo,
      });
      setResult(res);
      setMessage(`Check-in ${res.decision_status || ""}`.trim());
    } catch (err: any) {
      setMessage(err?.response?.data?.message || "Failed to check in");
    } finally {
      setLoading(false);
    }
  };

  const handleLogViolation = async () => {
    if (!result) return;
    setLoggingViolation(true);
    try {
      await submitViolation({
        exam_id: result.exam_id,
        student_id: result.student_id,
        checkin_id: result.id,
        reason: "proctor_flag",
        notes: "Logged from check-in screen",
      });
      setMessage("Violation logged.");
    } catch (err: any) {
      setMessage(err?.response?.data?.message || "Failed to log violation");
    } finally {
      setLoggingViolation(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-800">Check-in</h2>
      {message && <div className="text-sm text-emerald-700">{message}</div>}
      <div className="grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-sm p-4 space-y-3"
        >
          <div>
            <label className="text-sm text-slate-600">Exam</label>
            <select
              className="w-full border px-3 py-2 rounded"
              value={examId}
              onChange={(e) => setExamId(e.target.value)}
              required
            >
              <option value="">Select exam</option>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-600">Student</label>
            <input
              className="w-full border px-3 py-2 rounded text-sm mb-2"
              placeholder="Search student"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="w-full border px-3 py-2 rounded"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
            >
              <option value="">Select student</option>
              {filteredRoster.map((r) => (
                <option key={r.student_id} value={r.student_id}>
                  {r.student.full_name} ({r.student.student_number})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-600">Entered Seat Code</label>
            <input
              className="w-full border px-3 py-2 rounded"
              value={seatCode}
              onChange={(e) => setSeatCode(e.target.value.toUpperCase())}
              placeholder="e.g. A1"
            />
          </div>
          <div>
            <label className="text-sm text-slate-600">Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files?.[0] || null)}
              className="w-full"
              required
            />
          </div>
          <button
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>

        <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Result</h3>
            {result && (
              <button
                onClick={handleLogViolation}
                className="text-sm px-3 py-1.5 bg-slate-900 text-white rounded"
                disabled={loggingViolation}
              >
                {loggingViolation ? "Logging..." : "Log Violation"}
              </button>
            )}
          </div>
          {result ? (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <ResultCard
                label="Face Match"
                value={result.is_face_match ? "Yes" : "No"}
                tone={result.is_face_match}
                extra={result.score ? `Score: ${Number(result.score).toFixed(3)}` : "Score: n/a"}
              />
              <ResultCard
                label="Seat OK"
                value={result.is_seat_ok ? "Yes" : "No"}
                tone={result.is_seat_ok}
                extra={result.seat_code_entered || ""}
              />
              <ResultCard
                label="Decision"
                value={result.decision_status}
                tone={result.decision_status === "approved"}
              />
              <ResultCard
                label="Check-in Time"
                value={result.checked_in_at || ""}
              />
            </div>
          ) : (
            <div className="text-sm text-slate-500">Submit a check-in to see results.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultCard({
  label,
  value,
  tone,
  extra,
}: {
  label: string;
  value: string;
  tone?: boolean;
  extra?: string;
}) {
  return (
    <div
      className={`border rounded-lg p-3 ${
        tone === undefined ? "border-slate-200" : tone ? "border-emerald-400" : "border-amber-400"
      }`}
    >
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-lg font-semibold text-slate-900">{value}</div>
      {extra && <div className="text-xs text-slate-500 mt-1">{extra}</div>}
    </div>
  );
}
