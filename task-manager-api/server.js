/**
 * Advanced Web Development Frameworks (AWDF)
 * Task Manager API — Integrated Practicals 4 to 13
 * Features: REST API, MongoDB/Mongoose, JWT Auth, In-Memory Caching, Event-Driven Architecture, AI Assistant
 */

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Task = require("./models/Task");
const User = require("./models/User");
const cache = require("./cache");
const taskEvents = require("./listeners");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "awdf_default_development_secret_key_12345";

// Middleware: Enable CORS & JSON Parsing
app.use(cors());
app.use(express.json());

// Practical 4: Request Logging Middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// Validate JSON Content-Type for mutation methods
app.use((req, res, next) => {
  if (["POST", "PUT", "PATCH"].includes(req.method) && !req.is("application/json")) {
    return res.status(415).json({
      error: "Content-Type must be application/json"
    });
  }
  next();
});

// Root & Health Check Endpoint
app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "AWDF Task Manager API is running smoothly",
    practicalsCovered: "Practical 4 - Practical 13",
    timestamp: new Date().toISOString()
  });
});

// Practical 7: JWT Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: "Access token required"
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      error: "Invalid or expired token"
    });
  }
}

// Practical 7: User Registration Endpoint
app.post("/register", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({
        error: "Email and password are required"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        error: "Please enter a valid email address"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: "Password must contain at least 8 characters"
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        error: "Email is already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: normalizedEmail,
      password: hashedPassword
    });

    return res.status(201).json({
      message: "Registration successful",
      user: {
        id: user._id,
        email: user.email
      }
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        error: "Email is already registered"
      });
    }
    next(err);
  }
});

// Practical 7: User Login Endpoint
app.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({
        error: "Email and password are required"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email
      }
    });
  } catch (err) {
    next(err);
  }
});

// Get Current Logged-in User Profile
app.get("/me", authenticateToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({
        error: "User not found"
      });
    }
    return res.json(user);
  } catch (err) {
    next(err);
  }
});

// Task Input Validation Middleware
function validateTaskInput(req, res, next) {
  const { title, description, completed, priority } = req.body || {};

  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({
      error: "Task title is required"
    });
  }

  if (title.trim().length > 150) {
    return res.status(400).json({
      error: "Task title cannot exceed 150 characters"
    });
  }

  if (description !== undefined && typeof description !== "string") {
    return res.status(400).json({
      error: "Description must be a string"
    });
  }

  if (completed !== undefined && typeof completed !== "boolean") {
    return res.status(400).json({
      error: "Completed must be true or false"
    });
  }

  if (priority !== undefined && !["low", "medium", "high"].includes(priority)) {
    return res.status(400).json({
      error: "Priority must be low, medium, or high"
    });
  }

  req.body.title = title.trim();
  next();
}

// Practical 9: GET All Tasks with In-Memory Caching (node-cache)
app.get("/tasks", authenticateToken, async (req, res, next) => {
  try {
    const cachedTasks = cache.get("all_tasks");

    if (cachedTasks !== undefined) {
      console.log("[CACHE HIT] Serving tasks from node-cache in-memory storage");
      return res.json(cachedTasks);
    }

    console.log("[CACHE MISS] Fetching tasks directly from MongoDB");
    const tasks = await Task.find().sort({ createdAt: -1 });

    // Store in cache for 60 seconds
    cache.set("all_tasks", tasks);

    return res.json(tasks);
  } catch (err) {
    next(err);
  }
});

// GET Single Task by ID
app.get("/tasks/:id", authenticateToken, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        error: "Invalid task ID format"
      });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        error: "Task not found"
      });
    }

    return res.json(task);
  } catch (err) {
    next(err);
  }
});

// Practical 6 & 10: Create Task + Cache Invalidation + Event Emission
app.post("/tasks", authenticateToken, validateTaskInput, async (req, res, next) => {
  try {
    const task = await Task.create({
      title: req.body.title,
      description: req.body.description || "",
      completed: req.body.completed || false,
      priority: req.body.priority || "medium",
      userId: req.user.id
    });

    // Invalidate stale cache
    cache.del("all_tasks");

    // Practical 10: Asynchronously emit event
    taskEvents.emit("task-created", task);

    return res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

// Update Task + Cache Invalidation + Event Emission
app.put("/tasks/:id", authenticateToken, validateTaskInput, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        error: "Invalid task ID format"
      });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        description: req.body.description !== undefined ? req.body.description : "",
        completed: req.body.completed !== undefined ? req.body.completed : false,
        priority: req.body.priority || "medium"
      },
      {
        new: true,
        runValidators: true,
        omitUndefined: true
      }
    );

    if (!task) {
      return res.status(404).json({
        error: "Task not found"
      });
    }

    // Invalidate stale cache
    cache.del("all_tasks");

    // Emit update event
    taskEvents.emit("task-updated", task);

    return res.json(task);
  } catch (err) {
    next(err);
  }
});

