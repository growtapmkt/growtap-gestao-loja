const prisma = require('../config/db');
const bcrypt = require('bcryptjs');
const PLAN_LIMITS = require('../config/plans');

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const storeId = req.storeId; // From authMiddleware

    // 1. Validar se quem está criando é ADMIN ou OWNER
    // O middleware de rota já deve ter garantido autenticação, mas vamos garantir autorização
    // Ou assumimos que a rota tem middleware de role.
    // Vamos implementar a verificação aqui para garantir.
    if (req.user.role !== 'ADMIN' && req.user.role !== 'OWNER') {
      return res.status(403).json({ 
        message: 'Apenas administradores podem criar novos usuários.' 
      });
    }

    // 2. Verificar limite do plano
    // Buscar plano da loja
    const store = await prisma.store.findFirst({
      where: { id: storeId }, // valid req.storeId scope
      select: { plan: true }
    });

    if (!store) {
      return res.status(404).json({ message: 'Loja não encontrada.' });
    }

    const limit = PLAN_LIMITS[store.plan];
    
    // Contar usuários atuais
    const currentUsersCount = await prisma.user.count({ where: { storeId: req.storeId } });

    if (currentUsersCount >= limit) {
      return res.status(403).json({
        success: false,
        message: `Limite de usuários atingido para o plano ${store.plan}. (${currentUsersCount}/${limit})`,
        currentCount: currentUsersCount,
        limit: limit,
        plan: store.plan
      });
    }

    // 3. Validar se email já existe na loja
    const existingUser = await prisma.user.findFirst({
      where: { email, storeId: req.storeId }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email já cadastrado.' });
    }

    // 4. Criar usuário
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'EMPLOYEE', // Default to employee
        storeId
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso.',
      user: newUser
    });

  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ message: 'Erro interno ao criar usuário.' });
  }
};
