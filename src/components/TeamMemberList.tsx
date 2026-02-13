import { useState } from "react";
import { useTeam } from "../context/useTeam";
import { TeamRole } from "../types/team";
import InviteMember from "./InviteMember";

export default function TeamMemberList() {
  const { team, isLoading, isAdmin, error } = useTeam();
  const [modalOpen, setModalOpen] = useState(false);

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

  if (error) {
    return (
      <div className="card">
        <div className="card-header">
          <h2>Team Members</h2>
        </div>
        <div className="card-body">
          <p className="error-state">Failed to load team: {error}</p>
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
    <>
      <div className="card">
        <div className="card-header">
          <h2>Team Members</h2>
          <div className="card-header-actions">
            <span className="badge badge-neutral">{team.members.length}</span>
            {isAdmin && (
              <button
                className="add-task-btn"
                onClick={() => setModalOpen(true)}
                aria-label="Add team member"
                title="Add team member"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M8 3v10M3 8h10" />
                </svg>
              </button>
            )}
          </div>
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

      <InviteMember open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
