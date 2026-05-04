require('dotenv').config();
const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/productRoutes');
const dishRoutes = require('./routes/dishRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/products', productRoutes);
app.use('/api/dishes', dishRoutes);
app.use('/api/test', require('./routes/testRoutes'));

app.use(errorHandler);

module.exports = app;