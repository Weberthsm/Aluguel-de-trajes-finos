const request = require('supertest');
require('dotenv').config();
const postAuthLogin = require('../fixtures/login/postAuthLogin.json');


const obterToken = async (usuario, senha)=>{
   
    const bodyAuthLogin = {...postAuthLogin}
    

    
    if(usuario && senha){
        bodyAuthLogin.email = usuario;
        bodyAuthLogin.password = senha
    }

    const responseAuthLogin = await request(process.env.BASE_URL)
                            .post('/auth/login')
                            .set('content-type','application/json')
                            .send(bodyAuthLogin) 
                    
                return responseAuthLogin.body.token;
    
}


module.exports ={
    obterToken
}