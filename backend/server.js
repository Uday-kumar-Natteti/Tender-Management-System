const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// CORS Configuration - Updated for production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://localhost:3000',
      'https://localhost:3001',
      'https://tender-management-system-six.vercel.app',
      'https://tender-management-system-udays-projects-b69dec4c.vercel.app',
      process.env.CLIENT_ORIGIN,
      process.env.FRONTEND_URL,
      // Add your actual frontend domain here
      // 'https://your-frontend-domain.onrender.com'
    ].filter(Boolean); // Remove undefined values
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      console.log('Allowed origins:', allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Alternative: More permissive CORS for debugging (use temporarily)
// const corsOptions = {
//   origin: true, // This allows all origins - use only for debugging
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
// };

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.send('Tender System API is running');
});

// Debug endpoint to check CORS settings
app.get('/debug/cors', (req, res) => {
  res.json({
    origin: req.get('Origin'),
    allowedOrigins: process.env.CLIENT_ORIGIN || 'Not set',
    frontendUrl: process.env.FRONTEND_URL || 'Not set',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/companies', require('./routes/company'));
app.use('/api/tenders', require('./routes/tender'));
app.use('/api/applications', require('./routes/application'));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  if (err.message === 'Not allowed by CORS') {
    console.log('CORS Error - Origin:', req.get('Origin'));
    console.log('CORS Error - Referer:', req.get('Referer'));
  }
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Client Origin: ${process.env.CLIENT_ORIGIN || 'http://localhost:3000'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'Not set'}`);
});
