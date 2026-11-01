import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Header from "./components/Header";
import About from "./components/About";
import Skills from "./components/Skills";
import Footer from "./components/Footer";

// Practical 8: Performance Optimization with Lazy Loading & Code Splitting
const Projects = lazy(() => import("./pages/Projects"));
const Contact = lazy(() => import("./pages/Contact"));
const TaskManager = lazy(() => import("./pages/TaskManager"));
const Login = lazy(() => import("./pages/Login"));

// Student Profile Configuration — Niv Dobariya (24IT015)
const STUDENT_CONFIG = {
  name: "Niv Dobariya",
  studentId: "24IT015",
  course: "Advanced Web Development Frameworks (ITUE301)",
  institution: "CHARUSAT — Faculty of Technology and Engineering",
  semester: "B.Tech in Information Technology"
};

function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <span className="section-label">AWDF Laboratory Portfolio &middot; Practicals 1–13</span>
          <h1 className="hero-title">
            Hi, I'm <span>{STUDENT_CONFIG.name}</span>
          </h1>
          <p className="hero-subtitle">
            IT Undergraduate &amp; Full-Stack Web Development Specialist
          </p>
          <p className="hero-desc">
            A comprehensive, progressive web engineering showcase covering modular React components,
            REST API development with Express &amp; MongoDB, JWT security, in-memory caching,
            event-driven processing, Docker microservices, CI automation, and AI assistance.
          </p>
          <div className="hero-actions">
            <Link to="/tasks" className="btn-primary">
              Launch Task Manager →
            </Link>
            <Link to="/projects" className="btn-secondary">
              Browse Repositories
            </Link>
          </div>
        </div>
      </section>

      <About
        name={STUDENT_CONFIG.name}
        studentId={STUDENT_CONFIG.studentId}
        course={STUDENT_CONFIG.course}
        institution={STUDENT_CONFIG.institution}
        semester={STUDENT_CONFIG.semester}
      />

      <Skills />
    </>
  );
}

function PageLoader() {
  return (
    <div style={{ textAlign: "center", padding: "5rem", color: "#94a3b8" }}>
      <div className="spinner" style={{ width: "36px", height: "36px", marginBottom: "1rem" }}></div>
      <p>Loading view asynchronously (Practical 8: Lazy Splitting)...</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Header studentName={STUDENT_CONFIG.name} studentId={STUDENT_CONFIG.studentId} />

        <main className="main-content">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/tasks" element={<TaskManager />} />
              <Route path="/login" element={<Login />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </Suspense>
        </main>

        <Footer studentName={STUDENT_CONFIG.name} studentId={STUDENT_CONFIG.studentId} />
      </div>
    </BrowserRouter>
  );
}

export default App;
