import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import teamPlaceholder from "../../../assets/team.jpg";
import { getMyTeamRequests, deleteTeamRequest } from "../../../api/teamRequests";
import { getTeams } from "../../../api/teams";
import { TeamCard } from "../../../components/teams/TeamCard";
import { DashboardPageHeader } from "../../../components/student-dashboard/DashboardPageHeader";
import { LoadingState } from "../../../components/ui/LoadingSpinner";
import { SearchBar } from "../../../components/ui/SearchBar";
import { SelectFilter } from "../../../components/ui/SelectFilter";
import { Button } from "../../../components/ui/Button";
import { getApiErrorMessage } from "../../../utils/apiError";
import { cn } from "../../../utils/cn";
import { collectTeamSportTypes, filterTeams } from "../../../utils/teamUtils";

function sortByName(a, b) {
  return String(a.teamName).localeCompare(String(b.teamName));
}

function TeamSection({ id, title, teams, emptyHint, imageSrc }) {
  return (
    <section className="mt-10 first:mt-0" aria-labelledby={id}>
      <h2 id={id} className="text-lg font-black tracking-tight text-gray-900">
        {title}
      </h2>
      {teams.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-8 text-center text-sm text-gray-500">
          {emptyHint}
        </p>
      ) : (
        <ul className="mt-4 grid list-none gap-4 p-0 sm:grid-cols-2 xl:grid-cols-3">
          {teams.map((team) => (
            <li key={String(team._id)}>
              <TeamCard
                team={team}
                imageSrc={imageSrc}
                detailTo={`/student/teams/${team._id}`}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function TeamRequestStatusBadge({ status }) {
  const normalized = String(status ?? "").toLowerCase();
  const styles = {
    pending: "bg-amber-50 text-amber-900 ring-amber-200",
    approved: "bg-emerald-50 text-emerald-900 ring-emerald-200",
    accepted: "bg-emerald-50 text-emerald-900 ring-emerald-200",
    rejected: "bg-red-50 text-red-900 ring-red-200",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ring-1",
        styles[normalized] ?? "bg-gray-50 text-gray-800 ring-gray-200"
      )}
    >
      {normalized || "—"}
    </span>
  );
}

export default function StudentTeamsPage() {
  const navigate = useNavigate();
  const [rawTeams, setRawTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sportType, setSportType] = useState("");
  const [myTeamRequests, setMyTeamRequests] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [clearingId, setClearingId] = useState("");

  const loadData = async () => {
    setError("");
    try {
      const [teamsData, historyData] = await Promise.all([
        getTeams(),
        getMyTeamRequests()
      ]);
      setRawTeams(Array.isArray(teamsData) ? teamsData : []);
      setMyTeamRequests(Array.isArray(historyData) ? historyData : []);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not load data."));
    } finally {
      setLoading(false);
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClearRequest = async (id) => {
    if (!id || !window.confirm("Are you sure you want to remove this request from your history?")) return;
    setClearingId(id);
    try {
      await deleteTeamRequest(id);
      await loadData();
    } catch (err) {
      alert(getApiErrorMessage(err, "Could not clear request."));
    } finally {
      setClearingId("");
    }
  };

  const sportOptions = useMemo(() => collectTeamSportTypes(rawTeams), [rawTeams]);

  const filtered = useMemo(
    () => filterTeams(rawTeams, { searchQuery, sportType }),
    [rawTeams, searchQuery, sportType]
  );

  const { active, inactive } = useMemo(() => {
    const a = filtered.filter((t) => t.isActive !== false).sort(sortByName);
    const i = filtered.filter((t) => t.isActive === false).sort(sortByName);
    return { active: a, inactive: i };
  }, [filtered]);

  return (
    <>
      <div className="flex flex-col gap-4 border-b border-gray-100 pb-6 md:flex-row md:items-end md:justify-between">
        <DashboardPageHeader
          title="Teams"
          description="Browse SLIIT sports teams, rosters, and fixtures. Active teams are competing; inactive teams are archived."
        />
        <Button
          type="button"
          variant="primary"
          size="sm"
          className="shrink-0 rounded-full px-5"
          onClick={() => navigate("/student/teams/request")}
        >
          Add new request
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-6">
        <SearchBar
          id="student-teams-search"
          className="flex-1"
          label="Search teams"
          placeholder="Search by team name, captain, or player…"
          value={searchQuery}
          onChange={setSearchQuery}
        />
        <SelectFilter
          id="student-teams-sport-filter"
          className="lg:max-w-xs"
          label="Sport type"
          options={sportOptions}
          value={sportType}
          onChange={setSportType}
          showAllOption
          allLabel="All sports"
        />
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </div>
      ) : null}

      {loading ? (
        <LoadingState label="Loading teams…" className="mt-8" />
      ) : (
        <>
          <TeamSection
            id="student-teams-active-heading"
            title="Active teams"
            teams={active}
            emptyHint={
              searchQuery.trim() || sportType
                ? "No active teams match your search or filter."
                : "No active teams yet."
            }
            imageSrc={teamPlaceholder}
          />
          <TeamSection
            id="student-teams-inactive-heading"
            title="Inactive teams"
            teams={inactive}
            emptyHint={
              searchQuery.trim() || sportType
                ? "No inactive teams match your search or filter."
                : "No inactive teams."
            }
            imageSrc={teamPlaceholder}
          />

          <section className="mt-16">
            <h2 className="text-lg font-black tracking-tight text-gray-900">My requests</h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Review the requests you have submitted and their current status.
            </p>

            {historyLoading ? (
              <div className="mt-4 rounded-2xl border border-gray-100 bg-white py-10 text-center shadow-sm">
                <LoadingState label="Loading requests…" />
              </div>
            ) : myTeamRequests.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-6 py-10 text-center">
                <p className="text-sm font-semibold text-gray-900">No team requests yet</p>
                <p className="mt-2 text-sm text-gray-600">Click "Add new request" at the top to submit your first team request.</p>
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm ring-1 ring-gray-100">
                <table className="min-w-full divide-y divide-gray-100 text-left text-sm">
                  <thead className="bg-gray-50/80">
                    <tr>
                      <th className="px-4 py-3 font-bold text-gray-700">Team</th>
                      <th className="px-4 py-3 font-bold text-gray-700">Sport / Society</th>
                      <th className="px-4 py-3 font-bold text-gray-700">Captain</th>
                      <th className="px-4 py-3 font-bold text-gray-700">Members</th>
                      <th className="px-4 py-3 font-bold text-gray-700">Status</th>
                      <th className="px-4 py-3 font-bold text-gray-700">Submitted</th>
                       <th className="px-4 py-3 font-bold text-gray-700 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {myTeamRequests.map((request) => {
                      const memberCount = Array.isArray(request.members) ? request.members.length : 0;
                      let captainName = "—";
                      if (typeof request.captain === "object" && request.captain?.fullName) {
                        captainName = request.captain.fullName;
                      } else if (typeof request.captain === "string" && request.captain.trim() !== "") {
                        captainName = request.captain;
                      }
                      const status = String(request.status ?? "").toLowerCase();
                      return (
                        <tr key={String(request._id)} className="align-top">
                          <td className="px-4 py-3 font-semibold text-gray-900">{request.teamName}</td>
                          <td className="px-4 py-3 text-gray-600">
                            <div>{request.sportType || "—"}</div>
                            <div className="text-xs text-gray-500">{request.society || "—"}</div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{captainName}</td>
                          <td className="px-4 py-3 text-gray-600">{memberCount}</td>
                          <td className="px-4 py-3">
                            <TeamRequestStatusBadge status={status} />
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                            {request.createdAt ? new Date(request.createdAt).toLocaleString() : "—"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex flex-col gap-1 sm:flex-row sm:justify-center sm:gap-2">
                              {status === "pending" && (
                                <Button
                                  variant="outline"
                                  size="xs"
                                  className="rounded-full px-3 text-[10px]"
                                  onClick={() => navigate(`/student/teams/request/${request._id}/edit`)}
                                  disabled={clearingId === String(request._id)}
                                >
                                  Edit
                                </Button>
                              )}
                              {status === "rejected" && (
                                <Button
                                  variant="outline"
                                  size="xs"
                                  className="rounded-full px-3 text-[10px]"
                                  onClick={() => navigate(`/student/teams/request/${request._id}/edit`)}
                                  disabled={clearingId === String(request._id)}
                                >
                                  Resubmit
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="xs"
                                className="rounded-full border-red-100 px-3 text-[10px] text-red-600 hover:bg-red-50"
                                onClick={() => handleClearRequest(request._id)}
                                disabled={clearingId === String(request._id)}
                              >
                                {clearingId === String(request._id)
                                  ? "..."
                                  : status === "pending"
                                  ? "Cancel"
                                  : "Clear"}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}
