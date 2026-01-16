require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// Route Imports
const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');
const profileRoutes = require('./routes/profile');
const commentRoutes = require('./routes/comments');
const bookingRoutes = require('./routes/bookings');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve Static Files
app.use(express.static('public'));
app.use('/uploads', express.static('public/uploads'));

// Health Check
app.get('/', (req, res) => {
  res.send('Uni-Find API is running!');
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api', profileRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/bookings', bookingRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
