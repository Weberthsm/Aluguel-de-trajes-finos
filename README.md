# Aluguel de Trajes Finos - API REST

API REST em Node.js/Express para gestão de aluguel de trajes finos (in-memory).

Principais funcionalidades:
- Autenticação JWT (roles: administrador, atendente, alfaiate)
- Gerenciamento de usuários (admins criam atendentes/alfaiates)
- CRUD produtos (administrador)
- CRUD clientes (administrador e atendente)
- CRUD pedidos (atendente)
- Fluxo do alfaiate: listar pedidos "Na costura" / "Fazendo", marcar "Fazendo" e "Entregar para o cliente" e editar observações
- Auditoria de alterações de status e pagamento
- Documentação Swagger em `resources/swagger.json` e disponível em `/docs`

Como rodar:

1. Instalar dependências:

```bash
# no Bash (Windows WSL/git bash/cmd com bash)
npm install
```

2. Iniciar servidor:

```bash
npm start
```

Servidor inicializa em http://localhost:3000

Usuário administrador padrão (criado automaticamente):
- email: admin@local
- password: admin123
- username: weberth.machado

Endpoints principais:
- POST /auth/login -> obter token JWT
- /docs -> Swagger UI

Observações:
- Dados são guardados em memória; reiniciar servidor perde os dados.
- A API está dividida em layers: routes, controllers, services e models (in-memory DB).

