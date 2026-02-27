const prisma = require('../config/db');
const { subDays, differenceInDays } = require('date-fns');

exports.getIntelligentInventory = async (req, res) => {
  try {
    const { daysForABC = 90 } = req.query;
    const now = new Date();
    const dateLimitABC = subDays(now, daysForABC);

    // 1. Buscar vendas no período para calcular Curva ABC por variação
    const salesInABCPeriod = await prisma.saleItem.groupBy({
      by: ['variationId'],
      _sum: { quantity: true },
      where: {
        storeId: req.storeId,
        sale: {
          createdAt: { gte: dateLimitABC },
          storeId: req.storeId
        }
      }
    });

    const salesMap = {};
    salesInABCPeriod.forEach(s => {
      salesMap[s.variationId] = s._sum.quantity;
    });

    // 2. Buscar todas as variações e seus produtos para análise profunda
    const variations = await prisma.productVariation.findMany({
      where: { storeId: req.storeId },
      include: {
        product: {
            select: {
                id: true,
                name: true,
                sku: true,
                image: true,
                minStockQty: true
            }
        },
        saleItems: {
          select: {
            quantity: true,
            sale: { select: { createdAt: true } }
          },
          where: {
            storeId: req.storeId,
            sale: {
              createdAt: { gte: subDays(now, 90) },
              storeId: req.storeId
            }
          }
        }
      }
    });

    // 3. Atribuição Curva ABC
    // Ordenamos pela quantidade vendida no período (default 90 dias)
    const sortedBySales = [...variations].sort((a, b) => (salesMap[b.id] || 0) - (salesMap[a.id] || 0));
    const totalCount = sortedBySales.length;
    
    const abcMap = {};
    sortedBySales.forEach((v, index) => {
      if (totalCount === 0) {
        abcMap[v.id] = 'C';
        return;
      }
      const position = (index + 1) / totalCount;
      if (position <= 0.20) abcMap[v.id] = 'A'; // Top 20%
      else if (position <= 0.50) abcMap[v.id] = 'B'; // Próximos 30%
      else abcMap[v.id] = 'C'; // Restante 50%
    });

    // 4. Cruzamento de dados e geração de insights
    const inventory = variations.map(v => {
      // Vendas detalhadas
      const last30 = v.saleItems
        .filter(s => s.sale.createdAt >= subDays(now, 30))
        .reduce((acc, curr) => acc + curr.quantity, 0);
      const last60 = v.saleItems
        .filter(s => s.sale.createdAt >= subDays(now, 60))
        .reduce((acc, curr) => acc + curr.quantity, 0);
      const last90 = v.saleItems
        .reduce((acc, curr) => acc + curr.quantity, 0);

      // Cálculo de Tempo Parado
      const referenceDate = v.lastSaleDate || v.lastEntryDate || v.createdAt;
      const idleDays = differenceInDays(now, referenceDate);

      const abc = abcMap[v.id];
      
      // Inteligência de Status
      const minStock = v.product.minStockQty || 5;
      let status = { label: 'Monitorar', color: 'blue', type: 'NORMAL' };
      let suggestion = 'Giro regular. Manter acompanhamento.';

      // Regra 1: Produto A (Crítico) com Estoque Baixo
      if (abc === 'A' && v.quantity <= minStock) {
        status = { label: 'Reposição Urgente', color: 'emerald', type: 'URGENT' };
        suggestion = 'Alta demanda e estoque baixo. Risco de ruptura.';
      } 
      // Regra 2: Produto C com muito tempo parado
      else if (abc === 'C' && idleDays >= 90 && v.quantity > 0) {
        status = { label: 'Sugestão Promoção', color: 'rose', type: 'DANGER' };
        suggestion = 'Baixo giro e muito tempo parado. Considerar queima.';
      }
      // Regra 3: Produto B com estoque acima do dobro do min
      else if (abc === 'B' && v.quantity > (minStock * 3)) {
        status = { label: 'Estoque Elevado', color: 'amber', type: 'WARNING' };
        suggestion = 'Estoque acima da média de giro para esta categoria.';
      }
      // Regra 4: Sem vendas registradas nunca
      else if (!v.lastSaleDate && idleDays > 30) {
        status = { label: 'Sem Giro', color: 'slate', type: 'STAGNANT' };
        suggestion = 'Produto nunca vendido desde a entrada.';
      }

      return {
        id: v.id,
        productId: v.product.id,
        name: v.product.name,
        sku: v.product.sku,
        image: v.product.image,
        color: v.color,
        size: v.size,
        stock: v.quantity,
        lastSale: v.lastSaleDate,
        idleDays,
        abc,
        metrics: {
          last30,
          last60,
          last90
        },
        insight: {
          status: status.label,
          color: status.color,
          type: status.type,
          suggestion
        }
      };
    });

    res.json({
      success: true,
      count: inventory.length,
      inventory
    });

  } catch (error) {
    console.error('Erro no processamento de estoque inteligente:', error);
    res.status(500).json({ success: false, message: 'Falha ao processar métricas de inteligência de estoque.' });
  }
};
