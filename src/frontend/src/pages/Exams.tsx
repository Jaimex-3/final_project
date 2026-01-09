import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchExams } from "../api/exams";

export default function Exams() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    fetchExams().then(setItems).catch(() => {});
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-800">Exams</h2>
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-slate-100 text-left text-sm text-slate-600">
            <tr>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Start</th>
              <th className="px-4 py-2">End</th>
              <th className="px-4 py-2">Room</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {items.map((exam) => (
              <tr key={exam.id} className="hover:bg-slate-50">
                <td className="px-4 py-2">
                  <Link
                    to={`/exams/${exam.id}`}
                    className="text-emerald-600 hover:underline"
                  >
                    {exam.title}
                  </Link>
                </td>
                <td className="px-4 py-2">{exam.start_at}</td>
                <td className="px-4 py-2">{exam.end_at}</td>
                <td className="px-4 py-2">{exam.room?.name || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
