const prisma = require('../config/db');
const limitService = require('../services/LimitService');
const { BILLING_CONFIG } = require('../config/BillingConfig');

exports.createSale = async (req, res) => {
  try {
    const { clientId, items, subtotal, discount, discountType, paymentMethod, deliveryMethod, deliveryFee, observation } = req.body;
    const userId = req.user.id; // Pegando o ID do vendedor do token JWT

    if (!items || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'A venda deve conter pelo menos um item.' 
      });
    }

    // --- Limite Mensal de Vendas ---
    const salesLimit = req.plan?.limits?.maxSalesPerMonth;
    const limitCheck = await limitService.checkMonthlySalesLimit(req.storeId, salesLimit);

    if (!limitCheck.allowed) {
      if (BILLING_CONFIG.ENABLE_USAGE_TRACKING) {
        await prisma.featureUsage.create({
          data: {
            storeId: req.storeId,
            featureKey: 'monthly_sales_limit_exceeded',
            metadata: {
              currentCount: limitCheck.currentCount,
              limit: limitCheck.limit,
              mode: BILLING_CONFIG.MODE
            }
          }
        });
      }

      res.setHeader('X-Plan-Limit-Reached', 'true');
      return res.status(403).json({
        success: false,
        message: 'Você atingiu o limite de 50 vendas no plano gratuito. Para continuar registrando vendas, será necessário migrar para o plano PRO.'
      });
    }

    // Iniciando transação atômica
    const result = await prisma.$transaction(async (tx) => {
      const saleItemsToCreate = [];
      let calculatedSubtotal = 0;

      for (const item of items) {
        // 1. Buscar a variação e o preço atual do produto
        const variation = await tx.productVariation.findUnique({
          where: { id: item.variationId },
          include: { product: true }
        });

        if (!variation) {
          throw new Error(`Variação ${item.variationId} não encontrada.`);
        }

        // 2. Verificar estoque
        if (variation.quantity < item.quantity) {
          throw new Error(`Estoque insuficiente para o produto ${variation.product.name} (Tam: ${variation.size}). Disponível: ${variation.quantity}`);
        }

        // 3. Atualizar estoque (baixa) e registrar data da venda
        await tx.productVariation.updateMany({
      where: { id: item.variationId , storeId: req.storeId },
          data: {
            quantity: {
              decrement: item.quantity
            },
            lastSaleDate: new Date()
          }
        });

        // 4. Preparar item da venda
        const unitPrice = variation.product.isPromotionalPrice && variation.product.promotionalPrice 
          ? Number(variation.product.promotionalPrice) 
          : Number(variation.product.price);
        const itemSubtotal = unitPrice * item.quantity;
        calculatedSubtotal += itemSubtotal;

        saleItemsToCreate.push({
          variationId: item.variationId,
          quantity: item.quantity,
          unitPrice: unitPrice,
          // Snapshots (ERP Histórico Blindado)
          productNameSnapshot: variation.product.name,
          variationCodeSnapshot: variation.variationCode || null,
          colorSnapshot: variation.color,
          sizeSnapshot: variation.size,
          priceSnapshot: unitPrice,
          storeId: req.storeId
        });
      }

      // 5. Calcular Total Final com Desconto
      let total = calculatedSubtotal;
      const disc = Number(discount) || 0;
      
      if (discountType === 'PERCENTAGE') {
        total = calculatedSubtotal - (calculatedSubtotal * (disc / 100));
      } else {
        total = calculatedSubtotal - disc;
      }

      // 5.5 Adicionar valor do motoboy/entrega
      const fee = Number(deliveryFee) || 0;
      total += fee;

      // 6. Criar a Venda
      const sale = await tx.sale.create({
        data: {
          storeId: req.storeId,
          userId,
          clientId: clientId || null,
          subtotal: calculatedSubtotal,
          discount: disc,
          discountType: discountType || 'FIXED',
          deliveryFee: Number(deliveryFee) || 0,
          total: total,
          paymentMethod: paymentMethod || 'CASH',
          paymentStatus: paymentMethod === 'A_COMBINAR' ? 'PENDING' : 'PAID',
          deliveryMethod: deliveryMethod || 'PICKUP',
          observation: observation || null,
          items: {
            create: saleItemsToCreate
          }
        },
        include: {
          items: true,
          user: { select: { name: true } },
          client: { select: { name: true } }
        }
      });

      // 7. Criar a Transação no Caixa automaticamente (apenas se não for fiado)
      if (sale.paymentMethod !== 'A_COMBINAR') {
        await tx.transaction.create({
          data: {
            storeId: req.storeId,
            type: 'IN',
            description: `Venda Direta`,
            subDescription: `Pedido #${sale.id.split('-')[0].toUpperCase()}`,
            category: 'VENDA',
            method: sale.paymentMethod,
            value: sale.total,
            userId: sale.userId,
            saleId: sale.id
          }
        });
      }

      return sale;
    });

    res.status(201).json({
      success: true,
      message: 'Venda realizada com sucesso!',
      sale: result
    });

  } catch (error) {
    console.error('Erro ao processar venda:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Erro ao processar a venda.' 
    });
  }
};

