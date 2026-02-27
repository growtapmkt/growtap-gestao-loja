const prisma = require('../config/db');

class LimitService {
  /**
   * Checa o limite mensal de vendas da loja.
   * Regra (FREE only): Máximo de X vendas no mês vigente.
   * Considera do primeiro dia (00:00:00) ao último dia (23:59:59) do mês local.
   *
   * @param {string} storeId ID da Loja
   * @param {number|null} limit Limite estipulado pelo plano (null = ilimitado)
   * @returns {Promise<{allowed: boolean, currentCount: number, limit: number|null}>}
   */
  async checkMonthlySalesLimit(storeId, limit) {
    if (limit === null || limit === undefined) {
      return { allowed: true, currentCount: 0, limit };
    }

    const now = new Date();
    // Primeiro dia do mês atual (00:00:00.000)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Último dia do mês atual (23:59:59.999)
    // getMonth() + 1 com dia 0 retorna o último dia do mês atual
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const currentCount = await prisma.sale.count({
      where: {
        storeId,
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    });

    const allowed = currentCount < limit;

    return { allowed, currentCount, limit };
  }
}

module.exports = new LimitService();
