const express = require('express');
const router = express.Router();

const tasks = [
  { id: 1, title: "Learn Node.js", completed: false, priority: "high", createdAt: new Date("2023-01-01") },
  { id: 2, title: "Build REST API", completed: false, priority: "medium", createdAt: new Date("2023-02-15") },
  { id: 3, title: "Test with Postman", completed: true, priority: "low", createdAt: new Date("2023-03-10") },
  { id: 4, title: "Refactor routes", completed: false, priority: "high", createdAt: new Date("2023-04-20") },
  { id: 5, title: "Document API", completed: false, priority: "medium", createdAt: new Date("2023-05-05") }
];

router.get('/', (req, res) => res.json(tasks));

router.get('/:id', (req, res) => {
  const idParam = req.params.id;

  // Check if ID is a valid positive integer
  if (!/^\d+$/.test(idParam)) {
    return res.status(400).json({ 
      error: "Invalid ID format",
      message: "ID must be a positive integer" 
    });
  }

  const id = parseInt(idParam);
  const task = tasks.find(t => t.id === id);

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  res.json(task);
});

module.exports = router;