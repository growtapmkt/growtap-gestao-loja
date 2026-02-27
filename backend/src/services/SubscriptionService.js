const prisma = require('../config/db');

class SubscriptionService {
  /**
   * Checa se existem lojas com o Trial expirado e as marca como EXPIRED.
   * Por enquanto, no modo SOFT/TRIAL_ONLY, a rotina apenas atualiza o status.
   * Não afeta o bloqueio real contanto que BILLING_MODE = 'SOFT'.
   */
  async checkExpiredTrials() {
    try {
      const now = new Date();

      const expiredSubscriptions = await prisma.storeSubscription.updateMany({
        where: {
          status: 'TRIAL',
          endsAt: {
            lt: now
          }
        },
        data: {
          status: 'EXPIRED'
        }
      });

      if (expiredSubscriptions.count > 0) {
        console.log(`[SubscriptionService] Atualizou ${expiredSubscriptions.count} assinaturas de TRIAL para EXPIRED.`);
      }

      return expiredSubscriptions.count;
    } catch (error) {
      console.error('[SubscriptionService] Erro ao checar trials expirados:', error);
      throw error;
    }
  }
}

module.exports = new SubscriptionService();
