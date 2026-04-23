import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getTeamById, updateTeam } from "../../../api/teams";
import { getPlayers } from "../../../api/players";
import { PlayerPicker } from "../../../components/admin/teams/PlayerPicker";
import { Button } from "../../../components/ui/Button";
import { LoadingState } from "../../../components/ui/LoadingSpinner";
import { SelectField } from "../../../components/ui/SelectField";
import { TextField } from "../../../components/ui/TextField";
import { getApiErrorMessage } from "../../../utils/apiError";
import { getTitleOrSportTypeError } from "../../../utils/eventValidation";
import { refToId } from "../../../utils/eventFormUtils";
import { downloadSingleTeamPdf } from "../../../utils/teamPdfExport";

const SOCIETY_OPTIONS = [
  "Sliit",
  "IEEE",
  "FOSS",
  "Rotaract",
  "Leo",
  "Other",
];

export default function AdminTeamDetailPage() {
  const { teamId } = useParams();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [teamName, setTeamName] = useState("");
  const [sportType, setSportType] = useState("");
  const [society, setSociety] = useState("Sliit");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [memberIds, setMemberIds] = useState([]);
  const [captainId, setCaptainId] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [teamData, playersData] = await Promise.all([
          getTeamById(teamId),
          getPlayers()
        ]);
        if (!cancelled) {
          setTeam(teamData);
          setPlayers(Array.isArray(playersData) ? playersData : []);
          
          setTeamName(teamData.teamName || "");
          setSportType(teamData.sportType || "");
          setSociety(teamData.society || "Sliit");
          setContactEmail(teamData.contactEmail || "");
          setContactPhone(teamData.contactPhone || "");
          setMemberIds(Array.isArray(teamData.members) ? teamData.members.map(m => String(m._id || m)) : []);
          setCaptainId(teamData.captain ? String(teamData.captain._id || teamData.captain) : "");
          setIsActive(teamData.isActive !== false);
        }
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, "Could not load data."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [teamId]);

  const captainOptions = useMemo(() => {
    const set = new Set(memberIds.map(String));
    return players.filter((p) => set.has(String(p._id)));
  }, [players, memberIds]);

  const memberIdsSet = useMemo(() => new Set(memberIds.map(String)), [memberIds]);

  useEffect(() => {
    if (captainId && !memberIds.map(String).includes(String(captainId))) {
      setCaptainId("");
    }
  }, [memberIds, captainId]);

  const getAssignedTeamLabel = (player) => {
    if (!Array.isArray(player?.teams) || player.teams.length === 0) return "";
    const firstTeam = player.teams.find((t) => t?.isActive !== false && String(t?._id) !== teamId);
    if (!firstTeam) return "";
    const tName = typeof firstTeam?.teamName === "string" ? firstTeam.teamName.trim() : "";
    if (!tName) return "Already in another team";
    return `Already in ${tName}`;
  };

  const validate = () => {
    const next = {};
    if (!teamName.trim()) next.teamName = "Team name is required";
    const sportErr = getTitleOrSportTypeError(sportType, "Sport type");
    if (sportErr) next.sportType = sportErr;
    if (!society.trim()) next.society = "Society is required";
    const email = contactEmail.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.contactEmail = "Please enter a valid email address.";
    }
    const phone = contactPhone.trim();
    if (phone && !/^[+]?[-()\d\s]{7,20}$/.test(phone)) {
      next.contactPhone = "Please enter a valid contact number.";
    }
    if (memberIds.length === 0) next.members = "Select at least one player";
    
    const blockedSelected = players.some(
      (p) =>
        memberIdsSet.has(String(p._id)) &&
        Array.isArray(p.teams) &&
        p.teams.some((t) => t?.isActive !== false && String(t?._id) !== teamId)
    );
    if (blockedSelected) next.members = "Players already assigned to another team cannot be selected.";
    
    if (!captainId) next.captain = "Captain is required";
    if (captainId && !memberIds.map(String).includes(String(captainId))) {
      next.captain = "Captain must be one of the selected players";
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setError("");
    try {
      const members = [...new Set([...memberIds.map(String), String(captainId)])];
      await updateTeam(teamId, {
        teamName: teamName.trim(),
        sportType: sportType.trim(),
        society: society.trim(),
        contactEmail: contactEmail.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        captain: captainId,
        members,
        isActive
      });
      navigate("/admin/teams", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not update team."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Loading team details…" />;
  
  if (!team && !loading) {
    return (
      <div>
        <Link to="/admin/teams" className="text-sm font-semibold text-blue-600 hover:underline">
          ← Back to teams
        </Link>
        <p className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error || "Team not found."}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="border-b border-gray-100 pb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <Link to="/admin/teams" className="text-sm font-semibold text-blue-600 hover:underline">
            ← Back to teams
          </Link>
          <h1 className="mt-3 text-2xl font-black tracking-tight text-gray-900 md:text-3xl">Edit team</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-600">
            Update team details, members, and captain.
          </p>
        </div>
        
        <button
          type="button"
          onClick={() => downloadSingleTeamPdf(team)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download PDF
        </button>
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-8 max-w-5xl space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="team-name"
            name="teamName"
            label="Team name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            error={fieldErrors.teamName}
            required
          />
          <TextField
            id="team-sport"
            name="sportType"
            label="Sport type"
            value={sportType}
            onChange={(e) => setSportType(e.target.value)}
            error={fieldErrors.sportType}
            required
            placeholder="e.g. Cricket"
          />
        </div>

        <SelectField
          id="team-society"
          name="society"
          label="Society"
          value={society}
          onChange={(e) => setSociety(e.target.value)}
          error={fieldErrors.society}
          required
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
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            error={fieldErrors.contactEmail}
            placeholder="team@example.com"
          />
          <TextField
            id="team-contact-phone"
            name="contactPhone"
            label="Team Contact Phone"
            value={contactPhone}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 10);
              setContactPhone(val);
            }}
            error={fieldErrors.contactPhone}
            placeholder="0771234567"
          />
        </div>

        <div>
          <p className="mb-1.5 text-sm font-semibold text-gray-700">Players</p>
          <p className="mb-1 text-xs text-gray-500">Select at least one player. The captain must be chosen from this list.</p>
          <p className="mb-2 text-xs text-gray-500">Players already assigned to another active team are disabled.</p>
          {fieldErrors.members ? (
            <p className="mb-2 text-sm text-red-600" role="alert">
              {fieldErrors.members}
            </p>
          ) : null}
          <PlayerPicker
            players={players}
            selectedIds={memberIds}
            onChange={setMemberIds}
            disabled={saving}
            showSearch
            searchPlaceholder="Search players by name or email..."
            isOptionDisabled={(player) => {
              if (memberIdsSet.has(String(player._id))) return "";
              return getAssignedTeamLabel(player);
            }}
          />
        </div>

        <SelectField
          id="team-captain"
          name="captain"
          label="Captain"
          value={captainId}
          onChange={(e) => setCaptainId(e.target.value)}
          error={fieldErrors.captain}
          required
          disabled={captainOptions.length === 0}
        >
          <option value="">{captainOptions.length ? "Select captain…" : "Select players first"}</option>
          {captainOptions.map((p) => (
            <option key={p._id} value={p._id}>
              {p.fullName ?? refToId(p)}
              {p.studentId ? ` (${p.studentId})` : ""}
            </option>
          ))}
        </SelectField>

        <div className="flex items-center gap-2 mt-4">
          <input
            type="checkbox"
            id="team-is-active"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="team-is-active" className="text-sm font-medium text-gray-700">
            Team is active
          </label>
        </div>
        <p className="text-xs text-gray-500 mt-1">Inactive teams stay in the system but won't be shown in active listings.</p>

        <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-6">
          <Button type="submit" variant="primary" size="sm" disabled={saving || players.length === 0}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={saving} onClick={() => navigate("/admin/teams")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
