const request = require('supertest');
const { expect } = require('chai');
require('dotenv').config();
const postAuthLogin = require('../fixtures/login/postAuthLogin.json');

describe('Login', () => {
    describe('/POST /auth/login', () => {
        it('Deve retornar 200 com um token em string quando usar credenciais válidas', async () => {

            const bodyAuthLogin = { ...postAuthLogin }

            const response = await request(process.env.BASE_URL)
                .post('/auth/login')
                .set('content-type', 'application/json')
                .send(bodyAuthLogin)

            expect(response.status).to.equal(200);
            expect(response.body.token).to.be.a('string');

        });

        it('Deve retornar 400 quando não informar usuário ou senha', async () => {
            const response = await request(process.env.BASE_URL)
                .post('/auth/login')
                .set('Content-Type', 'application/json')
                .send({})
            expect(response.status).to.equal(400)
            expect(response.body.error).to.equal('email e password são obrigatórios')
        });

        it('Deve retornar 401 quando usuário não estiver cadastrado', async () => {
            const response = await request(process.env.BASE_URL)
                .post('/auth/login')
                .set('Content-Type', 'application/json')
                .send({ email: 'usuarioInexistente', password: '654321' })
            console.log("erro foi:" + JSON.stringify(response.body));
            expect(response.status).to.equal(401)
            expect(response.body).to.have.property('error')
            expect(response.body.error).to.equal('Credenciais inválidas')
        })


    })
})