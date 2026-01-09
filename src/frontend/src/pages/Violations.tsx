import { useEffect, useState } from "react";
import { fetchViolations, submitViolation, updateViolation, deleteViolation } from "../api/violations";
import { fetchExams, Exam, fetchRoster } from "../api/exams";

type Violation = {
  id: number;
  exam_id: number;
  student_id: number;
  reason: string;
  notes?: string;
  checkin_id?: number;
  created_at?: string;
  exam?: { id: number; title: string; code: string };
  student?: { id: number; full_name: string; student_number: string };
};

type FormState = {
  exam_id: string;
  student_id: string;
  reason: string;
  notes: string;
  checkin_id: string;
  evidence?: File | null;
};

export default function Violations() {
  const [items, setItems] = useState<Violation[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [roster, setRoster] = useState<{ student_id: number; student: { full_name: string; student_number: string } }[]>([]);
  const [filterExamId, setFilterExamId] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Violation | null>(null);
  const [form, setForm] = useState<FormState>({
    exam_id: "",
    student_id: "",
    reason: "",
    notes: "",
    checkin_id: "",
    evidence: null,
  });

  useEffect(() => {
    fetchExams().then(setExams).catch(() => {});
  }, []);

  useEffect(() => {
    loadViolations();
  }, []);

  useEffect(() => {
    if (form.exam_id) {
      loadRoster(Number(form.exam_id));
    } else {
      setRoster([]);
    }
  }, [form.exam_id]);

  const loadRoster = (examId: number) => {
    fetchRoster(examId)
      .then(setRoster)
      .catch(() => setRoster([]));
  };

  const loadViolations = (examId?: number) => {
    fetchViolations(examId)
      .then(setItems)
      .catch(() => setItems([]));
  };

  const resetForm = () => {
    setForm({
      exam_id: "",
      student_id: "",
      reason: "",
      notes: "",
      checkin_id: "",
      evidence: null,
    });
    setEditing(null);
  };

  const openAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (violation: Violation) => {
    setEditing(violation);
    setForm({
      exam_id: String(violation.exam_id),
      student_id: String(violation.student_id),
      reason: violation.reason,
      notes: violation.notes || "",
      checkin_id: violation.checkin_id ? String(violation.checkin_id) : "",
      evidence: null,
    });
    setShowModal(true);
    loadRoster(violation.exam_id);
  };

  const handleDelete = async (violation: Violation) => {
    if (!window.confirm("Delete this violation?")) return;
    try {
      await deleteViolation(violation.id);
      loadViolations(filterExamId ? Number(filterExamId) : undefined);
    } catch {
      alert("Failed to delete violation");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.exam_id || !form.student_id || !form.reason) {
      alert("Exam, student, and reason are required.");
      return;
    }

    const payload: any = {
      exam_id: Number(form.exam_id),
      student_id: Number(form.student_id),
      reason: form.reason,
      notes: form.notes || undefined,
      checkin_id: form.checkin_id ? Number(form.checkin_id) : undefined,
      evidence: form.evidence || undefined,
    };

    setSaving(true);
    try {
      if (editing) {
        await updateViolation(editing.id, payload);
      } else {
        await submitViolation(payload);
      }
      setShowModal(false);
      resetForm();
      loadViolations(filterExamId ? Number(filterExamId) : undefined);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to save violation");
    } finally {
      setSaving(false);
    }
  };

  const handleFilterChange = (value: string) => {
    setFilterExamId(value);
    const examId = value ? Number(value) : undefined;
    loadViolations(examId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Violations</h2>
          <p className="text-sm text-slate-500">Add, edit, or remove reported violations.</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          New Violation
        </button>
      </div>

      <div className="flex gap-3 items-center">
        <label className="text-sm text-slate-600">Filter by exam:</label>
        <select
          className="border px-3 py-2 rounded text-sm"
          value={filterExamId}
          onChange={(e) => handleFilterChange(e.target.value)}
        >
          <option value="">All exams</option>
          {exams.map((exam) => (
            <option key={exam.id} value={exam.id}>
              {exam.title}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-left text-slate-600">
            <tr>
              <th className="px-3 py-2">Exam</th>
              <th className="px-3 py-2">Student</th>
              <th className="px-3 py-2">Reason</th>
              <th className="px-3 py-2">Notes</th>
              <th className="px-3 py-2">Created</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-slate-500">
                  No violations found.
                </td>
              </tr>
            ) : (
              items.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2">
                    {v.exam?.title ? `${v.exam.title} (${v.exam.code})` : v.exam_id}
                  </td>
                  <td className="px-3 py-2">
                    {v.student?.full_name
                      ? `${v.student.full_name} (${v.student.student_number})`
                      : v.student_id}
                  </td>
                  <td className="px-3 py-2">{v.reason}</td>
                  <td className="px-3 py-2">{v.notes || "-"}</td>
                  <td className="px-3 py-2">{v.created_at ? v.created_at.slice(0, 16).replace("T", " ") : "-"}</td>
                  <td className="px-3 py-2 text-right space-x-2">
                    <button
                      onClick={() => openEdit(v)}
                      className="text-emerald-600 hover:text-emerald-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(v)}
                      className="text-rose-600 hover:text-rose-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800">
                  {editing ? "Edit Violation" : "New Violation"}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-700">
                  Close
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Exam</label>
                  <select
                    required
                    value={form.exam_id}
                    onChange={(e) => setForm({ ...form, exam_id: e.target.value, student_id: "" })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2"
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Student</label>
                  {roster.length > 0 ? (
                    <select
                      required
                      value={form.student_id}
                      onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2"
                      disabled={!form.exam_id}
                    >
                      <option value="">Select student</option>
                      {roster.map((r) => (
                        <option key={r.student_id} value={r.student_id}>
                          {r.student.full_name} ({r.student.student_number})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      required
                      type="number"
                      value={form.student_id}
                      onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2"
                      placeholder="Enter student ID"
                    />
                  )}
                  {roster.length === 0 && (
                    <p className="text-xs text-slate-500 mt-1">
                      Enter a student ID (roster unavailable for this exam).
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                  <input
                    required
                    type="text"
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Checkin ID (optional)</label>
                  <input
                    type="number"
                    value={form.checkin_id}
                    onChange={(e) => setForm({ ...form, checkin_id: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2"
                    placeholder="Link to a check-in"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Evidence (optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setForm({ ...form, evidence: e.target.files?.[0] || null })}
                    className="w-full"
                  />
                  {editing && !form.evidence && (
                    <p className="text-xs text-slate-500 mt-1">Leave empty to keep existing evidence.</p>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
