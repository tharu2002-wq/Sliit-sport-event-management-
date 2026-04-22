const TeamCard = ({ team, onDelete, onEdit, onApprove, onReject }) => {
  return (
    <article className="rounded-2xl border border-ink/10 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-float">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink/60">{team.customId}</p>
          <h4 className="font-display text-lg text-ink">{team.name}</h4>
        </div>
        <div className="flex gap-2">
          {team.status && (
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${team.status === 'pending' ? 'bg-amber-100 text-amber-700' : team.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
              {team.status}
            </span>
          )}
          <span className="rounded-full bg-coral/15 px-3 py-1 text-xs font-semibold text-coral">{team.category}</span>
        </div>
      </div>
      <p className="text-sm text-ink/80">Captain: {team.captain || team.coach || "Not assigned"}</p>
      <p className="mt-2 text-sm text-ink/80">Members: {team.members?.length || 0}</p>
      <p className="mt-1 text-sm text-ink/80">Achievements: {team.achievements?.length || 0}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {onApprove && team.status === 'pending' && (
          <button className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700" onClick={() => onApprove(team._id)} type="button">
            Approve
          </button>
        )}
        {onReject && team.status === 'pending' && (
          <button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700" onClick={() => onReject(team._id)} type="button">
            Reject
          </button>
        )}
        {onDelete && (
          <button className="rounded-lg bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-200" onClick={() => onDelete(team._id)} type="button">
            Delete
          </button>
        )}
        {onEdit && (
          <button className="rounded-lg bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-200" onClick={() => onEdit(team)} type="button">
            Edit
          </button>
        )}
      </div>
    </article>
  );
};

export default TeamCard;
