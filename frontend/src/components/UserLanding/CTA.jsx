import { useAuth } from '../../context/AuthContext';
import './CTA.css';

const trust = [
  { icon: '🏅', label: 'Verified Athletic Records' },
  { icon: '🔒', label: 'Secure Student Data' },
  { icon: '🚀', label: 'Real-time Updates' },
];

const CTA = () => {
  const { user } = useAuth();
  const dashboardUrl = user?.role === 'Admin' ? '/dashboard' : '/student/teams';

  return (
    <section className="cta" id="join">
      {/* Background blobs */}
      <div className="cta-blob cta-blob-1" />
      <div className="cta-blob cta-blob-2" />
      <div className="cta-blob cta-blob-3" />

      <div className="cta-inner">
        <div className="cta-eyebrow">🏆 Join the SLIIT Sports Family</div>

        <h2 className="cta-heading">
          Your Athletic Journey{' '}
          <span>Starts Here.</span>
        </h2>

        <p className="cta-desc">
          Join thousands of SLIIT students who are competing, connecting, and celebrating
          their sports journey through SportSync. Register today and unlock your digital
          athletic identity.
        </p>

        <div className="cta-actions">
          {user ? (
            <a href={dashboardUrl} className="btn btn-primary">🚀 Go to Your Dashboard</a>
          ) : (
            <>
              <a href="/user/register" className="btn btn-primary">🎓 Register as Student</a>
              <a href="/user/login" className="btn btn-outline">Login to Account</a>
            </>
          )}
        </div>

        <div className="cta-trust">
          {trust.map((t, i) => (
            <div className="cta-trust-item" key={i}>
              <span className="cta-trust-icon">{t.icon}</span>
              <span>{t.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CTA;
