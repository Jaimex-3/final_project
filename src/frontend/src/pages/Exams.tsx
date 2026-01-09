import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchExams, createExam, updateExam, deleteExam, Exam, ExamPayload } from "../api/exams";
import ExamForm from "../components/forms/ExamForm";
import { useAuth } from "../hooks/useAuth";
import { extractDateAndTime } from "../utils/datetime";

export default function Exams() {
  const { user } = useAuth();
  const [items, setItems] = useState<Exam[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = () => {
    fetchExams().then(setItems).catch(() => {});
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this exam?")) return;
    try {
      await deleteExam(id);
      loadExams();
    } catch (err) {
      alert("Failed to delete exam");
    }
  };

  const handleSave = async (data: ExamPayload) => {
    try {
      if (editingExam) {
        await updateExam(editingExam.id, data);
      } else {
        await createExam(data);
      }
      setShowModal(false);
      loadExams();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save exam");
    }
  };

  const openAdd = () => {
    setEditingExam(null);
    setShowModal(true);
  };

  const openEdit = (exam: Exam) => {
    setEditingExam(exam);
    setShowModal(true);
  };

  const isAdmin = user?.role === "admin";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Exams</h2>
        {isAdmin && (
          <button
            onClick={openAdd}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Add Exam
          </button>
        )}
      </div>
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-slate-100 text-left text-sm text-slate-600">
            <tr>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Start Time</th>
              <th className="px-4 py-2">End Time</th>
              <th className="px-4 py-2">Room</th>
              {isAdmin && <th className="px-4 py-2 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {items.map((exam) => {
              const { date, time: startTime } = extractDateAndTime(exam.start_at);
              const { time: endTime } = extractDateAndTime(exam.end_at);

              return (
                <tr key={exam.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2">
                    <Link
                      to={`/exams/${exam.id}`}
                      className="text-emerald-600 hover:underline"
                    >
                      {exam.title}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{date || "-"}</td>
                  <td className="px-4 py-2">{startTime || "-"}</td>
                  <td className="px-4 py-2">{endTime || "-"}</td>
                  <td className="px-4 py-2">{exam.room?.name || "-"}</td>
                  {isAdmin && (
                    <td className="px-4 py-2 text-right space-x-2">
                      <button
                        onClick={() => openEdit(exam)}
                        className="text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(exam.id)}
                        className="text-rose-600 hover:text-rose-700 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <ExamForm
          initialData={editingExam}
          onSubmit={handleSave}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
