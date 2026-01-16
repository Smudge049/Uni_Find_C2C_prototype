const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Post a comment or reply
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { item_id, comment_text, parent_comment_id } = req.body;
        const userId = req.user.id;

        if (!comment_text || comment_text.trim() === '') {
            return res.status(400).json({ error: 'Comment text is required' });
        }

        const [result] = await db.execute(
            'INSERT INTO comments (item_id, user_id, comment_text, parent_comment_id) VALUES (?, ?, ?, ?)',
            [item_id, userId, comment_text, parent_comment_id || null]
        );

        const [newCommentRows] = await db.execute(
            `SELECT comments.*, users.name as user_name, users.picture as user_picture 
       FROM comments 
       JOIN users ON comments.user_id = users.id 
       WHERE comments.id = ?`,
            [result.insertId]
        );

        res.status(201).json(newCommentRows[0]);
    } catch (err) {
        console.error('Error posting comment:', err);
        res.status(500).json({ error: 'Failed to post comment' });
    }
});

module.exports = router;
