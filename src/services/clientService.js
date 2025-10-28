const db = require('../models/db');
const { v4: uuidv4 } = require('uuid');

function create(data) {
  // minimal validation: name trimming
  const client = { id: uuidv4(), active: true, ...data };
  if (client.name) client.name = client.name.trim();
  db.clients.push(client);
  return client;
}

function get(id) { return db.clients.find(c => c.id === id); }

function update(id, data) {
  const idx = db.clients.findIndex(c => c.id === id);
  if (idx === -1) return null;
  db.clients[idx] = { ...db.clients[idx], ...data };
  return db.clients[idx];
}

module.exports = { create, get, update };
