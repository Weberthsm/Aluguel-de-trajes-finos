const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const orderService = require('../services/orderService');

// Attendant creates orders
router.post('/', verifyToken, authorizeRoles('administrador','atendente'), (req, res) => {
  try {
    const created = orderService.create(req.body, req.user);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({error: err.message});
  }
});

// Get order details
router.get('/:id', verifyToken, authorizeRoles('administrador','atendente','alfaiate'), (req, res) => {
  const o = orderService.getById(req.params.id);
  if (!o) return res.status(404).json({error:'Pedido não encontrado'});
  res.json(o);
});

// List orders - behavior for attendant/alfaiate
router.get('/', verifyToken, authorizeRoles('administrador','atendente','alfaiate'), (req, res) => {
  const list = orderService.listForUser(req.user);
  res.json(list);
});

// Attendant edits order
router.put('/:id', verifyToken, authorizeRoles('administrador','atendente'), (req, res) => {
  try {
    const updated = orderService.update(req.params.id, req.body, req.user);
    if (!updated) return res.status(404).json({error:'Pedido não encontrado'});
    res.json(updated);
  } catch (err) {
    res.status(400).json({error: err.message});
  }
});

// Alfaiate can change status to Fazendo or Entregar para o cliente and edit generalObservations
router.patch('/:id/alfaiate', verifyToken, authorizeRoles('alfaiate'), (req, res) => {
  try {
    const { status, generalObservations } = req.body;
    const updated = orderService.alfaiateUpdate(req.params.id, { status, generalObservations }, req.user);
    if (!updated) return res.status(404).json({error:'Pedido não encontrado'});
    res.json(updated);
  } catch (err) {
    res.status(400).json({error: err.message});
  }
});

module.exports = router;
