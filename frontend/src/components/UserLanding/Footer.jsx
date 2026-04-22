import './Footer.css';

const platform = [
  { label: 'Register', href: '/user/register' },
  { label: 'Login', href: '/user/login' },
  { label: 'Events', href: '/events' },
  { label: 'Teams', href: '/teams' },
  { label: 'Leaderboard', href: '/leaderboard' },
  { label: 'News', href: '/news' },
];

const sports = [
  { label: 'Cricket', href: '#' },
  { label: 'Football', href: '#' },
  { label: 'Basketball', href: '#' },
  { label: 'Badminton', href: '#' },
  { label: 'Swimming', href: '#' },
  { label: 'Athletics', href: '#' },
];

const contact = [
  { label: 'sports@sliit.lk', href: 'mailto:sports@sliit.lk' },
  { label: '+94 11 754 4801', href: 'tel:+94117544801' },
  { label: 'SLIIT, Malabe 10115', href: '#' },
  { label: 'Help Center', href: '#' },
];

const socials = ['🐦', '📘', '📸', '▶️'];

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <a href="/user" className="footer-logo">
              <div className="footer-logo-icon">🏆</div>
              <div className="footer-logo-text">SLIIT <span>SportSync</span></div>
            </a>
            <p className="footer-brand-desc">
              SLIIT SportSync is the official sport information technology community
              connecting athletes, teams and events across the SLIIT campus ecosystem.
            </p>
            <div className="footer-socials">
              {socials.map((s, i) => (
                <a href="#" className="footer-social" key={i}>{s}</a>
              ))}
            </div>
          </div>

          {/* Platform links */}
          <div className="footer-col">
            <h4 className="footer-col-title">Platform</h4>
            <ul className="footer-col-links">
              {platform.map((p, i) => (
                <li key={i}><a href={p.href}>{p.label}</a></li>
              ))}
            </ul>
          </div>

          {/* Sports links */}
          <div className="footer-col">
            <h4 className="footer-col-title">Sports</h4>
            <ul className="footer-col-links">
              {sports.map((s, i) => (
                <li key={i}><a href={s.href}>{s.label}</a></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4 className="footer-col-title">Contact</h4>
            <ul className="footer-col-links">
              {contact.map((c, i) => (
                <li key={i}><a href={c.href}>{c.label}</a></li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <p className="footer-copy">
            © {new Date().getFullYear()} SLIIT SportSync. All rights reserved.
          </p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
