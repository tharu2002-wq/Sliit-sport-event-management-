import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTeamRequest, getMyTeamRequest, getMyTeamRequests } from "../../../api/teamRequests";
import { getPlayers } from "../../../api/players";
import { PlayerPicker } from "../../../components/admin/teams/PlayerPicker";
import { DashboardPageHeader } from "../../../components/student-dashboard/DashboardPageHeader";
import { LoadingSpinner, LoadingState } from "../../../components/ui/LoadingSpinner";
import { Button } from "../../../components/ui/Button";
import { SelectField } from "../../../components/ui/SelectField";
import { TextField } from "../../../components/ui/TextField";
import { getApiErrorMessage } from "../../../utils/apiError";
import { getTitleOrSportTypeError } from "../../../utils/eventValidation";
import { cn } from "../../../utils/cn";

const SOCIETY_OPTIONS = ["Sliit", "IEEE", "FOSS", "Rotaract", "Leo", "Other"];

export default function StudentTeamRequestPage() {
  const navigate = useNavigate();
  const [allPlayers, setAllPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    teamName: "",
    sportType: "",
    society: "Sliit",
    contactEmail: "",
    contactPhone: "",
    memberIds: [],
    captainId: "",
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const players = await getPlayers();
        if (!cancelled) setAllPlayers(Array.isArray(players) ? players : []);
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, "Could not load players."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const captainOptions = useMemo(() => {
    const set = new Set(formData.memberIds.map(String));
    return allPlayers.filter((p) => set.has(String(p._id)));
  }, [allPlayers, formData.memberIds]);

  const memberIdsSet = useMemo(() => new Set(formData.memberIds.map(String)), [formData.memberIds]);

  const getAssignedTeamLabel = (player) => {
    if (!Array.isArray(player?.teams) || player.teams.length === 0) return "";
    const firstTeam = player.teams.find((team) => team?.isActive !== false);
    if (!firstTeam) return "";
    const teamName = typeof firstTeam?.teamName === "string" ? firstTeam.teamName.trim() : "";
    if (!teamName) return "Already in another team";
    return `Already in ${teamName}`;
  };

  useEffect(() => {
    if (formData.captainId && !formData.memberIds.map(String).includes(String(formData.captainId))) {
      setFormData((prev) => ({ ...prev, captainId: "" }));
    }
  }, [formData.memberIds, formData.captainId]);

  const validate = () => {
    const next = {};
    if (!formData.teamName.trim()) next.teamName = "Team name is required";
    const sportErr = getTitleOrSportTypeError(formData.sportType, "Sport type");
    if (sportErr) next.sportType = sportErr;
    if (!formData.society.trim()) next.society = "Society is required";
    const email = formData.contactEmail.trim();
    if (!email) {
      next.contactEmail = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.contactEmail = "Please enter a valid email address.";
    }

    const phone = formData.contactPhone.trim().replace(/[-\s]/g, "");
    if (!phone) {
      next.contactPhone = "Phone number is required.";
    } else if (!/^\d{10}$/.test(phone)) {
      next.contactPhone = "Contact number must be exactly 10 digits.";
    }
    if (formData.memberIds.length === 0) next.members = "Select at least one player";
    const blockedSelected = allPlayers.some(
      (p) => memberIdsSet.has(String(p._id)) && Array.isArray(p.teams) && p.teams.some((t) => t?.isActive !== false)
    );
    if (blockedSelected) next.members = "Players already assigned to another team cannot be selected.";
    if (!formData.captainId) next.captain = "Captain is required";
    if (formData.captainId && !formData.memberIds.map(String).includes(String(formData.captainId))) {
      next.captain = "Captain must be one of the selected players";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setError("");
    try {
      const members = [...new Set([...formData.memberIds.map(String), String(formData.captainId)])];
      await createTeamRequest({
        teamName: formData.teamName.trim(),
        sportType: formData.sportType.trim(),
        society: formData.society.trim(),
        contactEmail: formData.contactEmail.trim() || undefined,
        contactPhone: formData.contactPhone.trim() || undefined,
        captain: formData.captainId,
        members,
      });
      navigate("/student/teams", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not submit your team request."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading players…" />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-6">
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          className="rounded-full"
          onClick={() => navigate("/student/teams")}
        >
          ← Back
        </Button>
        <DashboardPageHeader
          title="Request new team"
          description="Submit a request to establish a new sports team at SLIIT. Your request will be reviewed by organisers."
        />
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm ring-1 ring-gray-100">
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
            disabled={submitting}
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
            disabled={submitting}
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
          disabled={submitting}
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
            disabled={submitting}
            required
          />
          <TextField
            id="team-contact-phone"
            name="contactPhone"
            label="Team Contact Phone"
            value={formData.contactPhone}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 10);
              setFormData({ ...formData, contactPhone: val });
            }}
            error={errors.contactPhone}
            placeholder="0771234567"
            disabled={submitting}
            required
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
            players={allPlayers}
            selectedIds={formData.memberIds}
            onChange={(ids) => setFormData({ ...formData, memberIds: ids })}
            disabled={submitting}
            showSearch
            searchPlaceholder="Search players by name or email..."
            isOptionDisabled={getAssignedTeamLabel}
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
          disabled={captainOptions.length === 0 || submitting}
        >
          <option value="">{captainOptions.length ? "Select captain…" : "Select players first"}</option>
          {captainOptions.map((p) => (
            <option key={p._id} value={p._id}>
              {p.fullName}
            </option>
          ))}
        </SelectField>

        <div className="flex justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl px-6"
            onClick={() => navigate("/student/teams")}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="rounded-xl px-6"
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <LoadingSpinner size="sm" />
                Sending…
              </span>
            ) : (
              "Submit Request"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
