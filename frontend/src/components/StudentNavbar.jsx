import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const StudentNavbar = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/user/login", { replace: true });
  };

  return (
    <header className="mb-4 flex items-center justify-between rounded-full bg-white px-6 py-3 border border-slate-200 shadow-sm md:mb-6">
      <div className="flex w-full max-w-lg items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-sm">
        <span className="text-slate-400">🔍</span>
        <input
          type="text"
          placeholder="Search by team name, captain, or player..."
          className="w-full bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="ml-4 flex items-center shrink-0">
        <Link
          to="/"
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Home
        </Link>
        <button className="ml-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          All sports
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="ml-2 rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default StudentNavbar;
