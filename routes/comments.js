const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { createNotification } = require('../utils/notificationHelper');

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

        const comment = newCommentRows[0];

        // Trigger Notifications
        try {
            const [itemRows] = await db.execute('SELECT title, uploaded_by FROM items WHERE id = ?', [item_id]);
            const item = itemRows[0];

            if (parent_comment_id) {
                // It's a reply - notify the parent comment owner
                const [parentRows] = await db.execute('SELECT user_id FROM comments WHERE id = ?', [parent_comment_id]);
                const parentCommentOwner = parentRows[0].user_id;

                if (parentCommentOwner !== userId) {
                    await createNotification(
                        parentCommentOwner,
                        'reply',
                        `${req.user.name} replied to your comment on "${item.title}".`,
                        item_id
                    );
                }
            } else {
                // It's a new comment - notify the item owner
                if (item.uploaded_by !== userId) {
                    await createNotification(
                        item.uploaded_by,
                        'comment',
                        `${req.user.name} commented on your item "${item.title}".`,
                        item_id
                    );
                }
            }
        } catch (notifErr) {
            console.error('Failed to trigger comment notification:', notifErr);
        }

        res.status(201).json(newCommentRows[0]);
    } catch (err) {
        console.error('Error posting comment:', err);
        res.status(500).json({ error: 'Failed to post comment' });
    }
});

module.exports = router;
