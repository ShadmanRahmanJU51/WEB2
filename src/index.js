const express = require('express');
const app = express();
const port = 3000;

const tasksRouter = require('./routes/tasks');

// 1.THE VERY FIRST MIDDLEWARE
app.use(express.json());                   

// 2. attaching the tasks to app.locals
const initialTasks = [
  {
    id: 1,
    title: "Complete LAB 02 Assignment",
    completed: true,
    priority: "high",
    createdAt: new Date("2025-11-17T14:00:00+06:00")
  },
  {
    id: 2,
    title: "Push code to GitHub successfully",
    completed: true,
    priority: "high",
    createdAt: new Date("2025-11-17T19:55:00+06:00")
  },
  {
    id: 3,
    title: "Test all error cases in Postman",
    completed: true,
    priority: "medium",
    createdAt: new Date("2025-11-17T18:30:00+06:00")
  },
  {
    id: 4,
    title: "Write LAB 02 report",
    completed: false,
    priority: "high",
    createdAt: new Date("2025-11-17T21:00:00+06:00")
  },
  {
    id: 5,
    title: "Start LAB 03 MySQL setup",
    completed: false,
    priority: "low",
    createdAt: new Date()
  }
];

app.locals.tasks = initialTasks;
app.locals.tasks = initialTasks; // Attach to app for route access


app.get('/', (req, res) => res.send('Task Management API is running!'));

app.get('/health', (req, res) => {
  res.json({ status: "healthy", uptime: process.uptime() });
});

// 3. Now mount routers (AFTER express.json()!)
app.use('/tasks', tasksRouter);
app.use('/task', tasksRouter);  // keeping your backward compatibility

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));