function Footer({ studentName = "Student Developer", studentId = "24IT000" }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div>
          <strong>{studentName}</strong> ({studentId}) — Advanced Web Development Frameworks (AWDF)
        </div>
        <div>
          Practicals 1–13 Integrated Project &copy; {currentYear}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
