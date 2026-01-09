import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import CheckIn from "../pages/CheckIn";
import Dashboard from "../pages/Dashboard";
import ExamDetail from "../pages/ExamDetail";
import Exams from "../pages/Exams";
import Login from "../pages/Login";
import Reports from "../pages/Reports";
import SeatingPlanBuilder from "../pages/SeatingPlanBuilder";
import Violations from "../pages/Violations";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = ({
  children,
  roles,
}: {
  children: JSX.Element;
  roles?: string[];
}) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

export default function Router() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route
          path="exams"
          element={
            <ProtectedRoute roles={["admin", "proctor"]}>
              <Exams />
            </ProtectedRoute>
          }
        />
        <Route
          path="exams/:id"
          element={
            <ProtectedRoute roles={["admin", "proctor"]}>
              <ExamDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="seating"
          element={
            <ProtectedRoute roles={["admin"]}>
              <SeatingPlanBuilder />
            </ProtectedRoute>
          }
        />
        <Route
          path="checkin"
          element={
            <ProtectedRoute roles={["proctor", "admin"]}>
              <CheckIn />
            </ProtectedRoute>
          }
        />
        <Route
          path="violations"
          element={
            <ProtectedRoute roles={["proctor", "admin"]}>
              <Violations />
            </ProtectedRoute>
          }
        />
        <Route
          path="reports"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Reports />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
