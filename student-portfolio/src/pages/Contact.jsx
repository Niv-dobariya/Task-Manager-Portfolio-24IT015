import { useState } from "react";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSubmitted(false);
    setError("");
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    // Practical 2: Form state submission simulation
    setSubmitted(true);
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: ""
    });
  }

  return (
    <section className="section">
      <div className="section-header">
        <span className="section-label">Practical 2: State Management & Forms</span>
        <h1 className="section-title">Get in Touch</h1>
        <p className="section-desc">
          Feel free to leave a message, inquiry, or academic feedback below.
        </p>
      </div>

      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        {submitted && (
          <div className="alert alert-success">
            ✓ Thank you! Your message has been sent successfully.
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="card">
          <div className="form-group">
            <label className="form-label" htmlFor="contact-name">Your Full Name *</label>
            <input
              id="contact-name"
              name="name"
              type="text"
              className="form-input"
              placeholder="e.g. Alex Sharma"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="contact-email">Email Address *</label>
            <input
              id="contact-email"
              name="email"
              type="email"
              className="form-input"
              placeholder="alex@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="contact-subject">Subject</label>
            <input
              id="contact-subject"
              name="subject"
              type="text"
              className="form-input"
              placeholder="Project Feedback / Academic Query"
              value={formData.subject}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="contact-message">Message *</label>
            <textarea
              id="contact-message"
              name="message"
              rows="5"
              className="form-textarea"
              placeholder="Write your message here..."
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
            Submit Message
          </button>
        </form>
      </div>
    </section>
  );
}

export default Contact;
