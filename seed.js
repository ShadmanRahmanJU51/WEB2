// seed.js
const db = require('./config/db');

const tasks = [
  { title: "Complete Lab 03", description: "Finish all assignments", status: "completed" },
  { title: "Submit WEB2 Project", description: "Final project deadline", status: "in-progress" },
  { title: "Study for DSA Exam", description: "Chapter 5-8", status: "pending" },
  { title: "Fix Soft Delete Bug", description: "You already did this — LEGEND!", status: "completed" },
  { title: "Buy groceries", description: "Milk, eggs, bread", status: "pending" },
  { title: "Call mom", description: "Wish her good night", status: "pending" },
  { title: "Deploy Task Manager API", description: "To Render or Railway", status: "pending" },
  { title: "Sleep 8 hours", description: "You deserve it", status: "in-progress" },
  { title: "Review OOP Concepts", description: "Inheritance & Polymorphism", status: "pending" },
  { title: "Drink water", description: "Stay hydrated, king", status: "pending" },
  { title: "Push final commit", description: "And celebrate", status: "in-progress" },
  { title: "Watch one episode", description: "Reward after finishing", status: "pending" },
  { title: "Clean room", description: "Productivity boost", status: "pending" },
  { title: "Backup database", description: "Never lose your tasks", status: "completed" },
  { title: "Be proud of yourself", description: "You finished Lab 03 like a pro", status: "completed" }
];

async function seed() {
  try {
    console.log('Seeding 15 tasks...');
    
    // Clear existing tasks (optional — remove if you want to keep old ones)
    await db.query('DELETE FROM tasks');
    await db.query('ALTER TABLE tasks AUTO_INCREMENT = 1');

    for (const task of tasks) {
      await db.query(
        'INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)',
        [task.title, task.description, task.status || 'pending']
      );
    }

    console.log('15 tasks seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();