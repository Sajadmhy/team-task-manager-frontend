import { type FormEvent, memo, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTeam } from "../context/useTeam";
import { TeamRole } from "../types/team";

interface Props {
  open: boolean;
  onClose: () => void;
}

function InviteMember({ open, onClose }: Props) {
  const { addTeamMember } = useTeam();

  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<TeamRole>(TeamRole.USER);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const overlayRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const handleClose = useCallback(() => {
    setUserId("");
    setRole(TeamRole.USER);
    setError(null);
    setSuccess(null);
    onClose();
  }, [onClose]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) handleClose();
    },
    [handleClose],
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError(null);
      setSuccess(null);
      setSubmitting(true);

      try {
        await addTeamMember(userId, role);
        setSuccess("Member added successfully");
        setUserId("");
        setRole(TeamRole.USER);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to add member.";
        setError(message);
      } finally {
        setSubmitting(false);
      }
    },
    [addTeamMember, userId, role],
  );

  if (!open) return null;

  return createPortal(
    <div className="modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <h2 id="modal-title">Add Team Member</h2>
          <button
            className="modal-close"
            onClick={handleClose}
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && <div className="invite-error">{error}</div>}
          {success && <div className="invite-success">{success}</div>}

          <div className="form-group">
            <label htmlFor="invite-user-id">User email</label>
            <input
              ref={inputRef}
              id="invite-user-id"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user's email"
              required
            />
          </div>

          <div className="form-group">
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

          <div className="modal-actions">
            <button
              type="button"
              className="add-task-cancel"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="invite-btn"
              disabled={submitting}
            >
              {submitting ? (
                <span className="btn-loading">
                  <span className="spinner small" />
                  Adding...
                </span>
              ) : (
                "Add Member"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

export default memo(InviteMember);
