// src/index.js
const express = require('express');
const app = express();
const port = 3000;

// Import the tasks router (now connected to MySQL)
const tasksRouter = require('./routes/tasks');

// 1. MIDDLEWARE: Parse JSON bodies (MUST be first)
app.use(express.json());

// 2. ROUTES
app.get('/', (req, res) => {
  res.send('Task Management API with MySQL is running!');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Mount all task-related routes under /tasks
// This replaces ALL old in-memory logic
app.use('/tasks', tasksRouter);

// Optional: Keep this if you still want /task/1 to work (some students had it)
// Remove it later if not needed
app.use('/task', tasksRouter);

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`MySQL Task API ready!`);
});