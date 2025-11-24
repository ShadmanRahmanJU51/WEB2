// src/routes/tasks.js
const express = require('express');
const router = express.Router();
const db = require('../../config/db'); // Correct path

// GET /tasks - Pagination Support (Task 1) - NO deleted_at required
// GET /tasks - Pagination + Search by Title (Task 1 + Task 2)
router.get('/', async (req, res) => {
    try {
        let { page = 1, limit = 10, q } = req.query;

        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        if (page < 1) page = 1;
        if (limit < 1) limit = 10;
        if (limit > 50) limit = 50;

        const offset = (page - 1) * limit;

        // Build dynamic query parts
        let whereClause = '';
        let countWhere = '';
        let queryParams = [];
        let countParams = [];

        if (q && q.trim() !== '') {
            const searchTerm = `%${q.trim()}%`;
            whereClause = 'WHERE title LIKE ?';
            countWhere = 'WHERE title LIKE ?';
            queryParams.push(searchTerm);
            countParams.push(searchTerm);
        }

        // Count total matching tasks
        const countQuery = `SELECT COUNT(*) as total FROM tasks ${countWhere}`;
        const [countResult] = await db.query(countQuery, countParams);
        const totalTasks = countResult[0].total;
        const totalPages = Math.ceil(totalTasks / limit);

        // Fetch paginated + searched tasks
        const dataQuery = `
            SELECT * FROM tasks 
            ${whereClause}
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        `;
        queryParams.push(limit, offset);

        const [rows] = await db.query(dataQuery, queryParams);

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
        console.error('MySQL Error:', err);
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

// DELETE task (hard delete - as in Lab 03)
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