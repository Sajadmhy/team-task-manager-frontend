import { useAuth } from "../context/useAuth";
import { TeamProvider } from "../context/TeamContext";
import TeamMemberList from "../components/TeamMemberList";
import TaskList from "../components/TaskList";
import InviteMember from "../components/InviteMember";

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

        <main className="dashboard-content">
          <div className="dashboard-grid">
            <div className="dashboard-main">
              <TaskList />
            </div>
            <aside className="dashboard-sidebar">
              <TeamMemberList />
              <InviteMember />
            </aside>
          </div>
        </main>
      </div>
    </TeamProvider>
  );
}
