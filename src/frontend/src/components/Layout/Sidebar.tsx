import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const navItems = [
  { to: "/", label: "Dashboard", roles: ["admin", "proctor"] },
  { to: "/exams", label: "Exams", roles: ["admin", "proctor"] },
  { to: "/students", label: "Students", roles: ["admin"] },
  { to: "/rooms", label: "Rooms", roles: ["admin"] },
  { to: "/seating", label: "Seating Plan", roles: ["admin"] },
  { to: "/checkin", label: "Check-in", roles: ["admin", "proctor"] },
  { to: "/violations", label: "Violations", roles: ["admin", "proctor"] },
  { to: "/reports", label: "Reports", roles: ["admin"] },
];

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="bg-slate-900 text-white w-64 min-h-screen p-4">
      <div className="text-xl font-bold mb-6">Exam Security</div>
      <nav className="space-y-2">
        {navItems
          .filter((item) => !user || item.roles.includes(user.role))
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block px-3 py-2 rounded ${
                  isActive ? "bg-slate-700" : "hover:bg-slate-800"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
      </nav>
    </aside>
  );
}
