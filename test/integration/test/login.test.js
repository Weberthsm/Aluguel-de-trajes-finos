const request = require('supertest');
const { expect } = require('chai');
require('dotenv').config();
const postUsersLogin = require('../../fixtures/postUsersLogin.json');

describe('Login', () => {
    describe('/POST /users/login', () => {
        it('Deve retornar 200 com um token em string quando usar credenciais válidas', async () => {

            const bodyUsersLogin = { ...postUsersLogin }

            const response = await request(process.env.BASE_URL)
                .post('/users/login')
                .set('content-type', 'application/json')
                .send(bodyUsersLogin)

            expect(response.status).to.equal(200);
            expect(response.body.token).to.be.a('string');

        });

        it('Deve retornar 400 quando não informar usuário ou senha', async () => {
            const response = await request(process.env.BASE_URL)
                .post('/users/login')
                .set('Content-Type', 'application/json')
                .send({})

            expect(response.status).to.equal(400)
            expect(response.body.error).to.equal('Usuário e senha obrigatórios')
        });

        it('Deve retornar 400 quando usuário não estiver cadastrado', async () => {
            const response = await request(process.env.BASE_URL)
                .post('/users/login')
                .set('Content-Type', 'application/json')
                .send({ username: 'usuarioInexistente', password: '654321' })

            expect(response.status).to.equal(400)
            expect(response.body).to.have.property('error')
            expect(response.body.error).to.equal('Usuário não encontrado')
        })


    })
})