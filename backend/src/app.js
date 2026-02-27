const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Routes imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const clientRoutes = require('./routes/clientRoutes');
const saleRoutes = require('./routes/saleRoutes');
const conditionalRoutes = require('./routes/conditionalRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const reportRoutes = require('./routes/reportRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const characteristicRoutes = require('./routes/characteristicRoutes');
const brandRoutes = require('./routes/brandRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

dotenv.config();

const app = express();

// Proteção Crítica: Impede inicializar Banco Incorreto em ambiente PROD
const PROD_PROJECT_ID = "bbmkrcugsvpbbshpjxuy"; // ID do projeto PROD no Supabase
if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL?.includes(PROD_PROJECT_ID)) {
  throw new Error('ERRO FATAL: Banco incorreto em ambiente de produção.');
}
// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Bloqueio Global contra injeção de storeId pelo Frontend
app.use((req, res, next) => {
  if (req.body?.storeId || req.query?.storeId) {
    console.warn(`[Segurança] Tentativa de injeção de storeId detectada: ${req.originalUrl}`);
  }

  if (req.body) delete req.body.storeId;
  if (req.query) delete req.query.storeId;

  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/conditionals', conditionalRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/characteristics', characteristicRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/settings', settingsRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Rota não encontrada: ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Erro interno do servidor',
      status: err.status || 500
    }
  });
});

module.exports = app;
