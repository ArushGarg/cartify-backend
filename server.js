const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Import routes
const paymentRoutes = require('./routes/payment');
const couponRoutes = require('./routes/coupon');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/payment', paymentRoutes);
app.use('/api/coupon', couponRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('Cartify Backend Running ✅');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});