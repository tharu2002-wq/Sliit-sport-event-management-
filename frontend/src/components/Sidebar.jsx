import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  {
    to: "/dashboard",
    label: "Dashboard Overview",
    isActive: (location) => location.pathname === "/dashboard" && !new URLSearchParams(location.search).get("view"),
  },
  {
    to: "/societies",
    label: "Societies Management",
    isActive: (location) => location.pathname === "/societies",
  },
  {
    to: "/schedules?mode=event",
    label: "Event Management",
    isActive: (location) =>
      location.pathname === "/schedules" && new URLSearchParams(location.search).get("mode") === "event",
  },
  {
    to: "/schedules",
    label: "Schedule Management",
    isActive: (location) => {
      const mode = new URLSearchParams(location.search).get("mode");
      return location.pathname === "/schedules" && mode !== "event";
    },
  },
  {
    to: "/teams",
    label: "Team Management",
    isActive: (location) => location.pathname === "/teams",
  },
  {
    to: "/members",
    label: "Player Management",
    isActive: (location) => location.pathname === "/members",
  },
  {
    to: "/societies/new",
    label: "Venue Management",
    isActive: (location) => location.pathname === "/societies/new",
  },
  {
    to: "/dashboard?view=reports",
    label: "Leaderboard & Reports",
    isActive: (location) =>
      location.pathname === "/dashboard" && new URLSearchParams(location.search).get("view") === "reports",
  },
];

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 md:sticky md:top-6">
      <div className="mb-5 flex flex-col items-center border-b border-slate-200 pb-4">
        <div className="mb-2 grid h-16 w-16 place-items-center rounded-full border border-slate-200 bg-slate-100 text-slate-500">
          <span className="text-2xl">👤</span>
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Administrator</p>
        <p className="mt-1 text-xs text-slate-500">
          Signed in as <span className="font-semibold text-slate-700">{user?.name || "User"}</span>
        </p>
      </div>
      <nav className="space-y-1">
        {links.map((item) => {
          const isActive = item.isActive(location);

          return (
            <Link
              key={`${item.to}-${item.label}`}
              to={item.to}
              className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
