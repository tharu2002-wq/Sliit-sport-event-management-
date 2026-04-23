import { useEffect, useMemo, useState } from "react";
import TeamCard from "../components/TeamCard";
import { getMembers } from "../services/memberService";
import { getSocieties } from "../services/societyService";
import { createTeam, deleteTeam, getTeams, reviewTeamRequest, updateTeam } from "../services/teamService";

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [societies, setSocieties] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [captainId, setCaptainId] = useState("");
  const [editingId, setEditingId] = useState("");
  const [error, setError] = useState("");
  const [listMessage, setListMessage] = useState("");
  const [memberSearchTerm, setMemberSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("form");
  const [reviewingId, setReviewingId] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [pendingRejectId, setPendingRejectId] = useState("");
  const [rejectionError, setRejectionError] = useState("");
  const [form, setForm] = useState({
    society: "",
    name: "",
    category: "",
    photoUrl: "",
    contactEmail: "",
    contactPhone: "",
    achievements: [],
  });

  const getMemberKey = (member) => {
    const raw = member?.fullName || member?.email || member?._id || "";
    return String(raw).trim().toLowerCase();
  };

  const assignedMemberKeys = useMemo(() => {
    const blocked = new Set();
    teams
      .filter((team) => team._id !== editingId)
      .forEach((team) => {
        (team.members || []).forEach((memberName) => {
          const key = String(memberName || "").trim().toLowerCase();
          if (key) {
            blocked.add(key);
          }
        });
      });
    return blocked;
  }, [teams, editingId]);

  const load = async () => {
    const [teamsData, societiesData, membersData] = await Promise.all([getTeams(), getSocieties(), getMembers()]);
    setTeams(teamsData);
    setSocieties(societiesData);
    setMembers(membersData);
    if (societiesData.length && !form.society) {
      setForm((prev) => ({ ...prev, society: societiesData[0]._id }));
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleMember = (id) => {
    const member = members.find((item) => item._id === id);
    const key = getMemberKey(member);
    // No block logic


    setSelectedMemberIds((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
    setCaptainId((prev) => (prev === id ? "" : prev));
  };

  const resetForm = () => {
    setEditingId("");
    setError("");
    setForm((prev) => ({ ...prev, name: "", category: "", photoUrl: "", contactEmail: "", contactPhone: "", achievements: [] }));
    setSelectedMemberIds([]);
    setCaptainId("");
  };

  const handleEdit = (team) => {
    setError("");
    setEditingId(team._id);
    setForm({
      society: team.society?._id || team.society || "",
      name: team.name || "",
      category: team.category || "",
      photoUrl: team.photoUrl || "",
      contactEmail: team.contactEmail || "",
      contactPhone: team.contactPhone || "",
      achievements: Array.isArray(team.achievements) ? team.achievements : [],
    });
    const memberIds = members
      .filter((member) => team.members?.includes(member.fullName) || team.members?.includes(member.email))
      .map((m) => m._id);
    setSelectedMemberIds(memberIds);
    
    const captain = members.find(
      (member) => member.fullName === team.captain || member.email === team.captain
    );
    setCaptainId(captain?._id || "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const selectedMembers = members.filter((member) => selectedMemberIds.includes(member._id));
    const captain = members.find((member) => member._id === captainId);

    const payload = {
      ...form,
      captain: captain?.fullName || "",
      members: selectedMembers.map((member) => member.fullName || member.email || member._id),
      achievements: Array.isArray(form.achievements) ? form.achievements : [],
      status: "active",
      rejectionReason: "",
    };

    try {
      if (editingId) {
        await updateTeam(editingId, payload);
        setListMessage("Team updated successfully.");
      } else {
        await createTeam(payload);
        setListMessage("Team created successfully.");
      }
      resetForm();
      await load();
      setSearchTerm("");
      setViewMode("list");
    } catch (error) {
      setError(error?.response?.data?.message || "Unable to save team.");
    }
  };

  const handleDelete = async (id) => {
    await deleteTeam(id);
    load();
  };

  const handleApprove = async (id) => {
    try {
      setReviewingId(id);
      setListMessage("");
      await reviewTeamRequest(id, { status: "active", adminMessage: "Approved by admin" });
      setListMessage("Request approved successfully.");
      await load();
    } catch (error) {
      setListMessage(error?.response?.data?.message || "Failed to approve request.");
    } finally {
      setReviewingId("");
    }
  };

  const handleRejectClick = (id) => {
    setPendingRejectId(id);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    try {
      setReviewingId(pendingRejectId);
      setListMessage("");
      setRejectionError("");
      await reviewTeamRequest(pendingRejectId, { status: "rejected", adminMessage: rejectionReason || "Rejected by admin" });
      setListMessage("Request rejected successfully.");
      setShowRejectModal(false);
      setRejectionReason("");
      setPendingRejectId("");
      await load();
    } catch (error) {
      setListMessage(error?.response?.data?.message || "Failed to reject request.");
    } finally {
      setReviewingId("");
    }
  };

  const pendingTeams = teams.filter((t) => t.status === "pending");
  const approvedTeams = teams.filter((t) => t.status === "active");
  const rejectedTeams = teams.filter((t) => t.status === "rejected");

  const formatDate = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getSocietyName = (team) => {
    if (!team.society) return "-";
    if (typeof team.society === 'object') return team.society.name;
    const soc = societies.find(s => s._id === team.society);
    return soc ? soc.name : "-";
  };

  const [searchTerm, setSearchTerm] = useState("");

  const filteredPendingTeams = pendingTeams.filter((team) => {
    const searchLower = searchTerm.toLowerCase();
    const socName = getSocietyName(team).toLowerCase();
    return (
      (team.name && team.name.toLowerCase().includes(searchLower)) ||
      (team.category && team.category.toLowerCase().includes(searchLower)) ||
      (team.customId && team.customId.toLowerCase().includes(searchLower)) ||
      socName.includes(searchLower)
    );
  });

  const filteredApprovedTeams = approvedTeams.filter((team) => {
    const searchLower = searchTerm.toLowerCase();
    const socName = getSocietyName(team).toLowerCase();
    return (
      (team.name && team.name.toLowerCase().includes(searchLower)) ||
      (team.category && team.category.toLowerCase().includes(searchLower)) ||
      (team.customId && team.customId.toLowerCase().includes(searchLower)) ||
      socName.includes(searchLower)
    );
  });

  const filteredRejectedTeams = rejectedTeams.filter((team) => {
    const searchLower = searchTerm.toLowerCase();
    const socName = getSocietyName(team).toLowerCase();
    return (
      (team.name && team.name.toLowerCase().includes(searchLower)) ||
      (team.category && team.category.toLowerCase().includes(searchLower)) ||
      (team.customId && team.customId.toLowerCase().includes(searchLower)) ||
      socName.includes(searchLower)
    );
  });

  return (
    <section className="space-y-8">
      <div className="border-b border-ink/10 pb-6">
        <h2 className="font-display text-3xl text-ink">Teams</h2>
        <p className="mt-2 text-sm text-ink/70">Create teams directly and manage active, pending, and rejected records.</p>
        
        <div className="mt-4 flex gap-3">
          <button
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              viewMode === "form"
                ? "bg-blue-600 text-white"
                : "border border-ink/20 text-ink hover:bg-slate-100"
            }`}
            onClick={() => setViewMode("form")}
            type="button"
          >
            Create Team
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              viewMode === "list"
                ? "bg-blue-600 text-white"
                : "border border-ink/20 text-ink hover:bg-slate-100"
            }`}
            onClick={() => setViewMode("list")}
            type="button"
          >
            All Teams
          </button>
        </div>
      </div>

      {viewMode === "form" && (
        <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">

        <h2 className="text-3xl font-bold text-slate-900">{editingId ? "Edit team" : "Create team"}</h2>
        <p className="mb-5 mt-1 text-sm text-slate-500">
          {editingId ? "Update team information and members." : "Choose players that already exist in the system. The captain must be one of the selected players."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm font-semibold text-slate-700">Team name *</span>
              <input
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                placeholder="Team 1"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm font-semibold text-slate-700">Sport type *</span>
              <input
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                placeholder="Cricket"
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
              />
            </label>


          </div>

          <label className="block space-y-1">
            <span className="text-sm font-semibold text-slate-700">Society *</span>
            <select
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              value={form.society}
              onChange={(e) => setForm((prev) => ({ ...prev, society: e.target.value }))}
            >
              {societies.map((society) => (
                <option key={society._id} value={society._id}>
                  {society.name}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm font-semibold text-slate-700">Team Contact Email</span>
              <input
                type="email"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                placeholder="team@example.com"
                value={form.contactEmail}
                onChange={(e) => setForm((prev) => ({ ...prev, contactEmail: e.target.value }))}
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-semibold text-slate-700">Team Contact Phone</span>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                placeholder="0771234567"
                value={form.contactPhone}
                onChange={(e) => setForm((prev) => ({ ...prev, contactPhone: e.target.value.replace(/\D/g, "") }))}
                maxLength={10}
              />
            </label>
          </div>


          <div>
            <p className="text-sm font-semibold text-slate-700">Players</p>
            <p className="mb-2 text-xs text-slate-500">Select at least one player. The captain must be chosen from this list.</p>
            <p className="mb-2 text-xs text-slate-500">Players already assigned to another team are disabled.</p>
            
            <input
              type="text"
              placeholder="Search players by name or email..."
              className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              value={memberSearchTerm}
              onChange={(e) => setMemberSearchTerm(e.target.value)}
            />

            <div className="max-h-52 space-y-2 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3">
              {members.filter((member) => {
                const searchLower = memberSearchTerm.toLowerCase();
                return (
                  (member.fullName && member.fullName.toLowerCase().includes(searchLower)) ||
                  (member.email && member.email.toLowerCase().includes(searchLower))
                );
              }).map((member) => (
                <label
                  key={member._id}
                    className="cursor-pointer flex items-start gap-2 rounded-md bg-white px-2 py-2"

                >
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={selectedMemberIds.includes(member._id)}
                    disabled={false}

                    onChange={() => handleToggleMember(member._id)}
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{member.fullName || "Unnamed member"}</p>
                    <p className="text-xs text-slate-500">{member.email || "No email"}</p>
                    {assignedMemberKeys.has(getMemberKey(member)) && (
                      <p className="text-xs font-medium text-amber-600">Already in another team</p>
                    )}
                  </div>
                </label>
              ))}
              {!members.filter((member) => {
                const searchLower = memberSearchTerm.toLowerCase();
                return (
                  (member.fullName && member.fullName.toLowerCase().includes(searchLower)) ||
                  (member.email && member.email.toLowerCase().includes(searchLower))
                );
              }).length && <p className="text-sm text-slate-500">No players found.</p>}
            </div>
          </div>

          <label className="block space-y-1">
            <span className="text-sm font-semibold text-slate-700">Captain *</span>
            <select
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              value={captainId}
              onChange={(e) => setCaptainId(e.target.value)}
            >
              <option value="">Select players first</option>
              {members
                .filter((member) => selectedMemberIds.includes(member._id))
                .map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.fullName || member.email || member._id}
                  </option>
                ))}
            </select>
          </label>

          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700" type="submit">
            {editingId ? "Update Team" : "Save Team"}
          </button>
          {editingId && (
            <button
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              type="button"
              onClick={resetForm}
            >
              Cancel
            </button>
          )}
          {error ? <p className="text-sm font-medium text-coral">{error}</p> : null}
        </form>
      </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Reject Team Request</h3>
            <label className="block mb-2">
              <span className="text-sm font-medium text-slate-900">Rejection Reason (Optional)</span>
            </label>
            <textarea
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 mb-4"
              placeholder="Enter rejection reason (optional)..."
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value);
                setRejectionError("");
              }}
              rows="4"
              maxLength="500"
            />
            <p className="text-xs text-slate-500 mb-4">{rejectionReason.length}/500</p>
            <div className="flex gap-2">
              <button
                className="flex-1 rounded-lg bg-red-600 hover:bg-red-700 px-4 py-2 text-sm font-semibold text-white transition cursor-pointer"
                onClick={handleReject}
              >
                Reject
              </button>
              <button
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason("");
                  setPendingRejectId("");
                  setRejectionError("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {viewMode === "list" && (
        <div className="space-y-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h3 className="font-semibold text-ink text-lg">All Teams</h3>
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Search by name, category or society..."
                className="input-shell w-full pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
              </span>
            </div>
          </div>

          {listMessage ? (
            <p className="text-sm font-medium text-ink/80">{listMessage}</p>
          ) : null}

          <div>
            <h3 className="font-semibold text-ink text-lg mb-4">Pending Requests</h3>
            <div className="overflow-x-auto rounded-2xl border border-amber-200 bg-white shadow-sm">
              <table className="w-full min-w-[1020px] table-auto text-left">
                <thead className="border-b border-amber-200 bg-amber-50 text-amber-900">
                  <tr>
                    <th className="px-5 py-4 text-sm font-semibold">Team Name</th>
                    <th className="px-5 py-4 text-sm font-semibold">Custom ID</th>
                    <th className="px-5 py-4 text-sm font-semibold">Society</th>
                    <th className="px-5 py-4 text-sm font-semibold">Sport Type</th>
                    <th className="px-5 py-4 text-sm font-semibold">Captain</th>
                    <th className="px-5 py-4 text-sm font-semibold">Contact</th>
                    <th className="px-5 py-4 text-sm font-semibold">Status</th>

                    <th className="px-5 py-4 text-sm font-semibold">Created</th>
                    <th className="px-5 py-4 text-sm font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPendingTeams.map((team) => (
                    <tr key={team._id} className="border-b border-amber-100 last:border-0 hover:bg-amber-50/50 transition">
                      <td className="px-5 py-4 font-medium text-ink">{team.name}</td>
                      <td className="px-5 py-4 text-sm text-ink/70">{team.customId}</td>
                      <td className="px-5 py-4 text-sm text-ink/70">{getSocietyName(team)}</td>
                      <td className="px-5 py-4 text-sm text-ink/70">{team.category || "General"}</td>
                      <td className="px-5 py-4 text-sm text-ink/70">{team.captain || "-"}</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-blue-600 font-bold">{team.contactEmail || "-"}</span>
                          <span className="text-[10px] text-slate-500 font-bold">{team.contactPhone || "-"}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">

                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 uppercase tracking-widest border border-amber-200">
                          {team.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-ink/70">{formatDate(team.createdAt)}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                            onClick={() => handleApprove(team._id)}
                            type="button"
                            disabled={reviewingId === team._id}
                          >
                            {reviewingId === team._id ? "Saving..." : "Approve"}
                          </button>
                          <button
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            onClick={() => handleRejectClick(team._id)}
                            type="button"
                            disabled={reviewingId === team._id}
                          >
                            {reviewingId === team._id ? "Saving..." : "Reject"}
                          </button>
                          <button className="btn-secondary text-xs px-3 py-1.5" onClick={() => { setViewMode("form"); handleEdit(team); }} type="button" disabled={reviewingId === team._id}>Edit</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!filteredPendingTeams.length && (
                    <tr>
                      <td colSpan="9" className="px-5 py-8 text-center text-sm text-ink/60">
                        {searchTerm ? "No teams match your search." : "No pending requests at the moment."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-ink text-lg mb-4">Active Teams</h3>
            <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white shadow-sm">
              <table className="w-full min-w-[1020px] table-auto text-left">
                <thead className="border-b border-ink/10 bg-slate-50 text-ink">
                  <tr>
                    <th className="px-5 py-4 text-sm font-semibold">Team Name</th>
                    <th className="px-5 py-4 text-sm font-semibold">Custom ID</th>
                    <th className="px-5 py-4 text-sm font-semibold">Society</th>
                    <th className="px-5 py-4 text-sm font-semibold">Sport Type</th>
                    <th className="px-5 py-4 text-sm font-semibold">Captain</th>
                    <th className="px-5 py-4 text-sm font-semibold">Members</th>
                    <th className="px-5 py-4 text-sm font-semibold">Contact</th>
                    <th className="px-5 py-4 text-sm font-semibold">Status</th>

                    <th className="px-5 py-4 text-sm font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApprovedTeams.map((team) => (
                    <tr key={team._id} className="border-b border-ink/10 last:border-0 hover:bg-slate-50 transition">
                      <td className="px-5 py-4 font-medium text-ink">{team.name}</td>
                      <td className="px-5 py-4 text-sm text-ink/70">{team.customId}</td>
                      <td className="px-5 py-4 text-sm text-ink/70">{getSocietyName(team)}</td>
                      <td className="px-5 py-4 text-sm text-ink/70">{team.category || "General"}</td>
                      <td className="px-5 py-4 text-sm text-ink/70">{team.captain || "-"}</td>
                      <td className="px-5 py-4 text-sm text-ink/70">{team.members?.length || 0}</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-blue-600 font-bold">{team.contactEmail || "-"}</span>
                          <span className="text-[10px] text-slate-500 font-bold">{team.contactPhone || "-"}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">

                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-700">
                          {team.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="btn-secondary text-xs px-3 py-1" onClick={() => { setViewMode("form"); handleEdit(team); }} type="button">Edit</button>
                          <button className="btn-danger text-xs px-3 py-1" onClick={() => handleDelete(team._id)} type="button">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!filteredApprovedTeams.length && (
                    <tr>
                      <td colSpan="9" className="px-5 py-8 text-center text-sm text-ink/60">
                        {searchTerm ? "No teams match your search." : "No approved requests yet."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-ink text-lg mb-4">Rejected Requests</h3>
            <div className="overflow-x-auto rounded-2xl border border-red-200 bg-white shadow-sm">
              <table className="w-full min-w-[1020px] table-auto text-left">
                <thead className="border-b border-red-200 bg-red-50 text-red-900">
                  <tr>
                    <th className="px-5 py-4 text-sm font-semibold">Team Name</th>
                    <th className="px-5 py-4 text-sm font-semibold">Custom ID</th>
                    <th className="px-5 py-4 text-sm font-semibold">Society</th>
                    <th className="px-5 py-4 text-sm font-semibold">Sport Type</th>
                    <th className="px-5 py-4 text-sm font-semibold">Captain</th>
                    <th className="px-5 py-4 text-sm font-semibold">Members</th>
                    <th className="px-5 py-4 text-sm font-semibold">Contact</th>
                    <th className="px-5 py-4 text-sm font-semibold">Status</th>
                    <th className="px-5 py-4 text-sm font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRejectedTeams.map((team) => (
                    <tr key={team._id} className="border-b border-red-100 last:border-0 hover:bg-red-50/40 transition">
                      <td className="px-5 py-4 font-medium text-ink">{team.name}</td>
                      <td className="px-5 py-4 text-sm text-ink/70">{team.customId}</td>
                      <td className="px-5 py-4 text-sm text-ink/70">{getSocietyName(team)}</td>
                      <td className="px-5 py-4 text-sm text-ink/70">{team.category || "General"}</td>
                      <td className="px-5 py-4 text-sm text-ink/70">{team.captain || "-"}</td>
                      <td className="px-5 py-4 text-sm text-ink/70">{team.members?.length || 0}</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-blue-600 font-bold">{team.contactEmail || "-"}</span>
                          <span className="text-[10px] text-slate-500 font-bold">{team.contactPhone || "-"}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-red-700">
                          {team.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="btn-secondary text-xs px-3 py-1" onClick={() => { setViewMode("form"); handleEdit(team); }} type="button">Edit</button>
                          <button className="btn-danger text-xs px-3 py-1" onClick={() => handleDelete(team._id)} type="button">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!filteredRejectedTeams.length && (
                    <tr>
                      <td colSpan="9" className="px-5 py-8 text-center text-sm text-ink/60">
                        {searchTerm ? "No teams match your search." : "No rejected requests yet."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Teams;
