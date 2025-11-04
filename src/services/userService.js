const db = require('../models/db');
const { v4: uuidv4 } = require('uuid');

function createUser({ id, username, email, password, role }) {
  // Ignora id do input
  const user = { id: uuidv4(), username, email, password, role };
  db.users.push(user);
  return user;
}

function findByEmail(email) {
  return db.users.find(u => u.email === email);
}

function ensureDefaultAdmin() {
  const exists = db.users.find(u => u.username === 'weberth.machado');
  if (!exists) {
    const admin = createUser({ username: 'weberth.machado', email: 'admin@local', password: 'admin123', role: 'administrador' });
    console.log('Default admin created:', admin.email);
  }
}

module.exports = { createUser, findByEmail, ensureDefaultAdmin };
