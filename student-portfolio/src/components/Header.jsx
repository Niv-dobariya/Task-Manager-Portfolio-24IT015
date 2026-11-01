import { Link, NavLink, useNavigate } from "react-router-dom";

function Header({ studentName = "Student Developer", studentId = "24IT000" }) {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const userEmail = sessionStorage.getItem("user_email");

  function handleLogout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user_email");
    navigate("/login");
  }

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo-container">
          <div className="logo-badge">{studentId}</div>
          <span className="logo-text">{studentName}</span>
        </Link>

        <nav className="nav-links">
          <NavLink to="/" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")} end>
            Home
          </NavLink>
          <NavLink to="/projects" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Projects
          </NavLink>
          <NavLink to="/tasks" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Task Manager
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Contact
          </NavLink>
        </nav>

        <div className="auth-nav-section">
          {token ? (
            <>
              <span className="user-badge" title={userEmail || "Logged in"}>
                👤 {userEmail ? userEmail.split("@")[0] : "Student"}
              </span>
              <button type="button" onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-primary" style={{ padding: "0.45rem 1rem", fontSize: "0.85rem" }}>
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
