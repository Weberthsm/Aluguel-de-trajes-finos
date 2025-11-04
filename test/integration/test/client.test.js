const request = require('supertest');
const { expect } = require('chai')
require('dotenv').config();
const postUsersRegister = require('../../fixtures/postUsersRegister.json');
const Fakerator = require("fakerator");
const fakerator = Fakerator();


describe(' users register', () => {
    describe('POST /users/register', () => {
        it('Deve retornar 201 e confirmar que username e favorecidos da resposta correspondem aos enviados no cadastro e tem saldo inicial de 10.000', async () => {

            const bodyPostUsersRegister = structuredClone(postUsersRegister);
            bodyPostUsersRegister.username = fakerator.names.firstName();
            bodyPostUsersRegister.favorecidos = [fakerator.names.firstName()];

            const response = await request(process.env.BASE_URL)
                .post('/users/register')
                .set('content-type', 'application/json')
                .send(bodyPostUsersRegister)

     //       console.log(response.body);
            expect(response.status).to.equal(201);
            expect(response.body.username).to.equal(bodyPostUsersRegister.username);
            expect(response.body.saldo).to.equal(10000);
            expect(response.body.favorecidos).to.have.deep.members(bodyPostUsersRegister.favorecidos);
        })


        it('Deve retornar 400 ao tentar cadastrar usuário com username já existente', async () => {

            const bodyPostUsersRegister = structuredClone(postUsersRegister);
            bodyPostUsersRegister.username = "weberth";
            bodyPostUsersRegister.favorecidos = [fakerator.names.firstName()];

            const response = await request(process.env.BASE_URL)
                .post('/users/register')
                .set('content-type', 'application/json')
                .send(bodyPostUsersRegister)
         //   console.log(response.body);
            expect(response.status).to.equal(400);
            expect(response.body.error).to.match(/Usuário já existe/i);
        })


    })

    describe('GET /users', () => {
        it('Deve retornar 200 e listar todos os usuários já cadastrados', async () => {

            const response = await request(process.env.BASE_URL)
                .get('/users')
                .set('content-type', 'application/json')

            // console.log(response.body);

            expect(response.status).to.equal(200);

            expect(response.body).to.be.an('array');
            expect(response.body.length).to.be.at.least(3);
            

            // const dadosEsperados = [
            //     { username: 'julio', favorecidos: ['priscila'], saldo: 10000 },
            //     { username: 'priscila', favorecidos: ['julio'], saldo: 10000 },
            //     { username: 'weberth', favorecidos: ['carlos'], saldo: 10000 }
            // ];

            // // Verifica se os dados esperados estão contidos na resposta, inclusive o saldo de 10.000 (independente da ordem)
            // expect(response.body).to.deep.include.members(dadosEsperados);

        })
    })
})
