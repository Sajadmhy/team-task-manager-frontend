import { type FormEvent, memo, useCallback, useState } from "react";
import { useTeam } from "../context/useTeam";

function CreateTeamPrompt() {
  const { createTeam } = useTeam();

  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError(null);
      setSubmitting(true);

      try {
        await createTeam(name);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to create team.";
        setError(message);
      } finally {
        setSubmitting(false);
      }
    },
    [createTeam, name],
  );

  return (
    <div className="card create-team-prompt">
      <div className="create-team-body">
        <div className="create-team-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" />
            <path d="M4 39v-2a8 8 0 0 1 8-8h10a8 8 0 0 1 8 8v2" />
            <path d="M36 14v12M30 20h12" />
          </svg>
        </div>

        <h2>Create your first team</h2>
        <p>You don't belong to any team yet. Create one to start collaborating.</p>

        <form onSubmit={handleSubmit} className="create-team-form">
          {error && <div className="invite-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="team-name">Team name</label>
            <input
              id="team-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Engineering"
              required
            />
          </div>

          <button type="submit" className="create-team-submit" disabled={submitting}>
            {submitting ? (
              <span className="btn-loading">
                <span className="spinner small" />
                Creating...
              </span>
            ) : (
              "Create Team"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default memo(CreateTeamPrompt);
