import { useAuth } from '../../context/AuthContext';
import './Hero.css';

const stats = [
  { number: '2,400+', label: 'Active Students' },
  { number: '128+', label: 'Sports Teams' },
  { number: '15', label: 'Sports Disciplines' },
  { number: '80+', label: 'Annual Events' },
];

const Hero = () => {
  const { user } = useAuth();
  const dashboardUrl = user?.role === 'Admin' ? '/dashboard' : '/student/teams';

  return (
    <section className="hero" id="home">
      {/* Background */}
      <div className="hero-bg">
        <div className="hero-blob hero-blob-1" />
        <div className="hero-blob hero-blob-2" />
        <div className="hero-blob hero-blob-3" />
        <div className="hero-grid" />
      </div>

      {/* Main content */}
      <div className="hero-content">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          SLIIT Sports Management Platform
        </div>

        <h1 className="hero-headline">
          One Platform.
          <span>Every Sport.</span>
        </h1>

        <p className="hero-desc">
          SLIIT SportSync brings together players, teams, and events inside one
          intelligent portal — powering the future of campus athletics.
        </p>

        <div className="hero-actions">
          {user ? (
            <a href={dashboardUrl} className="btn btn-primary">
              🚀 Go to Dashboard
            </a>
          ) : (
            <>
              <a href="/user/register" className="btn btn-primary">
                🎓 Register as Student
              </a>
              <a href="/user/login" className="btn btn-outline">
                Login to Your Account
              </a>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="hero-stats">
        <div className="hero-stats-inner">
          {stats.map((s, i) => (
            <div className="hero-stat" key={i}>
              <div className="hero-stat-number">{s.number}</div>
              <div className="hero-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
