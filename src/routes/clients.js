const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const clientService = require('../services/clientService');

// Create or edit clients (administrador, atendente)
router.post('/', verifyToken, authorizeRoles('administrador','atendente'), (req, res) => {
  const created = clientService.create(req.body);
  res.status(201).json(created);
});

router.get('/:id', verifyToken, authorizeRoles('administrador','atendente'), (req, res) => {
  const client = clientService.get(req.params.id);
  if (!client) return res.status(404).json({error:'Cliente não encontrado'});
  res.json(client);
});

router.put('/:id', verifyToken, authorizeRoles('administrador','atendente'), (req, res) => {
  const updated = clientService.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({error:'Cliente não encontrado'});
  res.json(updated);
});

module.exports = router;
