import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        background: "linear-gradient(135deg, #f7f4ea 0%, #d8efe6 100%)",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "720px",
          background: "#ffffff",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
          textAlign: "center",
        }}
      >
        <h1 style={{ marginTop: 0 }}>SLIIT Sport Event Management</h1>
        <p style={{ lineHeight: 1.6 }}>
          Frontend is running successfully. Some feature pages are not available in
          this workspace snapshot, so placeholders are shown for those routes.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <Link to="/admin">Admin</Link>
          <Link to="/student">Student</Link>
        </div>
      </section>
    </main>
  );
}
