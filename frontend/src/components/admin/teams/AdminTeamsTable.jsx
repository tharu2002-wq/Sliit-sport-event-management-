import { Link } from "react-router-dom";
import { Button } from "../../ui/Button";

function captainLabel(c) {
  if (!c) return "—";
  if (typeof c === "object" && c !== null && "fullName" in c) return c.fullName;
  return "—";
}

function buildCustomTeamId(team) {
  const raw = String(team?._id ?? "").replace(/[^a-fA-F0-9]/g, "").slice(-8);
  if (!raw) return "TEAM-00000000";
  const asNumber = parseInt(raw, 16) % 100000000;
  return `TEAM-${String(asNumber).padStart(8, "0")}`;
}

function contactEmail(team) {
  return String(team?.contactEmail ?? "").trim() || "—";
}

function contactPhone(team) {
  return String(team?.contactPhone ?? "").trim() || "—";
}

export function AdminTeamsTable({ teams, deletingTeamId, onDeleteTeam }) {
  if (teams.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-12 text-center text-sm text-gray-500">
        No teams match your filters. Create a team or adjust search.
      </p>
    );
  }

  return (
    <>
      <h2 className="mb-3 text-xl font-black tracking-tight text-gray-900">Active Teams</h2>

      <ul className="space-y-3 lg:hidden">
        {teams.map((t) => (
          <li key={t._id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-bold text-gray-900">{t.teamName}</p>
                <p className="mt-0.5 text-xs text-gray-500">{buildCustomTeamId(t)}</p>
              </div>
              <span
                className={
                  t.isActive === false
                    ? "rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs font-black tracking-wider text-gray-600"
                    : "rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1 text-xs font-black tracking-wider text-emerald-800"
                }
              >
                {t.isActive === false ? "INACTIVE" : "ACTIVE"}
              </span>
            </div>
            <p className="mt-2 text-xs text-gray-600">{t.society || "—"} · {t.sportType || "—"}</p>
            <p className="mt-1 text-xs text-gray-600">Captain: {captainLabel(t.captain)} · Members: {Array.isArray(t.members) ? t.members.length : 0}</p>
            <p className="mt-1 text-xs">
              <span className="font-semibold text-blue-600">{contactEmail(t)}</span>
              <span className="ml-2 text-gray-500">{contactPhone(t)}</span>
            </p>
            <div className="mt-4 flex gap-2">
              <Button to={`/admin/teams/${t._id}`} variant="outline" size="sm" className="!rounded-full !border-blue-200 !bg-blue-50 !px-4 !py-1.5 !text-blue-900">
                View details
              </Button>
              <button
                type="button"
                disabled={deletingTeamId === t._id}
                className="rounded-full bg-orange-500 px-4 py-1.5 text-sm font-bold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => onDeleteTeam?.(t)}
              >
                {deletingTeamId === t._id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm lg:block">
        <table className="w-full min-w-[940px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/90">
              <th className="px-4 py-3 font-bold text-gray-900">Team Name</th>
              <th className="px-4 py-3 font-bold text-gray-900">Custom ID</th>
              <th className="px-4 py-3 font-bold text-gray-900">Society</th>
              <th className="px-4 py-3 font-bold text-gray-900">Sport Type</th>
              <th className="px-4 py-3 font-bold text-gray-900">Captain</th>
              <th className="px-4 py-3 font-bold text-gray-900">Members</th>
              <th className="px-4 py-3 font-bold text-gray-900">Contact</th>
              <th className="px-4 py-3 font-bold text-gray-900">Status</th>
              <th className="px-4 py-3 text-right font-bold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((t) => (
              <tr key={t._id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3 font-semibold text-gray-900">{t.teamName || "—"}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-600">{buildCustomTeamId(t)}</td>
                <td className="px-4 py-3 text-gray-700">{t.society || "—"}</td>
                <td className="px-4 py-3 text-gray-700">{t.sportType || "—"}</td>
                <td className="max-w-[10rem] truncate px-4 py-3 text-gray-700">{captainLabel(t.captain)}</td>
                <td className="px-4 py-3 text-gray-700">{Array.isArray(t.members) ? t.members.length : 0}</td>
                <td className="px-4 py-3">
                  <p className="truncate text-sm font-semibold text-blue-600">{contactEmail(t)}</p>
                  <p className="text-xs font-medium text-gray-500">{contactPhone(t)}</p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      t.isActive === false
                        ? "inline-flex rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-xs font-bold tracking-wide text-gray-600"
                        : "inline-flex rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1 text-xs font-bold tracking-wide text-emerald-800"
                    }
                  >
                    {t.isActive === false ? "INACTIVE" : "ACTIVE"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link
                      to={`/admin/teams/${t._id}`}
                      className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-900 hover:bg-blue-100"
                    >
                      View details
                    </Link>
                    <button
                      type="button"
                      disabled={deletingTeamId === t._id}
                      className="rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => onDeleteTeam?.(t)}
                    >
                      {deletingTeamId === t._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
