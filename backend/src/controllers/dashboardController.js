const prisma = require('../config/db');
const { startOfDay, endOfDay, startOfMonth, endOfMonth, subDays, format } = require('date-fns');
const limitService = require('../services/LimitService');

exports.getStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const now = new Date();

    // Default range (if not provided) is today
    let filterStart = startDate ? new Date(startDate) : startOfDay(now);
    let filterEnd = endDate ? new Date(endDate) : endOfDay(now);

    // 1. Vendas no período (Com itens para cálculo de lucro)
    const periodSales = await prisma.sale.findMany({
      where: {
        storeId: req.storeId,
        createdAt: {
          gte: filterStart,
          lte: filterEnd
        }
      },
      include: {
        items: {
          where: { storeId: req.storeId },
          include: {
            variation: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });

    let periodRevenue = 0;
    let periodCost = 0;

    periodSales.forEach(sale => {
      periodRevenue += sale.total;
      sale.items.forEach(item => {
        // Custo do produto (se não tiver, assume 0)
        const cost = item.variation?.product?.cost || 0;
        periodCost += cost * item.quantity;
      });
    });

    const periodProfit = periodRevenue - periodCost;
    const periodSalesCount = periodSales.length;
    const periodAverageTicket = periodSalesCount > 0 ? periodRevenue / periodSalesCount : 0;

    // 2. Vendas por Dia ou Hora no período
    const diffInMilliseconds = filterEnd - filterStart;
    const diffInHours = diffInMilliseconds / (1000 * 60 * 60);
    const diffInDays = Math.ceil(diffInMilliseconds / (1000 * 60 * 60 * 24));
    
    const salesByDay = [];

    if (diffInDays <= 1 || diffInHours <= 24) {
      // Agrupar por hora (0-23)
      for (let i = 0; i <= 23; i++) {
        const hourStart = new Date(filterStart);
        hourStart.setHours(i, 0, 0, 0);
        
        const hourEnd = new Date(hourStart);
        hourEnd.setHours(i, 59, 59, 999);

        // Apenas adiciona pontos até a hora atual se for o dia de hoje
        if (hourStart > now && filterEnd >= now) continue;

        const hourTotal = periodSales
          .filter(sale => sale.createdAt >= hourStart && sale.createdAt <= hourEnd)
          .reduce((acc, sale) => acc + sale.total, 0);

        salesByDay.push({
          date: `${i.toString().padStart(2, '0')}:00`,
          total: hourTotal
        });
      }
    } else {
      // Agrupar por dias
      const chartPoints = diffInDays > 31 ? 31 : diffInDays;
      for (let i = 0; i < chartPoints; i++) {
        const date = subDays(filterEnd, i);
        const start = startOfDay(date);
        const end = endOfDay(date);

        const dayTotal = periodSales
          .filter(sale => sale.createdAt >= start && sale.createdAt <= end)
          .reduce((acc, sale) => acc + sale.total, 0);

        salesByDay.push({
          date: format(date, 'dd/MM'),
          total: dayTotal
        });
      }
      salesByDay.reverse();
    }

    // 3. Ranking de Produtos Mais Vendidos no período
    // Agregação via prisma para performance no ranking
    const topProductsGrouped = await prisma.saleItem.groupBy({
      by: ['variationId'],
      where: {
        storeId: req.storeId,
        sale: {
          createdAt: {
            gte: filterStart,
            lte: filterEnd
          }
        }
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 5,
    });

    const topProducts = await Promise.all(topProductsGrouped.map(async (item) => {
      const variation = await prisma.productVariation.findFirst({
        where: { id: item.variationId, storeId: req.storeId },
        include: { product: true }
      });
      return {
        name: variation?.product.name,
        variation: `${variation?.color} ${variation?.size}`,
        quantity: item._sum.quantity,
        revenue: item._sum.quantity * (variation?.product.price || 0)
      };
    }));

    // 4. Insights Inteligentes (Estoque Baixo)
    // Buscando produtos ativos com estoque baixo (ex: < 5 ou menor que minStock)
    // Prisma não compara colunas direto no where facilmente, então pegamos os com estoque absoluto baixo
    const lowStockProducts = await prisma.product.findMany({
      where: {
        storeId: req.storeId,
        active: true,
        controlStock: true,
        availableQty: {
          lte: 5 // Alerta para menos de 5 unidades
        }
      },
      take: 3,
      select: { name: true, availableQty: true }
    });

    // Métricas extras fixas (Hoje e Mês)
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // Buscar vendas do mês para cálculo de meta e receita mensal
    const monthSales = await prisma.sale.findMany({
      where: {
        storeId: req.storeId,
        createdAt: {
          gte: monthStart,
          lte: monthEnd
        }
      },
      select: { total: true, createdAt: true }
    });

    const dailyRevenue = monthSales
      .filter(sale => sale.createdAt >= todayStart && sale.createdAt <= todayEnd)
      .reduce((acc, sale) => acc + sale.total, 0);

    const monthlyRevenue = monthSales.reduce((acc, sale) => acc + sale.total, 0);

    res.json({
      success: true,
      stats: {
        periodRevenue,
        periodProfit,
        periodSalesCount,
        periodAverageTicket,
        dailyRevenue,
        monthlyRevenue,
        salesByDay,
        topProducts,
        lowStockProducts
      }
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas do dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno ao carregar o dashboard.'
    });
  }
};

exports.getUsage = async (req, res) => {
  try {
    const planName = req.plan?.name || 'FREE';
    const limit = req.plan?.limits?.maxSalesPerMonth;

    const limitCheck = await limitService.checkMonthlySalesLimit(req.storeId, limit);

    const current = limitCheck.currentCount;
    // If limit is null, it's unlimited. We'll send limit: null, percentageUsed: 0, remaining: null
    let percentageUsed = 0;
    let remaining = null;

    if (limit !== null && limit !== undefined) {
      percentageUsed = limit > 0 ? Math.min(100, Math.max(0, Math.floor((current / limit) * 100))) : 100;
      remaining = Math.max(0, limit - current);
    }

    res.json({
      success: true,
      plan: planName,
      monthlySales: {
        current,
        limit: limit === null ? null : limit,
        percentageUsed: Number(percentageUsed.toFixed(2)),
        remaining
      }
    });

  } catch (error) {
    console.error('Erro ao buscar uso do plano:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno ao carregar o uso do plano.'
    });
  }
};
