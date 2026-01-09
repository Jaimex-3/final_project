import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Student, uploadStudentPhoto } from "../api/students";
import client from "../api/client";
import { getUploadUrl } from "../api/common";

interface StudentDetailData extends Student {
  photos: { id: number; image_path: string; created_at: string }[];
}

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (id) loadStudent();
  }, [id]);

  const loadStudent = async () => {
    try {
      const { data } = await client.get(`/api/admin/students/${id}`);
      setStudent(data);
    } catch {
      alert("Failed to load student");
      navigate("/students");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !id) return;
    setUploading(true);
    try {
      await uploadStudentPhoto(Number(id), e.target.files[0]);
      await loadStudent();
    } catch {
      alert("Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  if (loading || !student) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">{student.full_name}</h2>
        <button
          onClick={() => navigate("/students")}
          className="text-slate-600 hover:text-slate-800"
        >
          Back to Students
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          <div>
            <span className="text-slate-500 block">Student Number</span>
            <span className="font-medium text-lg">{student.student_number}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Email</span>
            <span className="font-medium text-lg">{student.email || "-"}</span>
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Reference Photos</h3>
            <label className={`cursor-pointer bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
              {uploading ? "Uploading..." : "Upload New Photo"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={handleUpload}
              />
            </label>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {student.photos && student.photos.length > 0 ? (
              student.photos.map((photo) => (
                <div key={photo.id} className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200 group">
                  <img
                    src={getUploadUrl(photo.image_path)}
                    alt="Reference"
                    className="w-full h-full object-cover"
                  />
                  {/* Future: Add delete button here */}
                </div>
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                No reference photos uploaded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
