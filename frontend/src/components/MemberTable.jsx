import { formatDate } from "../utils/helpers";

const MemberTable = ({ members, onDelete }) => {
  if (!members.length) {
    return <p className="text-sm text-ink/70">No members added yet.</p>;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10">
      <table className="w-full table-auto text-left text-sm">
        <thead className="bg-ink text-sand">
          <tr>
            <th className="px-4 py-3 font-medium">Member</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Joined</th>
            <th className="px-4 py-3 font-medium">Society</th>
            <th className="px-4 py-3 text-right font-medium">Action</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {members.map((member, idx) => (
            <tr key={member._id} className={idx % 2 ? "bg-sand/40" : "bg-white"}>
              <td className="px-4 py-3">
                <p className="font-semibold text-ink">{member.fullName}</p>
                <p className="text-xs text-ink/60">{member.email || "No email"}</p>
              </td>
              <td className="px-4 py-3">{member.role}</td>
              <td className="px-4 py-3">{formatDate(member.joinedOn)}</td>
              <td className="px-4 py-3">{member.society?.name || "-"}</td>
              <td className="px-4 py-3 text-right">
                <button className="btn-danger" onClick={() => onDelete(member._id)} type="button">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MemberTable;
