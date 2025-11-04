const request = require('supertest');
require('dotenv').config();
const postUsersLogin = require('../fixtures/postUsersLogin.json');


const obterToken = async (usuario, senha)=>{
   
    const bodyUsersLogin = {...postUsersLogin}
    

    
    if(usuario && senha){
        bodyUsersLogin.username = usuario;
        bodyUsersLogin.password = senha
    }
    
    const responseUserslogin = await request(process.env.BASE_URL)
                            .post('/users/login')
                            .set('content-type','application/json')
                            .send(bodyUsersLogin) 
                    
                return responseUserslogin.body.token;
    
}


module.exports ={
    obterToken
}