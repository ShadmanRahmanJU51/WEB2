// src/routes/tasks.js
const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// GET /tasks → Pagination + Search + Hide soft-deleted
router.get('/', async (req, res) => {
    try {
        let { page = 1, limit = 10, q } = req.query;

        page = Math.max(1, parseInt(page) || 1);
        limit = Math.min(50, Math.max(1, parseInt(limit) || 10));
        const offset = (page - 1) * limit;

        let where = 'WHERE deleted_at IS NULL';
        let countWhere = 'WHERE deleted_at IS NULL';
        let params = [];
        let countParams = [];

        if (q && q.trim()) {
            const term = `%${q.trim()}%`;
            where += ' AND title LIKE ?';
            countWhere += ' AND title LIKE ?';
            params.push(term);
            countParams.push(term);
        }

        const [countRes] = await db.query(`SELECT COUNT(*) as total FROM tasks ${countWhere}`, countParams);
        const totalTasks = countRes[0].total;
        const totalPages = Math.ceil(totalTasks / limit);

        params.push(limit, offset);
        const [rows] = await db.query(`
            SELECT * FROM tasks 
            ${where}
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        `, params);

        res.json({
            totalTasks,
            totalPages,
            currentPage: page,
            limit,
            search: q || null,
            data: rows
        });

    } catch (err) {
        console.error('GET /tasks error:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// GET single active task
// GET single active task
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    if (!/^\d+$/.test(id)) return res.status(400).json({ error: 'Invalid ID format' });

    try {
        const [rows] = await db.query('SELECT * FROM tasks WHERE id = ? AND deleted_at IS NULL', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Task not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// CREATE task
router.post('/', async (req, res) => {
    const { title, description } = req.body;
    if (!title || title.trim() === '') return res.status(400).json({ error: 'Title is required' });

    try {
        const [result] = await db.query(
            'INSERT INTO tasks (title, description) VALUES (?, ?)',
            [title.trim(), description || null]
        );
        const [newTask] = await db.query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
        res.status(201).json(newTask[0]);
    } catch (err) {
        console.error('MySQL Error:', err);
        res.status(500).json({ error: 'Failed to create task' });
    }
});

// UPDATE task
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, status } = req.body;

    if (!/^\d+$/.test(id)) return res.status(400).json({ error: 'Invalid ID format' });
    if (!title && !description && status === undefined) return res.status(400).json({ error: 'No fields to update' });
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
        const sql = `UPDATE tasks SET ${fields.join(', ')} WHERE id = ? AND deleted_at IS NULL`;
        const [result] = await db.query(sql, values);

        if (result.affectedRows === 0) return res.status(404).json({ error: 'Task not found or deleted' });

        const [updated] = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);
        res.json(updated[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// Soft DELETE
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    if (!/^\d+$/.test(id)) return res.status(400).json({ error: 'Invalid ID format' });

    try {
        const [result] = await db.query(
            'UPDATE tasks SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL',
            [id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Task not found or already deleted' });
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to soft-delete task' });
    }
});

// GET /tasks/deleted → ONLY soft-deleted tasks (NO ID CHECK!)
router.get('/deleted', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM tasks WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC'
        );
        res.json({
            totalDeleted: rows.length,
            data: rows
        });
    } catch (err) {
        console.error('GET /tasks/deleted error:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// RESTORE task
router.put('/:id/restore', async (req, res) => {
    const { id } = req.params;
    if (!/^\d+$/.test(id)) return res.status(400).json({ error: 'Invalid ID format' });

    try {
        const [result] = await db.query(
            'UPDATE tasks SET deleted_at = NULL WHERE id = ? AND deleted_at IS NOT NULL',
            [id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Task not found or not deleted' });

        const [task] = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);
        res.json(task[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to restore task' });
    }
});

module.exports = router;