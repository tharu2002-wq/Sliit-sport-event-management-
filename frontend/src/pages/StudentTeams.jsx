import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { getTeams, createTeam, getMyTeamRequests, updateTeam } from "../services/teamService";
import { getSocieties } from "../services/societyService";
import { getMembers } from "../services/memberService";

const StudentTeams = () => {
  const [teams, setTeams] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [societies, setSocieties] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [captainId, setCaptainId] = useState("");
  const [memberSearchTerm, setMemberSearchTerm] = useState("");
  const [editingId, setEditingId] = useState("");
  const [reapplyingId, setReapplyingId] = useState("");
  const [form, setForm] = useState({
    name: "",
    category: "",
    society: "",
    photoUrl: "",
    contactEmail: "",
    contactPhone: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getMemberKey = (member) => {
    const raw = member?.fullName || member?.email || member?._id || "";
    return String(raw).trim().toLowerCase();
  };

  const assignedMemberKeys = useMemo(() => {
    const blocked = new Set();
    teams.filter((t) => t._id !== editingId).forEach((team) => {
      (team.members || []).forEach((memberName) => {
        const key = String(memberName || "").trim().toLowerCase();
        if (key) {
          blocked.add(key);
        }
      });
    });
    return blocked;
  }, [teams, editingId]);

  const handleToggleMember = (id) => {
    const member = members.find((item) => item._id === id);
    const key = getMemberKey(member);
    // No block logic


    setSelectedMemberIds((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
    setCaptainId((prev) => (prev === id ? "" : prev));
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [t, s, m, requests] = await Promise.all([
        getTeams(),
        getSocieties(),
        getMembers(),
        getMyTeamRequests(),
      ]);
      setTeams(t);
      setSocieties(s);
      setMembers(m);
      setMyRequests(requests);
      if (s.length > 0 && !form.society) setForm((prev) => ({ ...prev, society: s[0]._id }));
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);



  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const selectedMembers = members.filter((member) => selectedMemberIds.includes(member._id));
    const captain = members.find((member) => member._id === captainId);

    const payload = {
      ...form,
      captain: captain?.fullName || "",
      members: selectedMembers.map((member) => member.fullName || member.email || member._id),
      achievements: [],
      status: "pending",
    };

    try {
      if (editingId) {
        await updateTeam(editingId, payload);
        setSuccess("Team request updated successfully!");
      } else {
        await createTeam(payload);
        setSuccess("Team request submitted successfully!");
      }
      resetForm();
      loadData();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit request.");
    }
  };

  const resetForm = () => {
    setEditingId("");
    setError("");
    setForm((prev) => ({
      ...prev,
      name: "",
      category: "",
      photoUrl: "",
      contactEmail: "",
      contactPhone: "",
    }));
    setSelectedMemberIds([]);
    setCaptainId("");
  };

  const handleEditRequest = (team) => {
    setError("");
    setSuccess("");
    setEditingId(team._id);
    setForm({
      society: team.society?._id || team.society || "",
      name: team.name || "",
      category: team.category || "",
      photoUrl: team.photoUrl || "",
      contactEmail: team.contactEmail || "",
      contactPhone: team.contactPhone || "",
    });
    
    // Set members
    const memberIds = members
      .filter((member) => team.members?.includes(member.fullName) || team.members?.includes(member.email))
      .map((m) => m._id);
    setSelectedMemberIds(memberIds);

    // Set captain
    const captain = members.find(
      (member) => member.fullName === team.captain || member.email === team.captain
    );
    setCaptainId(captain?._id || "");
    
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleReapplyRequest = async (teamId) => {
    try {
      setReapplyingId(teamId);
      setError("");
      setSuccess("");
      await updateTeam(teamId, { status: "pending" });
      setSuccess("Request re-applied successfully. Waiting for admin review.");
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to re-apply request.");
    } finally {
      setReapplyingId("");
    }
  };

  const activeTeams = teams.filter((t) => t.status !== "pending" && t.status !== "rejected");
  const pendingRequestTeams = myRequests.filter((t) => t.status === "pending");
  const rejectedRequestTeams = myRequests.filter((t) => t.status === "rejected");

  const [searchTerm, setSearchTerm] = useState("");

  const filteredActiveTeams = activeTeams.filter((team) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (team.name && team.name.toLowerCase().includes(searchLower)) ||
      (team.category && team.category.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Active teams</h2>
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search teams by name or sport..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 pl-10 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            🔍
          </span>
        </div>
      </div>

      <div className="mb-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [1, 2, 3].map((n) => (
            <div key={n} className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 h-80">
              <div className="mb-4 h-48 w-full rounded-xl bg-slate-100" />
              <div className="mb-2 h-4 w-1/4 rounded bg-slate-100" />
              <div className="mb-4 h-6 w-3/4 rounded bg-slate-100" />
              <div className="flex gap-2">
                <div className="h-10 flex-1 rounded-full bg-slate-100" />
                <div className="h-10 flex-1 rounded-full bg-slate-100" />
              </div>
            </div>
          ))
        ) : (
          filteredActiveTeams.map((team) => {

            return (
              <div key={team._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="relative h-48 bg-slate-100">
                  <img
                    src={team.photoUrl || "/hero-campus.png"}
                    alt={`${team.name} Cover`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/hero-campus.png";
                    }}
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-[10px] font-bold shadow-sm text-emerald-700 border border-emerald-100 uppercase tracking-widest">
                    Active
                  </span>
                </div>
                
                <div className="p-5">
                  <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-[#1534a8]">
                    {team.category || "General"}
                  </p>
                  <h3 className="mb-3 text-xl font-bold text-slate-900">{team.name}</h3>
                  
                  <div className="space-y-1 text-sm text-slate-600 mb-6">
                    <p>
                      Captain: <span className="font-semibold text-slate-800">{team.captain || team.coach || 'Unassigned'}</span>
                    </p>
                    <div className="flex flex-col gap-0.5 mt-2">
                      <span className="text-[10px] text-blue-600 font-bold">📧 {team.contactEmail || "No email"}</span>
                      <span className="text-[10px] text-emerald-600 font-bold font-mono">📞 {team.contactPhone || "No phone"}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link
                      to={`/student/teams/${team._id}`}
                      className="flex-1 rounded-full border border-[#1534a8] py-2 text-center text-sm font-semibold text-[#1534a8] transition hover:bg-[#1534a8] hover:text-white"
                    >
                      View details
                    </Link>

                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      {!loading && !activeTeams.length && (
        <p className="py-8 text-center text-slate-500">No active teams found at the moment.</p>
      )}

      <div className="mb-6 mt-12 border-b border-slate-100 pb-4">
        <h2 className="text-2xl font-bold text-slate-900">My Requests</h2>
      </div>

      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="mb-2 text-lg font-bold text-slate-900">{editingId ? "Edit Team Request" : "Request New Team"}</h3>
        <p className="mb-4 text-sm text-slate-500">
          {editingId ? "Update your pending team request info." : "Submit a request to create a new team. Once approved by the admin, it will appear in Active Teams."}
        </p>
        <form onSubmit={handleCreateRequest} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-sm font-semibold text-slate-700">Team Name</label>
            <input required type="text" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Category / Sport</label>
            <input required type="text" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Society</label>
            <select required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={form.society} onChange={(e) => setForm({...form, society: e.target.value})}>
              {societies.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-700">Team Contact Email</label>
              <input type="email" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={form.contactEmail} onChange={(e) => setForm({...form, contactEmail: e.target.value})} placeholder="team@example.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Team Contact Phone</label>
              <input type="text" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={form.contactPhone} onChange={(e) => setForm({...form, contactPhone: e.target.value.replace(/\D/g, "")})} placeholder="0771234567" maxLength={10} />
            </div>
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

          <div className="flex gap-3">
            <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
              {editingId ? "Update Request" : "Submit Request"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>
            )}
          </div>
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          {success && <p className="text-sm font-medium text-emerald-600">{success}</p>}
        </form>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-bold text-amber-800">Pending Requests</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pendingRequestTeams.map((team) => (
            <div key={team._id} className="overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <span className="mb-3 inline-block rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-700">
                Pending Approval
              </span>
              <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-amber-800">{team.category || "General"}</p>
              <h3 className="mb-3 text-xl font-bold text-slate-900">{team.name}</h3>
              <p className="mb-1 text-sm text-slate-600">Captain: {team.captain || "Unassigned"}</p>
              <div className="mb-4 flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-amber-600">📧 {team.contactEmail || "No email"}</span>
                <span className="font-mono text-[10px] font-bold text-amber-600">📞 {team.contactPhone || "No phone"}</span>
              </div>
              {team.adminMessage ? (
                <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-100 px-3 py-2 text-xs text-emerald-800">
                  Admin message: {team.adminMessage}
                </div>
              ) : null}
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  to={`/student/teams/${team._id}`}
                  className="block w-full rounded-full border border-amber-700 py-2 text-center text-sm font-semibold text-amber-700 transition hover:bg-amber-700 hover:text-white"
                >
                  View details
                </Link>
                <button
                  onClick={() => handleEditRequest(team)}
                  className="block w-full rounded-full border border-slate-300 bg-white py-2 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Edit request
                </button>
              </div>
            </div>
          ))}
        </div>
        {!pendingRequestTeams.length ? (
          <p className="mt-3 text-sm text-slate-500">No pending requests.</p>
        ) : null}
      </div>

      <div className="mt-8">
        <h3 className="mb-4 text-lg font-bold text-red-800">Rejected Requests</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rejectedRequestTeams.map((team) => (
            <div key={team._id} className="overflow-hidden rounded-2xl border border-red-200 bg-red-50 p-5">
              <span className="mb-3 inline-block rounded-full border border-red-200 bg-red-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-red-700">
                Rejected
              </span>
              <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-red-800">{team.category || "General"}</p>
              <h3 className="mb-3 text-xl font-bold text-slate-900">{team.name}</h3>
              <p className="mb-1 text-sm text-slate-600">Captain: {team.captain || "Unassigned"}</p>
              <div className="mb-4 flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-red-600">📧 {team.contactEmail || "No email"}</span>
                <span className="font-mono text-[10px] font-bold text-red-600">📞 {team.contactPhone || "No phone"}</span>
              </div>
              {team.adminMessage ? (
                <div className="mb-3 rounded-lg border border-red-200 bg-red-100 px-3 py-2 text-xs text-red-800">
                  Admin message: {team.adminMessage}
                </div>
              ) : null}
              {team.rejectionReason ? (
                <div className="mb-3 rounded-lg border border-red-200 bg-red-100 px-3 py-2 text-xs text-red-800">
                  Rejection reason: {team.rejectionReason}
                </div>
              ) : null}
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  to={`/student/teams/${team._id}`}
                  className="block w-full rounded-full border border-red-700 py-2 text-center text-sm font-semibold text-red-700 transition hover:bg-red-700 hover:text-white"
                >
                  View details
                </Link>
                  <button
                    onClick={() => handleEditRequest(team)}
                    className="block w-full rounded-full border border-blue-600 bg-blue-600 py-2 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Edit
                  </button>
                <button
                  onClick={() => handleReapplyRequest(team._id)}
                  className="block w-full rounded-full border border-slate-300 bg-white py-2 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
                  disabled={reapplyingId === team._id}
                >
                  {reapplyingId === team._id ? "Re-applying..." : "Re-apply"}
                </button>
              </div>
            </div>
          ))}
        </div>
        {!rejectedRequestTeams.length ? (
          <p className="mt-3 text-sm text-slate-500">No rejected requests.</p>
        ) : null}
      </div>
    </div>
  );
};

export default StudentTeams;
