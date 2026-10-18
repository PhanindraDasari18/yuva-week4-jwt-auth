const express = require('express');
const authRoutes = require('./routes/auth');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(express.json({ limit: '10kb' }));

app.get('/', (req, res) => {
  res.json({
    message: 'Week 4 JWT Authentication API',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      profile: 'GET /api/auth/me',
      admin: 'GET /api/auth/admin'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use((req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});
app.use(errorHandler);

module.exports = app;
