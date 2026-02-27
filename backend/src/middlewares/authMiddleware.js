const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    // Busca usuário real no banco para atestar a loja (Contra bypass em caso de token velho/comprometido)
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: true, storeId: true }
    });

    if (!user) {
      return res.status(401).json({ message: 'Usuário não existe mais.' });
    }

    if (!user.storeId || (decoded.storeId && user.storeId !== decoded.storeId)) {
       return res.status(401).json({ message: 'Conflito ou ausência de escopo de Loja no token.' });
    }

    req.user = user;
    req.storeId = user.storeId;

    // Aciona o middleware de injeção de plano (apenas após `req.storeId` estar definido)
    const planMiddleware = require('./planMiddleware');
    await planMiddleware(req, res, next);
    
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Você não tem permissão para esta ação.' });
    }
    next();
  };
};
