const express = require('express');
const app = express();
const port = 3000;

// Import router
const tasksRouter = require('./routes/tasks');

app.get('/', (req, res) => res.send('Task Management API is running!'));

app.get('/health', (req, res) => {
  res.json({ status: "healthy", uptime: process.uptime() });
});

// Use router
app.use('/tasks', tasksRouter);
app.use('/task', tasksRouter); // for backward compatibility with Assignment 3

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));