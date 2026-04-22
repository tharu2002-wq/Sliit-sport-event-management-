import './About.css';

const tags = [
  { icon: '🎓', label: 'For Students' },
  { icon: '👥', label: 'For Team Leaders' },
  { icon: '⚙️', label: 'For Admins' },
  { icon: '🏅', label: 'For Athletes' },
];

const cardFeatures = ['Player Profiles', 'Team Dashboard', 'Event Management', 'Live Scores'];

const About = () => {
  return (
    <section className="about" id="about">
      <div className="about-inner">
        {/* Left content */}
        <div className="about-content">
          <span className="section-label">About the System</span>
          <h2 className="about-heading">
            The Central Hub for{' '}
            <span>SLIIT Athletics</span>
          </h2>
          <p className="about-desc">
            SLIIT SportSync is the official sport information technology community.
            It digitizes every aspect of campus sports — from player registration to
            team formation to live events that operate with results and timing.
            Whether you're a competitive first-year, a team leader, a fresher, or a
            sports coordinator, SportSync gives the tools to participate, compete,
            organise and celebrate sport at SLIIT.
          </p>
          <div className="about-tags">
            {tags.map((t, i) => (
              <span className="about-tag" key={i}>{t.icon} {t.label}</span>
            ))}
          </div>
          <a href="/user/register" className="btn btn-primary">Get Started Free →</a>
        </div>

        {/* Right card */}
        <div className="about-card-wrap">
          <div className="about-card">
            <div className="about-card-bg" />
            <span className="about-card-label">Built for SLIIT</span>
            <span className="about-card-icon">🏆</span>
            <h3 className="about-card-title">Your Campus Sports Command Centre</h3>
            <p className="about-card-desc">
              Everything built exclusively for SLIIT's sporting community — powered
              by student data, validated by coaches, and celebrated campus-wide.
            </p>
            <div className="about-card-features">
              {cardFeatures.map((f, i) => (
                <span className="about-card-feature" key={i}>{f}</span>
              ))}
            </div>
          </div>

          {/* Floating badges */}
          <div className="about-badge about-badge-1">
            <span className="about-badge-icon">🎯</span>
            <span>Real-Time Event Ops</span>
          </div>
          <div className="about-badge about-badge-2">
            <span className="about-badge-icon">👥</span>
            <span>Team Collaboration Hub</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
