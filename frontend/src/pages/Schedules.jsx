import { useEffect, useMemo, useState } from "react";
import { getTeams } from "../services/teamService";
import { createSchedule, deleteSchedule, getSchedules, updateSchedule } from "../services/scheduleService";

const statusColors = {
  Planned: "text-amber-600",
  Completed: "text-emerald-600",
  Cancelled: "text-rose-600",
};

const formatLocalDateToInputValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getCurrentLocalTimeHHmm = (offsetMinutes = 0) => {
  const now = new Date();
  now.setSeconds(0, 0);
  if (offsetMinutes) {
    now.setMinutes(now.getMinutes() + offsetMinutes);
  }
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const dateToInputValue = (date) => {
  if (!date) {
    return "";
  }

  if (typeof date === "string") {
    const parsedLocalDate = parseDateInputAsLocalDate(date);
    if (parsedLocalDate) {
      return formatLocalDateToInputValue(parsedLocalDate);
    }
  }

  const local = new Date(date);
  return formatLocalDateToInputValue(local);
};

const parseDateInputAsLocalDate = (value) => {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() + 1 !== month ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
};

const isValidDateInput = (value) => {
  if (typeof value !== "string") {
    return false;
  }

  const trimmed = value.trim();
  const datePattern = /^(\d{4})-(\d{2})-(\d{2})$/;
  const match = trimmed.match(datePattern);
  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() + 1 === month &&
    parsed.getUTCDate() === day
  );
};

const isValidTimeInput = (value) => {
  if (typeof value !== "string") {
    return false;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return true;
  }

  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(trimmed);
};

