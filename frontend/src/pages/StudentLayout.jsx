import { Outlet, Navigate } from "react-router-dom";
import StudentSidebar from "../components/StudentSidebar";
import StudentNavbar from "../components/StudentNavbar";
import { useAuth } from "../context/AuthContext";

const StudentLayout = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="grid min-h-screen place-items-center">Loading...</div>;

  if (!user || user.role !== "Student") {
    return <Navigate to="/user/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-[1400px] gap-4 px-4 py-6 md:px-8">
        <StudentSidebar />
        <div className="flex-1 overflow-hidden flex flex-col min-h-[80vh]">
          <StudentNavbar />
          <main className="flex-1 rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default StudentLayout;
