import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  generateTaskDescription,
} from "../api";

function TaskManager() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");

  // Filter & Search State
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'pending', 'completed'
  const [searchQuery, setSearchQuery] = useState("");

  async function loadTasks() {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await getTasks();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load tasks. Please verify your login session.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setPriority("medium");
  }

  // Practical 13: AI Task Description Generation
  async function handleGenerateDescription() {
    if (!title.trim()) {
      setError("Please provide a task title first so the AI can generate a relevant description.");
      return;
    }

    setGeneratingAi(true);
    setError("");
    setNotice("");

    try {
      const res = await generateTaskDescription(title.trim());
      if (res.description) {
        setDescription(res.description);
        setNotice(
          res.fallback
            ? "Template suggestion applied. You can edit it before saving."
            : "AI suggestion generated! Review or modify the description before saving."
        );
      } else {
        setError(res.message || "Could not retrieve an AI suggestion. Please enter manually.");
      }
    } catch (err) {
      setError(err.message || "AI service temporarily unavailable. You can enter description manually.");
    } finally {
      setGeneratingAi(false);
    }
  }

  // Handle Create or Update
  async function handleSubmit(e) {
    e.preventDefault();

    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    const taskPayload = {
      title: title.trim(),
      description: description.trim(),
      priority,
    };

    try {
      if (editingId) {
        await updateTask(editingId, taskPayload);
        setNotice("Task successfully updated!");
      } else {
        await createTask(taskPayload);
        setNotice("New task created and saved to MongoDB!");
      }

      await loadTasks();
      resetForm();
    } catch (err) {
      setError(err.message || "Operation failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // Handle Status Toggle
  async function handleToggleCompleted(task) {
    try {
      await updateTask(task._id, {
        title: task.title,
        description: task.description,
        priority: task.priority,
        completed: !task.completed,
      });
      await loadTasks();
    } catch (err) {
      setError(err.message || "Failed to update completion status.");
    }
  }

  // Handle Edit Selection
  function startEditing(task) {
    setEditingId(task._id);
    setTitle(task.title);
    setDescription(task.description || "");
    setPriority(task.priority || "medium");
    window.scrollTo({ top: 120, behavior: "smooth" });
  }

  // Handle Delete
  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      await deleteTask(id);
      setNotice("Task successfully deleted.");
      await loadTasks();
    } catch (err) {
      setError(err.message || "Failed to delete task.");
    }
  }

  // Filtering Logic
  const filteredTasks = tasks.filter((t) => {
    const matchesPriority = filterPriority === "all" || t.priority === filterPriority;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "completed" && t.completed) ||
      (filterStatus === "pending" && !t.completed);
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesPriority && matchesStatus && matchesSearch;
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  return (
    <section className="section">
      <div className="section-header">
        <span className="section-label">Full-Stack Task Manager</span>
        <h1 className="section-title">Laboratory Task Dashboard</h1>
        <p className="section-desc">
          Integrated CRUD with MongoDB, node-cache in-memory optimization, event notifications, and AI assistance.
        </p>
      </div>

      {notice && <div className="alert alert-success">✓ {notice}</div>}
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="tm-container">
        {/* Task Form Column */}
        <div className="tm-form-card">
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>
            {editingId ? "✏️ Edit Task" : "➕ Create New Task"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="task-title">Task Title *</label>
              <input
                id="task-title"
                type="text"
                className="form-input"
                placeholder="e.g. Implement Docker healthcheck"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={150}
                required
              />
            </div>

            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                <label className="form-label" htmlFor="task-desc" style={{ marginBottom: 0 }}>Description</label>
                <button
                  type="button"
                  className="btn-ai"
                  onClick={handleGenerateDescription}
                  disabled={generatingAi}
                >
                  {generatingAi ? (
                    <>
                      <span className="spinner"></span> Generating...
                    </>
                  ) : (
                    "✨ Generate with AI"
                  )}
                </button>
              </div>
              <textarea
                id="task-desc"
                rows="4"
                className="form-textarea"
                placeholder="Describe objectives or click 'Generate with AI' to draft automatically..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
              <div className="ai-hint-box">
                <span>💡</span>
                <span>Type a title and click <strong>Generate with AI</strong> (Practical 13) to auto-draft an actionable description.</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-priority">Priority Level</label>
              <select
                id="task-priority"
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">🟢 Low Priority</option>
                <option value="medium">🟡 Medium Priority</option>
                <option value="high">🔴 High Priority</option>
              </select>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn-primary"
                style={{ flex: 1, justifyContent: "center" }}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner"></span> Saving...
                  </>
                ) : editingId ? (
                  "Update Task"
                ) : (
                  "Create Task"
                )}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Task List & Filter Column */}
        <div>
          {/* Stats bar */}
          <div className="card" style={{ padding: "1rem 1.5rem", marginBottom: "1.5rem", display: "flex", justifyContent: "space-around" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#a5b4fc" }}>{totalTasks}</div>
              <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Total Tasks</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#34d399" }}>{completedTasks}</div>
              <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Completed</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#f59e0b" }}>{pendingTasks}</div>
              <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Pending</div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="filter-bar">
            <div className="filter-pills">
              <button
                type="button"
                className={`filter-pill ${filterStatus === "all" ? "active" : ""}`}
                onClick={() => setFilterStatus("all")}
              >
                All Status
              </button>
              <button
                type="button"
                className={`filter-pill ${filterStatus === "pending" ? "active" : ""}`}
                onClick={() => setFilterStatus("pending")}
              >
                Pending
              </button>
              <button
                type="button"
                className={`filter-pill ${filterStatus === "completed" ? "active" : ""}`}
                onClick={() => setFilterStatus("completed")}
              >
                Completed
              </button>
            </div>

            <div className="filter-pills">
              <button
                type="button"
                className={`filter-pill ${filterPriority === "all" ? "active" : ""}`}
                onClick={() => setFilterPriority("all")}
              >
                All Priorities
              </button>
              <button
                type="button"
                className={`filter-pill ${filterPriority === "high" ? "active" : ""}`}
                onClick={() => setFilterPriority("high")}
              >
                High
              </button>
              <button
                type="button"
                className={`filter-pill ${filterPriority === "medium" ? "active" : ""}`}
                onClick={() => setFilterPriority("medium")}
              >
                Medium
              </button>
              <button
                type="button"
                className={`filter-pill ${filterPriority === "low" ? "active" : ""}`}
                onClick={() => setFilterPriority("low")}
              >
                Low
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div style={{ marginBottom: "1.5rem" }}>
            <input
              type="text"
              className="search-input"
              placeholder="🔍 Search tasks by title or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Tasks Container */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "3rem" }}>
              <div className="spinner" style={{ width: "32px", height: "32px", marginBottom: "1rem" }}></div>
              <p style={{ color: "#94a3b8" }}>Loading tasks from database / cache...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
              <p style={{ color: "#94a3b8", fontSize: "1.1rem" }}>No tasks found matching your criteria.</p>
              <p style={{ color: "#64748b", fontSize: "0.9rem", marginTop: "0.5rem" }}>
                Create a new task using the form on the left or clear search filters.
              </p>
            </div>
          ) : (
            <div>
              {filteredTasks.map((task) => (
                <div key={task._id} className={`task-item ${task.completed ? "completed" : ""}`}>
                  <div className="task-main">
                    <input
                      type="checkbox"
                      className="task-checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleCompleted(task)}
                      title="Toggle completed"
                    />
                    <div>
                      <h3 className="task-title">{task.title}</h3>
                      {task.description && <p className="task-desc">{task.description}</p>}
                      <div className="task-meta">
                        <span className={`priority-badge priority-${task.priority}`}>
                          {task.priority}
                        </span>
                        <span style={{ color: "#64748b" }}>
                          {new Date(task.createdAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="task-actions">
                    <button
                      type="button"
                      className="action-btn"
                      onClick={() => startEditing(task)}
                      title="Edit task"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      type="button"
                      className="action-btn delete"
                      onClick={() => handleDelete(task._id)}
                      title="Delete task"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default TaskManager;
