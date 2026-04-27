const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

// Load environment variables FIRST before other imports
dotenv.config();

const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');
const passport = require('./config/passport');
const { globalLimiter, redirectLimiter } = require('./middleware/rateLimit');

// Connect to database & Redis
connectDB();
connectRedis();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// Apply global rate limiter
app.use(globalLimiter);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/urls', require('./routes/urlRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/insights', require('./routes/insightsRoutes'));

// Redirect route (must be last)
const { redirectToURL } = require('./controllers/urlController');
app.get('/:shortCode', redirectLimiter, redirectToURL);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
