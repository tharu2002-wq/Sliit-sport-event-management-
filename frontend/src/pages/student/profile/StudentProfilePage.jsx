import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import userAvatar from "../../../assets/user.png";
import { deleteAccount as deleteAccountRequest, getProfile } from "../../../api/users";
import { getMyLinkedPlayers, getPlayers } from "../../../api/players";
import { createPlayerRequest, getMyPlayerRequest } from "../../../api/playerRequests";
import { getMyTeamRequest, createTeamRequest } from "../../../api/teamRequests";
import { useAuth } from "../../../contexts/AuthContext";
import { getApiErrorMessage } from "../../../utils/apiError";
import { DashboardPageHeader } from "../../../components/student-dashboard/DashboardPageHeader";
import { PlayerCard } from "../../../components/players/PlayerCard";
import { PlayerPicker } from "../../../components/admin/teams/PlayerPicker";
import { Button } from "../../../components/ui/Button";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { SelectField } from "../../../components/ui/SelectField";
import { TextField } from "../../../components/ui/TextField";
import { cn } from "../../../utils/cn";
import { scrollToSection } from "../../../utils/scroll";
import { getTitleOrSportTypeError } from "../../../utils/eventValidation";
import playerPlaceholder from "../../../assets/player.jpg";

const SOCIETY_OPTIONS = [
  "Sliit",
  "IEEE",
  "FOSS",
  "Rotaract",
  "Leo",
  "Other",
];

function buildCustomTeamId(team) {
  const raw = String(team?._id ?? "").replace(/[^a-fA-F0-9]/g, "").slice(-8);
  if (!raw) return "TEAM-00000000";
  const asNumber = parseInt(raw, 16) % 100000000;
  return `TEAM-${String(asNumber).padStart(8, "0")}`;
}

function teamContactLine(team) {
  const email = String(team?.contactEmail ?? "").trim();
  const phone = String(team?.contactPhone ?? "").trim();
  return { email, phone };
}

