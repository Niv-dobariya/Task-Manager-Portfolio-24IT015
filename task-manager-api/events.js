const EventEmitter = require("events");

// Asynchronous Event Bus for Practical 10 (Event-Driven Architecture)
class TaskEventEmitter extends EventEmitter {}

module.exports = new TaskEventEmitter();
