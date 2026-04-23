import { useEffect, useState } from "react";
import { getMembers } from "../services/memberService";
import { getSocieties } from "../services/societyService";

const StudentPlayers = () => {
  const [players, setPlayers] = useState([]);
  const [societies, setSocieties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        const [p, s] = await Promise.all([getMembers(), getSocieties()]);
        setPlayers(Array.isArray(p) ? p : []);
        setSocieties(Array.isArray(s) ? s : []);
      } catch (err) {
        console.error("Failed to fetch players", err);
      } finally {
        if (!silent) setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(() => fetchData(true), 10000);
    return () => clearInterval(interval);
  }, []);

  const getSocietyName = (sid) => {
    const soc = societies.find(s => s._id === sid);
    return soc ? soc.name : "-";
  };

  const filteredPlayers = players.filter((player) => {
    const searchLower = searchTerm.toLowerCase();
    const socName = (typeof player.society === 'object' ? player.society?.name : getSocietyName(player.society)).toLowerCase();
    return (
      (player.fullName && player.fullName.toLowerCase().includes(searchLower)) ||
      (player.email && player.email.toLowerCase().includes(searchLower)) ||
      (player.role && player.role.toLowerCase().includes(searchLower)) ||
      socName.includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Player Directory</h2>
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search by name, role or society..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 pl-10 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            🔍
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full border-collapse text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs font-bold uppercase tracking-widest text-slate-500">
            <tr>
              <th className="px-6 py-4">Player Name</th>
              <th className="px-6 py-4">Society / Team</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Contact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              [1, 2, 3, 4, 5].map((n) => (
                <tr key={n} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 w-32 rounded bg-slate-100" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-24 rounded bg-slate-100" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-16 rounded bg-slate-100" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-40 rounded bg-slate-100" /></td>
                </tr>
              ))
            ) : (
              filteredPlayers.map((player) => (
                <tr key={player._id} className="transition hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-bold text-slate-900">{player.fullName || "Unnamed"}</td>
                  <td className="px-6 py-4">
                    {typeof player.society === 'object' ? player.society?.name : getSocietyName(player.society)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                      {player.role || "Member"}
                    </span>
                  </td>
                  <td className="px-6 py-4">{player.email || "No email"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && !filteredPlayers.length && (
        <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center">
          <p className="text-slate-500">{searchTerm ? "No players match your search." : "No players found in the directory."}</p>
        </div>
      )}
    </div>
  );
};

export default StudentPlayers;
