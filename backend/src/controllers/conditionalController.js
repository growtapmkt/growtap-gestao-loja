const prisma = require('../config/db');

// Criar uma nova condicional (Appro)
exports.createConditional = async (req, res) => {
  try {
    const {
      clientId, items, returnDate, observation, orderNotes,
      discount = 0, discountType = 'FIXED', deliveryFee = 0, deliveryMethod = 'PICKUP'
    } = req.body;
    const userId = req.user.id;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'A condicional deve conter itens.' });
    }

    const result = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const conditionalItems = [];

      for (const item of items) {
        const variation = await tx.productVariation.findFirst({ where: { id: item.variationId, storeId: req.storeId },
          include: { product: true }
        });

        if (!variation) throw new Error(`Variação ${item.variationId} não encontrada.`);
        if (variation.quantity < item.quantity) {
          throw new Error(`Estoque insuficiente para ${variation.product.name}.`);
        }

        // Baixar estoque (reserva)
        await tx.productVariation.updateMany({
      where: { id: item.variationId , storeId: req.storeId },
          data: { quantity: { decrement: item.quantity } }
        });

        const unitPrice = variation.product.isPromotionalPrice && variation.product.promotionalPrice 
          ? Number(variation.product.promotionalPrice) 
          : Number(variation.product.price);
        const quantity = Number(item.quantity);
        subtotal += unitPrice * quantity;

        conditionalItems.push({
          variationId: item.variationId,
          quantity: quantity,
          unitPrice: unitPrice,
          storeId: req.storeId
        });
      }

      const safeDiscount = Number(discount);
      const safeDeliveryFee = Number(deliveryFee);

      const total = discountType === 'PERCENTAGE'
        ? (subtotal - (subtotal * (safeDiscount / 100))) + safeDeliveryFee
        : (subtotal - safeDiscount) + safeDeliveryFee;

      return await tx.conditional.create({
        data: {
          storeId: req.storeId,
          clientId: clientId || null,
          userId,
          subtotal: subtotal,
          discount: Number(discount),
          discountType,
          deliveryFee: Number(deliveryFee),
          deliveryMethod,
          total: total,
          returnDate: new Date(returnDate),
          observation,
          orderNotes,
          status: 'PENDING',
          items: {
            create: conditionalItems
          }
        },
        include: {
          client: true,
          items: { where: { storeId: req.storeId }, include: { variation: {
                include: { product: true }
              }
            }
          }
        }
      });
    });

    res.status(201).json({ success: true, conditional: result });
  } catch (error) {
    console.error('Erro ao criar condicional:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Listar todas as condicionais
exports.getConditionals = async (req, res) => {
  try {
    const conditionals = await prisma.conditional.findMany({
      where: { storeId: req.storeId },
      include: {
        client: true,
        user: { select: { name: true } },
        items: { where: { storeId: req.storeId }, include: { variation: {
              include: { product: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Atualizar status para OVERDUE se o prazo passou e ainda está PENDING
    const now = new Date();
    const updatedConditionals = conditionals.map(c => {
      if (c.status === 'PENDING' && new Date(c.returnDate) < now) {
        return { ...c, status: 'OVERDUE' };
      }
      return c;
    });

    res.json({ success: true, conditionals: updatedConditionals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar condicionais.' });
  }
};

// Finalizar condicional (Transformar em Venda)
exports.finalizeConditional = async (req, res) => {
  const { id } = req.params;
  const { paymentMethod, discount, discountType } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const cond = await tx.conditional.findFirst({ where: { id, storeId: req.storeId },
        include: { items: true }
      });

      if (!cond || cond.storeId !== req.storeId) throw new Error('Condicional não encontrada.');
      if (cond.status === 'FINISHED' || cond.status === 'RETURNED') {
        throw new Error('Esta condicional já foi finalizada ou devolvida.');
      }

      // 1. Criar a Venda
      // Se não foram enviados itens específicos, vendemos TUDO da condicional
      // Se foram enviados, vendemos apenas os enviados e DEVOLVEMOS o resto ao estoque
      const finalItems = req.body.items || cond.items.map(i => ({ variationId: i.variationId, quantity: i.quantity, unitPrice: i.unitPrice }));
      const subtotal = finalItems.reduce((acc, i) => acc + (Number(i.unitPrice) * Number(i.quantity)), 0);

      const finalDiscount = discount !== undefined ? Number(discount) : cond.discount;
      const finalDiscountType = discountType !== undefined ? discountType : cond.discountType;
      const finalDeliveryFee = req.body.deliveryFee !== undefined ? Number(req.body.deliveryFee) : cond.deliveryFee;
      const finalDeliveryMethod = req.body.deliveryMethod !== undefined ? req.body.deliveryMethod : cond.deliveryMethod;

      const finalTotal = finalDiscountType === 'PERCENTAGE'
        ? (subtotal - (subtotal * (finalDiscount / 100))) + finalDeliveryFee
        : (subtotal - finalDiscount) + finalDeliveryFee;

      const sale = await tx.sale.create({
        data: {
          storeId: req.storeId,
          clientId: cond.clientId,
          userId: cond.userId,
          subtotal: subtotal,
          discount: finalDiscount,
          discountType: finalDiscountType,
          deliveryFee: finalDeliveryFee,
          deliveryMethod: finalDeliveryMethod,
          total: finalTotal,
          paymentMethod,
          paymentStatus: paymentMethod === 'A_COMBINAR' ? 'PENDING' : 'PAID',
          conditionalId: cond.id,
          items: {
            create: finalItems.map(item => ({
              variationId: item.variationId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              storeId: req.storeId
            }))
          }
        }
      });

      // Se foi parcial, precisamos devolver os itens que NÃO foram comprados ao estoque
      // E também ajustar os itens da condicional para refletir apenas o que foi vendido
      if (req.body.items) {
        for (const condItem of cond.items) {
          const soldItem = req.body.items.find(si => si.variationId === condItem.variationId);
          const quantityToReturn = condItem.quantity - (soldItem ? soldItem.quantity : 0);

          if (quantityToReturn > 0) {
            await tx.productVariation.updateMany({
              where: { id: condItem.variationId , storeId: req.storeId },
              data: { quantity: { increment: quantityToReturn } }
            });
          }
        }

        // Ajustar os itens da condicional no banco de dados para bater com a venda final
        await tx.conditionalItem.deleteMany({
          where: { conditionalId: cond.id, storeId: req.storeId }
        });
        
        if (finalItems.length > 0) {
          await tx.conditionalItem.createMany({
            data: finalItems.map(item => ({
              conditionalId: cond.id,
              variationId: item.variationId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              storeId: req.storeId
            }))
          });
        }
      }

      // 2. Atualizar status e valores financeiros da condicional para refletirem a venda
      await tx.conditional.updateMany({
        where: { id: id , storeId: req.storeId },
        data: { 
          status: 'FINISHED',
          subtotal: subtotal,
          discount: finalDiscount,
          discountType: finalDiscountType,
          deliveryFee: finalDeliveryFee,
          deliveryMethod: finalDeliveryMethod,
          total: finalTotal
        }
      });

      return sale;
    });

    res.json({ success: true, sale: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Devolver condicional (Estornar estoque)
exports.returnConditional = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.$transaction(async (tx) => {
      const cond = await tx.conditional.findFirst({ where: { id, storeId: req.storeId },
        include: { items: true }
      });

      if (!cond || cond.storeId !== req.storeId) throw new Error('Condicional não encontrada.');
      if (cond.status === 'FINISHED' || cond.status === 'RETURNED') {
        throw new Error('Esta condicional já foi finalizada ou devolvida.');
      }

      // 1. Devolver itens ao estoque
      for (const item of cond.items) {
        await tx.productVariation.updateMany({
      where: { id: item.variationId , storeId: req.storeId },
          data: { quantity: { increment: item.quantity } }
        });
      }

      // 2. Atualizar status
      await tx.conditional.updateMany({
      where: { id, storeId: req.storeId },
        data: { status: 'RETURNED' }
      });
    });

    res.json({ success: true, message: 'Condicional devolvida com sucesso.' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteConditional = async (req, res) => {
  const { id } = req.params;
  try {
    // Buscar a condicional para saber se precisamos devolver o estoque
    const cond = await prisma.conditional.findFirst({ where: { id, storeId: req.storeId },
      include: { items: true }
    });

    if (!cond) return res.status(404).json({ success: false, message: 'Não encontrada.' });

    await prisma.$transaction(async (tx) => {
      // Se estava pendente, devolve o estoque
      if (cond.status === 'PENDING' || cond.status === 'OVERDUE') {
        for (const item of cond.items) {
          await tx.productVariation.updateMany({
      where: { id: item.variationId , storeId: req.storeId },
            data: { quantity: { increment: item.quantity } }
          });
        }
      }

      // Deletar itens primeiro por causa da FK
      await tx.conditionalItem.deleteMany({ where: { conditionalId: id, storeId: req.storeId } });
      await tx.conditional.deleteMany({
      where: { id, storeId: req.storeId }
    });
    });

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Erro ao excluir.' });
  }
};
exports.updateConditional = async (req, res) => {
  const { id } = req.params;
  const { observation, orderNotes, returnDate, clientId, discount, discountType, deliveryFee, deliveryMethod } = req.body;

  try {
    const existing = await prisma.conditional.findFirst({ where: { id, storeId: req.storeId } });
    if (!existing) return res.status(404).json({ success: false, message: 'Não encontrada.' });

    // Re-calcular total se os valores financeiros mudarem
    let subtotal = existing.subtotal;
    let newDiscount = discount !== undefined ? Number(discount) : existing.discount;
    let newDiscountType = discountType !== undefined ? discountType : existing.discountType;
    let newDeliveryFee = deliveryFee !== undefined ? Number(deliveryFee) : existing.deliveryFee;

    const total = newDiscountType === 'PERCENTAGE'
      ? (subtotal - (subtotal * (newDiscount / 100))) + newDeliveryFee
      : (subtotal - newDiscount) + newDeliveryFee;

    const updated = await prisma.conditional.updateMany({
      where: { id, storeId: req.storeId },
      data: {
        observation,
        orderNotes,
        returnDate: returnDate ? new Date(returnDate) : undefined,
        clientId: clientId || undefined,
        discount: discount !== undefined ? Number(discount) : undefined,
        discountType,
        deliveryFee: deliveryFee !== undefined ? Number(deliveryFee) : undefined,
        deliveryMethod,
        total
      }
    });
    res.json({ success: true, conditional: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Erro ao atualizar condicional.' });
  }
};
