import { useAuth } from "../context/useAuth";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
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
        <p>You are signed in as {user?.email}.</p>
      </main>
    </div>
  );
}
