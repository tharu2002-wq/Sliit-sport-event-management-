import './Modules.css';

const modules = [
  {
    icon: '🎽',
    iconBg: 'rgba(37,99,235,0.1)',
    label: 'Player Hub',
    title: 'Your Athletic Identity',
    desc: 'Build a complete athlete profile that showcases your sport history, achievements, certifications, and upcoming game schedule.',
    tags: ['Athlete Profile', 'Achievements', 'Schedule'],
  },
  {
    icon: '⚽',
    iconBg: 'rgba(16,185,129,0.1)',
    label: 'Team Manager',
    title: 'Unified Team Control',
    desc: 'Captains and coaches get a dedicated control panel for managing rosters, tracking attendance, and sharing training materials.',
    tags: ['Roster', 'Attendance', 'Training'],
  },
  {
    icon: '📋',
    iconBg: 'rgba(139,92,246,0.1)',
    label: 'Event Organiser',
    title: 'End-to-End Event Ops',
    desc: 'Plan and execute sporting events from bracket creation to final score submission with all workflow tools in one dashboard.',
    tags: ['Scheduling', 'Brackets', 'Results'],
  },
  {
    icon: '📱',
    iconBg: 'rgba(245,158,11,0.1)',
    label: 'Social & Feeds',
    title: 'Campus Sports Feed',
    desc: 'Follow your teams, discover campus sports news, and stay updated with post-match analysis and student sports journalist content.',
    tags: ['News Feed', 'Follow Teams', 'Commentary'],
  },
];

const Modules = () => {
  return (
    <section className="modules" id="modules">
      <div className="modules-header">
        <span className="section-label">Module Highlights</span>
        <h2 className="modules-heading">
          Powerful Modules,{' '}
          <span className="modules-heading-accent">Seamlessly Integrated</span>
        </h2>
        <p className="modules-subheading">
          Each module is purpose-built for a specific role in the SLIIT sports ecosystem.
        </p>
      </div>

      <div className="modules-grid">
        {modules.map((m, i) => (
          <div className="module-card" key={i}>
            <div className="module-icon-wrap" style={{ background: m.iconBg }}>
              {m.icon}
            </div>
            <div className="module-body">
              <div className="module-label">{m.label}</div>
              <h3 className="module-title">{m.title}</h3>
              <p className="module-desc">{m.desc}</p>
              <div className="module-tags">
                {m.tags.map((t, j) => (
                  <span className="module-tag" key={j}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Modules;
