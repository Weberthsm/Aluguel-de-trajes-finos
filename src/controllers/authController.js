const userService = require('../services/userService');
const { generateToken } = require('../middleware/auth');

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({error:'email e password são obrigatórios'});
  const user = userService.findByEmail(email);
  if (!user || user.password !== password) return res.status(401).json({error:'Credenciais inválidas'});
  const token = generateToken(user);
  res.json({ token, user: { id: user.id, username: user.username, role: user.role, email: user.email } });
}

module.exports = { login };