function UniqueTeamsSection({ teams, title, emptyHint }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm ring-1 ring-gray-100">
      <h3 className="text-base font-black tracking-tight text-gray-900">{title}</h3>
      {teams.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-8 text-center text-sm text-gray-500">
          {emptyHint}
        </p>
      ) : (
        <div className="mt-4 grid gap-4">
          {teams.map((team) => {
            const active = team.isActive !== false;
            const memberCount = Array.isArray(team.members) ? team.members.length : 0;
            const captainName = typeof team.captain === "object" ? team.captain?.fullName ?? "—" : team.captain || "—";
            const { email, phone } = teamContactLine(team);

            return (
              <article
                key={String(team._id)}
                className={cn(
                  "rounded-2xl border p-4 shadow-sm transition-shadow hover:shadow-md",
                  active ? "border-blue-100 bg-blue-50/40" : "border-gray-200 bg-gray-50/80"
                )}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                      {buildCustomTeamId(team)}
                    </p>
                    <h4 className="mt-1 text-lg font-black tracking-tight text-gray-900">{team.teamName}</h4>
                    <p className="mt-1 text-sm font-semibold text-blue-700">
                      {team.society || "—"} · {team.sportType || "—"}
                    </p>
                    <p className="mt-2 text-sm text-gray-600">
                      <span className="font-semibold text-gray-500">Captain:</span> {captainName}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      <span className="font-semibold text-gray-500">Members:</span> {memberCount}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      <span className="font-semibold text-gray-500">Contact:</span>{" "}
                      {email || phone ? (
                        <span className="text-blue-700">{email || phone}</span>
                      ) : (
                        <span>—</span>
                      )}
                    </p>
                    {email && phone ? <p className="mt-0.5 text-xs text-gray-500">{phone}</p> : null}
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-3 py-1 text-xs font-black tracking-wide",
                        active
                          ? "border-emerald-300 bg-emerald-100 text-emerald-800"
                          : "border-gray-300 bg-gray-100 text-gray-600"
                      )}
                    >
                      {active ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    to={`/student/teams/${team._id}`}
                    className="rounded-full !border-blue-200 !bg-blue-50 !px-4 !py-2 !text-blue-900"
                  >
                    View details
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function formatDate(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(d);
  } catch {
    return "—";
  }
}

const NOT_SET = "Not set";

function ProfileField({ label, value, muted, className }) {
  const display = value ?? "—";
  return (
    <div
      className={cn(
        "flex flex-col gap-0.5 border-b border-gray-100 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
        className
      )}
    >
      <dt className="shrink-0 text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</dt>
      <dd
        className={cn(
          "min-w-0 break-words text-sm",
          muted ? "font-normal text-gray-500" : "font-semibold text-gray-900"
        )}
      >
        {display}
      </dd>
    </div>
  );
}

function ParticipationNeedStudentId() {
  return (
    <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/80 px-6 py-10 text-center">
      <p className="text-sm font-semibold text-amber-950">Add your Student ID to link athlete records</p>
      <p className="mt-2 text-sm text-amber-900/85">
        SportSync matches your profile Student ID to player profiles created by organisers. Add it under Edit profile to
        see your linked participation here.
      </p>
      <Link
        to="/student/profile/edit"
        className="mt-5 inline-flex items-center justify-center rounded-xl bg-amber-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-900"
      >
        Edit profile
      </Link>
    </div>
  );
}

function ParticipationNoLinkedPlayer() {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-6 py-10 text-center">
      <p className="text-sm font-semibold text-gray-900">No linked athlete profile yet</p>
      <p className="mt-2 text-sm text-gray-600">
        There is no player record with the same Student ID as your profile. Ask an organiser to register you, or confirm
        your Student ID matches the one on file.
      </p>
      <Link
        to="/student/players"
        className="mt-5 inline-flex items-center justify-center rounded-xl border-2 border-blue-600 px-4 py-2.5 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50"
      >
        Browse players
      </Link>
    </div>
  );
}

function TeamRequestForm({ onSubmit, loading, error, formData, setFormData, errors, players, captainOptions, memberIdsSet, getAssignedTeamLabel }) {
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
        <p className="mb-2 text-xs text-gray-500">Players already assigned to another team are disabled.</p>
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
          isOptionDisabled={(player) => {
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

    </form>
  );
}

export default function StudentProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser, logout } = useAuth();
  const [serverUser, setServerUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState("");
  const [linkedPlayers, setLinkedPlayers] = useState([]);
  const [participationLoading, setParticipationLoading] = useState(true);
  const [participationError, setParticipationError] = useState("");
  const [myPlayerRequest, setMyPlayerRequest] = useState(null);
  const [requestActionError, setRequestActionError] = useState("");
  const [submittingPlayerRequest, setSubmittingPlayerRequest] = useState(false);
  const [myTeamRequest, setMyTeamRequest] = useState(null);
  const [teamRequestError, setTeamRequestError] = useState("");
  const [submittingTeamRequest, setSubmittingTeamRequest] = useState(false);
  const [teamRequestLoading, setTeamRequestLoading] = useState(true);
  const [allPlayers, setAllPlayers] = useState([]);
  const [playersLoading, setPlayersLoading] = useState(false);
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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setFetchError("");
      try {
        const data = await getProfile();
        if (!cancelled && data?.user) {
          setServerUser(data.user);
        }
      } catch (err) {
        if (!cancelled) setFetchError(getApiErrorMessage(err, "Could not refresh profile from server."));
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
      setParticipationError("");
      setParticipationLoading(true);
      try {
        const [list, reqPayload] = await Promise.all([getMyLinkedPlayers(), getMyPlayerRequest()]);
        if (!cancelled) {
          setLinkedPlayers(list);
          setMyPlayerRequest(reqPayload?.request ?? null);
        }
      } catch (err) {
        if (!cancelled) setParticipationError(getApiErrorMessage(err, "Could not load linked player records."));
      } finally {
        if (!cancelled) setParticipationLoading(false);
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
        const [reqPayload, playersList] = await Promise.all([getMyTeamRequest(), getPlayers()]);
        if (!cancelled) {
          setMyTeamRequest(reqPayload?.request ?? null);
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

  const display = useMemo(() => {
    const u = serverUser ?? authUser;
    if (!u) return null;
    const rawSkills = u.skills;
    let skills = null;
    if (Array.isArray(rawSkills) && rawSkills.length > 0) {
      skills = rawSkills.map(String).filter(Boolean).join(", ");
    } else if (typeof rawSkills === "string" && rawSkills.trim()) {
      skills = rawSkills.trim();
    }

    return {
      name: u.name ?? "—",
      email: u.email ?? "—",
      memberSince: formatDate(u.createdAt),
      age: u.age != null && u.age !== "" ? String(u.age) : null,
      /** Wired when backend exposes these on the user profile. */
      academicYear: u.academicYear ?? null,
      faculty: u.faculty ?? null,
      studentId: u.studentId ?? null,
      skills,
    };
  }, [serverUser, authUser]);

  const handleEditProfile = () => {
    navigate("/student/profile/edit");
  };

  const hasStudentIdOnProfile = Boolean(display?.studentId && String(display.studentId).trim());

  const myTeams = useMemo(() => {
    const map = new Map();
    for (const player of linkedPlayers) {
      for (const team of Array.isArray(player?.teams) ? player.teams : []) {
        if (team?._id == null) continue;
        const id = String(team._id);
        if (!map.has(id)) {
          map.set(id, team);
        }
      }
    }
    return [...map.values()];
  }, [linkedPlayers]);

  const activeTeams = useMemo(() => myTeams.filter((team) => team.isActive !== false), [myTeams]);
  const inactiveTeams = useMemo(() => myTeams.filter((team) => team.isActive === false), [myTeams]);

  const captainOptions = useMemo(() => {
    const set = new Set(teamFormData.memberIds.map(String));
    return allPlayers.filter((p) => set.has(String(p._id)));
  }, [allPlayers, teamFormData.memberIds]);

  const memberIdsSet = useMemo(() => new Set(teamFormData.memberIds.map(String)), [teamFormData.memberIds]);

  const getAssignedTeamLabel = (player) => {
    if (!Array.isArray(player?.teams) || player.teams.length === 0) return "";
    const firstTeam = player.teams[0];
    const teamName = typeof firstTeam?.teamName === "string" ? firstTeam.teamName.trim() : "";
    if (!teamName) return "Already in another team";
    return `Already in ${teamName}`;
  };

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
      const { request } = await getMyTeamRequest();
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

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace(/^#/, "");
    if (!id) return;
    const timer = window.setTimeout(() => scrollToSection(id), 50);
    return () => window.clearTimeout(timer);
  }, [location.hash, participationLoading, loading]);

  const handleRequestToBePlayer = async () => {
    setRequestActionError("");
    setSubmittingPlayerRequest(true);
    try {
      await createPlayerRequest();
      const { request } = await getMyPlayerRequest();
      setMyPlayerRequest(request ?? null);
    } catch (err) {
      setRequestActionError(getApiErrorMessage(err, "Could not submit your request."));
    } finally {
      setSubmittingPlayerRequest(false);
    }
  };

  const handleDeleteAccount = async () => {
    const ok = window.confirm(
      "Delete your SportSync account permanently? This cannot be undone and you will be signed out."
    );
    if (!ok) return;

    setDeleteAccountError("");
    setDeletingAccount(true);
    try {
      await deleteAccountRequest();
      logout();
      navigate("/login", { replace: true });
    } catch (err) {
      setDeleteAccountError(getApiErrorMessage(err, "Could not delete your account."));
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <>
      <DashboardPageHeader
        title="Profile"
        description="Your SportSync account details and campus sports participation."
      />

      {fetchError ? (
        <div
          className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          role="status"
        >
          {fetchError} Showing details from your last sign-in.
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)]">
        <section aria-labelledby="account-heading">
          <h2 id="account-heading" className="sr-only">
            Account information
          </h2>
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm ring-1 ring-gray-100">
            <div className="border-b border-gray-100 bg-gradient-to-br from-blue-50/80 to-white px-6 py-6 sm:flex sm:items-center sm:gap-6">
              <div className="mx-auto shrink-0 sm:mx-0">
                <div className="rounded-full bg-blue-50 p-1 ring-2 ring-blue-100 shadow-sm">
                  <img
                    src={userAvatar}
                    alt={authUser?.name ? `${authUser.name}'s profile photo` : "Student profile photo"}
                    width={96}
                    height={96}
                    className="h-24 w-24 rounded-full object-cover"
                    decoding="async"
                  />
                </div>
              </div>
              <div className="mt-4 min-w-0 text-center sm:mt-0 sm:text-left">
                <p className="text-xl font-black tracking-tight text-gray-900">{display?.name ?? "—"}</p>
                <p className="mt-0.5 truncate text-sm text-gray-500">{display?.email ?? "—"}</p>
              </div>
            </div>

            <dl className="px-6 pb-2 pt-2">
              <ProfileField label="Full name" value={display?.name} />
              <ProfileField label="University email" value={display?.email} />
              <ProfileField label="Member since" value={display?.memberSince} />
              <ProfileField label="Age" value={display?.age ?? NOT_SET} muted={!display?.age} />
              <ProfileField
                label="Academic year"
                value={display?.academicYear ?? NOT_SET}
                muted={!display?.academicYear}
              />
              <ProfileField label="Faculty" value={display?.faculty ?? NOT_SET} muted={!display?.faculty} />
              <ProfileField
                label="Student ID"
                value={display?.studentId ?? NOT_SET}
                muted={!display?.studentId}
              />
              <ProfileField label="Skills" value={display?.skills ?? NOT_SET} muted={!display?.skills} />
            </dl>

            {deleteAccountError ? (
              <div
                className="border-t border-gray-100 px-6 py-3 text-sm text-red-700"
                role="alert"
              >
                {deleteAccountError}
              </div>
            ) : null}

            <div className="flex flex-col gap-2 border-t border-gray-100 px-6 py-4 sm:flex-row sm:justify-end sm:gap-3">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={handleEditProfile}
                disabled={deletingAccount}
              >
                Edit profile
              </Button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
                aria-busy={deletingAccount}
                className="inline-flex w-full items-center justify-center rounded-xl border-2 border-red-100 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 enabled:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {deletingAccount ? (
                  <span className="inline-flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    Deleting…
                  </span>
                ) : (
                  "Delete account"
                )}
              </button>
            </div>

            {loading ? (
              <div
                className="flex items-center gap-2 border-t border-gray-100 px-6 py-3 text-xs text-gray-400"
                role="status"
                aria-live="polite"
              >
                <LoadingSpinner size="sm" />
                <span>Syncing profile…</span>
              </div>
            ) : null}
          </div>
        </section>

        <section aria-labelledby="participation-heading">
          <h2 id="participation-heading" className="text-lg font-black tracking-tight text-gray-900">
            My participation
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Submit and track your SportSync requests from one place. Player registration appears here now, and team
            requests can be linked here from the Teams page.
          </p>

          <div className="mt-4 space-y-4">
            {participationError ? (
              <div
                className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
                role="alert"
              >
                {participationError}
              </div>
            ) : null}

            {participationLoading ? (
              <div
                className="flex min-h-[120px] items-center justify-center gap-2 rounded-2xl border border-gray-100 bg-white py-10 text-sm text-gray-500 shadow-sm ring-1 ring-gray-100"
                role="status"
                aria-live="polite"
              >
                <LoadingSpinner size="sm" />
                <span>Loading linked profiles…</span>
              </div>
            ) : !hasStudentIdOnProfile ? (
              <ParticipationNeedStudentId />
            ) : linkedPlayers.length > 0 ? (
              <ul className="grid list-none gap-3 p-0 sm:grid-cols-2 lg:max-w-3xl">
                {linkedPlayers.map((player) => (
                  <li key={String(player._id)}>
                    <PlayerCard
                      compact
                      player={player}
                      imageSrc={playerPlaceholder}
                      detailTo={`/student/players/${player._id}`}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="space-y-4">
                {requestActionError ? (
                  <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                    {requestActionError}
                  </div>
                ) : null}

                {myPlayerRequest?.status === "pending" ? (
                  <div className="rounded-2xl border border-blue-200 bg-blue-50/90 px-6 py-10 text-center shadow-sm ring-1 ring-blue-100">
                    <p className="text-sm font-semibold text-blue-950">Player request sent</p>
                    <p className="mt-2 text-sm text-blue-900/90">
                      Your details were shared with SportSync admins. You will be registered as a player after they
                      approve your request.
                    </p>
                  </div>
                ) : myPlayerRequest?.status === "approved" ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 px-6 py-8 text-center text-sm text-emerald-900">
                    <p className="font-semibold">Request approved</p>
                    <p className="mt-2 text-emerald-800/95">
                      Your player profile should appear above in a moment. Refresh the page if it does not load.
                    </p>
                  </div>
                ) : myPlayerRequest?.status === "rejected" ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-red-100 bg-red-50/90 px-6 py-6 text-center">
                      <p className="text-sm font-semibold text-red-900">Previous request was not approved</p>
                      {myPlayerRequest.rejectReason ? (
                        <p className="mt-2 text-sm text-red-800/95">{myPlayerRequest.rejectReason}</p>
                      ) : (
                        <p className="mt-2 text-sm text-red-800/90">You can submit a new request below.</p>
                      )}
                    </div>
                    <ParticipationNoLinkedPlayer />
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={handleRequestToBePlayer}
                        disabled={submittingPlayerRequest}
                        className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {submittingPlayerRequest ? (
                          <span className="inline-flex items-center gap-2">
                            <LoadingSpinner size="sm" />
                            Sending…
                          </span>
                        ) : (
                          "Request to be a player"
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <ParticipationNoLinkedPlayer />
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={handleRequestToBePlayer}
                        disabled={submittingPlayerRequest}
                        className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {submittingPlayerRequest ? (
                          <span className="inline-flex items-center gap-2">
                            <LoadingSpinner size="sm" />
                            Sending…
                          </span>
                        ) : (
                          "Request to be a player"
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

          </div>
        </section>

        <section className="mt-8" aria-labelledby="teams-heading">
          <h2 id="teams-heading" className="text-lg font-black tracking-tight text-gray-900">
            My teams
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Teams linked to your player profile appear here. Active teams are currently listed in competitions, while
            inactive teams are archived.
          </p>

          {participationLoading ? (
            <div
              className="mt-4 flex min-h-[120px] items-center justify-center gap-2 rounded-2xl border border-gray-100 bg-white py-10 text-sm text-gray-500 shadow-sm ring-1 ring-gray-100"
              role="status"
              aria-live="polite"
            >
              <LoadingSpinner size="sm" />
              <span>Loading your teams…</span>
            </div>
          ) : !hasStudentIdOnProfile ? (
            <div className="mt-4 rounded-2xl border border-dashed border-amber-200 bg-amber-50/80 px-6 py-10 text-center">
              <p className="text-sm font-semibold text-amber-950">Add your Student ID to see teams</p>
              <p className="mt-2 text-sm text-amber-900/85">
                Your profile Student ID is used to link player records to teams.
              </p>
              <Link
                to="/student/profile/edit"
                className="mt-5 inline-flex items-center justify-center rounded-xl bg-amber-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-900"
              >
                Edit profile
              </Link>
            </div>
          ) : myTeams.length > 0 ? (
            <div className="mt-4 space-y-4">
              <UniqueTeamsSection
                title="Active teams"
                teams={activeTeams}
                emptyHint="You are not linked to any active teams yet."
              />
              <UniqueTeamsSection
                title="Inactive teams"
                teams={inactiveTeams}
                emptyHint="You are not linked to any inactive teams."
              />
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-6 py-10 text-center">
              <p className="text-sm font-semibold text-gray-900">No teams linked yet</p>
              <p className="mt-2 text-sm text-gray-600">
                Ask an organiser to add you to a team, or check whether your Student ID matches the one on file.
              </p>
              <Link
                to="/student/teams"
                className="mt-5 inline-flex items-center justify-center rounded-xl border-2 border-blue-600 px-4 py-2.5 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50"
              >
                Browse teams
              </Link>
            </div>
          )}
        </section>

      </div>
    </>
  );
}
