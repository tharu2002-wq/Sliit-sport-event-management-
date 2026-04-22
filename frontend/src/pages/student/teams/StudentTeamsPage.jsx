import { useEffect, useMemo, useState } from "react";
import teamPlaceholder from "../../../assets/team.jpg";
import { createTeamRequest, getMyTeamRequest, getMyTeamRequests } from "../../../api/teamRequests";
import { getPlayers } from "../../../api/players";
import { getTeams } from "../../../api/teams";
import { PlayerPicker } from "../../../components/admin/teams/PlayerPicker";
import { TeamCard } from "../../../components/teams/TeamCard";
import { DashboardPageHeader } from "../../../components/student-dashboard/DashboardPageHeader";
import { LoadingSpinner, LoadingState } from "../../../components/ui/LoadingSpinner";
import { SearchBar } from "../../../components/ui/SearchBar";
import { SelectFilter } from "../../../components/ui/SelectFilter";
import { Button } from "../../../components/ui/Button";
import { SelectField } from "../../../components/ui/SelectField";
import { TextField } from "../../../components/ui/TextField";
import { getApiErrorMessage } from "../../../utils/apiError";
import { getTitleOrSportTypeError } from "../../../utils/eventValidation";
import { cn } from "../../../utils/cn";
import { scrollToSection } from "../../../utils/scroll";
import { collectTeamSportTypes, filterTeams } from "../../../utils/teamUtils";

const SOCIETY_OPTIONS = ["Sliit", "IEEE", "FOSS", "Rotaract", "Leo", "Other"];

function sortByName(a, b) {
  return String(a.teamName).localeCompare(String(b.teamName));
}

