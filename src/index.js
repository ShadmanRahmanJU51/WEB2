const express = require('express');
const app = express();
const port = 3000;

const tasks = [
  { id: 1, title: "Learn Node.js", completed: false, priority: "high", createdAt: new Date("2023-01-01") },
  { id: 2, title: "Build REST API", completed: false, priority: "medium", createdAt: new Date("2023-02-15") },
  { id: 3, title: "Test with Postman", completed: true, priority: "low", createdAt: new Date("2023-03-10") },
  { id: 4, title: "Refactor routes", completed: false, priority: "high", createdAt: new Date("2023-04-20") },
  { id: 5, title: "Document API", completed: false, priority: "medium", createdAt: new Date("2023-05-05") }
];

app.get('/', (req, res) => res.send('Task Management API is running!'));
app.get('/tasks', (req, res) => res.json(tasks));

app.get('/health', (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime()
  });
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));