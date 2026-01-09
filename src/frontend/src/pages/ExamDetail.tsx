import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchExam, fetchRoster, addStudentToRoster, removeStudentFromRoster } from "../api/exams";
import { fetchCheckins } from "../api/checkins";
import { fetchStudents, Student } from "../api/students";
import { useAuth } from "../hooks/useAuth";
import { formatDateTimeDisplay } from "../utils/datetime";

export default function ExamDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [exam, setExam] = useState<any | null>(null);
  const [checkins, setCheckins] = useState<any[]>([]);
  const [roster, setRoster] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<number>>(new Set());
  const [searchTerm, setSearch] = useState("");
  const [rosterLoading, setRosterLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const examId = Number(id);
    fetchExam(id).then(setExam).catch(() => {});
    fetchCheckins(examId).then(setCheckins).catch(() => {});
    loadRoster(examId);
    if (user?.role === "admin") {
      fetchStudents().then(setAllStudents).catch(() => {});
    }
  }, [id, user]);

  const loadRoster = (examId: number) => {
    setRosterLoading(true);
    fetchRoster(examId)
      .then(setRoster)
      .catch(() => {})
      .finally(() => setRosterLoading(false));
  };

  const handleAddSelected = async () => {
    if (!id || selectedStudentIds.size === 0) return;
    const examId = Number(id);
    try {
      // Execute sequentially or parallel
      await Promise.all(Array.from(selectedStudentIds).map(sid => addStudentToRoster(examId, sid)));
      loadRoster(examId);
      setSelectedStudentIds(new Set());
    } catch (err: any) {
      alert("Some students could not be added.");
    }
  };

  const toggleSelection = (studentId: number) => {
    const newSet = new Set(selectedStudentIds);
    if (newSet.has(studentId)) {
      newSet.delete(studentId);
    } else {
      newSet.add(studentId);
    }
    setSelectedStudentIds(newSet);
  };

  const handleRemoveStudent = async (studentId: number) => {
    if (!id || !window.confirm("Remove student from roster?")) return;
    try {
      await removeStudentFromRoster(Number(id), studentId);
      loadRoster(Number(id));
    } catch (err: any) {
      alert("Failed to remove student.");
    }
  };

  if (!exam) return <div>Loading...</div>;

  const isAdmin = user?.role === "admin";
  const startDisplay = formatDateTimeDisplay(exam.start_at) || "-";
  const endDisplay = formatDateTimeDisplay(exam.end_at) || "-";

  // Filter students not already in roster
  const availableStudents = allStudents
    .filter((s) => !roster.some((r) => r.student_id === s.id))
    .filter((s) => 
      s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.student_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">{exam.title}</h2>
          <div className="text-sm text-slate-500">
            {exam.code} • {exam.room?.name}
          </div>
        </div>
        <div className="text-sm text-slate-600 text-right">
          <div>{startDisplay}</div>
          <div>{endDisplay}</div>
        </div>
      </div>

      {isAdmin && (
        <section className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="font-semibold text-slate-800 mb-4">Manage Roster</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Add Students Panel */}
            <div className="border rounded-lg p-3 flex flex-col h-80">
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Available Students</h4>
              <input 
                type="text" 
                placeholder="Search..." 
                className="border px-2 py-1 rounded text-sm mb-2"
                value={searchTerm}
                onChange={e => setSearch(e.target.value)}
              />
              <div className="flex-1 overflow-y-auto space-y-1 border-t pt-2">
                {availableStudents.length === 0 ? (
                  <div className="text-sm text-slate-400 text-center py-4">No students found</div>
                ) : (
                  availableStudents.map(s => (
                    <label key={s.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={selectedStudentIds.has(s.id)}
                        onChange={() => toggleSelection(s.id)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="text-sm">
                        <div className="font-medium text-slate-800">{s.full_name}</div>
                        <div className="text-xs text-slate-500">{s.student_number}</div>
                      </div>
                    </label>
                  ))
                )}
              </div>
              <div className="pt-3 mt-auto border-t">
                <button
                  onClick={handleAddSelected}
                  disabled={selectedStudentIds.size === 0}
                  className="w-full bg-emerald-600 text-white px-4 py-2 rounded text-sm hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Selected ({selectedStudentIds.size})
                </button>
              </div>
            </div>

            {/* Current Roster Panel */}
            <div className="border rounded-lg p-3 flex flex-col h-80">
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Current Roster ({roster.length})</h4>
              <div className="flex-1 overflow-y-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-left sticky top-0">
                    <tr>
                      <th className="px-3 py-2">ID</th>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rosterLoading ? (
                      <tr><td colSpan={3} className="p-4 text-center">Loading...</td></tr>
                    ) : roster.length === 0 ? (
                      <tr><td colSpan={3} className="p-4 text-center text-slate-500">Empty roster.</td></tr>
                    ) : (
                      roster.map((r) => (
                        <tr key={r.student_id}>
                          <td className="px-3 py-2 text-slate-600">{r.student.student_number}</td>
                          <td className="px-3 py-2 font-medium text-slate-800">{r.student.full_name}</td>
                          <td className="px-3 py-2 text-right">
                            <button
                              onClick={() => handleRemoveStudent(r.student_id)}
                              className="text-rose-600 hover:text-rose-800 text-xs px-2 py-1 rounded hover:bg-rose-50"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="font-semibold text-slate-800 mb-2">Check-ins</h3>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-left text-slate-600">
              <tr>
                <th className="px-3 py-2">Student</th>
                <th className="px-3 py-2">Seat</th>
                <th className="px-3 py-2">Face</th>
                <th className="px-3 py-2">Seat OK</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {checkins.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center text-slate-500">No check-ins yet.</td></tr>
              ) : (
                checkins.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2">{c.student_id}</td>
                    <td className="px-3 py-2">{c.seat_code_entered}</td>
                    <td className="px-3 py-2">
                      {c.is_face_match ? "Match" : "Mismatch"}
                    </td>
                    <td className="px-3 py-2">{c.is_seat_ok ? "OK" : "Wrong"}</td>
                    <td className="px-3 py-2">{c.decision_status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
