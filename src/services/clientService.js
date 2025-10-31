const db = require('../models/db');
const { v4: uuidv4 } = require('uuid');

function validateCPF(cpf) {
  cpf = cpf.replace(/[\.\-]/g, '');
  if (!cpf || cpf.length !== 11 || /^([0-9])\1+$/.test(cpf)) return false;
  let sum = 0, rest;
  for (let i = 1; i <= 9; i++) sum += parseInt(cpf.substring(i-1, i)) * (11 - i);
  rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== parseInt(cpf.substring(9, 10))) return false;
  sum = 0;
  for (let i = 1; i <= 10; i++) sum += parseInt(cpf.substring(i-1, i)) * (12 - i);
  rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== parseInt(cpf.substring(10, 11))) return false;
  return true;
}

function validateCNPJ(cnpj) {
  cnpj = cnpj.replace(/[\.\-\/]/g, '');
  if (!cnpj || cnpj.length !== 14) return false;
  let size = cnpj.length - 2;
  let numbers = cnpj.substring(0, size);
  let digits = cnpj.substring(size);
  let sum = 0;
  let pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += numbers[size - i] * pos--;
    if (pos < 2) pos = 9;
  }
  let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  if (result !== parseInt(digits.charAt(0))) return false;
  size = size + 1;
  numbers = cnpj.substring(0, size);
  sum = 0;
  pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += numbers[size - i] * pos--;
    if (pos < 2) pos = 9;
  }
  result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  if (result !== parseInt(digits.charAt(1))) return false;
  return true;
}

function validatePhone(phone) {
  // Aceita celular (11 dígitos) ou fixo (10 dígitos)
  return /^\d{10,11}$/.test(phone.replace(/\D/g, ''));
}

function validateCEP(cep) {
  return /^\d{5}-?\d{3}$/.test(cep);
}

function validateState(state) {
  const estados = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
  return estados.includes(state);
}

function create(data) {
  // Validações obrigatórias
  const requiredFields = ["typePessoa","name","cep","state","city","logradouro","numero"];
  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      throw new Error(`Campo obrigatório ausente: ${field}`);
    }
  }
  // Nome completo: remover espaços início/fim
  data.name = data.name.trim();
  // Tipo pessoa
  if (!["Física","Jurídica"].includes(data.typePessoa)) {
    throw new Error("typePessoa deve ser 'Física' ou 'Jurídica'");
  }
  // CPF/CNPJ se informado
  if (data.cpf_cnpj) {
    if (data.typePessoa === "Física" && !validateCPF(data.cpf_cnpj)) {
      throw new Error("CPF inválido");
    }
    if (data.typePessoa === "Jurídica" && !validateCNPJ(data.cpf_cnpj)) {
      throw new Error("CNPJ inválido");
    }
  }
  // Telefones
  if (!Array.isArray(data.phones) || data.phones.length === 0) {
    throw new Error("É obrigatório informar ao menos um telefone");
  }
  for (const phone of data.phones) {
    if (!validatePhone(phone)) throw new Error("Telefone inválido");
  }
  // CEP
  if (!validateCEP(data.cep)) throw new Error("CEP inválido");
  // Estado
  if (!validateState(data.state)) throw new Error("Estado inválido");
  // Número: só aceita número ou 'S/N'
  if (data.numero !== "S/N" && !/^\d+$/.test(data.numero)) {
    throw new Error("Número deve ser apenas dígitos ou 'S/N'");
  }
  // Ativo
  data.active = data.active !== false;
  // Ignora id do input
  const { id, ...rest } = data;
  const client = { id: uuidv4(), ...rest };
  db.clients.push(client);
  return client;
}

function get(id) { return db.clients.find(c => c.id === id); }

function update(id, data) {
  const idx = db.clients.findIndex(c => c.id === id);
  if (idx === -1) return null;
  // Repete validações do create, exceto id
  const requiredFields = ["typePessoa","name","cep","state","city","logradouro","numero"];
  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      throw new Error(`Campo obrigatório ausente: ${field}`);
    }
  }
  data.name = data.name.trim();
  if (!["Física","Jurídica"].includes(data.typePessoa)) {
    throw new Error("typePessoa deve ser 'Física' ou 'Jurídica'");
  }
  if (data.cpf_cnpj) {
    if (data.typePessoa === "Física" && !validateCPF(data.cpf_cnpj)) {
      throw new Error("CPF inválido");
    }
    if (data.typePessoa === "Jurídica" && !validateCNPJ(data.cpf_cnpj)) {
      throw new Error("CNPJ inválido");
    }
  }
  if (!Array.isArray(data.phones) || data.phones.length === 0) {
    throw new Error("É obrigatório informar ao menos um telefone");
  }
  for (const phone of data.phones) {
    if (!validatePhone(phone)) throw new Error("Telefone inválido");
  }
  if (!validateCEP(data.cep)) throw new Error("CEP inválido");
  if (!validateState(data.state)) throw new Error("Estado inválido");
  if (data.numero !== "S/N" && !/^\d+$/.test(data.numero)) {
    throw new Error("Número deve ser apenas dígitos ou 'S/N'");
  }
  data.active = data.active !== false;
  db.clients[idx] = { ...db.clients[idx], ...data };
  return db.clients[idx];
}

module.exports = { create, get, update };
