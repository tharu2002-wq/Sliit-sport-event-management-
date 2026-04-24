import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import teamPlaceholder from "../../../assets/team.jpg";
import { getTeamById } from "../../../api/teams";
import { DashboardPageHeader } from "../../../components/student-dashboard/DashboardPageHeader";
import { LoadingState } from "../../../components/ui/LoadingSpinner";
import { Button } from "../../../components/ui/Button";
import { getApiErrorMessage } from "../../../utils/apiError";
import { cn } from "../../../utils/cn";
import { downloadSingleTeamPdf } from "../../../utils/teamPdfExport";

export default function StudentTeamDetailPage() {
  const { teamId } = useParams();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!teamId) return;
    let cancelled = false;
    (async () => {
      setError("");
      setLoading(true);
      try {
        const teamData = await getTeamById(teamId);
        if (!cancelled) {
          setTeam(teamData);
        }
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, "Could not load this team."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [teamId]);

  if (loading) {
    return (
      <>
        <DashboardPageHeader title="Team" description="Loading…" />
        <LoadingState label="Loading team…" minHeight={false} className="mt-4" />
      </>
    );
  }

  if (error || !team) {
    return (
      <>
        <DashboardPageHeader title="Team" description="We couldn’t open this team." />
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error || "Team not found."}
        </div>
        <Button type="button" variant="outline" className="mt-6" to="/student/teams">
          Back to teams
        </Button>
      </>
    );
  }

  const active = team.isActive !== false;
  const members = Array.isArray(team.members) ? team.members : [];

  return (
    <>
      <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <Button type="button" variant="outline" size="sm" to="/student/teams" className="mb-4">
            ← Back to teams
          </Button>
          <DashboardPageHeader title={team.teamName} description={team.sportType} />
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

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm ring-1 ring-gray-100">
        <div className="aspect-[21/9] w-full overflow-hidden bg-gray-100 sm:aspect-[24/9]">
          <img src={teamPlaceholder} alt="" className="h-full w-full object-cover" decoding="async" />
        </div>
        <div className="p-6">
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ring-1",
                active ? "bg-emerald-50 text-emerald-800 ring-emerald-100" : "bg-gray-100 text-gray-600 ring-gray-200"
              )}
            >
              {active ? "Active" : "Inactive"}
            </span>
            <span className="text-sm font-bold text-blue-700">{team.sportType}</span>
            {team.society && (
              <span className="ml-2 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                {team.society}
              </span>
            )}
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="border-t border-gray-100 pt-6">
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Captain</h2>
              {team.captain ? (
                <p className="mt-2 text-base font-semibold text-gray-900">{team.captain.fullName}</p>
              ) : (
                <p className="mt-2 text-sm text-gray-500">No captain assigned.</p>
              )}
              {team.captain?.studentId ? (
                <p className="text-sm text-gray-600">ID: {team.captain.studentId}</p>
              ) : null}
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Contact Info</h2>
              <div className="mt-2 space-y-1">
                {team.contactEmail ? (
                  <p className="text-sm text-gray-900">
                    <span className="font-medium text-gray-500">Email:</span> {team.contactEmail}
                  </p>
                ) : null}
                {team.contactPhone ? (
                  <p className="text-sm text-gray-900">
                    <span className="font-medium text-gray-500">Phone:</span> {team.contactPhone}
                  </p>
                ) : null}
                {!team.contactEmail && !team.contactPhone && (
                  <p className="text-sm text-gray-500">No contact info available.</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">
              Team members ({members.length})
            </h2>
            {members.length === 0 ? (
              <p className="mt-3 text-sm text-gray-500">No players on this roster yet.</p>
            ) : (
              <ul className="mt-4 divide-y divide-gray-100 rounded-xl border border-gray-100">
                {members.map((p) => (
                  <li key={String(p._id)} className="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="font-semibold text-gray-900">{p.fullName}</span>
                    <span className="text-sm text-gray-500 sm:text-right">
                      {[p.studentId && `ID: ${p.studentId}`, p.email].filter(Boolean).join(" · ") || "—"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
