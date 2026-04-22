import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSocieties } from "../services/societyService";
import { getMembers } from "../services/memberService";
import { getTeams } from "../services/teamService";

const Dashboard = () => {
  const [counts, setCounts] = useState({ societies: 0, members: 0, teams: 0 });
  const [activeTeams, setActiveTeams] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [societies, members, teams] = await Promise.all([getSocieties(), getMembers(), getTeams()]);
        setCounts({ societies: societies.length, members: members.length, teams: teams.length });
        setActiveTeams(teams.slice(0, 6));
      } catch (err) {
        console.error("Dashboard refresh failed", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredTeams = activeTeams.filter((team) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (team.name && team.name.toLowerCase().includes(searchLower)) ||
      (team.category && team.category.toLowerCase().includes(searchLower))
    );
  });

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Active teams</h2>
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search teams..."
            className="input-shell w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            🔍
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredTeams.map((team) => (
          <article key={team._id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="relative h-40 w-full">
              <img
                src={team.photoUrl || "/hero-campus.png"}
                alt="Team"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/hero-campus.png";
                }}
              />
              <span className="absolute left-2 top-2 rounded bg-emerald-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                Active
              </span>
            </div>
            <div className="space-y-2 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                {team.category || "Elite"}
              </p>
              <h3 className="text-xl font-bold leading-none text-slate-900">{team.name || "Unnamed Team"}</h3>
              <p className="text-xs text-slate-600">Captain: {team.captain || team.coach || "Not assigned"}</p>
              <p className="text-xs text-slate-500">{team.members?.length || 0} players on the roster.</p>
              <p className="text-[11px] text-slate-400">Updated: Mar 27, 2026</p>
              <Link
                to={`/teams/${team._id}`}
                className="mt-2 block w-full rounded-lg border border-blue-300 py-2 text-center text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                View details
              </Link>
            </div>
          </article>
        ))}
      </div>

      {!activeTeams.length && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
          No teams available yet. Create teams to populate this dashboard.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-[11px] uppercase tracking-[0.1em] text-slate-400">Societies</p>
          <p className="text-2xl font-bold text-slate-800">{counts.societies}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-[11px] uppercase tracking-[0.1em] text-slate-400">Members</p>
          <p className="text-2xl font-bold text-slate-800">{counts.members}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-[11px] uppercase tracking-[0.1em] text-slate-400">Teams</p>
          <p className="text-2xl font-bold text-slate-800">{counts.teams}</p>
        </article>
      </div>
    </section>
  );
};

export default Dashboard;
