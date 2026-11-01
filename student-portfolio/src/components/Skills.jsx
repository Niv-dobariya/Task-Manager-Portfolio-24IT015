const defaultSkills = [
  { name: "React 18/19", icon: "⚛️", desc: "Component architecture, hooks, state, routing, lazy loading" },
  { name: "Node.js & Express", icon: "🟢", desc: "RESTful API routes, custom middlewares, global error handling" },
  { name: "MongoDB & Mongoose", icon: "🍃", desc: "Schema validation, document lifecycle hooks, indexing, queries" },
  { name: "JWT Authentication", icon: "🔐", desc: "bcrypt password hashing, stateless tokens, protected routes" },
  { name: "In-Memory Caching", icon: "⚡", desc: "node-cache implementation, automated TTL, write invalidation" },
  { name: "Event Architecture", icon: "📡", desc: "Node.js EventEmitter, asynchronous background logging" },
  { name: "Docker & Compose", icon: "🐳", desc: "Containerized frontend, API, MongoDB services with healthchecks" },
  { name: "CI/CD & Testing", icon: "🚀", desc: "GitHub Actions automation, Jest and Supertest unit & API suites" },
  { name: "Generative AI", icon: "✨", desc: "Groq LLM endpoint integration, fallback heuristics, safe prompt design" }
];

function Skills({ skills = defaultSkills }) {
  return (
    <section id="skills" className="section">
      <div className="section-header">
        <span className="section-label">Core Competencies</span>
        <h2 className="section-title">Technical Skills & Practical Frameworks</h2>
        <p className="section-desc">
          Key technologies mastered throughout the AWDF practical syllabus and demonstrated in this project.
        </p>
      </div>

      <div className="card-grid">
        {skills.map((skill, index) => (
          <div className="card skill-card" key={index}>
            <div className="skill-icon">{skill.icon}</div>
            <div className="skill-name">{skill.name}</div>
            <div className="skill-desc">{skill.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Skills;
