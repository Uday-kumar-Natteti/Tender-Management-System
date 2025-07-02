const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Allowed origins for CORS
const allowedOrigins = [
  'http://localhost:3000',
  'https://tender-management-system-six.vercel.app',
  'https://tender-management-system-udays-projects-b69dec4c.vercel.app/'
];

app.use(cors({
  origin: function (origin, callback) {
    console.log('🛰️ Incoming Origin:', origin); // log the real origin

    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.error('❌ Not allowed by CORS:', origin);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.send('Tender System API is running');
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/companies', require('./routes/company'));
app.use('/api/tenders', require('./routes/tender'));
app.use('/api/applications', require('./routes/application'));

// Optional: Global error handler
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ error: 'Something went wrong!' });
// });

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
