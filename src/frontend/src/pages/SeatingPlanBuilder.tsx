import { useEffect, useMemo, useState } from "react";
import {
  assignSeats,
  createSeatingPlan,
  fetchRoster,
  fetchSeatAssignments,
  fetchSeatingPlan,
  Seat,
} from "../api/seating";
import { fetchExams, Exam } from "../api/exams";
import SeatingGrid from "../components/seating/SeatingGrid";
import { formatDateTimeDisplay } from "../utils/datetime";

type RosterEntry = {
  student_id: number;
  student: { full_name: string; student_number: string };
};

export default function SeatingPlanBuilder() {
  const [examId, setExamId] = useState("");
  const [exams, setExams] = useState<Exam[]>([]);
  const [mode, setMode] = useState<"grid" | "manual">("grid");
  const [rows, setRows] = useState(4);
  const [cols, setCols] = useState(5);
  const [seatCodes, setSeatCodes] = useState("");
  const [seats, setSeats] = useState<Seat[]>([]);
  const [assignments, setAssignments] = useState<Record<string, number>>({});
  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSeat, setSelectedSeat] = useState<string>();
  const [selectedStudent, setSelectedStudent] = useState<string>();
  const [message, setMessage] = useState("");

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
    fetchExams().then(setExams).catch(console.error);
  }, []);

  useEffect(() => {
    if (!examId) return;
    loadPlanAndAssignments();
    fetchRoster(Number(examId))
      .then(setRoster)
      .catch(() => setRoster([]));
  }, [examId]);

  const generateSeats = () => {
    if (mode === "grid") {
      const list: Seat[] = [];
      for (let r = 0; r < rows; r++) {
        const rowLabel = lettersForIndex(r);
        for (let c = 0; c < cols; c++) {
          list.push({
            seat_code: `${rowLabel}${c + 1}`,
            row_number: r + 1,
            col_number: c + 1,
          });
        }
      }
      setSeats(list);
    } else {
      const list = seatCodes
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean)
        .map((code) => ({ seat_code: code }));
      setSeats(list);
    }
  };

  const loadPlanAndAssignments = async () => {
    try {
      const plan = await fetchSeatingPlan(Number(examId));
      setSeats(plan.seats || []);
    } catch {
      setSeats([]);
    }
    try {
      const sa = await fetchSeatAssignments(Number(examId));
      const map: Record<string, number> = {};
      sa.forEach((item: any) => {
        map[item.seat_code] = item.student_id;
      });
      setAssignments(map);
    } catch {
      setAssignments({});
    }
  };

  const handleSavePlan = async () => {
    if (!examId) {
      setMessage("Exam ID is required.");
      return;
    }
    const payload =
      mode === "grid"
        ? { rows, cols }
        : { seat_codes: seatCodes.split(",").map((s) => s.trim()).filter(Boolean) };
    try {
      const plan = await createSeatingPlan(Number(examId), payload);
      setSeats(plan.seats || []);
      setMessage("Seating plan saved.");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to save plan.";
      const errs = err?.response?.data?.errors;
      setMessage(errs ? `${msg} ${JSON.stringify(errs)}` : msg);
    }
  };

  const handleAssign = () => {
    if (!selectedSeat || !selectedStudent) return;
    setAssignments((prev) => ({
      ...prev,
      [selectedSeat]: Number(selectedStudent),
    }));
    setSelectedSeat(undefined);
    setSelectedStudent(undefined);
  };

  const handleSaveAssignments = async () => {
    if (!examId) {
      setMessage("Exam ID is required.");
      return;
    }
    const payload = Object.entries(assignments).map(([seat_code, student_id]) => ({
      seat_code,
      student_id,
    }));
    try {
      await assignSeats(Number(examId), payload);
      setMessage("Seat assignments saved.");
    } catch (err: any) {
      setMessage(err?.response?.data?.message || "Failed to assign seats.");
    }
  };

  const assignmentsWithNames = useMemo(() => {
    const map: Record<string, string> = {};
    const rosterMap = Object.fromEntries(
      roster.map((r) => [r.student_id, `${r.student.full_name} (${r.student.student_number})`])
    );
    Object.entries(assignments).forEach(([seat, studentId]) => {
      map[seat] = rosterMap[studentId] || `Student ${studentId}`;
    });
    return map;
  }, [assignments, roster]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Seating Plan</h2>
        <div className="flex items-center gap-3 w-1/3">
          <select
            className="border px-3 py-2 rounded text-sm w-full"
            value={examId}
            onChange={(e) => setExamId(e.target.value)}
          >
            <option value="">Select Exam</option>
            {exams.map((exam) => {
              const startLabel = formatDateTimeDisplay(exam.start_at) || "No schedule";
              return (
                <option key={exam.id} value={exam.id}>
                  {exam.title} ({startLabel})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {message && <div className="text-sm text-emerald-700">{message}</div>}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={mode === "grid"}
                onChange={() => setMode("grid")}
              />
              Rows/Cols
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={mode === "manual"}
                onChange={() => setMode("manual")}
              />
              Manual seat codes
            </label>
          </div>

          {mode === "grid" ? (
            <div className="grid grid-cols-2 gap-4 max-w-md">
              <div>
                <label className="text-sm text-slate-600">Rows</label>
                <input
                  type="number"
                  className="w-full border px-3 py-2 rounded"
                  value={rows}
                  min={1}
                  onChange={(e) => setRows(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-sm text-slate-600">Columns</label>
                <input
                  type="number"
                  className="w-full border px-3 py-2 rounded"
                  value={cols}
                  min={1}
                  onChange={(e) => setCols(Number(e.target.value))}
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="text-sm text-slate-600">
                Seat codes (comma separated)
              </label>
              <textarea
                className="w-full border px-3 py-2 rounded h-24"
                value={seatCodes}
                onChange={(e) => setSeatCodes(e.target.value)}
                placeholder="A1,A2,B1,B2"
              />
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={generateSeats}
              className="px-4 py-2 bg-slate-200 text-slate-800 rounded"
            >
              Preview
            </button>
            <button
              type="button"
              onClick={handleSavePlan}
              className="px-4 py-2 bg-emerald-600 text-white rounded shadow hover:bg-emerald-700"
            >
              Save Seating Plan
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Seat Assignments</h3>
            <button
              onClick={handleSaveAssignments}
              className="px-3 py-2 text-sm bg-emerald-600 text-white rounded"
            >
              Save Assignments
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <select
                className="border px-3 py-2 rounded w-1/2"
                value={selectedSeat || ""}
                onChange={(e) => setSelectedSeat(e.target.value)}
              >
                <option value="">Select seat</option>
                {seats.map((s) => (
                  <option key={s.seat_code} value={s.seat_code}>
                    {s.seat_code}
                  </option>
                ))}
              </select>
              <div className="flex-1">
                <input
                  className="border px-3 py-2 rounded w-full text-sm mb-1"
                  placeholder="Search student"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select
                  className="border px-3 py-2 rounded w-full"
                  value={selectedStudent || ""}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                >
                  <option value="">Select student</option>
                  {filteredRoster.map((r) => (
                    <option key={r.student_id} value={r.student_id}>
                      {r.student.full_name} ({r.student.student_number})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAssign}
                className="px-3 py-2 text-sm bg-slate-800 text-white rounded"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Preview</h3>
          <div className="text-sm text-slate-500">{seats.length} seats</div>
        </div>
        <SeatingGrid
          seats={seats}
          selectedSeat={selectedSeat}
          onSelect={setSelectedSeat}
          assignments={assignmentsWithNames}
        />
      </div>
    </div>
  );
}

function lettersForIndex(idx: number): string {
  let letters = "";
  while (true) {
    letters = String.fromCharCode(65 + (idx % 26)) + letters;
    idx = Math.floor(idx / 26) - 1;
    if (idx < 0) break;
  }
  return letters;
}
