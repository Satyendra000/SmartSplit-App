const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// CORS Configuration
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://smartsplit-app.vercel.app",
    "https://smartsplit-app.netlify.app",
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes with debug logging
if (process.env.NODE_ENV === 'development') {
  console.log('📍 Registering routes...');
}

try {
  app.use('/api/auth', require('./routes/auth'));
  if (process.env.NODE_ENV === 'development') console.log('✅ Auth route registered');
} catch (err) {
  console.error('❌ Auth route error:', err.message);
}

try {
  app.use('/api/expenses', require('./routes/expenses'));
  if (process.env.NODE_ENV === 'development') console.log('✅ Expenses route registered');
} catch (err) {
  console.error('❌ Expenses route error:', err.message);
}

try {
  app.use('/api/groups', require('./routes/groups'));
  if (process.env.NODE_ENV === 'development') console.log('✅ Groups route registered');
} catch (err) {
  console.error('❌ Groups route error:', err.message);
}

try {
  app.use('/api/users', require('./routes/users'));
  if (process.env.NODE_ENV === 'development') console.log('✅ Users route registered');
} catch (err) {
  console.error('❌ Users route error:', err.message);
}

try {
  app.use('/api/feedback', require('./routes/feedback'));
  if (process.env.NODE_ENV === 'development') console.log('✅ Feedback route registered');
} catch (err) {
  console.error('❌ Feedback route error:', err.message);
}

try {
  app.use('/api/sessions', require('./routes/session'));
  if (process.env.NODE_ENV === 'development') console.log('✅ Sessions route registered');
} catch (err) {
  console.error('❌ Sessions route error:', err.message);
}

// Root route
app.get('/', (req, res) => {
  res.json({
    message: "SmartSplit API is running!",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      expenses: "/api/expenses",
      groups: "/api/groups",
      feedback: "/api/feedback",
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  }
});
