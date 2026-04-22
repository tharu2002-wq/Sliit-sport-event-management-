import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSociety } from "../services/societyService";

const initialState = {
  name: "",
  type: "Sports",
  description: "",
  establishedYear: "",
  president: "",
  contactEmail: "",
  phone: "",
};

const AddSociety = () => {
  const [form, setForm] = useState(initialState);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createSociety({
      ...form,
      establishedYear: form.establishedYear ? Number(form.establishedYear) : undefined,
    });

    navigate("/societies");
  };

  return (
    <section>
      <h2 className="card-title mb-4">Create New Society</h2>
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <input required name="name" className="input-shell" placeholder="Society name" value={form.name} onChange={handleChange} />
        <select name="type" className="input-shell" value={form.type} onChange={handleChange}>
          <option>Sports</option>
          <option>Technical</option>
          <option>Cultural</option>
          <option>Community</option>
          <option>Other</option>
        </select>
        <input name="president" className="input-shell" placeholder="President name" value={form.president} onChange={handleChange} />
        <input name="establishedYear" type="number" className="input-shell" placeholder="Established year" value={form.establishedYear} onChange={handleChange} />
        <input name="contactEmail" type="email" className="input-shell" placeholder="Contact email" value={form.contactEmail} onChange={handleChange} />
        <input
          name="phone"
          className="input-shell"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
          maxLength={10}
          inputMode="numeric"
          pattern="[0-9]{10}"
        />
        <textarea
          name="description"
          className="input-shell md:col-span-2"
          rows="4"
          placeholder="Describe this society"
          value={form.description}
          onChange={handleChange}
        />
        <button className="btn-primary md:col-span-2" type="submit">
          Save Society
        </button>
      </form>
    </section>
  );
};

export default AddSociety;
