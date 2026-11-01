const taskEvents = require("./events");

// Practical 10: Event Listeners for Asynchronous Processing
taskEvents.on("task-created", (task) => {
  const title = task.title || "Untitled Task";
  const priority = task.priority || "medium";

  console.log(
    `[EVENT: task-created] Registered at ${new Date().toISOString()} | Title: "${title}" | Priority: ${priority}`
  );

  // Non-blocking asynchronous background notification simulation
  setTimeout(() => {
    console.log(
      `[EVENT: background-notification-sent] Notification successfully dispatched for "${title}" at ${new Date().toISOString()}`
    );
  }, 1500);
});

taskEvents.on("task-updated", (task) => {
  console.log(
    `[EVENT: task-updated] Task "${task.title}" (ID: ${task._id}) updated at ${new Date().toISOString()}`
  );
});

taskEvents.on("task-deleted", (task) => {
  console.log(
    `[EVENT: task-deleted] Task "${task.title}" (ID: ${task._id}) removed at ${new Date().toISOString()}`
  );
});

taskEvents.on("error", (err) => {
  console.error(`[EVENT ERROR] Event processing failed: ${err?.message || err}`);
});

module.exports = taskEvents;
