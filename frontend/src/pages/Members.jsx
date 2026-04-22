import { useEffect, useState } from "react";
import MemberTable from "../components/MemberTable";
import { createMember, deleteMember, getMembers } from "../services/memberService";
import { getSocieties } from "../services/societyService";

const Members = () => {
  const [members, setMembers] = useState([]);
  const [societies, setSocieties] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({ society: "", fullName: "", role: "Member", email: "", phone: "" });

  const load = async () => {
    const [membersData, societiesData] = await Promise.all([getMembers(), getSocieties()]);
    setMembers(membersData);
    setSocieties(societiesData);
    if (societiesData.length && !form.society) {
      setForm((prev) => ({ ...prev, society: societiesData[0]._id }));
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createMember(form);
    setForm((prev) => ({ ...prev, fullName: "", email: "", phone: "" }));
    load();
  };

  const handleDelete = async (id) => {
    await deleteMember(id);
    load();
  };

  const filteredMembers = members.filter((member) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (member.fullName && member.fullName.toLowerCase().includes(searchLower)) ||
      (member.email && member.email.toLowerCase().includes(searchLower)) ||
      (member.role && member.role.toLowerCase().includes(searchLower))
    );
  });

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Player Management</h1>
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search players by name, email or role..."
            className="input-shell w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            🔍
          </span>
        </div>
      </div>

      <article className="rounded-2xl border border-ink/10 bg-white p-4">
        <h2 className="mb-3 font-display text-xl">Quick Add Player</h2>
        <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-3">
          <select
            required
            className="input-shell"
            value={form.society}
            onChange={(e) => setForm((prev) => ({ ...prev, society: e.target.value }))}
          >
            {societies.map((society) => (
              <option key={society._id} value={society._id}>
                {society.name}
              </option>
            ))}
          </select>
          <input
            required
            className="input-shell"
            placeholder="Full name"
            value={form.fullName}
            onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
          />
          <select
            className="input-shell"
            value={form.role}
            onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
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
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          />
          <input
            className="input-shell"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
          />
          <button className="btn-primary" type="submit">
            Add Player
          </button>
        </form>
      </article>

      <MemberTable members={filteredMembers} onDelete={handleDelete} />
    </section>
  );
};

export default Members;
