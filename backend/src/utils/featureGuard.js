const prisma = require('../config/db');
const { BILLING_CONFIG } = require('../config/BillingConfig');

/**
 * Middleware Guard para proteger rotas baseadas nas features/limits do plano do lojista.
 *
 * Fluxo:
 * - Verificar acesso via req.plan.features ou req.plan.limits
 * - Se permitido -> next()
 * - Se não permitido:
 *    - Registrar em FeatureUsage (com metadata opcional)
 *    - Se MODE === 'SOFT':
 *         - adicionar header: X-Plan-Limit-Reached: true
 *         - continuar next()
 *    - Se MODE === 'HARD':
 *         - retornar 403
 *
 * @param {string} featureKey Chave da feature a ser verificada (ex: 'advancedReports')
 * @returns Express Middleware
 */
const requireFeature = (featureKey) => {
  return async (req, res, next) => {
    // Validação de segurança básica para garantir que o middleware injetou os dados
    if (!req.features || !req.plan) {
      console.error('[CRITICAL] requireFeature chamado sem req.features definido.', req.originalUrl);
      return res.status(403).json({
        success: false,
        message: 'Não foi possível validar as permissões do seu plano. Tente novamente mais tarde.'
      });
    }

    // A feature pode estar em features ou em limits
    let hasFeature = false;
    
    // Se a featureKey está no JSON de limits (como boolean)
    if (req.plan.limits && req.plan.limits[featureKey] !== undefined) {
       hasFeature = req.plan.limits[featureKey] === true;
    } else if (req.features && req.features[featureKey] !== undefined) {
       // Compatibilidade retroativa
       hasFeature = req.features[featureKey] === true;
    }

    if (hasFeature) {
      return next();
    }

    // -------------------------------------------------------------------------------- //
    // FLUXO DE NÃO PERMITIDO (LIMIT REACHED / FEATURE LOCKED)
    // -------------------------------------------------------------------------------- //
    
    try {
      if (BILLING_CONFIG.ENABLE_USAGE_TRACKING && req.storeId) {
        // Sempre registrar a tentativa de uso se configurado
        await prisma.featureUsage.create({
          data: {
            storeId: req.storeId,
            featureKey: featureKey,
            metadata: {
              url: req.originalUrl,
              method: req.method,
              blocked: BILLING_CONFIG.MODE === 'HARD',
              mode: BILLING_CONFIG.MODE
            }
          }
        });
      }
    } catch (err) {
      console.error('[CRITICAL] Falha ao registrar FeatureUsage:', err);
    }

    // Avalia o Modo da Aplicação
    if (BILLING_CONFIG.MODE === 'SOFT') {
      res.setHeader('X-Plan-Limit-Reached', 'true');
      return next();
    }

    // Modo HARD - Bloqueio real
    return res.status(403).json({
      success: false,
      message: `O seu plano atual não inclui acesso à funcionalidade: ${featureKey}. Faça o upgrade para utilizar.`,
      requiredFeature: featureKey
    });
  };
};

/**
 * Função Helper para avaliar limites numéricos baseados no plano antes da inserção.
 * Retorna true se estiver dentro do limite, ou se SOFT Billing permitir.
 */
const checkLimit = async (req, limitKey, currentValue) => {
  if (!req.plan || !req.plan.limits) return false;
  
  const limitValue = req.plan.limits[limitKey];
  
  // Se o limitValue for null, significa ilimitado
  if (limitValue === null || limitValue === undefined) return true;

  if (currentValue >= limitValue) {
      // Excedeu o limite numérico
      try {
        if (BILLING_CONFIG.ENABLE_USAGE_TRACKING && req.storeId) {
          await prisma.featureUsage.create({
            data: {
              storeId: req.storeId,
              featureKey: limitKey,
              metadata: {
                currentValue,
                limitValue,
                blocked: BILLING_CONFIG.MODE === 'HARD',
                mode: BILLING_CONFIG.MODE
              }
            }
          });
        }
      } catch (err) {
        console.error('[CRITICAL] Falha ao registrar FeatureUsage limit:', err);
      }

      if (BILLING_CONFIG.MODE === 'SOFT') {
         return true; // Permite prosseguir no modo SOFT
      }
      return false; // Bloqueia no modo HARD
  }

  return true;
};

module.exports = {
  requireFeature,
  checkLimit
};