exports.getAllSales = async (req, res) => {
  try {
    const sales = await prisma.sale.findMany({
      where: { storeId: req.storeId },
      include: {
        user: { select: { name: true } },
        client: { select: { name: true } },
        items: { where: { storeId: req.storeId }, include: { variation: {
              include: { product: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      sales
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar histórico de vendas.' 
    });
  }
};

exports.deleteSale = async (req, res) => {
  const { id } = req.params;
  const { action } = req.query; // 'REVERT_TO_CONDITIONAL' ou 'DELETE_ALL'

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Buscar a venda (com itens)
      const sale = await tx.sale.findUnique({
        where: { id },
        include: { items: true }
      });
      
      if (!sale || sale.storeId !== req.storeId) {
        throw new Error('Venda não encontrada.');
      }

      // 2. Lógica para Vendas Vinculadas a Condicionais
      if (sale.conditionalId) {
        if (action === 'REVERT_TO_CONDITIONAL') {
          // Voltar condicional para PENDING
          await tx.conditional.updateMany({
            where: { id: sale.conditionalId, storeId: req.storeId },
            data: { status: 'PENDING' }
          });

          // Ajustar a condicional para conter EXATAMENTE as peças que foram vendidas
          // (ignorando o que já foi devolvido para a prateleira)
          await tx.conditionalItem.deleteMany({
            where: { conditionalId: sale.conditionalId, storeId: req.storeId }
          });
          const newCondItems = sale.items.map(item => ({
             conditionalId: sale.conditionalId,
             variationId: item.variationId,
             quantity: item.quantity,
             unitPrice: item.unitPrice,
             storeId: req.storeId
          }));
          await tx.conditionalItem.createMany({ data: newCondItems });
          // Importante: NÃO devolver as peças ao estoque. Elas continuam na condicional.

        } else if (action === 'DELETE_ALL') {
          // Devolver peças ao estoque
          for (const item of sale.items) {
            await tx.productVariation.updateMany({
              where: { id: item.variationId, storeId: req.storeId },
              data: { quantity: { increment: item.quantity } }
            });
          }
          // Deletar condicional completamente
          await tx.conditionalItem.deleteMany({ where: { conditionalId: sale.conditionalId, storeId: req.storeId } });
          await tx.conditional.deleteMany({ where: { id: sale.conditionalId, storeId: req.storeId } });
        } else {
          throw new Error('Esta venda está vinculada a uma condicional e necessita de uma ação específica.');
        }
      } else {
        // Venda Normal: Simplesmente devolvemos quantidades ao estoque
        for (const item of sale.items) {
          await tx.productVariation.updateMany({
            where: { id: item.variationId , storeId: req.storeId },
            data: { quantity: { increment: item.quantity } }
          });
        }
      }

      // 3. Deletar a transação associada (Caixa)
      await tx.transaction.deleteMany({ where: { saleId: id, storeId: req.storeId } });

      // 4. Deletar os itens da venda
      await tx.saleItem.deleteMany({ where: { saleId: id, storeId: req.storeId } });

      // 5. Deletar a venda em si
      await tx.sale.deleteMany({ where: { id, storeId: req.storeId } });
    });

    res.json({ success: true, message: 'Operação de exclusão realizada com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateSale = async (req, res) => {
  const { id } = req.params;
  const { observation, paymentMethod, deliveryMethod, deliveryFee, clientId } = req.body;
  try {
    // 1. Buscar a venda atual para pegar os valores antigos
    const currentSale = await prisma.sale.findFirst({
      where: { id, storeId: req.storeId }
    });
    if (!currentSale || currentSale.storeId !== req.storeId) {
      return res.status(404).json({ success: false, message: 'Venda não encontrada.' });
    }

    // 2. Calcular novo total se o deliveryFee mudou
    let newTotal = currentSale.total;
    if (deliveryFee !== undefined) {
      const oldFee = currentSale.deliveryFee || 0;
      const newFee = Number(deliveryFee) || 0;
      newTotal = (currentSale.total - oldFee) + newFee;
    }

    const sale = await prisma.sale.updateMany({
      where: { id, storeId: req.storeId },
      data: {
        observation,
        paymentMethod,
        deliveryMethod,
        deliveryFee: deliveryFee !== undefined ? Number(deliveryFee) : undefined,
        total: newTotal,
        clientId: clientId || null
      }
    });
    res.json({ success: true, sale });
  } catch (error) {
    console.error('Erro ao atualizar venda:', error);
    res.status(400).json({ success: false, message: 'Erro ao atualizar venda.' });
  }
};

// Quitar venda pendente (Fiado / A_COMBINAR)
exports.paySale = async (req, res) => {
  const { id } = req.params;
  const { paymentMethod } = req.body; // O método real (PIX, DINHEIRO, etc.)

  try {
    const sale = await prisma.sale.findFirst({
      where: { id, storeId: req.storeId }
    });

    if (!sale) {
      return res.status(404).json({ success: false, message: 'Venda não encontrada.' });
    }

    if (sale.paymentStatus === 'PAID') {
      return res.status(400).json({ success: false, message: 'Esta venda já está paga.' });
    }

    await prisma.sale.updateMany({
      where: { id, storeId: req.storeId },
      data: {
        paymentStatus: 'PAID',
        paymentMethod: paymentMethod // Atualiza de A_COMBINAR para o método real
      }
    });

    res.json({ success: true, message: 'Pagamento confirmado com sucesso!' });
  } catch (error) {
    console.error('Erro ao confirmar pagamento da venda:', error);
    res.status(500).json({ success: false, message: 'Erro interno ao processar pagamento.' });
  }
};
