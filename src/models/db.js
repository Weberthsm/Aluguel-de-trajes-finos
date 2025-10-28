const db = {
  users: [], // {id, username, email, password, role}
  clients: [],
  products: [],
  orders: [],
  nextOrderNumber: 1
};

module.exports = db;
