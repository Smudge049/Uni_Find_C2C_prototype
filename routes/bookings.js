const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Cancel Reservation/Booking
router.post('/:id/cancel', authenticateToken, async (req, res) => {
    try {
        const bookingId = req.params.id;
        const userId = req.user.id;

        const [bookings] = await db.execute(
            'SELECT b.*, i.uploaded_by as seller_id FROM bookings b JOIN items i ON b.item_id = i.id WHERE b.id = ?',
            [bookingId]
        );

        if (bookings.length === 0) return res.status(404).json({ error: 'Booking not found' });

        const booking = bookings[0];

        if (booking.user_id !== userId && booking.seller_id !== userId) {
            return res.status(403).json({ error: 'You are not authorized to cancel this booking.' });
        }

        await db.execute('UPDATE bookings SET status = "cancelled" WHERE id = ?', [bookingId]);
        await db.execute('UPDATE items SET status = "available" WHERE id = ?', [booking.item_id]);

        res.json({ message: 'Booking cancelled and item is now available.' });
    } catch (err) {
        console.error('Cancel Booking error:', err);
        res.status(500).json({ error: 'Failed to cancel booking.' });
    }
});

// Confirm/Mark as Sold (Seller only)
router.post('/:id/confirm', authenticateToken, async (req, res) => {
    try {
        const bookingId = req.params.id;
        const userId = req.user.id; // Seller's ID

        // Verify that the user is the seller of the item in this booking
        const [bookings] = await db.execute(
            `SELECT b.*, i.uploaded_by as seller_id 
             FROM bookings b 
             JOIN items i ON b.item_id = i.id 
             WHERE b.id = ?`,
            [bookingId]
        );

        if (bookings.length === 0) return res.status(404).json({ error: 'Booking not found' });

        const booking = bookings[0];

        if (booking.seller_id !== userId) {
            return res.status(403).json({ error: 'Only the seller can confirm this sale.' });
        }

        if (booking.status !== 'reserved') {
            return res.status(400).json({ error: 'Only reserved bookings can be confirmed.' });
        }

        // 1. Update booking status to confirmed
        await db.execute('UPDATE bookings SET status = "confirmed" WHERE id = ?', [bookingId]);

        // 2. Update item status to sold
        await db.execute('UPDATE items SET status = "sold" WHERE id = ?', [booking.item_id]);

        res.json({ message: 'Item marked as sold and booking confirmed.' });
    } catch (err) {
        console.error('Confirm Booking error:', err);
        res.status(500).json({ error: 'Failed to confirm sale.' });
    }
});

module.exports = router;
