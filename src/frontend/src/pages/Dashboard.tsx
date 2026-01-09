import { useEffect, useState } from "react";
import { fetchSummary } from "../api/reports";

export default function Dashboard() {
  const [summary, setSummary] = useState({
    total_checkins: 0,
    face_mismatches: 0,
    seat_mismatches: 0,
    violations_count: 0,
  });

  useEffect(() => {
    fetchSummary().then(setSummary).catch(() => {});
  }, []);

  const cards = [
    { label: "Total Check-ins", value: summary.total_checkins },
    { label: "Face mismatches", value: summary.face_mismatches },
    { label: "Seat mismatches", value: summary.seat_mismatches },
    { label: "Violations", value: summary.violations_count },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-800">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-slate-500">{c.label}</div>
            <div className="text-2xl font-bold text-slate-900">{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
