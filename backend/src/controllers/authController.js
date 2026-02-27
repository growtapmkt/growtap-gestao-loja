const prisma = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { BILLING_CONFIG } = require('../config/BillingConfig');

exports.register = async (req, res) => {
  try {
    const { name, email, password, storeName } = req.body;

    // Validações básicas
    if (!name || !email || !password || !storeName) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    // Verificar se email já existe
    const existingUser = await prisma.user.findFirst({ where: { email } }) /* req.storeId not applicable here, email is globally unique */ /* enforced unique */;

    if (existingUser) {
      return res.status(400).json({ message: 'Este email já está em uso.' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Transaction para criar Store e User atomicamente
    const result = await prisma.$transaction(async (tx) => {
      // 1. Validar e Buscar o Plano FREE
      let freePlan = await tx.plan.findUnique({
        where: { name: 'FREE' }
      });

      if (!freePlan) {
        console.error('[CRITICAL] Plano "FREE" não encontrado na base. Criando dinamicamente...');
        freePlan = await tx.plan.create({
          data: {
            name: 'FREE',
            description: 'Plano gratuito básico',
            priceMonthly: 0,
            priceYearly: 0,
            features: {},
            limits: {
              maxProducts: 50,
              maxUsers: 2,
              maxSalesPerMonth: 50,
              advancedReports: false,
              apiAccess: false
            }
          }
        });
      }

      // 2. Criar a Loja
      const store = await tx.store.create({
        data: {
          name: storeName
        }
      });

      // 3. Assinatura FREE Vitalícia Limitada
      const startedAt = new Date();

      // 4. Criar a Assinatura (StoreSubscription)
      const subscription = await tx.storeSubscription.create({
        data: {
          storeId: store.id,
          planId: freePlan.id,
          status: 'ACTIVE',
          startedAt: startedAt,
          endsAt: null, // Sem expiração para o plano grátis
          autoRenew: false,
          paymentProvider: null
        }
      });

      // 4. Criar o Usuário Dono (Owner) vinculado à loja
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'OWNER',
          storeId: store.id
        }
      });
      
      // 5. (Opcional) Criar dados iniciais para a loja (Categorias padrão, etc)
      // Podemos adicionar isso depois se necessário

      return { store, user, subscription };
    });

    // Gerar Token JWT
    const token = jwt.sign(
      { id: result.user.id, role: result.user.role, storeId: result.store.id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    res.status(201).json({
      message: 'Cadastro realizado com sucesso!',
      token,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        storeId: result.store.id,
        storeName: result.store.name
      }
    });

  } catch (error) {
    console.error('Erro no cadastro:', error);
    res.status(500).json({ message: 'Erro interno ao realizar cadastro.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Verificar se o usuário existe
    const user = await prisma.user.findFirst({ where: { email } }) /* req.storeId not applicable here, email is globally unique */ /* enforced unique */;

    if (!user) {
      return res.status(401).json({ 
        message: 'Credenciais inválidas. Verifique seu e-mail e senha.' 
      });
    }

    // 2. Verificar a senha (bcrypt compare)
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Credenciais inválidas. Verifique seu e-mail e senha.' 
      });
    }

    // 3. Gerar Token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role, storeId: user.storeId },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    // 4. Retornar dados (sem a senha)
    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        storeId: user.storeId
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno no servidor ao processar o login.' });
  }
};
