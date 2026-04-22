import { useEffect, useState } from "react";
import { getSchedules } from "../services/scheduleService";

const StudentMatches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchMatches = async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        const data = await getSchedules();
        // Filter for events that are likely matches (e.g. have 'match', 'final', 'vs' in name)
        const matchData = data.filter(item => 
          item.eventName.toLowerCase().includes("match") || 
          item.eventName.toLowerCase().includes("vs") ||
          item.eventName.toLowerCase().includes("final") ||
          item.eventName.toLowerCase().includes("tournament")
        );
        setMatches(Array.isArray(matchData) ? matchData : data);
      } catch (err) {
        console.error("Failed to fetch matches", err);
      } finally {
        if (!silent) setLoading(false);
      }
    };
    fetchMatches();
    const interval = setInterval(() => fetchMatches(true), 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredMatches = matches.filter((match) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (match.eventName && match.eventName.toLowerCase().includes(searchLower)) ||
      (match.team && match.team.toLowerCase().includes(searchLower)) ||
      (match.sportType && match.sportType.toLowerCase().includes(searchLower)) ||
      (match.venue && match.venue.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Matches & Fixtures</h2>
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search matches by team or sport..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 pl-10 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            🔍
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          [1, 2, 3].map((n) => (
            <div key={n} className="animate-pulse rounded-xl border border-slate-200 bg-white p-6 h-24" />
          ))
        ) : (
          filteredMatches.map((match) => (
            <div key={match._id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md md:flex-row md:items-center">
              <div className="flex-1">
                <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-[#1534a8]">
                  {match.sportType || "General Sport"}
                </p>
                <h3 className="text-xl font-bold text-slate-900">{match.eventName}</h3>
                <p className="text-sm text-slate-500">{match.team} • {match.venue || "Campus Grounds"}</p>
              </div>
              
              <div className="flex items-center gap-6 border-t border-slate-50 pt-4 md:border-0 md:pt-0">
                <div className="text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Date</p>
                  <p className="text-base font-bold text-slate-800">
                    {new Date(match.scheduleDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Time</p>
                  <p className="text-base font-bold text-slate-800">{match.scheduleTime || "TBD"}</p>
                </div>
                <div className="ml-auto md:ml-4">
                  <span className={`rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest border ${
                    match.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                    match.status === 'Cancelled' ? 'bg-red-100 text-red-700 border-red-200' : 
                    'bg-amber-100 text-amber-700 border-amber-200'
                  }`}>
                    {match.status}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {!loading && !filteredMatches.length && (
        <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center">
          <p className="text-slate-500">{searchTerm ? "No matches match your search." : "No upcoming matches scheduled."}</p>
        </div>
      )}
    </div>
  );
};

export default StudentMatches;
