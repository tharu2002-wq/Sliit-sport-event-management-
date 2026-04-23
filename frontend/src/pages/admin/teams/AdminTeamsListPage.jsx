import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { deleteTeam, getTeams, updateTeam } from "../../../api/teams";
import { AdminTeamsTable } from "../../../components/admin/teams/AdminTeamsTable";
import { Button } from "../../../components/ui/Button";
import { SearchBar } from "../../../components/ui/SearchBar";
import { SelectFilter } from "../../../components/ui/SelectFilter";
import { LoadingState } from "../../../components/ui/LoadingSpinner";
import { getApiErrorMessage } from "../../../utils/apiError";
import { downloadTeamsPdf } from "../../../utils/teamPdfExport";

function normalize(s) {
  return String(s ?? "").toLowerCase().trim();
}

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default function AdminTeamsListPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingTeamId, setDeletingTeamId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const data = await getTeams();
      setTeams(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not load teams."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = normalize(searchQuery);
    return teams.filter((t) => {
      if (statusFilter === "active" && t.isActive === false) return false;
      if (statusFilter === "inactive" && t.isActive !== false) return false;
      if (!q) return true;
      const cap =
        typeof t.captain === "object" && t.captain?.fullName ? t.captain.fullName : "";
      const blob = [t.teamName, t.sportType, cap].map(normalize).join(" ");
      return blob.includes(q);
    });
  }, [teams, searchQuery, statusFilter]);

  const handleDeleteTeam = useCallback(async (team) => {
    if (!team?._id) return;
    const ok = window.confirm(`Delete team \"${team.teamName ?? "this team"}\" permanently?`);
    if (!ok) return;

    setDeletingTeamId(team._id);
    setError("");
    try {
      await deleteTeam(team._id);
      setTeams((prev) => prev.filter((t) => t._id !== team._id));
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not delete team."));
    } finally {
      setDeletingTeamId("");
    }
  }, []);

  const handleToggleActive = useCallback(async (team) => {
    if (!team?._id) return;
    const newStatus = team.isActive === false ? true : false;
    try {
      await updateTeam(team._id, { isActive: newStatus });
      setTeams((prev) =>
        prev.map((t) => (t._id === team._id ? { ...t, isActive: newStatus } : t))
      );
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not update team status."));
    }
  }, []);

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-gray-100 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 md:text-3xl">Team management</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-600">
            Create teams, assign players and a captain from existing player records, and manage membership on each team
            page.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => downloadTeamsPdf(teams)}
            disabled={loading || teams.length === 0}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </button>
          <Button to="/admin/team-requests" variant="outline" size="sm" className="shrink-0">
            Team requests
          </Button>
          <Button to="/admin/teams/new" variant="primary" size="sm" className="shrink-0">
            Create team
          </Button>
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <SearchBar
            id="admin-teams-search"
            label="Search"
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by team name, sport, or captain…"
          />
        </div>
        <SelectFilter
          id="admin-teams-status"
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          showAllOption
          allLabel="All teams"
          options={STATUS_OPTIONS}
          className="sm:w-44"
        />
      </div>

      <div className="mt-6">
        {loading ? (
          <LoadingState label="Loading teams…" />
        ) : teams.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-12 text-center text-sm text-gray-500">
            No teams yet.{" "}
            <Link to="/admin/teams/new" className="font-semibold text-blue-600 hover:underline">
              Create a team
            </Link>
            .
          </p>
        ) : filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-12 text-center text-sm text-gray-500">
            No teams match the current filters.
          </p>
        ) : (
          <AdminTeamsTable 
            teams={filtered} 
            deletingTeamId={deletingTeamId} 
            onDeleteTeam={handleDeleteTeam} 
            onToggleActive={handleToggleActive}
          />
        )}
      </div>
    </div>
  );
}
