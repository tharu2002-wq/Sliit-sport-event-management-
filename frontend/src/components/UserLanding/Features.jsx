import './Features.css';

const features = [
  {
    icon: '👤',
    iconBg: 'rgba(37,99,235,0.1)',
    title: 'Become a Player',
    desc: 'Create your athlete profile and join upcoming sport selections, tryouts and competitions representing your faculty.',
    link: 'Register now',
  },
  {
    icon: '🏅',
    iconBg: 'rgba(245,158,11,0.1)',
    title: 'Build Teams',
    desc: 'Captains can assemble, manage and maintain their team roster with ease across all SLIIT-affiliated competitions.',
    link: 'Manage teams',
  },
  {
    icon: '📅',
    iconBg: 'rgba(139,92,246,0.1)',
    title: 'Host Events',
    desc: 'Organisers can create, schedule and manage the full lifecycle of sports events including budgets and logistics.',
    link: 'Create an event',
  },
  {
    icon: '🤝',
    iconBg: 'rgba(16,185,129,0.1)',
    title: 'Join Sessions',
    desc: 'Browse open practice sessions and training programmes. Register with one click and get instant confirmation.',
    link: 'Find sessions',
  },
  {
    icon: '📢',
    iconBg: 'rgba(239,68,68,0.1)',
    title: 'Sport Announcements',
    desc: 'Stay informed with real-time push notifications for team selections, event changes, and match results.',
    link: 'View updates',
  },
  {
    icon: '📰',
    iconBg: 'rgba(6,182,212,0.1)',
    title: 'Sport News',
    desc: "Read articles, match reports and campus sports stories written by SLIIT's sports journalism collective.",
    link: 'Read news',
  },
  {
    icon: '🏆',
    iconBg: 'rgba(234,179,8,0.1)',
    title: 'Sport Leaderboard',
    desc: 'Follow live and historical rankings for individuals and teams across every sport on campus.',
    link: 'See rankings',
  },
];

const Features = () => {
  return (
    <section className="features" id="features">
      <div className="features-header">
        <span className="section-label">Everything You Need</span>
        <h2 className="features-heading">
          Everything You Need to{' '}
          <span>Play, Lead & Win</span>
        </h2>
        <p className="features-subheading">
          A complete toolkit for students, teams, and event coordinators — all in
          one place.
        </p>
      </div>

      <div className="features-grid">
        {features.map((f, i) => (
          <div className="feature-card" key={i}>
            <div
              className="feature-icon-box"
              style={{ background: f.iconBg }}
            >
              {f.icon}
            </div>
            <h3 className="feature-title">{f.title}</h3>
            <p className="feature-desc">{f.desc}</p>
                <a href="/user/register" className="feature-link">
              {f.link} →
            </a>
          </div>
        ))}

        {/* CTA Card */}
        <div className="feature-card feature-card-cta">
          <div className="feature-icon-box" style={{ background: 'rgba(255,255,255,0.15)' }}>
            🚀
          </div>
          <h3 className="feature-title">Ready to get started?</h3>
          <p className="feature-desc">
            Join thousands of SLIIT students already competing, connecting, and
            celebrating through SportSync.
          </p>
              <a href="/user/register" className="btn">Register Now →</a>
        </div>
      </div>
    </section>
  );
};

export default Features;
