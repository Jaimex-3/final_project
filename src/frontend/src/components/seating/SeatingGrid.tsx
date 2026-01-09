import React from "react";
import { Seat } from "../../api/seating";

type Props = {
  seats: Seat[];
  selectedSeat?: string;
  assignments?: Record<string, string>;
  onSelect?: (seatCode: string) => void;
};

export default function SeatingGrid({
  seats,
  selectedSeat,
  assignments = {},
  onSelect,
}: Props) {
  if (!seats.length) {
    return <div className="text-sm text-slate-500">No seats defined.</div>;
  }

  const columns =
    seats.reduce(
      (max, seat) => Math.max(max, seat.col_number || 0),
      0
    ) || Math.min(seats.length, 8);

  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${columns || 5}, minmax(72px, 1fr))` }}
    >
      {seats.map((seat) => {
        const assigned = assignments[seat.seat_code];
        const isSelected = selectedSeat === seat.seat_code;
        return (
          <button
            key={seat.seat_code}
            type="button"
            onClick={() => onSelect && onSelect(seat.seat_code)}
            className={`border rounded-md p-2 text-sm text-left transition ${
              isSelected ? "border-emerald-500 ring-2 ring-emerald-300" : "border-slate-200"
            } ${assigned ? "bg-emerald-50" : "bg-white"}`}
          >
            <div className="font-semibold text-slate-800">{seat.seat_code}</div>
            {assigned && (
              <div className="text-xs text-emerald-700 truncate">→ {assigned}</div>
            )}
          </button>
        );
      })}
    </div>
  );
}
