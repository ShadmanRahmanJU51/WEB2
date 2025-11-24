// src/routes/tasks.js
const express = require('express');
const router = express.Router();
const db = require('../../config/db'); // ← CORRECT PATH

// GET all tasks
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM tasks ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// GET single task
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    if (!/^\d+$/.test(id)) return res.status(400).json({ error: 'Invalid ID format' });

    try {
        const [rows] = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Task not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// CREATE task
// CREATE task - FIXED VERSION
router.post('/', async (req, res) => {
    const { title, description } = req.body;

    if (!title || title.trim() === '') {
        return res.status(400).json({ error: 'Title is required' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO tasks (title, description) VALUES (?, ?)',
            [title.trim(), description || null]
        );

        const [newTask] = await db.query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
        res.status(201).json(newTask[0]);
    } catch (err) {
        console.error('MySQL Error:', err);  // ← This will now show the real error in terminal
        res.status(500).json({ error: 'Failed to create task' });
    }
});

// UPDATE task
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, status } = req.body;

    if (!/^\d+$/.test(id)) return res.status(400).json({ error: 'Invalid ID format' });
    if (!title && !description && status === undefined) {
        return res.status(400).json({ error: 'No fields to update' });
    }
    if (status && !['pending', 'in-progress', 'completed'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
    }

    try {
        const fields = [];
        const values = [];

        if (title !== undefined) {
            if (title.trim() === '') return res.status(400).json({ error: 'Title cannot be empty' });
            fields.push('title = ?');
            values.push(title.trim());
        }
        if (description !== undefined) { fields.push('description = ?'); values.push(description); }
        if (status !== undefined) { fields.push('status = ?'); values.push(status); }

        values.push(id);
        const sql = `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`;
        const [result] = await db.query(sql, values);

        if (result.affectedRows === 0) return res.status(404).json({ error: 'Task not found' });

        const [updated] = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);
        res.json(updated[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// DELETE task
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    if (!/^\d+$/.test(id)) return res.status(400).json({ error: 'Invalid ID format' });

    try {
        const [result] = await db.query('DELETE FROM tasks WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Task not found' });
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

module.exports = router;