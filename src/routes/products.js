const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const productService = require('../services/productService');

// Admin CRUD products
router.post('/', verifyToken, authorizeRoles('administrador'), (req, res) => {
  const product = productService.create(req.body);
  res.status(201).json(product);
});

router.get('/', verifyToken, authorizeRoles('administrador','atendente'), (req, res) => {
  res.json(productService.list());
});

router.get('/:id', verifyToken, authorizeRoles('administrador','atendente'), (req, res) => {
  const p = productService.get(req.params.id);
  if (!p) return res.status(404).json({error:'Produto não encontrado'});
  res.json(p);
});

router.put('/:id', verifyToken, authorizeRoles('administrador'), (req, res) => {
  const updated = productService.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({error:'Produto não encontrado'});
  res.json(updated);
});

module.exports = router;