// Delete Task + Cache Invalidation + Event Emission
app.delete("/tasks/:id", authenticateToken, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        error: "Invalid task ID format"
      });
    }

    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        error: "Task not found"
      });
    }

    // Invalidate stale cache
    cache.del("all_tasks");

    // Emit delete event
    taskEvents.emit("task-deleted", task);

    return res.json({
      message: "Task deleted successfully",
      task
    });
  } catch (err) {
    next(err);
  }
});

// Practical 13: Generative AI API Integration (Groq/OpenAI compatible with graceful fallback)
app.post("/api/ai/generate-description", authenticateToken, async (req, res) => {
  const title = req.body?.title;

  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({
      description: "",
      message: "Task title is required to generate a description."
    });
  }

  const cleanTitle = title.trim();

  // If no API key is provided, deliver a smart local fallback description
  if (!process.env.GROQ_API_KEY && !process.env.OPENAI_API_KEY) {
    const fallbackDescription = `Identify and execute all core requirements for "${cleanTitle}". Structure implementation steps, test key outcomes, and document progress for completion.`;
    return res.json({
      description: fallbackDescription,
      fallback: true,
      message: "Generated using standard template (Set GROQ_API_KEY in .env for live LLM suggestions)."
    });
  }

  try {
    const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
    const apiUrl = process.env.GROQ_API_KEY
      ? "https://api.groq.com/openai/v1/chat/completions"
      : "https://api.openai.com/v1/chat/completions";
    const model = process.env.GROQ_API_KEY
      ? "llama-3.3-70b-versatile"
      : "gpt-3.5-turbo";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are an expert productivity assistant. Generate a clear, concise, actionable task description in 2 sentences. Focus on actionable objectives."
          },
          {
            role: "user",
            content: `Task Title: "${cleanTitle}". Generate a practical 2-sentence description.`
          }
        ],
        temperature: 0.6,
        max_tokens: 150
      }),
      signal: AbortSignal.timeout(12000)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.choices?.[0]?.message?.content) {
      console.warn("AI API request unsuccessful; activating fallback:", data.error?.message || response.statusText);
      const fallbackDesc = `Outline key steps to complete "${cleanTitle}". Verify deliverables and ensure timely execution with clean documentation.`;
      return res.json({
        description: fallbackDesc,
        fallback: true,
        message: "AI provider busy or unavailable. Provided structured template."
      });
    }

    const description = data.choices[0].message.content.trim();
    return res.json({ description, fallback: false });
  } catch (err) {
    console.error("AI Generation error:", err.message);
    const fallbackDesc = `Plan and implement the necessary tasks for "${cleanTitle}". Review results thoroughly and confirm acceptance criteria.`;
    return res.json({
      description: fallbackDesc,
      fallback: true,
      message: "AI request timed out. Provided standard fallback description."
    });
  }
});

// 404 Route Not Found Handler
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found"
  });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error("[GLOBAL ERROR]", err);

  if (res.headersSent) {
    return next(err);
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation error",
      details: Object.values(err.errors).map((e) => e.message)
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      error: "Invalid ID or data format"
    });
  }

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      error: "Invalid JSON in request body"
    });
  }

  return res.status(500).json({
    error: "Internal server error"
  });
});

// Connect to MongoDB and start HTTP Server
async function startServer() {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/task_manager_awdf";

    await mongoose.connect(mongoUri);
    console.log(`[DATABASE] MongoDB successfully connected to ${mongoUri}`);

    app.listen(PORT, () => {
      console.log(`[SERVER] Task Manager API running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("[DATABASE ERROR] Could not connect to MongoDB:", err.message);
    process.exit(1);
  }
}

// Start server when executed directly
if (require.main === module) {
  startServer();
}

// Export for Automated Tests (Practical 12)
module.exports = app;
