const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Import payment routes
const paymentRoutes = require('./routes/payment');

const app = express();

// Middleware — runs on every request
app.use(cors()); // Allow Flutter to connect
app.use(bodyParser.json()); // Read JSON from Flutter

// Routes
app.use('/api/payment', paymentRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('Cartify Backend Running ✅');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});