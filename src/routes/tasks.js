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
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: "Invalid ID format"
    });
  }

  const task = req.app.locals.tasks.find(t => t.id === id);
  if (!task) {
    return res.status(404).json({
      success: false,
      error: "Task not found"
    });
  }

  res.json({
    success: true,
    data: task
  });
});

module.exports = router;