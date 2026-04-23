import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { getTeams } from "../services/teamService";
import html2pdf from "html2pdf.js";

const TeamDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [playerSearchTerm, setPlayerSearchTerm] = useState("");

  const filteredPlayers = useMemo(() => {
    if (!team?.members) return [];
    const searchLower = playerSearchTerm.toLowerCase();
    return team.members.filter((m) => String(m).toLowerCase().includes(searchLower));
  }, [team?.members, playerSearchTerm]);

  const isStudentRoute = location.pathname.startsWith("/student/");

  const primaryBackLink = isStudentRoute ? "/student/teams" : "/dashboard";
  const primaryBackLabel = isStudentRoute ? "Back to Active Teams" : "Back to Dashboard Overview";

  const secondaryLink = isStudentRoute ? "/student/profile" : "/teams";
  const secondaryLabel = isStudentRoute ? "View User Profile" : "Open Teams Management";

  useEffect(() => {
    const loadTeam = async () => {
      try {
        setLoading(true);
        setError("");
        const teams = await getTeams();
        const foundTeam = teams.find((item) => item._id === id);
        if (!foundTeam) {
          setError("Team not found.");
          setTeam(null);
          return;
        }
        setTeam(foundTeam);
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || "Unable to load team details.");
      } finally {
        setLoading(false);
      }
    };

    loadTeam();
  }, [id]);

  const updatedLabel = useMemo(() => {
    if (!team?.updatedAt) {
      return "-";
    }
    return new Date(team.updatedAt).toLocaleString();
  }, [team]);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading team details...</p>;
  }

  if (error || !team) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-sm text-red-600">{error || "Team not found."}</p>
        <Link to={primaryBackLink} className="mt-3 inline-block text-sm font-semibold text-blue-700 hover:underline">
          {primaryBackLabel}
        </Link>
      </div>
    );
  }

  const handleDownloadPdf = () => {
    const element = document.getElementById("team-details-content");
    const opt = {
      margin: 5,
      filename: `${team?.name || "team"}-details.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-slate-900">Team Details</h2>
        <div className="flex gap-2">
          <button 
            onClick={handleDownloadPdf}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Download PDF
          </button>
          <Link to={secondaryLink} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 print:hidden">
            {secondaryLabel}
          </Link>
          <Link to={primaryBackLink} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 print:hidden">
            {primaryBackLabel}
          </Link>
        </div>
      </div>

      <article id="team-details-content" className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="relative h-56 w-full bg-slate-100">
          <img
            src={team.photoUrl || "/hero-campus.png"}
            alt={`${team.name || "Team"} cover`}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/hero-campus.png";
            }}
          />
          <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg ${
            team.status === 'active' ? 'bg-emerald-600' : 
            team.status === 'rejected' ? 'bg-red-600' : 'bg-amber-500'
          }`}>
            {team.status || "Pending"}
          </span>

        </div>

        <div className="grid gap-5 p-5 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">{team.category || "General"}</p>
            <h3 className="text-3xl font-bold text-slate-900">{team.name || "Unnamed Team"}</h3>
            <p className="text-sm text-slate-600">Captain: {team.captain || team.coach || "Unassigned"}</p>
            <p className="text-sm text-slate-600">Coach: {team.coach || team.captain || "Unassigned"}</p>
            <p className="text-sm text-slate-600">Society: {typeof team.society === "object" ? team.society?.name || "-" : "-"}</p>
            <p className="text-sm text-slate-500">Updated: {updatedLabel}</p>

            {team.adminMessage ? (
              <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                Admin message: {team.adminMessage}
              </div>
            ) : null}

            {team.status === "rejected" && team.rejectionReason ? (
              <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                Rejection reason: {team.rejectionReason}
              </div>
            ) : null}
            
            <div className="mt-4 space-y-2 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Team Contact</p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="text-blue-600">📧</span>
                  <span className="font-medium">{team.contactEmail || "No team email provided"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="text-emerald-600">📞</span>
                  <span className="font-semibold font-mono">{team.contactPhone || "No team phone provided"}</span>
                </div>
              </div>
            </div>
          </div>




          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-800">Players</h4>
                <div className="relative w-40">
                  <input
                    type="text"
                    placeholder="Search players..."
                    className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] outline-none focus:border-blue-400"
                    value={playerSearchTerm}
                    onChange={(e) => setPlayerSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              {filteredPlayers && filteredPlayers.length ? (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                  {filteredPlayers.map((member, index) => (
                    <li key={`${member}-${index}`}>{member}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-sm text-slate-500">
                  {playerSearchTerm ? "No players match your search." : "No players listed."}
                </p>
              )}
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-800">Achievements</h4>
              {Array.isArray(team.achievements) && team.achievements.length ? (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                  {team.achievements.map((achievement, index) => (
                    <li key={`${achievement}-${index}`}>{achievement}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-sm text-slate-500">No achievements added yet.</p>
              )}
            </div>
          </div>
        </div>
      </article>
    </section>
  );
};

export default TeamDetails;