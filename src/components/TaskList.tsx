import { type FormEvent, memo, useCallback, useState } from "react";
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

function TaskList() {
  const { tasks, isLoading, isAdmin, deleteTask, createTask, error } = useTeam();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Are you sure you want to delete this task?")) return;
      setDeletingId(id);
      setDeleteError(null);
      try {
        await deleteTask(id);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to delete task.";
        setDeleteError(message);
      } finally {
        setDeletingId(null);
      }
    },
    [deleteTask],
  );

  const handleCreate = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setCreateError(null);
      setCreating(true);
      try {
        await createTask(title, description || undefined);
        setTitle("");
        setDescription("");
        setShowForm(false);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to create task.";
        setCreateError(message);
      } finally {
        setCreating(false);
      }
    },
    [createTask, title, description],
  );

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

  if (error) {
    return (
      <div className="card">
        <div className="card-header">
          <h2>Tasks</h2>
        </div>
        <div className="card-body">
          <p className="error-state">Failed to load tasks: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2>Tasks</h2>
        <div className="card-header-actions">
          <span className="badge badge-neutral">{tasks.length}</span>
          <button
            className="add-task-btn"
            onClick={() => setShowForm(!showForm)}
            aria-label={showForm ? "Cancel adding task" : "Add new task"}
          >
            {showForm ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M4 4l8 8M12 4l-8 8" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M8 3v10M3 8h10" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="add-task-form">
          {createError && <div className="invite-error">{createError}</div>}
          <div className="form-group">
            <label htmlFor="task-title">Title</label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="task-description">Description (optional)</label>
            <textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              rows={2}
            />
          </div>
          <div className="add-task-actions">
            <button
              type="button"
              className="add-task-cancel"
              onClick={() => {
                setShowForm(false);
                setTitle("");
                setDescription("");
                setCreateError(null);
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="invite-btn"
              disabled={creating}
            >
              {creating ? (
                <span className="btn-loading">
                  <span className="spinner small" />
                  Adding...
                </span>
              ) : (
                "Add Task"
              )}
            </button>
          </div>
        </form>
      )}

      {deleteError && (
        <div className="card-body">
          <p className="error-state">{deleteError}</p>
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="card-body">
          <p className="empty-state">No tasks yet. Click + to add one.</p>
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
                  {task.assignedUser && (
                    <span className="task-assignee">
                      Assigned to <strong>{task.assignedUser.name}</strong>
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

export default memo(TaskList);
