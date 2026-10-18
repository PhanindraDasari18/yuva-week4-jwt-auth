const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const users = require('../services/userStore');
const authenticate = require('../middleware/authenticate');
const authorizeRole = require('../middleware/authorizeRole');

const router = express.Router();
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const publicUser = user => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt
});

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    if (typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: { message: 'Name must contain at least 2 characters.' } });
    }
    if (typeof email !== 'string' || !EMAIL_PATTERN.test(email.trim())) {
      return res.status(400).json({ error: { message: 'A valid email address is required.' } });
    }
    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: { message: 'Password must be at least 8 characters.' } });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (users.findByEmail(normalizedEmail)) {
      return res.status(409).json({ error: { message: 'An account with this email already exists.' } });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    // Public registration always creates a normal user; clients cannot assign themselves admin.
    const user = users.create({ name: name.trim(), email: normalizedEmail, passwordHash, role: 'user' });
    return res.status(201).json({ message: 'Registration successful.', user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: { message: 'Email and password are required.' } });
    }

    const user = users.findByEmail(email.trim().toLowerCase());
    // Same response for unknown email and incorrect password to reduce account enumeration.
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: { message: 'Invalid email or password.' } });
    }

    const token = jwt.sign(
      { role: user.role },
      config.jwtSecret,
      { subject: String(user.id), expiresIn: config.jwtExpiresIn }
    );
    return res.json({
      message: 'Login successful.',
      token,
      tokenType: 'Bearer',
      expiresIn: config.jwtExpiresIn,
      user: publicUser(user)
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

router.get('/admin', authenticate, authorizeRole('admin'), (req, res) => {
  res.json({ message: 'Admin access granted.', user: req.user });
});

module.exports = router;
