import { useState } from "react";
import { useTeam } from "../context/useTeam";
import { TaskStatus } from "../types/team";

const STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: "To Do",
  [TaskStatus.IN_PROGRESS]: "In Progress",
  [TaskStatus.DONE]: "Done",
};

const STATUS_CLASSES: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: "badge-todo",
  [TaskStatus.IN_PROGRESS]: "badge-progress",
  [TaskStatus.DONE]: "badge-done",
};

export default function TaskList() {
  const { tasks, isLoading, isAdmin, deleteTask } = useTeam();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    setDeletingId(id);
    try {
      await deleteTask(id);
    } catch {
      // Error is handled by Apollo
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="card-header">
          <h2>Tasks</h2>
        </div>
        <div className="card-body center">
          <div className="spinner small" />
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2>Tasks</h2>
        <span className="badge badge-neutral">{tasks.length}</span>
      </div>

      {tasks.length === 0 ? (
        <div className="card-body">
          <p className="empty-state">No tasks yet.</p>
        </div>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <li key={task.id} className="task-item">
              <div className="task-content">
                <div className="task-top-row">
                  <span className="task-title">{task.title}</span>
                  <span
                    className={`badge ${STATUS_CLASSES[task.status]}`}
                  >
                    {STATUS_LABELS[task.status]}
                  </span>
                </div>
                {task.description && (
                  <p className="task-description">{task.description}</p>
                )}
                <div className="task-meta">
                  {task.assignee && (
                    <span className="task-assignee">
                      Assigned to <strong>{task.assignee.name}</strong>
                    </span>
                  )}
                </div>
              </div>

              {isAdmin && (
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(task.id)}
                  disabled={deletingId === task.id}
                  title="Delete task"
                  aria-label={`Delete task: ${task.title}`}
                >
                  {deletingId === task.id ? (
                    <span className="spinner small" />
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 4h12M5.333 4V2.667a1.333 1.333 0 0 1 1.334-1.334h2.666a1.333 1.333 0 0 1 1.334 1.334V4m2 0v9.333a1.333 1.333 0 0 1-1.334 1.334H4.667a1.333 1.333 0 0 1-1.334-1.334V4h9.334Z" />
                    </svg>
                  )}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
