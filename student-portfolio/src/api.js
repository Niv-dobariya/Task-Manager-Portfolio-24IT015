/**
 * Frontend API Utility Service
 * Centralizes requests to Node/Express Backend API
 * Practical 3 (API Integration) & Practical 6 (Full-Stack Connection)
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

async function apiRequest(path, options = {}, settings = {}) {
  const { auth = true, redirectOnUnauthorized = true } = settings;
  const token = sessionStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (auth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (response.status === 401 && redirectOnUnauthorized) {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user_email");
    if (window.location.pathname !== "/login") {
      window.location.assign("/login");
    }
  }

  if (!response.ok) {
    throw new Error(data.error || data.message || `API request failed (${response.status})`);
  }

  return data;
}

// User Registration (Practical 7)
export function registerUser(email, password) {
  return apiRequest(
    "/register",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
    { auth: false, redirectOnUnauthorized: false }
  );
}

// User Login (Practical 7)
export function loginUser(email, password) {
  return apiRequest(
    "/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
    { auth: false, redirectOnUnauthorized: false }
  );
}

// Fetch Current Authenticated User Profile
export function getCurrentUser() {
  return apiRequest("/me");
}

// Fetch All Tasks (Practical 9: In-Memory Caching)
export function getTasks() {
  return apiRequest("/tasks");
}

// Create New Task (Practical 6 & 10)
export function createTask(task) {
  return apiRequest("/tasks", {
    method: "POST",
    body: JSON.stringify(task),
  });
}

// Update Task by ID
export function updateTask(id, task) {
  return apiRequest(`/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(task),
  });
}

// Delete Task by ID
export function deleteTask(id) {
  return apiRequest(`/tasks/${id}`, {
    method: "DELETE",
  });
}

// Generate Task Description via AI (Practical 13)
export function generateTaskDescription(title) {
  return apiRequest("/api/ai/generate-description", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}
