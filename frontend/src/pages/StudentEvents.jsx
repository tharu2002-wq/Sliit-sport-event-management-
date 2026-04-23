import { useEffect, useState } from "react";
import { getSchedules } from "../services/scheduleService";

const statusColors = {
  Planned: "bg-amber-100 text-amber-700 border-amber-200",
  Completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Cancelled: "bg-red-100 text-red-700 border-red-200",
};

const StudentEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchEvents = async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        const data = await getSchedules();
        setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch events", err);
      } finally {
        if (!silent) setLoading(false);
      }
    };
    fetchEvents();
    const interval = setInterval(() => fetchEvents(true), 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredEvents = events.filter((event) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (event.eventName && event.eventName.toLowerCase().includes(searchLower)) ||
      (event.team && event.team.toLowerCase().includes(searchLower)) ||
      (event.sportType && event.sportType.toLowerCase().includes(searchLower)) ||
      (event.venue && event.venue.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Events & Practice Sessions</h2>
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search by name, team or sport..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 pl-10 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            🔍
          </span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [1, 2, 3].map((n) => (
            <div key={n} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-4 h-6 w-3/4 rounded bg-slate-100" />
              <div className="space-y-2">
                <div className="h-4 w-1/2 rounded bg-slate-100" />
                <div className="h-4 w-1/3 rounded bg-slate-100" />
              </div>
            </div>
          ))
        ) : (
          filteredEvents.map((event) => (
            <div key={event._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
              <div className="mb-3 flex items-center justify-between">
                <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest border ${statusColors[event.status] || "bg-slate-100 text-slate-600"}`}>
                  {event.status}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {new Date(event.scheduleDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
              </div>
              
              <h3 className="mb-1 text-lg font-bold text-slate-900">{event.eventName}</h3>
              <p className="mb-4 text-sm font-medium text-[#1534a8]">{event.team} • {event.sportType}</p>
              
              <div className="space-y-2 border-t border-slate-50 pt-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <span>🕒</span>
                  <span>{event.scheduleTime || "TBD"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📍</span>
                  <span className="truncate">{event.venue || "Campus Grounds"}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {!loading && !filteredEvents.length && (
        <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center">
          <p className="text-slate-500">{searchTerm ? "No events match your search." : "No upcoming events scheduled."}</p>
        </div>
      )}
    </div>
  );
};

export default StudentEvents;
