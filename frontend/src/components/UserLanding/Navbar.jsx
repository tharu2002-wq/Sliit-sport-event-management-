import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const dashboardUrl = user?.role === 'Admin' ? '/dashboard' : '/student/teams';

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner">
        {/* Logo */}
        <a href="/" className="navbar-logo">
          <div className="navbar-logo-icon">🏆</div>
          <div className="navbar-logo-text">SLIIT <span>SportSync</span></div>
        </a>

        {/* Links */}
        <ul className="navbar-links">
          <li><a href="#about">About</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#modules">Modules</a></li>
          <li><a href="#events">Events</a></li>
          <li><a href="#news">News</a></li>
        </ul>

        {/* Actions */}
        <div className="navbar-actions">
          {user ? (
            <div className="auth-actions">
              <a href={dashboardUrl} className="btn btn-primary">Go to Dashboard</a>
              <button onClick={logout} className="btn btn-outline" style={{ marginLeft: '10px' }}>Logout</button>
            </div>
          ) : (
            <a href="/user/register" className="btn btn-primary">Register as Student</a>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
