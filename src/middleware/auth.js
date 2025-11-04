const jwt = require('jsonwebtoken');
const db = require('../models/db');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

function generateToken(user) {
  const payload = { id: user.id, role: user.role, username: user.username, email: user.email };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });
}

function verifyToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({error:'Token não informado'});
  const parts = auth.split(' ');
  if (parts.length !== 2) return res.status(401).json({error:'Token inválido'});
  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // attach full user from db
    const user = db.users.find(u => u.id === payload.id);
    if (!user) return res.status(401).json({error:'Usuário não encontrado'});
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({error:'Token inválido ou expirado'});
  }
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({error:'Não autenticado'});
    if (!allowedRoles.includes(req.user.role)) return res.status(403).json({error:'Acesso negado'});
    next();
  };
}

module.exports = { generateToken, verifyToken, authorizeRoles };
