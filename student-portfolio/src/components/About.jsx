function About({
  name = "Niv Dobariya",
  studentId = "24IT015",
  course = "Advanced Web Development Frameworks (AWDF / ITUE301)",
  institution = "CHARUSAT — Faculty of Technology & Engineering",
  semester = "4th Semester B.Tech IT"
}) {
  return (
    <section id="about" className="section">
      <div className="section-header">
        <span className="section-label">Academic Profile</span>
        <h2 className="section-title">About Me</h2>
        <p className="section-desc">
          Building scalable, modular web systems through progressive practical laboratory milestones.
        </p>
      </div>

      <div className="about-box">
        <div>
          <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#fff" }}>
            Hello! I'm <span style={{ color: "#a5b4fc" }}>{name}</span>
          </h3>
          <p style={{ color: "#94a3b8", lineHeight: 1.8, marginBottom: "1.25rem" }}>
            I am an undergraduate Information Technology student passionate about full-stack web engineering,
            clean architecture, and automated cloud workflows. This repository brings together 13 laboratory
            practicals ranging from React UI fundamentals to containerized microservices and AI integrations.
          </p>
          <p style={{ color: "#94a3b8", lineHeight: 1.8 }}>
            My goal is to develop clean, secure, and maintainable software products that solve real-world problems.
          </p>
        </div>

        <div style={{ background: "rgba(10, 13, 20, 0.6)", padding: "1.75rem", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
          <div className="info-item">
            <span className="info-label">Student ID:</span>
            <span className="info-value">{studentId}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Degree & Year:</span>
            <span className="info-value">{semester}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Course:</span>
            <span className="info-value">{course}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Institution:</span>
            <span className="info-value">{institution}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Status:</span>
            <span className="info-value" style={{ color: "#34d399" }}>● Practicals 1–13 Completed</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
