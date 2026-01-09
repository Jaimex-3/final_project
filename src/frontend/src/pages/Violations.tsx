import { useEffect, useState } from "react";
import { fetchViolations } from "../api/violations";

export default function Violations() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    fetchViolations().then(setItems).catch(() => {});
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-800">Violations</h2>
      <div className="bg-white rounded-lg shadow-sm overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-left text-slate-600">
            <tr>
              <th className="px-3 py-2">Exam</th>
              <th className="px-3 py-2">Student</th>
              <th className="px-3 py-2">Reason</th>
              <th className="px-3 py-2">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((v) => (
              <tr key={v.id} className="hover:bg-slate-50">
                <td className="px-3 py-2">{v.exam_id}</td>
                <td className="px-3 py-2">{v.student_id}</td>
                <td className="px-3 py-2">{v.reason}</td>
                <td className="px-3 py-2">{v.notes || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
