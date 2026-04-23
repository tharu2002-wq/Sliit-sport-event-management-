import { useCallback, useEffect, useMemo, useState } from 'react';
import { getSchedules } from '../../services/scheduleService';
import { getTeams } from '../../services/teamService';
import './ScheduleCalendar.css';

const statusClassMap = {
  Planned: 'calendar-status-planned',
  Completed: 'calendar-status-completed',
  Cancelled: 'calendar-status-cancelled',
};

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatLocalDateToInputValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateInputAsLocalDate = (value) => {
  if (typeof value !== 'string') {
    return null;
  }

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(year, month - 1, day);

  if (parsed.getFullYear() !== year || parsed.getMonth() + 1 !== month || parsed.getDate() !== day) {
    return null;
  }

  return parsed;
};

const toDateInputValue = (dateValue) => {
  const date = new Date(dateValue);
  return formatLocalDateToInputValue(date);
};

const formatTimeLabel = (timeValue) => {
  if (!timeValue || typeof timeValue !== 'string') {
    return '-';
  }

  const [hours, minutes] = timeValue.split(':').map(Number);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
    return timeValue;
  }

  const timeDate = new Date();
  timeDate.setHours(hours, minutes, 0, 0);
  return timeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ScheduleCalendar = () => {
  const [teams, setTeams] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  const loadCalendarData = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) {
        setLoading(true);
      }
      setError('');

      const [teamData, scheduleData] = await Promise.all([getTeams(), getSchedules()]);
      const normalizedTeams = Array.isArray(teamData) ? teamData : [];
      const normalizedSchedules = Array.isArray(scheduleData) ? scheduleData : [];

      setTeams(normalizedTeams);
      setSchedules(normalizedSchedules);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

      if (!selectedDate) {
        const today = new Date();
        const todayValue = formatLocalDateToInputValue(today);
        setSelectedDate(todayValue);
        setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
      }
    } catch (loadError) {
      setError(loadError?.response?.data?.message || 'Unable to load schedule calendar.');
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }, [selectedDate]);

  useEffect(() => {
    loadCalendarData(true);
  }, [loadCalendarData]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadCalendarData(false);
    }, 60000);

    return () => clearInterval(interval);
  }, [loadCalendarData]);

  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

  const filteredSchedules = useMemo(() => {
    if (!selectedTeam) {
      return schedules;
    }

    return schedules.filter((item) => item.team === selectedTeam);
  }, [schedules, selectedTeam]);

  const eventsByDate = useMemo(() => {
    const map = new Map();

    filteredSchedules.forEach((item) => {
      const key = toDateInputValue(item.scheduleDate);
      const current = map.get(key) || [];
      current.push(item);
      map.set(key, current);
    });

    return map;
  }, [filteredSchedules]);

  const teamSocietyMap = useMemo(() => {
    const map = new Map();

    teams.forEach((team) => {
      const teamName = team?.name || '';
      const societyName = typeof team?.society === 'object' ? team.society?.name : '';

      if (teamName) {
        map.set(teamName, societyName || '-');
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
      const timeA = a.scheduleTime || '99:99';
      const timeB = b.scheduleTime || '99:99';
      if (timeA === timeB) {
        return (a.eventName || '').localeCompare(b.eventName || '');
      }
      return timeA.localeCompare(timeB);
    });
  }, [eventsByDate, selectedDate]);

  const days = useMemo(() => {
    const startDay = monthStart.getDay();
    const monthDates = [];

    for (let i = 0; i < startDay; i += 1) {
      monthDates.push(null);
    }

    for (let day = 1; day <= monthEnd.getDate(); day += 1) {
      monthDates.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
    }

    return monthDates;
  }, [currentMonth, monthStart, monthEnd]);

  return (
    <section className="landing-calendar" id="schedule-calendar">
      <div className="landing-calendar-header">
        <span className="section-label">Schedule Calendar</span>
      </div>

      <div className="landing-calendar-shell">
        <div className="landing-calendar-toolbar">
          <button
            className="landing-calendar-nav"
            type="button"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
          >
            &lt;
          </button>

          <h3 className="landing-calendar-month">
            {currentMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </h3>

          <button
            className="landing-calendar-nav"
            type="button"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
          >
            &gt;
          </button>
        </div>

        <div className="landing-calendar-meta-row">
          <p className="landing-calendar-last-updated">{lastUpdated ? `Last updated: ${lastUpdated}` : 'Loading...'}</p>
          <button className="landing-calendar-refresh" type="button" onClick={() => loadCalendarData(true)}>
            Refresh
          </button>
        </div>

        <div className="landing-calendar-filter-row">
          <label htmlFor="landing-team-filter">Filter by team</label>
          <select
            id="landing-team-filter"
            value={selectedTeam}
            onChange={(event) => setSelectedTeam(event.target.value)}
            disabled={loading}
          >
            <option value="">All teams</option>
            {teams.map((team) => (
              <option key={team._id} value={team.name}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div className="landing-calendar-weekdays">
          {weekDays.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>

        <div className="landing-calendar-grid">
          {days.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="landing-calendar-cell landing-calendar-cell-empty" />;
            }

            const dateKey = toDateInputValue(day);
            const events = eventsByDate.get(dateKey) || [];
            const isSelected = selectedDate === dateKey;

            return (
              <button
                key={dateKey}
                type="button"
                className={`landing-calendar-cell ${isSelected ? 'landing-calendar-cell-selected' : ''}`.trim()}
                onClick={() => setSelectedDate(dateKey)}
              >
                <p className="landing-calendar-day-number">{day.getDate()}</p>
                <p className="landing-calendar-event-count">{events.length} event(s)</p>
                {events.slice(0, 2).map((event) => (
                  <p key={event._id} className="landing-calendar-event-preview">
                    {event.eventName}
                  </p>
                ))}
              </button>
            );
          })}
        </div>

        <div className="landing-calendar-details">
          <h4>
            {selectedDate
              ? `Schedule details - ${parseDateInputAsLocalDate(selectedDate)?.toLocaleDateString() || selectedDate}`
              : 'Schedule details'}
          </h4>

          {loading && <p className="landing-calendar-info">Loading calendar data...</p>}
          {!loading && error && <p className="landing-calendar-info landing-calendar-info-error">{error}</p>}

          {!loading && !error && !selectedDate && (
            <p className="landing-calendar-info">Select a date from the calendar to view details.</p>
          )}

          {!loading && !error && selectedDate && selectedDateEvents.length === 0 && (
            <p className="landing-calendar-info">No events scheduled for this date.</p>
          )}

          {!loading && !error && selectedDateEvents.length > 0 && (
            <div className="landing-calendar-event-list">
              {selectedDateEvents.map((event) => (
                <article key={event._id} className="landing-calendar-event-item">
                  <p className="landing-calendar-event-title">{event.eventName}</p>
                  <p>
                    Date:{' '}
                    {parseDateInputAsLocalDate(toDateInputValue(event.scheduleDate))?.toLocaleDateString() ||
                      toDateInputValue(event.scheduleDate)}
                  </p>
                  <p>Time: {formatTimeLabel(event.scheduleTime)}</p>
                  <p>Team: {event.team || '-'}</p>
                  <p>Society: {teamSocietyMap.get(event.team) || '-'}</p>
                  <p>Sport type: {event.sportType || '-'}</p>
                  <p>Venue: {event.venue || '-'}</p>
                  <p className={statusClassMap[event.status] || ''}>Status: {event.status || 'Planned'}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ScheduleCalendar;
