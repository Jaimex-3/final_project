import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchStudents, createStudent, updateStudent, deleteStudent, uploadStudentPhoto, Student } from "../api/students";

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  // ... rest of state
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    student_no: "",
    full_name: "",
    email: "",
  });

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async (query?: string) => {
    setLoading(true);
    try {
      const data = await fetchStudents(query);
      setStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadStudents(search);
  };

  const openAdd = () => {
    setEditingStudent(null);
    setFormData({ student_no: "", full_name: "", email: "" });
    setShowModal(true);
  };

  const openEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      student_no: student.student_number,
      full_name: student.full_name,
      email: student.email || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      await deleteStudent(id);
      loadStudents(search);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete student");
    }
  };

  const handleUploadPhoto = async (id: number, file: File) => {
    try {
      await uploadStudentPhoto(id, file);
      alert("Photo uploaded successfully.");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to upload photo");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await updateStudent(editingStudent.id, formData);
      } else {
        await createStudent(formData);
      }
      setShowModal(false);
      loadStudents(search);
    } catch (err: any) {
      alert(err.response?.data?.errors?.student_no || err.response?.data?.message || "Failed to save student");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Students</h2>
        <button
          onClick={openAdd}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Add Student
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or student number..."
            className="flex-1 border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            className="bg-slate-800 text-white px-6 py-2 rounded-lg hover:bg-slate-900 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-slate-100 text-left text-sm text-slate-600">
            <tr>
              <th className="px-4 py-3">Student #</th>
              <th className="px-4 py-3">Full Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">Loading...</td></tr>
            ) : students.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No students found.</td></tr>
            ) : (
              students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{student.student_number}</td>
                  <td className="px-4 py-3">{student.full_name}</td>
                  <td className="px-4 py-3 text-slate-500">{student.email || "-"}</td>
                  <td className="px-4 py-3 text-right space-x-2 flex justify-end items-center">
                    <Link
                      to={`/students/${student.id}`}
                      className="text-blue-600 hover:text-blue-700 font-medium text-xs border border-blue-200 rounded px-2 py-1 hover:bg-blue-50"
                    >
                      Photos ({student.photos?.length || 0})
                    </Link>
                    <button
                      onClick={() => openEdit(student)}
                      className="text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(student.id)}
                      className="text-rose-600 hover:text-rose-700 font-medium"
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">
                {editingStudent ? "Edit Student" : "Add New Student"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Student Number</label>
                  <input
                    required
                    type="text"
                    value={formData.student_no}
                    onChange={(e) => setFormData({ ...formData, student_no: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    required
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Save Student
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
