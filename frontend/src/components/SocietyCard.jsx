import { Link } from "react-router-dom";

const SocietyCard = ({ society, onDelete }) => {
  return (
    <article className="glass-panel animate-rise overflow-hidden p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/60">{society.customId}</p>
          <h3 className="font-display text-xl text-ink">{society.name}</h3>
        </div>
        <span className="rounded-full bg-mint/65 px-3 py-1 text-xs font-semibold text-ink">{society.type}</span>
      </div>

      <p className="mb-4 line-clamp-3 min-h-16 text-sm text-ink/80">{society.description || "No description yet."}</p>

      <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-sky p-3">
          <p className="text-xs uppercase tracking-wide text-ink/60">Members</p>
          <p className="font-display text-lg">{society.membersCount ?? 0}</p>
        </div>
        <div className="rounded-xl bg-sand p-3">
          <p className="text-xs uppercase tracking-wide text-ink/60">Teams</p>
          <p className="font-display text-lg">{society.teamCount ?? 0}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link className="btn-primary" to={`/societies/${society._id}`}>
          Details
        </Link>
        <Link className="btn-secondary" to={`/societies/${society._id}/edit`}>
          Edit
        </Link>
        <button className="btn-danger" onClick={() => onDelete(society._id)} type="button">
          Delete
        </button>
      </div>
    </article>
  );
};

export default SocietyCard;
