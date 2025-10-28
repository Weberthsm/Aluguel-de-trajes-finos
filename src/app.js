const express = require('express');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const clientRoutes = require('./routes/clients');
const orderRoutes = require('./routes/orders');

const app = express();
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/clients', clientRoutes);
app.use('/orders', orderRoutes);

// Swagger
const swaggerSpec = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'swagger.json')));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Basic root
app.get('/', (req, res) => res.json({ok:true, message: 'API Aluguel de Trajes Finos'}));

module.exports = app;
