require('dotenv').config();
const fs = require('fs');
const path = require('path');
const request = require('supertest');
const { obterToken } = require('./autenticacao');

async function seedPerfilUsers({ onlyIfMissing = true } = {}) {
  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) throw new Error('BASE_URL não definido no .env');

  const token = await obterToken('admin@local', 'admin123');

  const filePath = path.resolve(
    __dirname,
    '../fixtures/cadastrarUsuarios/perfis/perfilUsers.json'
  );
  const perfis = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  const listResp = await request(baseUrl)
    .get('/users')
    .set('Authorization', `Bearer ${token}`)
    .set('content-type', 'application/json');

  if (listResp.status !== 200) {
    throw new Error(`Falha ao listar usuários: ${listResp.status}`);
  }

  const existingByEmail = new Map(listResp.body.map(u => [u.email, u]));
  const existingByUsername = new Map(listResp.body.map(u => [u.username, u]));

  const result = { created: [], skipped: [], failed: [] };

  for (const perfil of perfis) {
    const { username, email } = perfil;
    const exists = existingByEmail.has(email) || existingByUsername.has(username);

    if (exists && onlyIfMissing) {
      result.skipped.push({ username, email, reason: 'já existe' });
      continue;
    }

    const resp = await request(baseUrl)
      .post('/users')
      .set('Authorization', `Bearer ${token}`)
      .set('content-type', 'application/json')
      .send(perfil);

    if (resp.status === 201) {
      const u = resp.body?.user ?? { username, email };
      result.created.push(u);
      existingByEmail.set(u.email, u);
      existingByUsername.set(u.username, u);
    } else if (resp.status === 400 && onlyIfMissing) {
      result.skipped.push({ username, email, reason: 'conflito 400' });
    } else {
      result.failed.push({ username, email, status: resp.status, body: resp.body });
    }
  }

  return result;
}

module.exports = { seedPerfilUsers };