const Schedules = () => {
  const todayValue = formatLocalDateToInputValue(new Date());
  const [teams, setTeams] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [calendarTeam, setCalendarTeam] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(todayValue);
  const [editingId, setEditingId] = useState("");
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("form");
  const [form, setForm] = useState({
    team: "",
    eventName: "",
    scheduleDate: "",
    scheduleTime: "",
    venue: "",
    sportType: "",
    status: "Planned",
  });

  const getSportTypeForTeam = (teamName) => {
    const selectedTeam = teams.find((team) => team.name === teamName);
    return selectedTeam?.category || "";
  };

  const loadData = async () => {
    const [teamData, scheduleData] = await Promise.all([getTeams(), getSchedules()]);
    const normalizedTeams = Array.isArray(teamData) ? teamData : [];
    const normalizedSchedules = Array.isArray(scheduleData) ? scheduleData : [];

    setTeams(normalizedTeams);
    setSchedules(normalizedSchedules);

    if (!form.team && normalizedTeams.length) {
      const firstTeam = normalizedTeams[0].name || "";
      setForm((prev) => ({
        ...prev,
        team: firstTeam,
        sportType: getSportTypeForTeam(firstTeam),
      }));
      setCalendarTeam(firstTeam);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(todayValue);
    }
  }, [selectedDate, todayValue]);

  const handleChange = (e) => {
    if (error) {
      setError("");
    }

    const { name, value } = e.target;
    if (name === "team") {
      setForm((prev) => ({
        ...prev,
        team: value,
        sportType: getSportTypeForTeam(value),
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setEditingId("");
    setError("");
    setForm((prev) => ({
      team: prev.team || "",
      eventName: "",
      scheduleDate: "",
      scheduleTime: "",
      venue: "",
      sportType: "",
      status: "Planned",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.team || !form.eventName || !form.scheduleDate) {
      setError("Team, event name, and date are required.");
      return;
    }

    if (!isValidDateInput(form.scheduleDate)) {
      setError("Schedule date must be a valid date.");
      return;
    }

    if (!isValidTimeInput(form.scheduleTime)) {
      setError("Schedule time must be in HH:mm format.");
      return;
    }

    const scheduleDate = parseDateInputAsLocalDate(form.scheduleDate);
    if (!scheduleDate) {
      setError("Schedule date must be a valid date.");
      return;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (scheduleDate < today) {
      setError("Schedule date cannot be in the past (local date).");
      return;
    }

    if (form.scheduleTime && scheduleDate.getTime() === today.getTime()) {
      const [hours, minutes] = form.scheduleTime.split(":").map(Number);
      const eventMinutes = hours * 60 + minutes;
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const allowedDelayMinutes = 1;

      if (eventMinutes + allowedDelayMinutes < nowMinutes) {
        setError("Schedule time cannot be in the past for today's date (local time).");
        return;
      }
    }

    const payload = {
      ...form,
      scheduleTime: form.scheduleTime || getCurrentLocalTimeHHmm(1),
    };

    try {
      if (editingId) {
        await updateSchedule(editingId, payload);
      } else {
        await createSchedule(payload);
      }

      await loadData();
      setSelectedDate(payload.scheduleDate);
      const selectedDay = parseDateInputAsLocalDate(payload.scheduleDate);
      if (selectedDay) {
        setCurrentMonth(new Date(selectedDay.getFullYear(), selectedDay.getMonth(), 1));
      }
      resetForm();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to save schedule.");
    }
  };

  const handleEdit = (item) => {
    const normalizedDate = dateToInputValue(item.scheduleDate);
    setEditingId(item._id);
    setForm({
      team: item.team,
      eventName: item.eventName,
      scheduleDate: normalizedDate,
      scheduleTime: item.scheduleTime || "",
      venue: item.venue || "",
      sportType: item.sportType || "",
      status: item.status || "Planned",
    });

    setSelectedDate(normalizedDate);
    const selectedDay = parseDateInputAsLocalDate(normalizedDate);
    if (selectedDay) {
      setCurrentMonth(new Date(selectedDay.getFullYear(), selectedDay.getMonth(), 1));
    }
  };

  const handleDelete = async (id) => {
    await deleteSchedule(id);
    await loadData();
  };

  const filteredSchedules = useMemo(() => {
    if (!calendarTeam) {
      return schedules;
    }
    return schedules.filter((item) => item.team === calendarTeam);
  }, [schedules, calendarTeam]);

  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

  const days = useMemo(() => {
    const startDay = monthStart.getDay();
    const list = [];

    for (let i = 0; i < startDay; i += 1) {
      list.push(null);
    }

    for (let day = 1; day <= monthEnd.getDate(); day += 1) {
      list.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
    }

    return list;
  }, [currentMonth, monthStart, monthEnd]);

  const eventsByDate = useMemo(() => {
    const map = new Map();
    filteredSchedules.forEach((item) => {
      const key = dateToInputValue(item.scheduleDate);
      const existing = map.get(key) || [];
      existing.push(item);
      map.set(key, existing);
    });
    return map;
  }, [filteredSchedules]);

  const teamSocietyMap = useMemo(() => {
    const map = new Map();
    teams.forEach((team) => {
      const teamName = team?.name || "";
      const societyName = typeof team?.society === "object" ? team.society?.name : "";
      if (teamName) {
        map.set(teamName, societyName || "-");
      }
    });
    return map;
  }, [teams]);

  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) {
      return [];
    }
    const events = eventsByDate.get(selectedDate) || [];
    return [...events].sort((a, b) => {
      const aTime = a.scheduleTime || "99:99";
      const bTime = b.scheduleTime || "99:99";
      if (aTime === bTime) {
        return (a.eventName || "").localeCompare(b.eventName || "");
      }
      return aTime.localeCompare(bTime);
    });
  }, [eventsByDate, selectedDate]);

  const handleDateClick = async (dateObj) => {
    const dateValue = dateToInputValue(dateObj);
    setSelectedDate(dateValue);
    setForm((prev) => ({ ...prev, scheduleDate: dateValue, status: "Planned" }));
  };

  const [searchTerm, setSearchTerm] = useState("");

  const filteredSchedulesList = schedules.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (item.team && item.team.toLowerCase().includes(searchLower)) ||
      (item.eventName && item.eventName.toLowerCase().includes(searchLower)) ||
      (item.venue && item.venue.toLowerCase().includes(searchLower)) ||
      (item.sportType && item.sportType.toLowerCase().includes(searchLower))
    );
  });

  return (
    <section className="space-y-8">
      <div>
        <h2 className="font-display text-3xl text-ink">Schedules</h2>
        <p className="mt-1 text-sm text-ink/70">Manage team practice sessions and fixtures using events.</p>
        <div className="mt-3 flex gap-3">
          <button
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              viewMode === "form"
                ? "bg-blue-600 text-white"
                : "border border-ink/20 text-ink hover:bg-slate-100"
            }`}
            onClick={() => setViewMode("form")}
            type="button"
          >
            Schedule Form & List
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              viewMode === "calendar"
                ? "bg-blue-600 text-white"
                : "border border-ink/20 text-ink hover:bg-slate-100"
            }`}
            onClick={() => setViewMode("calendar")}
            type="button"
          >
            Calendar View
          </button>
        </div>
      </div>

      {viewMode === "form" && (
        <>
          <form className="grid gap-3 lg:grid-cols-7" onSubmit={handleSubmit}>
            <select className="input-shell" name="team" value={form.team} onChange={handleChange} required>
              <option value="">Select team</option>
              {teams.map((team) => (
                <option key={team._id} value={team.name}>
                  {team.name}
                </option>
              ))}
            </select>
            <input
              className="input-shell"
              name="eventName"
              placeholder="Session / match name"
              value={form.eventName}
              onChange={handleChange}
              required
            />
            <input
              className="input-shell"
              type="date"
              name="scheduleDate"
              value={form.scheduleDate}
              onChange={handleChange}
              min={formatLocalDateToInputValue(new Date())}
              required
            />
            <input
              className="input-shell"
              type="time"
              name="scheduleTime"
              value={form.scheduleTime}
              onChange={handleChange}
            />
            <input className="input-shell" name="venue" placeholder="Venue" value={form.venue} onChange={handleChange} />
            <input
              className="input-shell bg-slate-50"
              name="sportType"
              placeholder="Sport type (auto from selected team)"
              value={form.sportType}
              onChange={handleChange}
              readOnly
            />
            <select className="input-shell lg:col-span-2" name="status" value={form.status} onChange={handleChange}>
              <option value="Planned">Planned</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <button className="btn-primary lg:col-span-2" type="submit">
              {editingId ? "Update schedule" : "Add to schedule"}
            </button>
            {editingId && (
              <button className="btn-secondary lg:col-span-2" type="button" onClick={resetForm}>
                Cancel edit
              </button>
            )}
            {error ? <p className="lg:col-span-6 text-sm text-coral">{error}</p> : null}
          </form>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h3 className="font-semibold text-ink text-lg">Schedule List</h3>
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Search by team, event or venue..."
                className="input-shell w-full pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
              </span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white">
        <table className="w-full min-w-[980px] table-auto text-left">
          <thead className="border-b border-ink/10 bg-slate-50">
            <tr>
              <th className="px-5 py-3 text-sm font-semibold">Team</th>
              <th className="px-5 py-3 text-sm font-semibold">Event</th>
              <th className="px-5 py-3 text-sm font-semibold">Sport</th>
              <th className="px-5 py-3 text-sm font-semibold">Date &amp; Time</th>
              <th className="px-5 py-3 text-sm font-semibold">Venue</th>
              <th className="px-5 py-3 text-sm font-semibold">Status</th>
              <th className="px-5 py-3 text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSchedulesList.map((item) => (
              <tr key={item._id} className="border-b border-ink/10 last:border-0">
                <td className="px-5 py-3">{item.team}</td>
                <td className="px-5 py-3">{item.eventName}</td>
                <td className="px-5 py-3">{item.sportType || "-"}</td>
                <td className="px-5 py-3">
                  {new Date(item.scheduleDate).toLocaleDateString()} {item.scheduleTime ? ` ${item.scheduleTime}` : ""}
                </td>
                <td className="px-5 py-3">{item.venue || "-"}</td>
                <td className={`px-5 py-3 font-semibold ${statusColors[item.status] || "text-ink"}`}>{item.status}</td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    <button className="btn-secondary" onClick={() => handleEdit(item)} type="button">
                      Edit
                    </button>
                    <button className="btn-danger" onClick={() => handleDelete(item._id)} type="button">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!filteredSchedulesList.length && (
              <tr>
                <td colSpan="7" className="px-5 py-8 text-center text-sm text-ink/60">
                  {searchTerm ? "No schedules match your search." : "No schedules yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
        </>
      )}

      {viewMode === "calendar" && (
      <div className="space-y-4">
        <div>
          <h3 className="font-display text-2xl text-ink">Schedule Calendar</h3>
          <p className="text-sm text-ink/70">Click any date to view schedule details for that day.</p>
        </div>

        <div className="max-w-sm">
          <label className="mb-1 block text-sm font-medium text-ink">Select Team</label>
          <select className="input-shell" value={calendarTeam} onChange={(e) => setCalendarTeam(e.target.value)}>
            <option value="">All teams</option>
            {teams.map((team) => (
              <option key={team._id} value={team.name}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl border border-ink/10 bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <button
              className="rounded-lg border border-ink/20 px-3 py-1 text-sm"
              type="button"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
            >
              &lt;
            </button>
            <div className="flex items-center gap-3">
              <h4 className="font-display text-3xl text-ink">
                {currentMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
              </h4>
              <button
                className="rounded-lg border border-coral/40 bg-coral/10 px-3 py-1 text-xs font-semibold text-coral"
                type="button"
                onClick={() => {
                  const today = new Date();
                  const todayDateValue = formatLocalDateToInputValue(today);
                  setSelectedDate(todayDateValue);
                  setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
                }}
              >
                Today
              </button>
            </div>
            <button
              className="rounded-lg border border-ink/20 px-3 py-1 text-sm"
              type="button"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
            >
              &gt;
            </button>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-2 text-center text-sm font-semibold text-ink/80">
            {[
              "Sun",
              "Mon",
              "Tue",
              "Wed",
              "Thu",
              "Fri",
              "Sat",
            ].map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="h-24 rounded-xl bg-slate-50" />;
              }

              const key = dateToInputValue(day);
              const events = eventsByDate.get(key) || [];
              const isSelected = selectedDate === key;
              const isToday = key === todayValue;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleDateClick(day)}
                  className={`h-24 rounded-xl border p-2 text-left transition ${
                    isSelected
                      ? "border-coral bg-coral/10"
                      : isToday
                        ? "border-sky-300 bg-sky-50"
                        : "border-ink/10 bg-white hover:bg-sky/35"
                  }`}
                >
                  <p className="text-sm font-semibold text-ink">{day.getDate()}</p>
                  <p className="mt-1 text-xs text-ink/70">{events.length} event(s)</p>
                  {events.slice(0, 2).map((event) => (
                    <p key={event._id} className="truncate text-xs text-ink/80">
                      {event.eventName}
                    </p>
                  ))}
                </button>
              );
            })}
          </div>

          <div className="mt-4 rounded-xl border border-ink/10 bg-slate-50 p-4">
            <h5 className="text-base font-semibold text-ink">
              {selectedDate
                ? `Schedule details - ${
                    parseDateInputAsLocalDate(selectedDate)?.toLocaleDateString() || selectedDate
                  }`
                : "Schedule details"}
            </h5>

            {!selectedDate && <p className="mt-2 text-sm text-ink/70">Select a date from the calendar to view events.</p>}

            {selectedDate && !selectedDateEvents.length && (
              <p className="mt-2 text-sm text-ink/70">No events scheduled for this date.</p>
            )}

            {selectedDateEvents.length > 0 && (
              <div className="mt-3 space-y-2">
                {selectedDateEvents.map((event) => (
                  <div key={event._id} className="rounded-lg border border-ink/10 bg-white p-3">
                    <p className="font-semibold text-ink">{event.eventName}</p>
                    <p className="text-sm text-ink/80">Team: {event.team || "-"}</p>
                    <p className="text-sm text-ink/80">Society: {teamSocietyMap.get(event.team) || "-"}</p>
                    <p className="text-sm text-ink/80">Sport: {event.sportType || "-"}</p>
                    <p className="text-sm text-ink/80">Time: {event.scheduleTime || "-"}</p>
                    <p className="text-sm text-ink/80">Venue: {event.venue || "-"}</p>
                    <p className={`text-sm font-semibold ${statusColors[event.status] || "text-ink"}`}>
                      Status: {event.status || "Planned"}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button className="btn-secondary" type="button" onClick={() => handleEdit(event)}>
                        Edit
                      </button>
                      <button className="btn-danger" type="button" onClick={() => handleDelete(event._id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      )}
    </section>
  );
};

export default Schedules;