function refToId(value) {
  if (!value) return "";
  if (typeof value === "object" && value !== null) {
    return String(value._id ?? "");
  }
  return String(value);
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

function TeamRequestForm({
  onSubmit,
  loading,
  error,
  formData,
  setFormData,
  errors,
  players,
  captainOptions,
  memberIdsSet,
  getAssignedTeamLabel,
}) {
  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm ring-1 ring-gray-100">
      {error ? (
        <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="team-name"
          name="teamName"
          label="Team name"
          value={formData.teamName}
          onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
          error={errors.teamName}
          required
          disabled={loading}
        />
        <TextField
          id="team-sport"
          name="sportType"
          label="Category / Sport"
          value={formData.sportType}
          onChange={(e) => setFormData({ ...formData, sportType: e.target.value })}
          error={errors.sportType}
          required
          placeholder="e.g. Cricket"
          disabled={loading}
        />
      </div>

      <SelectField
        id="team-society"
        name="society"
        label="Society"
        value={formData.society}
        onChange={(e) => setFormData({ ...formData, society: e.target.value })}
        error={errors.society}
        required
        disabled={loading}
      >
        <option value="">Select society…</option>
        {SOCIETY_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </SelectField>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="team-contact-email"
          name="contactEmail"
          label="Team Contact Email"
          value={formData.contactEmail}
          onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
          error={errors.contactEmail}
          placeholder="team@example.com"
          disabled={loading}
        />
        <TextField
          id="team-contact-phone"
          name="contactPhone"
          label="Team Contact Phone"
          value={formData.contactPhone}
          onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
          error={errors.contactPhone}
          placeholder="0771234567"
          disabled={loading}
        />
      </div>

      <div>
        <p className="mb-1.5 text-sm font-semibold text-gray-700">Players</p>
        <p className="mb-1 text-xs text-gray-500">Select at least one player. The captain must be chosen from this list.</p>
        <p className="mb-2 text-xs text-gray-500">Players already assigned to another team are shown below.</p>
        {errors.members ? (
          <p className="mb-2 text-sm text-red-600" role="alert">
            {errors.members}
          </p>
        ) : null}
        <PlayerPicker
          players={players}
          selectedIds={formData.memberIds}
          onChange={(ids) => setFormData({ ...formData, memberIds: ids })}
          disabled={loading}
          showSearch
          searchPlaceholder="Search players by name or email..."
          getOptionHint={(player) => {
            if (memberIdsSet.has(String(player._id))) return "";
            return getAssignedTeamLabel ? getAssignedTeamLabel(player) : "";
          }}
        />
      </div>

      <SelectField
        id="team-captain"
        name="captain"
        label="Captain"
        value={formData.captainId}
        onChange={(e) => setFormData({ ...formData, captainId: e.target.value })}
        error={errors.captain}
        required
        disabled={captainOptions.length === 0 || loading}
      >
        <option value="">{captainOptions.length ? "Select player's first" : "Select players first"}</option>
        {captainOptions.map((p) => (
          <option key={p._id} value={p._id}>
            {p.fullName}
          </option>
        ))}
      </SelectField>

      <div className="flex justify-center">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <LoadingSpinner size="sm" />
              Sending…
            </span>
          ) : (
            "Submit Request"
          )}
        </button>
      </div>
    </form>
  );
}

export default function StudentTeamsPage() {
  const [rawTeams, setRawTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sportType, setSportType] = useState("");
  const [myTeamRequest, setMyTeamRequest] = useState(null);
  const [myTeamRequests, setMyTeamRequests] = useState([]);
  const [teamRequestError, setTeamRequestError] = useState("");
  const [submittingTeamRequest, setSubmittingTeamRequest] = useState(false);
  const [teamRequestLoading, setTeamRequestLoading] = useState(true);
  const [allPlayers, setAllPlayers] = useState([]);
  const [teamFormErrors, setTeamFormErrors] = useState({});
  const [teamFormData, setTeamFormData] = useState({
    teamName: "",
    sportType: "",
    society: "Sliit",
    contactEmail: "",
    contactPhone: "",
    memberIds: [],
    captainId: "",
  });
  const [showRequestForm, setShowRequestForm] = useState(false);

  const startReapply = (request) => {
    const memberIds = Array.isArray(request?.members)
      ? request.members.map((m) => refToId(m)).filter(Boolean)
      : [];
    const captainId = refToId(request?.captain);
    const ensuredMembers = captainId && !memberIds.includes(captainId) ? [...memberIds, captainId] : memberIds;

    setTeamFormData({
      teamName: String(request?.teamName ?? "").trim(),
      sportType: String(request?.sportType ?? "").trim(),
      society: String(request?.society ?? "Sliit").trim() || "Sliit",
      contactEmail: String(request?.contactEmail ?? "").trim(),
      contactPhone: String(request?.contactPhone ?? "").trim(),
      memberIds: ensuredMembers,
      captainId,
    });
    setTeamFormErrors({});
    setTeamRequestError("");
    setShowRequestForm(true);
    scrollToSection("request-team");
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError("");
      try {
        const data = await getTeams();
        if (!cancelled) setRawTeams(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, "Could not load teams."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setTeamRequestError("");
      setTeamRequestLoading(true);
      try {
        const [reqPayload, historyList, playersList] = await Promise.all([
          getMyTeamRequest(),
          getMyTeamRequests(),
          getPlayers(),
        ]);
        if (!cancelled) {
          setMyTeamRequest(reqPayload?.request ?? null);
          setMyTeamRequests(Array.isArray(historyList) ? historyList : []);
          setAllPlayers(Array.isArray(playersList) ? playersList : []);
        }
      } catch (err) {
        if (!cancelled) setTeamRequestError(getApiErrorMessage(err, "Could not load team request data."));
      } finally {
        if (!cancelled) setTeamRequestLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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

  const captainOptions = useMemo(() => {
    const set = new Set(teamFormData.memberIds.map(String));
    return allPlayers.filter((p) => set.has(String(p._id)));
  }, [allPlayers, teamFormData.memberIds]);

  const memberIdsSet = useMemo(() => new Set(teamFormData.memberIds.map(String)), [teamFormData.memberIds]);

  const getAssignedTeamLabel = (player) => {
    if (!Array.isArray(player?.teams) || player.teams.length === 0) return "";
    const firstTeam = player.teams.find((team) => team?.isActive !== false);
    if (!firstTeam) return "";
    const teamName = typeof firstTeam?.teamName === "string" ? firstTeam.teamName.trim() : "";
    if (!teamName) return "Already in another team";
    return `Already in ${teamName}`;
  };

  useEffect(() => {
    if (teamFormData.captainId && !teamFormData.memberIds.map(String).includes(String(teamFormData.captainId))) {
      setTeamFormData((prev) => ({ ...prev, captainId: "" }));
    }
  }, [teamFormData.memberIds, teamFormData.captainId]);

  const validateTeamRequest = () => {
    const next = {};
    if (!teamFormData.teamName.trim()) next.teamName = "Team name is required";
    const sportErr = getTitleOrSportTypeError(teamFormData.sportType, "Sport type");
    if (sportErr) next.sportType = sportErr;
    if (!teamFormData.society.trim()) next.society = "Society is required";
    const email = teamFormData.contactEmail.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.contactEmail = "Please enter a valid email address.";
    }
    const phone = teamFormData.contactPhone.trim();
    if (phone && !/^[+]?[-()\d\s]{7,20}$/.test(phone)) {
      next.contactPhone = "Please enter a valid contact number.";
    }
    if (teamFormData.memberIds.length === 0) next.members = "Select at least one player";
    const blockedSelected = allPlayers.some(
      (p) => memberIdsSet.has(String(p._id)) && Array.isArray(p.teams) && p.teams.length > 0
    );
    if (blockedSelected) next.members = "Players already assigned to another team cannot be selected.";
    if (!teamFormData.captainId) next.captain = "Captain is required";
    if (teamFormData.captainId && !teamFormData.memberIds.map(String).includes(String(teamFormData.captainId))) {
      next.captain = "Captain must be one of the selected players";
    }
    setTeamFormErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleTeamRequestSubmit = async (e) => {
    e.preventDefault();
    if (!validateTeamRequest()) return;
    setSubmittingTeamRequest(true);
    setTeamRequestError("");
    try {
      const members = [...new Set([...teamFormData.memberIds.map(String), String(teamFormData.captainId)])];
      await createTeamRequest({
        teamName: teamFormData.teamName.trim(),
        sportType: teamFormData.sportType.trim(),
        society: teamFormData.society.trim(),
        contactEmail: teamFormData.contactEmail.trim() || undefined,
        contactPhone: teamFormData.contactPhone.trim() || undefined,
        captain: teamFormData.captainId,
        members,
      });
      const [requestPayload, historyList] = await Promise.all([getMyTeamRequest(), getMyTeamRequests()]);
      setMyTeamRequests(Array.isArray(historyList) ? historyList : []);
      const request = requestPayload?.request ?? null;
      setMyTeamRequest(request ?? null);
      setTeamFormData({
        teamName: "",
        sportType: "",
        society: "Sliit",
        contactEmail: "",
        contactPhone: "",
        memberIds: [],
        captainId: "",
      });
      setTeamFormErrors({});
    } catch (err) {
      setTeamRequestError(getApiErrorMessage(err, "Could not submit your team request."));
    } finally {
      setSubmittingTeamRequest(false);
    }
  };

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
          onClick={() => {
            setShowRequestForm(true);
            scrollToSection("request-team");
          }}
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
        <div
          className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
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

          <section id="request-team" className="mt-10 scroll-mt-6" aria-labelledby="request-team-heading">
            <h2 id="request-team-heading" className="text-lg font-black tracking-tight text-gray-900">
              Request new team
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Submit a request to establish a new sports team at SLIIT. Your request will be reviewed by organisers.
            </p>

            {teamRequestLoading ? (
              <div
                className="mt-4 flex min-h-[120px] items-center justify-center gap-2 rounded-2xl border border-gray-100 bg-white py-10 text-sm text-gray-500 shadow-sm ring-1 ring-gray-100"
                role="status"
                aria-live="polite"
              >
                <LoadingSpinner size="sm" />
                <span>Loading team request form…</span>
              </div>
            ) : showRequestForm ? (
              <TeamRequestForm
                onSubmit={handleTeamRequestSubmit}
                loading={submittingTeamRequest}
                error={teamRequestError}
                formData={teamFormData}
                setFormData={setTeamFormData}
                errors={teamFormErrors}
                players={allPlayers}
                captainOptions={captainOptions}
                memberIdsSet={memberIdsSet}
                getAssignedTeamLabel={getAssignedTeamLabel}
              />
            ) : myTeamRequest?.status === "approved" || myTeamRequest?.status === "accepted" ? (
              <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/90 px-6 py-6 text-center">
                <p className="text-sm font-semibold text-emerald-900">Your team request was approved!</p>
                <p className="mt-2 text-sm text-emerald-800/95">Your team has been created and is now active.</p>
              </div>
            ) : myTeamRequest?.status === "pending" ? (
              <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50/90 px-6 py-6 text-center">
                <p className="text-sm font-semibold text-amber-900">Your request is pending</p>
                <p className="mt-2 text-sm text-amber-800/95">Organisers are reviewing your team request.</p>
              </div>
            ) : myTeamRequest?.status === "rejected" ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl border border-red-100 bg-red-50/90 px-6 py-6 text-center">
                  <p className="text-sm font-semibold text-red-900">Your request was not approved</p>
                  {myTeamRequest.rejectReason ? (
                    <p className="mt-2 text-sm text-red-800/95">{myTeamRequest.rejectReason}</p>
                  ) : (
                    <p className="mt-2 text-sm text-red-800/90">You can submit a new request below.</p>
                  )}
                </div>
                <TeamRequestForm
                  onSubmit={handleTeamRequestSubmit}
                  loading={submittingTeamRequest}
                  error={teamRequestError}
                  formData={teamFormData}
                  setFormData={setTeamFormData}
                  errors={teamFormErrors}
                  players={allPlayers}
                  captainOptions={captainOptions}
                  memberIdsSet={memberIdsSet}
                  getAssignedTeamLabel={getAssignedTeamLabel}
                />
              </div>
            ) : (
              <TeamRequestForm
                onSubmit={handleTeamRequestSubmit}
                loading={submittingTeamRequest}
                error={teamRequestError}
                formData={teamFormData}
                setFormData={setTeamFormData}
                errors={teamFormErrors}
                players={allPlayers}
                captainOptions={captainOptions}
                memberIdsSet={memberIdsSet}
                getAssignedTeamLabel={getAssignedTeamLabel}
              />
            )}

            <div className="mt-8">
              <h3 className="text-base font-black tracking-tight text-gray-900">My requests</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Review the requests you have submitted and their current status.
              </p>

              {teamRequestLoading ? (
                <div
                  className="mt-4 flex min-h-[120px] items-center justify-center gap-2 rounded-2xl border border-gray-100 bg-white py-10 text-sm text-gray-500 shadow-sm ring-1 ring-gray-100"
                  role="status"
                  aria-live="polite"
                >
                  <LoadingSpinner size="sm" />
                  <span>Loading your request history…</span>
                </div>
              ) : myTeamRequests.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-6 py-10 text-center">
                  <p className="text-sm font-semibold text-gray-900">No team requests yet</p>
                  <p className="mt-2 text-sm text-gray-600">Use the form above to submit your first team request.</p>
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
                        <th className="px-4 py-3 font-bold text-gray-700">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {myTeamRequests.map((request) => {
                        const memberCount = Array.isArray(request.members) ? request.members.length : 0;
                        const captainName =
                          typeof request.captain === "object" && request.captain?.fullName
                            ? request.captain.fullName
                            : "—";
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
                            <td className="px-4 py-3">
                              {status === "rejected" ? (
                                <button
                                  type="button"
                                  onClick={() => startReapply(request)}
                                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                                >
                                  Re-apply
                                </button>
                              ) : (
                                <span className="text-xs text-gray-400">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </>
  );
}
