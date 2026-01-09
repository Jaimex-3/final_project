import { useEffect, useState } from "react";
import { fetchReportCheckins, fetchReportViolations, fetchSummary } from "../api/reports";

export default function Reports() {
  const [summary, setSummary] = useState<any>(null);
  const [checkins, setCheckins] = useState<any[]>([]);
  const [violations, setViolations] = useState<any[]>([]);

  useEffect(() => {
    fetchSummary().then(setSummary).catch(() => {});
    fetchReportCheckins({}).then(setCheckins).catch(() => {});
    fetchReportViolations().then(setViolations).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-800">Reports</h2>
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Check-ins", value: summary.total_checkins },
            { label: "Face mismatches", value: summary.face_mismatches },
            { label: "Seat mismatches", value: summary.seat_mismatches },
            { label: "Violations", value: summary.violations_count },
          ].map((c) => (
            <div key={c.label} className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-sm text-slate-500">{c.label}</div>
              <div className="text-xl font-semibold text-slate-900">
                {c.value}
              </div>
            </div>
          ))}
        </div>
      )}

      <section className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="font-semibold text-slate-800 mb-2">Check-ins</h3>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-left text-slate-600">
              <tr>
                <th className="px-3 py-2">Exam</th>
                <th className="px-3 py-2">Student</th>
                <th className="px-3 py-2">Face</th>
                <th className="px-3 py-2">Seat</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {checkins.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2">{c.exam_id}</td>
                  <td className="px-3 py-2">{c.student_id}</td>
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

      <section className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="font-semibold text-slate-800 mb-2">Violations</h3>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-left text-slate-600">
              <tr>
                <th className="px-3 py-2">Exam</th>
                <th className="px-3 py-2">Student</th>
                <th className="px-3 py-2">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {violations.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2">{v.exam_id}</td>
                  <td className="px-3 py-2">{v.student_id}</td>
                  <td className="px-3 py-2">{v.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
