const db = require('../models/db');
const { v4: uuidv4 } = require('uuid');

const VALID_STATUSES = [
  'Pedido cadastrado',
  'Na costura',
  'Fazendo',
  'Entregar para o cliente',
  'Entregue para o cliente',
  'Devolvido pelo cliente',
  'Cancelado'
];

const PAYMENT_FORMS = ['CREDITO','DEBITO','PIX','DINHEIRO'];

function create(data, user) {
  // required fields minimal check
  if (!data.clientId) throw new Error('clientId obrigatório');
  const client = db.clients.find(c => c.id === data.clientId);
  if (!client) throw new Error('Cliente não encontrado');
  const order = {
    id: uuidv4(),
    orderNumber: db.nextOrderNumber++,
    orderName: data.orderName || '',
    clientName: client.name, // agora armazena o nome do cliente
    eventDate: data.eventDate || null,
    pickupDateTime: data.pickupDateTime || null,
    measureDateTime: data.measureDateTime || null,
    products: (data.products || []).map(p => ({ id: uuidv4(), ...p })),
    generalObservations: data.generalObservations || '',
    paymentStatus: data.paymentStatus || 'Não quitado',
    paidValue: data.paidValue || 0,
    paymentForm: data.paymentForm || null,
    status: 'Pedido cadastrado',
    createdBy: { id: user.id, username: user.username },
    updatedBy: null,
    auditLog: [ { user: user.username, action: 'Criou pedido', when: new Date().toISOString(), details: { status: 'Pedido cadastrado' } } ],
    flags: {}
  };
  db.orders.push(order);
  return order;
}

function getById(id) {
  const order = db.orders.find(o => o.id === id);
  if (!order) return null;
  // Recupera nome do cliente do cadastro
  const client = db.clients.find(c => c.name === order.clientName || c.id === order.clientId);
  return client ? { ...order, clientName: client.name } : order;
}

function listForUser(user) {
  function getClientNameByOrder(order) {
    // Tenta recuperar pelo id do cliente se existir
    if (order.clientId) {
      const client = db.clients.find(c => c.id === order.clientId);
      return client ? client.name : order.clientName;
    }
    // Se não, tenta pelo nome
    const client = db.clients.find(c => c.name === order.clientName);
    return client ? client.name : order.clientName;
  }
  if (user.role === 'alfaiate') {
    // only status Na costura or Fazendo
    return db.orders
      .filter(o => o.status === 'Na costura' || o.status === 'Fazendo')
      .sort((a,b) => new Date(a.pickupDateTime || 0) - new Date(b.pickupDateTime || 0))
      .map(o => ({ orderNumber: o.orderNumber, orderName: `${o.orderName} - ${getClientNameByOrder(o)}`, clientName: getClientNameByOrder(o), pickupDateTime: o.pickupDateTime, status: o.status, id: o.id }));
  }
  // attendant or admin: list orders to deliver by default between today and next saturday if not provided
  const now = new Date();
  const nextSaturday = new Date(now);
  nextSaturday.setDate(now.getDate() + ((6 - now.getDay() + 7) % 7));
  return db.orders
    .filter(o => {
      if (!o.pickupDateTime) return true;
      const dt = new Date(o.pickupDateTime);
      return dt >= now && dt <= nextSaturday;
    })
    .sort((a,b) => new Date(a.pickupDateTime || 0) - new Date(b.pickupDateTime || 0))
    .map(o => ({ ...o, clientName: getClientNameByOrder(o) }));
}

function update(id, data, user) {
  const idx = db.orders.findIndex(o => o.id === id);
  if (idx === -1) return null;
  const order = db.orders[idx];
  // if paymentStatus change, rules
  if (data.paymentStatus && data.paymentStatus === 'Quitado') {
    if (!data.paymentForm && !order.paymentForm) throw new Error('Não permitir marcar quitado sem definir a forma de pagamento');
    if ((data.paidValue || order.paidValue) <= 0) throw new Error('Valor pago deve ser maior que 0');
  }
  // cannot cancel if already quitado
  if (data.status === 'Cancelado' && (order.paymentStatus === 'Quitado' || data.paymentStatus === 'Quitado')) {
    throw new Error('Pedido quitado não pode ser cancelado');
  }
  // handle delivery rule: to set Entregue para o cliente, must be quitado
  if (data.status === 'Entregue para o cliente') {
    const newPaymentStatus = data.paymentStatus || order.paymentStatus;
    if (newPaymentStatus !== 'Quitado') {
      // ask (interactive) not possible; follow rule: if attendant forces delivery, store flag 'Combinado Pagar na devolução'
      order.flags.combinadoPagarNaDevolucao = true;
    }
  }

  // apply updates
  const prev = { ...order };
  db.orders[idx] = { ...order, ...data, updatedBy: { id: user.id, username: user.username } };

  // audit changes for status/payment/value
  const changedDetails = {};
  if (data.status && data.status !== prev.status) changedDetails.status = { from: prev.status, to: data.status };
  if ((data.paymentStatus && data.paymentStatus !== prev.paymentStatus) || (data.paidValue && data.paidValue !== prev.paidValue) || (data.paymentForm && data.paymentForm !== prev.paymentForm)) {
    changedDetails.payment = { from: prev.paymentStatus, to: data.paymentStatus || prev.paymentStatus, paidValueFrom: prev.paidValue, paidValueTo: data.paidValue || prev.paidValue };
  }
  if (Object.keys(changedDetails).length > 0) {
    db.orders[idx].auditLog.push({ user: user.username, action: 'Atualizou pedido', when: new Date().toISOString(), details: changedDetails });
  }

  return db.orders[idx];
}

function alfaiateUpdate(id, data, user) {
  const idx = db.orders.findIndex(o => o.id === id);
  if (idx === -1) return null;
  const order = db.orders[idx];
  // Alfaiate only can set status to 'Fazendo' or 'Entregar para o cliente' and edit generalObservations
  if (data.status && !['Fazendo','Entregar para o cliente'].includes(data.status)) {
    throw new Error('Alfaiate só pode definir status Fazendo ou Entregar para o cliente');
  }
  const prev = { ...order };
  if (data.status) order.status = data.status;
  if (typeof data.generalObservations === 'string') order.generalObservations = data.generalObservations;
  order.updatedBy = { id: user.id, username: user.username };
  // Audit
  const details = {};
  if (data.status && data.status !== prev.status) details.status = { from: prev.status, to: data.status };
  if (typeof data.generalObservations === 'string' && data.generalObservations !== prev.generalObservations) details.generalObservations = { from: prev.generalObservations, to: data.generalObservations };
  if (Object.keys(details).length) {
    order.auditLog.push({ user: user.username, action: 'Alfaiate atualizou pedido', when: new Date().toISOString(), details });
  }
  return order;
}

module.exports = { create, getById, listForUser, update, alfaiateUpdate, VALID_STATUSES, PAYMENT_FORMS };
