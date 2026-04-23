import { Link, Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";

function PlaceholderPage({ title }) {
  return (
    <main style={{ maxWidth: 720, margin: "48px auto", padding: "0 16px" }}>
      <h1>{title}</h1>
      <p>This section is not available in the current frontend source snapshot.</p>
      <p>
        <Link to="/">Go back to Home</Link>
      </p>
    </main>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<PlaceholderPage title="Register" />} />
      <Route path="/login" element={<PlaceholderPage title="Login" />} />
      <Route path="/admin/*" element={<PlaceholderPage title="Admin Portal" />} />
      <Route path="/student/*" element={<PlaceholderPage title="Student Portal" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
