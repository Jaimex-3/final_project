import { useAuth } from "../../hooks/useAuth";

export default function Topbar() {
  const { user, logout } = useAuth();
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
      <h1 className="text-lg font-semibold text-slate-800">Control Panel</h1>
      <div className="flex items-center space-x-4">
        <div className="text-sm text-slate-600">
          {user?.full_name} ({user?.role})
        </div>
        <button
          onClick={logout}
          className="px-3 py-1.5 rounded bg-slate-900 text-white text-sm hover:bg-slate-800"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
