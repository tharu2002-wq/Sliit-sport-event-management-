import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const UserAuth = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, loading, loginAsUser, registerAsUser } = useAuth();
  const isRegister = pathname.endsWith("/register");

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    return <Navigate to={user.role === "Student" ? "/user" : "/dashboard"} replace />;
  }

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (isRegister) {
        await registerAsUser({ name: form.name, email: form.email, password: form.password });
      } else {
        await loginAsUser({ email: form.email, password: form.password });
      }

      navigate("/user", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(130deg,#0a1d5e_0%,#123ea9_58%,#0e2f82_100%)] px-4 py-8 text-white md:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <Link to="/user" className="text-sm text-blue-100 hover:text-white">
            Back to User Home
          </Link>
          <Link to="/admin/login" className="rounded-full border border-white/35 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-100 hover:bg-white/10">
            Admin Portal
          </Link>
        </div>

        <div className="mt-8 grid gap-8 rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur md:grid-cols-2 md:p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-blue-100">SLIIT SportSync</p>
            <h1 className="mt-3 font-display text-4xl font-bold leading-tight">
              {isRegister ? "Create User Account" : "User Login"}
            </h1>
            <p className="mt-4 text-sm leading-7 text-blue-100">
              {isRegister
                ? "Join as a student player and access campus sports announcements, event registrations, and team activities."
                : "Access your student sports profile, events, and team updates from one place."}
            </p>

            <div className="mt-6 flex gap-3 text-sm font-semibold">
              <Link
                to="/user/login"
                className={`rounded-full px-4 py-2 transition ${
                  !isRegister ? "bg-white text-[#12399d]" : "border border-white/35 text-blue-100"
                }`}
              >
                Login
              </Link>
              <Link
                to="/user/register"
                className={`rounded-full px-4 py-2 transition ${
                  isRegister ? "bg-white text-[#12399d]" : "border border-white/35 text-blue-100"
                }`}
              >
                Register
              </Link>
            </div>
          </div>

          <form onSubmit={onSubmit} className="rounded-2xl bg-white p-5 text-slate-900 md:p-6">
            <h2 className="font-display text-2xl">{isRegister ? "Register" : "Login"}</h2>

            <div className="mt-4 space-y-3">
              {isRegister ? (
                <div>
                  <label htmlFor="name" className="mb-1 block text-sm font-medium">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={onChange}
                    className="input-shell"
                    placeholder="Your full name"
                    required
                  />
                </div>
              ) : null}

              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  className="input-shell"
                  placeholder="student@sliit.lk"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1 block text-sm font-medium">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={onChange}
                  className="input-shell"
                  placeholder="At least 6 characters"
                  minLength={6}
                  required
                />
              </div>
            </div>

            {error ? <p className="mt-3 text-sm text-coral">{error}</p> : null}

            <button type="submit" className="btn-primary mt-5 w-full" disabled={submitting}>
              {submitting ? "Please wait..." : isRegister ? "Create User Account" : "Login as User"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserAuth;
