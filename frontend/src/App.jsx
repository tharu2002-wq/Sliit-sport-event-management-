import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { useAuth } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import Societies from "./pages/Societies";
import AddSociety from "./pages/AddSociety";
import EditSociety from "./pages/EditSociety";
import SocietyDetails from "./pages/SocietyDetails";
import Members from "./pages/Members";
import Teams from "./pages/Teams";
import Schedules from "./pages/Schedules";
import UserLanding from "./pages/UserLanding";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserAuth from "./pages/UserAuth";
import StudentLayout from "./pages/StudentLayout";
import StudentTeams from "./pages/StudentTeams";
import StudentEvents from "./pages/StudentEvents";
import StudentMatches from "./pages/StudentMatches";
import StudentPlayers from "./pages/StudentPlayers";
import StudentLeaderboard from "./pages/StudentLeaderboard";
import StudentProfile from "./pages/StudentProfile";
import TeamDetails from "./pages/TeamDetails";

const Layout = () => {
  return (
    <div className="min-h-screen bg-layer px-4 py-4 md:px-8 md:py-6">
      <div className="mx-auto max-w-7xl">
        <Navbar />
        <div className="grid gap-4 md:grid-cols-[250px,1fr] md:gap-6">
          <Sidebar />
          <main className="glass-panel p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

const RequireAdmin = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="grid min-h-screen place-items-center text-slate-600">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (user.role !== "Admin") {
    return <Navigate to="/student/teams" replace />;
  }

  return <Outlet />;
};

const RequireStudent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="grid min-h-screen place-items-center text-slate-600">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/user/login" replace />;
  }

  if (user.role !== "Student") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

const UserHomeRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="grid min-h-screen place-items-center text-slate-600">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/user/login" replace />;
  }

  if (user.role === "Admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/student/teams" replace />;
};

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<UserLanding />} />
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin/register" element={<Register />} />
      <Route path="/user/login" element={<UserAuth />} />
      <Route path="/user/register" element={<UserAuth />} />
      <Route path="/user" element={<UserHomeRedirect />} />

      <Route element={<RequireStudent />}>
        <Route path="/student" element={<StudentLayout />}>
          <Route path="teams" element={<StudentTeams />} />
          <Route path="teams/:id" element={<TeamDetails />} />
          <Route path="events" element={<StudentEvents />} />
          <Route path="matches" element={<StudentMatches />} />
          <Route path="players" element={<StudentPlayers />} />
          <Route path="leaderboard" element={<StudentLeaderboard />} />
          <Route path="profile" element={<StudentProfile />} />
        </Route>
      </Route>

      <Route element={<RequireAdmin />}>
        <Route element={<Layout />}>
          <Route path="/admin/dashboard" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/societies" element={<Societies />} />
          <Route path="/societies/new" element={<AddSociety />} />
          <Route path="/societies/:id/edit" element={<EditSociety />} />
          <Route path="/societies/:id" element={<SocietyDetails />} />
          <Route path="/members" element={<Members />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/teams/:id" element={<TeamDetails />} />
          <Route path="/schedules" element={<Schedules />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
