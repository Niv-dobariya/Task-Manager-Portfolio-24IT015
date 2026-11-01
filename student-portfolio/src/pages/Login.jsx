import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../api";

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // 'login' or 'register'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (mode === "register") {
        await registerUser(email, password);
        setSuccessMsg("Registration successful! You can now log in.");
        setMode("login");
        setPassword("");
      } else {
        const data = await loginUser(email, password);
        sessionStorage.setItem("token", data.token);
        if (data.user?.email) {
          sessionStorage.setItem("user_email", data.user.email);
        }
        navigate("/tasks");
      }
    } catch (err) {
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  function handleTabSwitch(targetMode) {
    setMode(targetMode);
    setError("");
    setSuccessMsg("");
  }

  return (
    <section className="section">
      <div className="auth-box">
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => handleTabSwitch("login")}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === "register" ? "active" : ""}`}
            onClick={() => handleTabSwitch("register")}
          >
            Create Account
          </button>
        </div>

        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
            {mode === "login" ? "Welcome Back" : "Student Registration"}
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
            {mode === "login"
              ? "Authenticate with JWT to access protected task features."
              : "Register to manage tasks with persistent database storage."}
          </p>
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}
        {successMsg && <div className="alert alert-success">✓ {successMsg}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="auth-email">Academic Email</label>
            <input
              id="auth-email"
              type="email"
              className="form-input"
              placeholder="e.g. student@charusat.edu.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="auth-password">Password (min. 8 characters)</label>
            <input
              id="auth-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: "100%", justifyContent: "center", marginTop: "1rem" }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span> Processing...
              </>
            ) : mode === "login" ? (
              "Sign In to Dashboard"
            ) : (
              "Create Account"
            )}
          </button>
        </form>
      </div>
    </section>
  );
}

export default Login;
