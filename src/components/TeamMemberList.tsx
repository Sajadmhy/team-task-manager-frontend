import { useTeam } from "../context/useTeam";
import { TeamRole } from "../types/team";

export default function TeamMemberList() {
  const { team, isLoading } = useTeam();

  if (isLoading) {
    return (
      <div className="card">
        <div className="card-header">
          <h2>Team Members</h2>
        </div>
        <div className="card-body center">
          <div className="spinner small" />
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="card">
        <div className="card-header">
          <h2>Team Members</h2>
        </div>
        <div className="card-body">
          <p className="empty-state">No team found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2>Team Members</h2>
        <span className="badge badge-neutral">{team.members.length}</span>
      </div>
      <ul className="member-list">
        {team.members.map((member) => (
          <li key={member.id} className="member-item">
            <div className="member-avatar">
              {member.user.name.charAt(0).toUpperCase()}
            </div>
            <div className="member-info">
              <span className="member-name">{member.user.name}</span>
              <span className="member-email">{member.user.email}</span>
            </div>
            <span
              className={`badge ${
                member.role === TeamRole.ADMIN
                  ? "badge-admin"
                  : "badge-user"
              }`}
            >
              {member.role === TeamRole.ADMIN ? "Admin" : "User"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
