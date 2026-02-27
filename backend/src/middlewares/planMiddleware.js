const prisma = require('../config/db');

module.exports = async (req, res, next) => {
  try {
    // Só deve rodar se a loja já estiver identificada no req (via authMiddleware ou tenantMiddleware)
    if (!req.storeId) {
      return next();
    }

    // Busca a assinatura ativa com o plano
    const subscription = await prisma.storeSubscription.findFirst({
      where: { 
        storeId: req.storeId, 
        status: 'ACTIVE' 
      },
      include: { 
        plan: true 
      }
    });

    if (!subscription || !subscription.plan) {
      console.error(`[CRITICAL] Store ${req.storeId} não possui uma assinatura ativa ou um plano válido.`);
      // Fallback seguro rigoroso: previne que req.features seja undefined
      req.plan = null;
      req.features = {};
      return next();
    }

    // Injeta os dados da assinatura e plano na requisição
    req.plan = subscription.plan;
    req.features = subscription.plan.features;

    next();
  } catch (error) {
    console.error('Erro no planMiddleware:', error);
    // Em caso de erro do banco ou infraestrutura, garantimos um fallback limpo para não derrubar requisições
    req.plan = null;
    req.features = {};
    next(error);
  }
};
