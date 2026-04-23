import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/student/events", label: "Events" },
  { to: "/student/matches", label: "Matches" },
  { to: "/student/teams", label: "Teams" },
  { to: "/student/players", label: "Players" },
  { to: "/student/leaderboard", label: "Leaderboard" },
  { to: "/student/profile", label: "Profile" },
];

const StudentSidebar = () => {
  const { user } = useAuth();

  return (
    <aside className="h-fit w-[220px] shrink-0 pr-4 md:sticky md:top-6">
      <div className="mb-6 flex flex-col pt-2">
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-600 font-bold text-white">
            S
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight text-slate-900">SLIIT SportSync</h1>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Student</p>
          </div>
        </div>
      </div>
      
      <div className="mb-8 flex flex-col items-center pt-4">
        <div className="mb-3 grid h-20 w-20 place-items-center rounded-full bg-slate-100 text-slate-400 border border-slate-200">
          <span className="text-3xl">👤</span>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Student</p>
        <p className="mt-1 text-sm text-slate-500">
          Signed in as <span className="font-semibold text-slate-800">{user?.name || "Student"}</span>
        </p>
      </div>

      <nav className="space-y-1">
        {links.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block rounded-full px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-blue-50 text-[#1534a8] font-semibold"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      
      <div className="mt-20 px-2">
         <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">SLIIT SportSync</p>
      </div>
    </aside>
  );
};

export default StudentSidebar;
