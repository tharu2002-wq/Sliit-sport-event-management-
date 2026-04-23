import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getSocietyDetails, updateSociety } from "../services/societyService";

const EditSociety = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    type: "Sports",
    description: "",
    establishedYear: "",
    president: "",
    contactEmail: "",
    phone: "",
  });

  useEffect(() => {
    const fetchOne = async () => {
      const { society } = await getSocietyDetails(id);
      setForm({
        name: society.name || "",
        type: society.type || "Sports",
        description: society.description || "",
        establishedYear: society.establishedYear || "",
        president: society.president || "",
        contactEmail: society.contactEmail || "",
        phone: society.phone || "",
      });
    };

    fetchOne();
  }, [id]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateSociety(id, {
      ...form,
      establishedYear: form.establishedYear ? Number(form.establishedYear) : undefined,
    });

    navigate(`/societies/${id}`);
  };

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="card-title">Edit Society</h2>
        <div className="flex gap-2">
          <button className="btn-secondary" type="button" onClick={() => navigate("/societies")}> 
            Back to Societies
          </button>
          <Link className="btn-secondary" to={`/societies/${id}`}>
            View Details
          </Link>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <input required name="name" className="input-shell" value={form.name} onChange={handleChange} />
        <select name="type" className="input-shell" value={form.type} onChange={handleChange}>
          <option>Sports</option>
          <option>Technical</option>
          <option>Cultural</option>
          <option>Community</option>
          <option>Other</option>
        </select>
        <input name="president" className="input-shell" value={form.president} onChange={handleChange} />
        <input name="establishedYear" type="number" className="input-shell" value={form.establishedYear} onChange={handleChange} />
        <input name="contactEmail" type="email" className="input-shell" value={form.contactEmail} onChange={handleChange} />
        <input name="phone" className="input-shell" value={form.phone} onChange={handleChange} />
        <textarea name="description" rows="4" className="input-shell md:col-span-2" value={form.description} onChange={handleChange} />
        <div className="md:col-span-2 flex gap-3">
          <button className="btn-primary" type="submit">
            Update Society
          </button>
          <button className="btn-secondary" type="button" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
};

export default EditSociety;
