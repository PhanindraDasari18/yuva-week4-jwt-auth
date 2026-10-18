// In-memory demo storage. Replace with a database for production use.
const usersByEmail = new Map();
let nextId = 1;

function findByEmail(email) {
  return usersByEmail.get(String(email).toLowerCase()) || null;
}

function findById(id) {
  for (const user of usersByEmail.values()) {
    if (user.id === Number(id)) return user;
  }
  return null;
}

function create({ name, email, passwordHash, role = 'user' }) {
  const normalizedEmail = String(email).toLowerCase();
  const user = {
    id: nextId++,
    name: String(name).trim(),
    email: normalizedEmail,
    passwordHash,
    role,
    createdAt: new Date().toISOString()
  };
  usersByEmail.set(normalizedEmail, user);
  return user;
}

function all() {
  return Array.from(usersByEmail.values());
}

function reset() {
  usersByEmail.clear();
  nextId = 1;
}

module.exports = { findByEmail, findById, create, all, reset };
