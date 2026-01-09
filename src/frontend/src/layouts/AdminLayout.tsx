import { Outlet } from "react-router-dom";
import Sidebar from "../components/Layout/Sidebar";
import Topbar from "../components/Layout/Topbar";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
