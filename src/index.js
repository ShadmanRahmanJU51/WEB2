const express = require('express');
const app = express();
const port = 3000;

// Import router
const tasksRouter = require('./routes/tasks');

app.get('/', (req, res) => res.send('Task Management API is running!'));

app.get('/health', (req, res) => {
  res.json({ status: "healthy", uptime: process.uptime() });
});

app.get('/task/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find(t => t.id === id);
  if (task) {
    res.json(task);
  } else {
    res.status(404).json({ error: "Task not found" });
  }
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));