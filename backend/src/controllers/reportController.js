const prisma = require('../config/db');
const { startOfMonth, endOfMonth, eachDayOfInterval, format, startOfDay, endOfDay, subMonths } = require('date-fns');

exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : startOfMonth(new Date());
    const end = endDate ? new Date(endDate) : endOfDay(new Date());

    // 1. Métricas Gerais
    const sales = await prisma.sale.findMany({
      where: {
        storeId: req.storeId,
        createdAt: {
          gte: start,
          lte: end
        }
      }
    });

    const totalRevenue = sales.reduce((acc, sale) => acc + sale.total, 0);
    const totalOrders = sales.length;
    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Métricas do período anterior (para comparação %)
    const prevStart = subMonths(start, 1);
    const prevEnd = subMonths(end, 1);
    const prevSales = await prisma.sale.findMany({
      where: {
        storeId: req.storeId,
        createdAt: {
          gte: prevStart,
          lte: prevEnd
        }
      }
    });
    const prevRevenue = prevSales.reduce((acc, sale) => acc + sale.total, 0);
    const prevOrders = prevSales.length;

    const revenueTrend = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    const ordersTrend = prevOrders > 0 ? ((totalOrders - prevOrders) / prevOrders) * 100 : 0;

    // 2. Vendas ao Longo do Tempo (Gráfico)
    // Criar um mapa de datas para garantir que dias sem vendas apareçam como 0
    const days = eachDayOfInterval({ start, end });
    const salesOverTime = days.map(day => {
      const dayStr = format(day, 'dd/MM');
      const dailyTotal = sales
        .filter(s => format(new Date(s.createdAt), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
        .reduce((acc, s) => acc + s.total, 0);
      
      return { name: dayStr, revenue: dailyTotal };
    });

    // 3. Top Produtos
    const topProducts = await prisma.saleItem.groupBy({
      by: ['variationId'],
      where: { storeId: req.storeId },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    });

    const enrichedTopProducts = await Promise.all(topProducts.map(async (item) => {
      const variation = await prisma.productVariation.findFirst({
        where: { id: item.variationId, storeId: req.storeId },
        include: { product: true }
      });
      return {
        name: variation?.product.name || 'Produto Removido',
        units: item._sum.quantity,
        color: '#22c55e' // Cor padrão para o gráfico
      };
    }));

    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        averageTicket,
        revenueTrend,
        ordersTrend
      },
      salesOverTime,
      topProducts: enrichedTopProducts
    });

  } catch (error) {
    console.error('Erro no relatório:', error);
    res.status(500).json({ success: false, message: 'Erro ao gerar relatório.' });
  }
};
