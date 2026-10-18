const jwt = require('jsonwebtoken');
const config = require('../config');
const users = require('../services/userStore');

module.exports = function authenticate(req, res, next) {
  const header = req.get('authorization') || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: { message: 'Authentication required. Use Bearer token.' } });
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const user = users.findById(payload.sub);
    if (!user) return res.status(401).json({ error: { message: 'Token user no longer exists.' } });

    req.user = { id: user.id, name: user.name, email: user.email, role: user.role };
    next();
  } catch (error) {
    const message = error.name === 'TokenExpiredError' ? 'Token has expired.' : 'Invalid token.';
    return res.status(401).json({ error: { message } });
  }
};
