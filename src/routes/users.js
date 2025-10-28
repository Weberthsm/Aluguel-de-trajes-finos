const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const userService = require('../services/userService');

// Admin creates users (administrador cria atendente/alfaiate/administrador)
router.post('/', verifyToken, authorizeRoles('administrador'), (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password || !role) return res.status(400).json({error:'username,email,password,role obrigatórios'});
  const existing = userService.findByEmail(email);
  if (existing) return res.status(400).json({error:'Email já cadastrado'});
  const created = userService.createUser({ username: username.trim(), email, password, role });
  res.status(201).json({ user: { id: created.id, username: created.username, email: created.email, role: created.role } });
});

module.exports = router;
