import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  createSociety,
  deleteSociety,
  getNextSocietyCode,
  getSocieties,
  updateSociety,
} from "../services/societyService";

const Societies = () => {
  const [societies, setSocieties] = useState([]);
  const [code, setCode] = useState("SOC001");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [viewMode, setViewMode] = useState("form");
  const [form, setForm] = useState({
    name: "",
    president: "",
    contactEmail: "",
    phone: "",
    description: "",
    type: "Sports",
    status: "Active",
  });

  const fetchSocieties = async () => {
    const [list, nextCodeData] = await Promise.all([getSocieties(), getNextSocietyCode()]);
    const data = Array.isArray(list) ? list : [];
    setSocieties(data);
    setCode(nextCodeData?.code || "SOC001");
  };

  useEffect(() => {
    fetchSocieties();
    const interval = setInterval(fetchSocieties, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (error) {
      setError("");
    }
    setFieldErrors((prev) => {
      if (!prev[name]) {
        return prev;
      }
      const next = { ...prev };
      delete next[name];
      return next;
    });
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateSocietyForm = (value) => {
    const name = value.name.trim();
    const president = value.president.trim();
    const email = value.contactEmail.trim().toLowerCase();
    const phone = value.phone.trim();
    const description = value.description.trim();
    const errors = {};

    if (!name) {
      errors.name = "Society name is required.";
    }

    if (!president) {
      errors.president = "President / Head is required.";
    }

    if (!email) {
      errors.contactEmail = "Contact email is required.";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailPattern.test(email)) {
      errors.contactEmail = "Enter a valid contact email address.";
    }

    if (!phone) {
      errors.phone = "Contact number is required.";
    }

    const phonePattern = /^\d{10}$/;
    if (phone && !phonePattern.test(phone)) {
      errors.phone = "Contact number must be exactly 10 digits.";
    }

    if (description.length > 500) {
      errors.description = "Description cannot exceed 500 characters.";
    }

    const hasErrors = Object.keys(errors).length > 0;
    if (hasErrors) {
      const firstMessage = Object.values(errors)[0];
      return { isValid: false, message: firstMessage, errors };
    }

    return {
      isValid: true,
      message: "",
      errors: {},
      normalized: {
        name,
        president,
        contactEmail: email,
        phone,
        description,
        type: value.type,
        status: value.status,
      },
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validation = validateSocietyForm(form);
    if (!validation.isValid) {
      setFieldErrors(validation.errors || {});
      setError(validation.message);
      return;
    }
    setFieldErrors({});

    try {
      await createSociety(validation.normalized);
    } catch (submitError) {
      setError(submitError?.response?.data?.message || "Unable to add society.");
      return;
    }

    setForm({
      name: "",
      president: "",
      contactEmail: "",
      phone: "",
      description: "",
      type: "Sports",
      status: "Active",
    });
    setFieldErrors({});

    await fetchSocieties();
  };

  const handleDelete = async (id) => {
    await deleteSociety(id);
    await fetchSocieties();
  };

  const handleToggleStatus = async (society) => {
    const nextStatus = society.status === "Inactive" ? "Active" : "Inactive";
    await updateSociety(society._id, { status: nextStatus });
    await fetchSocieties();
  };

  const formatDate = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const [searchTerm, setSearchTerm] = useState("");

  const filteredSocieties = societies.filter((society) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (society.name && society.name.toLowerCase().includes(searchLower)) ||
      (society.type && society.type.toLowerCase().includes(searchLower)) ||
      (society.customId && society.customId.toLowerCase().includes(searchLower))
    );
  });

  return (
    <section className="space-y-8">
      <div className="border-b border-ink/10 pb-6">
        <h2 className="font-display text-3xl text-ink">Societies</h2>
        <p className="mt-2 text-sm text-ink/70">Create and manage societies that own teams.</p>
        <p className="mt-1 text-sm text-ink/70">Society code is auto-generated when you add a new society.</p>
        <div className="mt-4 flex gap-3">
          <button
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              viewMode === "form"
                ? "bg-blue-600 text-white"
                : "border border-ink/20 text-ink hover:bg-slate-100"
            }`}
            onClick={() => setViewMode("form")}
            type="button"
          >
            Create Society & List
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              viewMode === "list"
                ? "bg-blue-600 text-white"
                : "border border-ink/20 text-ink hover:bg-slate-100"
            }`}
            onClick={() => setViewMode("list")}
            type="button"
          >
            All Societies
          </button>
        </div>
      </div>

      {viewMode === "form" && (
        <>
      <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">
        <h3 className="mb-6 font-semibold text-ink">Add New Society</h3>
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-ink">Society Name *</label>
              <input
                className={`input-shell ${fieldErrors.name ? "border-coral focus:ring-coral/20" : ""}`}
                name="name"
                placeholder="Enter society name"
                value={form.name}
                onChange={handleChange}
                aria-invalid={Boolean(fieldErrors.name)}
              />
              {fieldErrors.name && <p className="mt-1 text-xs text-coral font-medium">{fieldErrors.name}</p>}
            </div>

            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-ink">Society Code</label>
              <input className="input-shell bg-slate-50 cursor-not-allowed" value={code} readOnly />
              <p className="mt-1 text-xs text-ink/50">Auto-generated</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-ink">President / Head *</label>
              <input
                className={`input-shell ${fieldErrors.president ? "border-coral focus:ring-coral/20" : ""}`}
                name="president"
                placeholder="Enter president name"
                value={form.president}
                onChange={handleChange}
                aria-invalid={Boolean(fieldErrors.president)}
              />
              {fieldErrors.president && <p className="mt-1 text-xs text-coral font-medium">{fieldErrors.president}</p>}
            </div>

            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-ink">Contact Email *</label>
              <input
                className={`input-shell ${fieldErrors.contactEmail ? "border-coral focus:ring-coral/20" : ""}`}
                type="email"
                name="contactEmail"
                placeholder="Enter email address"
                value={form.contactEmail}
                onChange={handleChange}
                aria-invalid={Boolean(fieldErrors.contactEmail)}
              />
              {fieldErrors.contactEmail && <p className="mt-1 text-xs text-coral font-medium">{fieldErrors.contactEmail}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-ink">Contact Number *</label>
              <input
                className={`input-shell ${fieldErrors.phone ? "border-coral focus:ring-coral/20" : ""}`}
                name="phone"
                placeholder="10-digit number"
                value={form.phone}
                onChange={handleChange}
                maxLength={10}
                inputMode="numeric"
                aria-invalid={Boolean(fieldErrors.phone)}
              />
              {fieldErrors.phone && <p className="mt-1 text-xs text-coral font-medium">{fieldErrors.phone}</p>}
            </div>

            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-ink">Type</label>
              <select name="type" className="input-shell" value={form.type} onChange={handleChange}>
                <option value="Sports">Sports</option>
                <option value="Technical">Technical</option>
                <option value="Cultural">Cultural</option>
                <option value="Community">Community</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-ink">Description (Optional)</label>
            <textarea
              className={`input-shell resize-none ${fieldErrors.description ? "border-coral focus:ring-coral/20" : ""}`}
              name="description"
              placeholder="Enter society description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              aria-invalid={Boolean(fieldErrors.description)}
            />
            <div className="mt-1 flex justify-between">
              {fieldErrors.description && <p className="text-xs text-coral font-medium">{fieldErrors.description}</p>}
              <p className="text-xs text-ink/50 ml-auto">{form.description.length}/500</p>
            </div>
          </div>

          {error && <p className="rounded-lg bg-coral/10 px-4 py-3 text-sm text-coral font-medium border border-coral/20">{error}</p>}

          <button className="btn-primary w-full md:w-auto" type="submit">
            Add Society
          </button>
        </form>
      </div>
        </>
      )}

      {viewMode === "list" && (
      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h3 className="font-semibold text-ink text-lg">All Societies</h3>
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search by name, code or type..."
              className="input-shell w-full pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              🔍
            </span>
          </div>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white shadow-sm">
          <table className="w-full min-w-[1020px] table-auto text-left">
            <thead className="border-b border-ink/10 bg-slate-50 text-ink">
              <tr>
                <th className="px-5 py-4 text-sm font-semibold">Name</th>
                <th className="px-5 py-4 text-sm font-semibold">Code</th>
                <th className="px-5 py-4 text-sm font-semibold">Type</th>
                <th className="px-5 py-4 text-sm font-semibold">President / Head</th>
                <th className="px-5 py-4 text-sm font-semibold">Email</th>
                <th className="px-5 py-4 text-sm font-semibold">Phone</th>
                <th className="px-5 py-4 text-sm font-semibold">Status</th>
                <th className="px-5 py-4 text-sm font-semibold">Created</th>
                <th className="px-5 py-4 text-sm font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSocieties.map((society) => (
                <tr key={society._id} className="border-b border-ink/10 last:border-0 hover:bg-slate-50 transition">
                  <td className="px-5 py-4 font-medium text-ink">{society.name}</td>
                  <td className="px-5 py-4 font-semibold text-ink/80">{society.customId}</td>
                  <td className="px-5 py-4 text-sm text-ink/70">{society.type || "General"}</td>
                  <td className="px-5 py-4 text-sm text-ink">{society.president || "-"}</td>
                  <td className="px-5 py-4 text-sm text-ink/70">{society.contactEmail || "-"}</td>
                  <td className="px-5 py-4 text-sm text-ink/70">{society.phone || "-"}</td>
                  <td className="px-5 py-4">
                    <button
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition hover:opacity-80 ${
                        society.status === "Active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                      onClick={() => handleToggleStatus(society)}
                      type="button"
                    >
                      {society.status || "Active"}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-sm text-ink/70">{formatDate(society.createdAt)}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link className="btn-secondary text-xs px-3 py-1" to={`/societies/${society._id}/edit`}>
                        Edit
                      </Link>
                      <button className="btn-danger text-xs px-3 py-1" onClick={() => handleDelete(society._id)} type="button">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!societies.length && (
          <div className="rounded-2xl border border-dashed border-ink/20 bg-slate-50 p-8 text-center">
            <p className="text-sm text-ink/70">No societies yet. Create one using the form above.</p>
          </div>
        )}
      </div>
      )}
    </section>
  );
};

export default Societies;
