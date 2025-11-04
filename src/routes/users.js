const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const userService = require('../services/userService');

// Admin creates users (administrador cria atendente/alfaiate/administrador)
router.post('/', verifyToken, authorizeRoles('administrador'), (req, res) => {
  const { username, email, password, role, active } = req.body;
  if (!username || !email || !password || !role) return res.status(400).json({error:'username,email,password,role obrigatórios'});
  const existing = userService.findByEmail(email);
  if (existing) return res.status(400).json({error:'Email já cadastrado'});
  const created = userService.createUser({ username: username.trim(), email, password, role, active });
  res.status(201).json({ user: { id: created.id, username: created.username, email: created.email, role: created.role, active: created.active } });
});

// Listar usuários (apenas admin, sem senha)
router.get('/', verifyToken, authorizeRoles('administrador'), (req, res) => {
  const users = require('../models/db').users.map(u => {
    const { password, ...userData } = u;
    return userData;
  });
  res.json(users);
});
// Atualizar usuário (admin pode ativar/inativar)
router.put('/:id', verifyToken, authorizeRoles('administrador'), (req, res) => {
  const db = require('../models/db');
  const idx = db.users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({error:'Usuário não encontrado'});
  const user = db.users[idx];
  const { email, password, role, active } = req.body;
  // Valida unicidade do email se alterado
  if (email && email !== user.email) {
    if (db.users.some(u => u.email === email && u.id !== user.id)) {
      return res.status(400).json({error:'Email já cadastrado'});
    }
  }
  // Auditoria
  if (!user.auditLog) user.auditLog = [];
  const changes = {};
  // username não pode ser alterado
  if (typeof email !== 'undefined' && email !== user.email) { changes.email = { from: user.email, to: email }; user.email = email; }
  if (typeof password !== 'undefined' && password !== user.password) { changes.password = { from: '***', to: '***' }; user.password = password; }
  if (typeof role !== 'undefined' && role !== user.role) { changes.role = { from: user.role, to: role }; user.role = role; }
  if (typeof active !== 'undefined' && !!active !== user.active) { changes.active = { from: user.active, to: !!active }; user.active = !!active; }
  if (Object.keys(changes).length > 0) {
    user.auditLog.push({
      when: new Date().toISOString(),
      by: req.user.username,
      changes
    });
  }
  res.json({ user: { id: user.id, username: user.username, email: user.email, role: user.role, active: user.active, auditLog: user.auditLog } });
});

module.exports = router;
