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
    "https://smartsplit-nine.vercel.app"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes with debug logging
console.log('📍 Registering routes...');

try {
  app.use('/api/auth', require('./routes/auth'));
  console.log('✅ Auth route registered');
} catch (err) {
  console.error('❌ Auth route error:', err.message);
}

try {
  app.use('/api/expenses', require('./routes/expenses'));
  console.log('✅ Expenses route registered');
} catch (err) {
  console.error('❌ Expenses route error:', err.message);
}

try {
  app.use('/api/groups', require('./routes/groups'));
  console.log('✅ Groups route registered');
} catch (err) {
  console.error('❌ Groups route error:', err.message);
}

try {
  app.use('/api/users', require('./routes/users'));
  console.log('✅ Users route registered');
} catch (err) {
  console.error('❌ Users route error:', err.message);
}

try {
  app.use('/api/feedback', require('./routes/feedback'));
  console.log('✅ Feedback route registered');
} catch (err) {
  console.error('❌ Feedback route error:', err.message);
}

try {
  app.use('/api/sessions', require('./routes/session'));
  console.log('✅ Sessions route registered');
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
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
});
