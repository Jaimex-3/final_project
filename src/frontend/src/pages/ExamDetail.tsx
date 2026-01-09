import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchExam } from "../api/exams";
import { fetchCheckins } from "../api/checkins";

export default function ExamDetail() {
  const { id } = useParams();
  const [exam, setExam] = useState<any | null>(null);
  const [checkins, setCheckins] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    fetchExam(id).then(setExam).catch(() => {});
    fetchCheckins(Number(id)).then(setCheckins).catch(() => {});
  }, [id]);

  if (!exam) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">{exam.title}</h2>
        <div className="text-sm text-slate-600">
          {exam.start_at} - {exam.end_at}
        </div>
      </div>

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
              {checkins.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2">{c.student_id}</td>
                  <td className="px-3 py-2">{c.seat_code_entered}</td>
                  <td className="px-3 py-2">
                    {c.is_face_match ? "Match" : "Mismatch"}
                  </td>
                  <td className="px-3 py-2">{c.is_seat_ok ? "OK" : "Wrong"}</td>
                  <td className="px-3 py-2">{c.decision_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
