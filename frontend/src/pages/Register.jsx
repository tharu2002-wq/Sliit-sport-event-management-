import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { user, registerAsAdmin, loading } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    return <Navigate to={user.role === "Admin" ? "/dashboard" : "/user"} replace />;
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
      await registerAsAdmin(form);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-layer px-4 py-10">
      <div className="glass-panel w-full max-w-md p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.22em] text-ink/60">Join now</p>
        <h1 className="mt-2 font-display text-3xl text-ink">Admin Register</h1>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-ink">
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

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              className="input-shell"
              placeholder="admin@sliit.lk"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
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

          {error ? <p className="text-sm text-coral">{error}</p> : null}

          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-4 text-sm text-ink/75">
          Already have an admin account?{" "}
          <Link to="/admin/login" className="font-semibold text-ink underline-offset-2 hover:underline">
            Login here
          </Link>
        </p>
        <p className="mt-2 text-sm text-ink/75">
          Student user?{" "}
          <Link to="/user/register" className="font-semibold text-ink underline-offset-2 hover:underline">
            Go to user register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
