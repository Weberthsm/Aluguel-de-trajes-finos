const db = require('../models/db');
const { v4: uuidv4 } = require('uuid');

function create(data) {
  const p = { id: uuidv4(), ...data };
  db.products.push(p);
  return p;
}

function list() { return db.products; }
function get(id) { return db.products.find(p => p.id === id); }
function update(id, data) {
  const idx = db.products.findIndex(p => p.id === id);
  if (idx === -1) return null;
  db.products[idx] = { ...db.products[idx], ...data };
  return db.products[idx];
}

module.exports = { create, list, get, update };
