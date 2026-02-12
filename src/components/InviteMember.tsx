import { type FormEvent, useState } from "react";
import { useTeam } from "../context/useTeam";
import { TeamRole } from "../types/team";

export default function InviteMember() {
  const { isAdmin, inviteMember } = useTeam();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamRole>(TeamRole.USER);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isAdmin) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      await inviteMember(email, role);
      setSuccess(`Invitation sent to ${email}`);
      setEmail("");
      setRole(TeamRole.USER);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to send invitation.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>Invite New Member</h2>
      </div>
      <form onSubmit={handleSubmit} className="invite-form">
        {error && <div className="invite-error">{error}</div>}
        {success && <div className="invite-success">{success}</div>}

        <div className="invite-fields">
          <div className="form-group invite-email-group">
            <label htmlFor="invite-email">Email address</label>
            <input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              required
            />
          </div>

          <div className="form-group invite-role-group">
            <label htmlFor="invite-role">Role</label>
            <select
              id="invite-role"
              value={role}
              onChange={(e) => setRole(e.target.value as TeamRole)}
            >
              <option value={TeamRole.USER}>User</option>
              <option value={TeamRole.ADMIN}>Admin</option>
            </select>
          </div>

          <button
            type="submit"
            className="invite-btn"
            disabled={submitting}
          >
            {submitting ? (
              <span className="btn-loading">
                <span className="spinner small" />
                Sending...
              </span>
            ) : (
              "Invite"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
