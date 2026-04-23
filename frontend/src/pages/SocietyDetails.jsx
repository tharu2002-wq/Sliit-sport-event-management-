import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MemberTable from "../components/MemberTable";
import TeamCard from "../components/TeamCard";
import { createMember, deleteMember } from "../services/memberService";
import { getSocietyDetails } from "../services/societyService";
import { createTeam, deleteTeam } from "../services/teamService";
import { splitByComma } from "../utils/helpers";

const SocietyDetails = () => {
  const { id } = useParams();
  const [payload, setPayload] = useState({ society: null, members: [], teams: [] });
  const [memberForm, setMemberForm] = useState({ fullName: "", role: "Member", email: "", phone: "" });
  const [teamForm, setTeamForm] = useState({
    name: "",
    category: "General",
    captain: "",
    photoUrl: "",
    members: "",
    achievements: "",
  });
  const [memberSearchTerm, setMemberSearchTerm] = useState("");
  const [teamSearchTerm, setTeamSearchTerm] = useState("");

  const load = async () => {
    const data = await getSocietyDetails(id);
    setPayload(data);
  };

  useEffect(() => {
    load();
  }, [id]);

  const filteredMembers = (payload.members || []).filter((member) => {
    const searchLower = memberSearchTerm.toLowerCase();
    return (
      (member.fullName && member.fullName.toLowerCase().includes(searchLower)) ||
      (member.email && member.email.toLowerCase().includes(searchLower)) ||
      (member.role && member.role.toLowerCase().includes(searchLower))
    );
  });

  const filteredTeams = (payload.teams || []).filter((team) => {
    const searchLower = teamSearchTerm.toLowerCase();
    return (
      (team.name && team.name.toLowerCase().includes(searchLower)) ||
      (team.category && team.category.toLowerCase().includes(searchLower)) ||
      (team.captain && team.captain.toLowerCase().includes(searchLower))
    );
  });

  const handleCreateMember = async (e) => {
    e.preventDefault();
    await createMember({ ...memberForm, society: id });
    setMemberForm({ fullName: "", role: "Member", email: "", phone: "" });
    load();
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    await createTeam({
      society: id,
      name: teamForm.name,
      category: teamForm.category,
      captain: teamForm.captain,
      photoUrl: teamForm.photoUrl,
      members: splitByComma(teamForm.members),
      achievements: splitByComma(teamForm.achievements),
      status: "active",
    });
    setTeamForm({ name: "", category: "General", captain: "", photoUrl: "", members: "", achievements: "" });
    load();
  };

  const handleDeleteMember = async (memberId) => {
    await deleteMember(memberId);
    load();
  };

  const handleDeleteTeam = async (teamId) => {
    await deleteTeam(teamId);
    load();
  };

  if (!payload.society) {
    return <p>Loading society details...</p>;
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-ink/60">{payload.society.customId}</p>
        <h2 className="card-title">{payload.society.name}</h2>
        <p className="mt-2 text-sm text-ink/75">{payload.society.description || "No description available."}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-ink/10 bg-white p-4">
          <h3 className="mb-3 font-display text-lg">Add Member</h3>
          <form onSubmit={handleCreateMember} className="space-y-3">
            <input
              required
              className="input-shell"
              placeholder="Full name"
              value={memberForm.fullName}
              onChange={(e) => setMemberForm((prev) => ({ ...prev, fullName: e.target.value }))}
            />
            <select
              className="input-shell"
              value={memberForm.role}
              onChange={(e) => setMemberForm((prev) => ({ ...prev, role: e.target.value }))}
            >
              <option>Member</option>
              <option>President</option>
              <option>Secretary</option>
              <option>Treasurer</option>
              <option>Coordinator</option>
            </select>
            <input
              type="email"
              className="input-shell"
              placeholder="Email"
              value={memberForm.email}
              onChange={(e) => setMemberForm((prev) => ({ ...prev, email: e.target.value }))}
            />
            <input
              className="input-shell"
              placeholder="Phone"
              value={memberForm.phone}
              onChange={(e) => setMemberForm((prev) => ({ ...prev, phone: e.target.value }))}
            />
            <button className="btn-primary w-full" type="submit">
              Add Member
            </button>
          </form>
        </article>

        <article className="rounded-2xl border border-ink/10 bg-white p-4">
          <h3 className="mb-3 font-display text-lg">Add Team</h3>
          <form onSubmit={handleCreateTeam} className="space-y-3">
            <input
              required
              className="input-shell"
              placeholder="Team name"
              value={teamForm.name}
              onChange={(e) => setTeamForm((prev) => ({ ...prev, name: e.target.value }))}
            />
            <input
              className="input-shell"
              placeholder="Category"
              value={teamForm.category}
              onChange={(e) => setTeamForm((prev) => ({ ...prev, category: e.target.value }))}
            />
            <input
              className="input-shell"
              placeholder="Captain"
              value={teamForm.captain}
              onChange={(e) => setTeamForm((prev) => ({ ...prev, captain: e.target.value }))}
            />

            <input
              className="input-shell"
              placeholder="Members (comma separated)"
              value={teamForm.members}
              onChange={(e) => setTeamForm((prev) => ({ ...prev, members: e.target.value }))}
            />
            <input
              className="input-shell"
              placeholder="Achievements (comma separated)"
              value={teamForm.achievements}
              onChange={(e) => setTeamForm((prev) => ({ ...prev, achievements: e.target.value }))}
            />
            <button className="btn-primary w-full" type="submit">
              Add Team
            </button>
          </form>
        </article>
      </div>

      <article>
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h3 className="font-display text-lg">Members</h3>
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search members..."
              className="input-shell w-full pl-10"
              value={memberSearchTerm}
              onChange={(e) => setMemberSearchTerm(e.target.value)}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              🔍
            </span>
          </div>
        </div>
        <MemberTable members={filteredMembers} onDelete={handleDeleteMember} />
      </article>

      <article>
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h3 className="font-display text-lg">Teams</h3>
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search teams..."
              className="input-shell w-full pl-10"
              value={teamSearchTerm}
              onChange={(e) => setTeamSearchTerm(e.target.value)}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              🔍
            </span>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredTeams.map((team) => (
            <TeamCard key={team._id} team={team} onDelete={handleDeleteTeam} />
          ))}
        </div>
        {!filteredTeams.length && <p className="text-sm text-ink/70">{teamSearchTerm ? "No teams match your search." : "No teams registered."}</p>}
      </article>
    </section>
  );
};

export default SocietyDetails;
