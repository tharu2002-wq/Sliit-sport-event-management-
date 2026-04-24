import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { acceptTeamRequest, listTeamRequests, rejectTeamRequest } from "../../../api/teamRequests";
import { Button } from "../../../components/ui/Button";
import { LoadingState } from "../../../components/ui/LoadingSpinner";
import { TextAreaField } from "../../../components/ui/TextAreaField";
import { cn } from "../../../utils/cn";
import { getApiErrorMessage } from "../../../utils/apiError";

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-amber-50 text-amber-900 ring-amber-200",
    approved: "bg-emerald-50 text-emerald-900 ring-emerald-200",
    rejected: "bg-red-50 text-red-900 ring-red-200",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ring-1",
        styles[status] ?? "bg-gray-50 text-gray-800 ring-gray-200"
      )}
    >
      {status}
    </span>
  );
}

function personLabel(person) {
  if (!person) return "—";
  if (typeof person === "object") {
    return [person.fullName, person.studentId].filter(Boolean).join(" · ") || "—";
  }
  return String(person);
}

export default function AdminTeamRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [detailsFor, setDetailsFor] = useState(null);
  const [acceptingId, setAcceptingId] = useState("");
  const [rejectFor, setRejectFor] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectSaving, setRejectSaving] = useState(false);
  const [rejectError, setRejectError] = useState("");

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const params = statusFilter === "all" ? {} : { status: statusFilter };
      const data = await listTeamRequests(params);
      setRequests(data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not load team requests."));
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const openReject = (req) => {
    setRejectError("");
    setRejectReason("");
    setRejectFor(req);
  };

  const closeDetails = () => {
    setDetailsFor(null);
  };

  const submitAccept = async (req) => {
    if (!req?._id) return;
    setAcceptingId(String(req._id));
    setError("");
    try {
      await acceptTeamRequest(String(req._id), {});
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not approve request."));
    } finally {
      setAcceptingId("");
    }
  };

  const submitReject = async (e) => {
    e.preventDefault();
    if (!rejectFor?._id) return;
    setRejectError("");
    setRejectSaving(true);
    try {
      await rejectTeamRequest(String(rejectFor._id), {
        reason: rejectReason.trim() || undefined,
      });
      setRejectFor(null);
      setRejectReason("");
      await load();
    } catch (err) {
      setRejectError(getApiErrorMessage(err, "Could not reject request."));
    } finally {
      setRejectSaving(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-gray-100 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 md:text-3xl">Team requests</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-600">
            Requests submitted by students to create new teams. Approve to create the team immediately, or reject with a reason.
          </p>
        </div>
        <Button to="/admin/teams" variant="outline" size="sm" className="shrink-0">
          Team list
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <label className="text-sm font-semibold text-gray-700" htmlFor="admin-tr-status">
          Status
        </label>
        <select
          id="admin-tr-status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="pending">Pending</option>
          <option value="all">All</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <LoadingState label="Loading requests…" className="mt-10" />
      ) : requests.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-10 text-center text-sm text-gray-600">
          No requests for this filter.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm ring-1 ring-gray-100">
          <table className="min-w-full divide-y divide-gray-100 text-left text-sm">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-4 py-3 font-bold text-gray-700">Student</th>
                <th className="px-4 py-3 font-bold text-gray-700">Team</th>
                <th className="px-4 py-3 font-bold text-gray-700">Sport / Society</th>
                <th className="px-4 py-3 font-bold text-gray-700">Captain</th>
                <th className="px-4 py-3 font-bold text-gray-700">Members</th>
                <th className="px-4 py-3 font-bold text-gray-700">Requested</th>
                <th className="px-4 py-3 font-bold text-gray-700">Status</th>
                <th className="px-4 py-3 font-bold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.map((r) => {
                const memberCount = Array.isArray(r.members) ? r.members.length : 0;
                return (
                  <tr key={String(r._id)} className="align-top">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">{r.user?.name ?? "—"}</div>
                      <div className="text-xs text-gray-500">{r.user?.email ?? ""}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{r.teamName}</td>
                    <td className="px-4 py-3 text-gray-600">
                      <div>{r.sportType}</div>
                      <div className="text-xs text-gray-500">{r.society || "—"}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{personLabel(r.captain)}</td>
                    <td className="px-4 py-3 text-gray-600">{memberCount}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                      {r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3">
                      {r.status === "pending" ? (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setDetailsFor(r)}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                          >
                            View details
                          </button>
                          <button
                            type="button"
                            onClick={() => submitAccept(r)}
                            disabled={acceptingId === String(r._id)}
                            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                          >
                            {acceptingId === String(r._id) ? "Approving…" : "Accept"}
                          </button>
                          <button
                            type="button"
                            onClick={() => openReject(r)}
                            className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                          >
                            Reject
                          </button>
                        </div>
                      ) : r.status === "approved" && r.createdTeam ? (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setDetailsFor(r)}
                            className="text-xs font-semibold text-blue-700 hover:text-blue-800"
                          >
                            View details
                          </button>
                          <Link to={`/admin/teams/${r.createdTeam}`} className="text-xs font-semibold text-blue-700 hover:text-blue-800">
                            Open team
                          </Link>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDetailsFor(r)}
                          className="text-xs font-semibold text-blue-700 hover:text-blue-800"
                        >
                          View details
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {detailsFor ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="details-tr-title"
        >
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h2 id="details-tr-title" className="text-lg font-black text-gray-900">
                  Team request details
                </h2>
                <p className="mt-1 text-sm text-gray-600">{detailsFor.teamName}</p>
              </div>
              <StatusBadge status={detailsFor.status} />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <DetailItem label="Student" value={detailsFor.user?.name ?? "—"} />
              <DetailItem label="Email" value={detailsFor.user?.email ?? "—"} />
              <DetailItem label="Sport type" value={detailsFor.sportType ?? "—"} />
              <DetailItem label="Society" value={detailsFor.society ?? "—"} />
              <DetailItem label="Captain" value={personLabel(detailsFor.captain)} />
              <DetailItem label="Members" value={String(Array.isArray(detailsFor.members) ? detailsFor.members.length : 0)} />
              <DetailItem label="Contact email" value={detailsFor.contactEmail ?? "—"} />
              <DetailItem label="Contact phone" value={detailsFor.contactPhone ?? "—"} />
              <DetailItem label="Requested" value={detailsFor.createdAt ? new Date(detailsFor.createdAt).toLocaleString() : "—"} />
              <DetailItem label="Reviewed" value={detailsFor.reviewedAt ? new Date(detailsFor.reviewedAt).toLocaleString() : "—"} />
            </div>

            {Array.isArray(detailsFor.members) && detailsFor.members.length > 0 ? (
              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-900">Players</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {detailsFor.members.map((member) => (
                    <span
                      key={String(member?._id ?? member)}
                      className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                    >
                      {personLabel(member)}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={closeDetails}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              {detailsFor.status === "pending" ? (
                <>
                  <button
                    type="button"
                    onClick={async () => {
                      closeDetails();
                      await submitAccept(detailsFor);
                    }}
                    disabled={acceptingId === String(detailsFor._id)}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {acceptingId === String(detailsFor._id) ? "Approving…" : "Accept request"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      closeDetails();
                      openReject(detailsFor);
                    }}
                    className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                  >
                    Reject
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {rejectFor ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-tr-title"
        >
          <form onSubmit={submitReject} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 id="reject-tr-title" className="text-lg font-black text-gray-900">
              Reject team request
            </h2>
            <p className="mt-1 text-sm text-gray-600">{rejectFor.teamName}</p>

            {rejectError ? (
              <p className="mt-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-800">{rejectError}</p>
            ) : null}

            <TextAreaField
              id="reject-tr-reason"
              label="Reason (optional)"
              name="reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="mt-4"
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => !rejectSaving && setRejectFor(null)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={rejectSaving}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {rejectSaving ? "Rejecting…" : "Reject request"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}