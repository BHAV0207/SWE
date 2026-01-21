const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart-productivity-app')
    .then(() => {
        console.log('MongoDB connected successfully to:', mongoose.connection.host);
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

// Routes
app.get('/', (req, res) => {
    console.log(`Base route hit: ${req.method} ${req.url}`);
    res.send('Smart Productivity App API is running');
});

// Import Routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const noteRoutes = require('./routes/notes');

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notes', noteRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
