import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <header className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 md:mb-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-600 text-xs font-bold text-white">S</div>
          <div>
            <p className="text-sm font-semibold leading-none text-blue-700">SLIIT SportSync</p>
            <p className="text-[10px] uppercase tracking-[0.12em] text-slate-400">Control Panel</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Link
            to="/"
            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-600 transition hover:bg-slate-100"
          >
            Home
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-600 transition hover:bg-slate-100"
          >
            Logout
          </button>
          <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
            {(user?.name || "U").charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
