import { memo, useCallback, useState } from "react";
import { useAuth } from "../context/useAuth";
import { TeamProvider } from "../context/TeamContext";
import TeamMemberList from "../components/TeamMemberList";
import TaskList from "../components/TaskList";
import CreateTeamPrompt from "../components/CreateTeamPrompt";
import { useTeam } from "../context/useTeam";

const DashboardContent = memo(function DashboardContent() {
  const { team, isLoading, isAdmin, error, deleteTeam } = useTeam();
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteTeam = useCallback(async () => {
    if (!team) return;
    if (
      !confirm(
        `Are you sure you want to delete "${team.name}"? This will remove all tasks and members. This action cannot be undone.`
      )
    )
      return;

    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteTeam(team.id);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete team.";
      setDeleteError(message);
    } finally {
      setDeleting(false);
    }
  }, [team, deleteTeam]);

  if (isLoading) {
    return (
      <main className="dashboard-content">
        <div className="card">
          <div className="card-body center">
            <div className="spinner" />
            <p>Loading your workspace...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error && !team) {
    return (
      <main className="dashboard-content">
        <div className="card">
          <div className="card-body">
            <p className="error-state">Something went wrong: {error}</p>
          </div>
        </div>
      </main>
    );
  }

  if (!team) {
    return (
      <main className="dashboard-content">
        <CreateTeamPrompt />
      </main>
    );
  }

  return (
    <main className="dashboard-content">
      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}
      {deleteError && (
        <div className="error-banner">
          {deleteError}
        </div>
      )}

      <div className="team-header">
        <h2 className="team-name">{team.name}</h2>
        {isAdmin && (
          <button
            className="delete-team-btn"
            onClick={handleDeleteTeam}
            disabled={deleting}
            title="Delete team"
          >
            {deleting ? (
              <span className="btn-loading">
                <span className="spinner small" />
                Deleting...
              </span>
            ) : (
              "Delete Team"
            )}
          </button>
        )}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-main">
          <TaskList />
        </div>
        <aside className="dashboard-sidebar">
          <TeamMemberList />
        </aside>
      </div>
    </main>
  );
});

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <TeamProvider>
      <div className="dashboard">
        <header className="dashboard-header">
          <h1>Dashboard</h1>
          <div className="user-info">
            <span>
              Welcome, <strong>{user?.name}</strong>
            </span>
            <button onClick={logout} className="logout-btn">
              Sign out
            </button>
          </div>
        </header>

        <DashboardContent />
      </div>
    </TeamProvider>
  );
}
