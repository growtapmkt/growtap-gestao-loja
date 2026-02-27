const prisma = require('../config/db');

// Listar todas as transações (com filtros de data)
exports.getTransactions = async (req, res) => {
  try {
    const { startDate, endDate, type, category } = req.query;
    
    let where = {};
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }
    if (type) where.type = type;
    if (category) where.category = category;

    // Forçar filtro por loja
    where.storeId = req.storeId;

    const transactions = await prisma.transaction.findMany({ /* req.storeId enforced via where object injected previously */
      where,
      orderBy: { date: 'desc' },
      include: {
        user: { select: { name: true } },
        sale: {
          select: { id: true }
        }
      }
    });

    res.json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar transações.' });
  }
};

// Criar uma nova transação (Entrada ou Despesa manual)
exports.createTransaction = async (req, res) => {
  try {
    const { type, description, subDescription, category, method, value, date } = req.body;
    const userId = req.user.id;

    const transaction = await prisma.transaction.create({
      data: {
        storeId: req.storeId,
        type,
        description,
        subDescription,
        category,
        method,
        value: Number(value),
        date: date ? new Date(date) : new Date(),
        userId
      }
    });

    res.status(201).json({ success: true, transaction });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Erro ao criar transação.' });
  }
};

// Obter resumo de caixa (Saldo, Vencimentos, etc)
exports.getSummary = async (req, res) => {
  try {
    // Saldo Total (Entradas - Saídas)
    const incomes = await prisma.transaction.aggregate({
      where: { type: 'IN', storeId: req.storeId },
      _sum: { value: true }
    });

    const expenses = await prisma.transaction.aggregate({
      where: { type: 'OUT', storeId: req.storeId },
      _sum: { value: true }
    });

    const currentBalance = (incomes._sum.value || 0) - (expenses._sum.value || 0);

    // Próximos Vencimentos (Aqui poderíamos ter um campo 'status' PENDING em despesas, 
    // mas por enquanto vamos simular ou buscar transações futuras se houver)
    // Para simplificar, vamos retornar o saldo atual.
    
    res.json({ 
      success: true, 
      balance: currentBalance,
      totalIncome: incomes._sum.value || 0,
      totalExpense: expenses._sum.value || 0
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar resumo.' });
  }
};

// Deletar transação
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se pertence à loja antes de deletar
    const existing = await prisma.transaction.findFirst({ 
      where: { id, storeId: req.storeId } 
    });
    
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Transação não encontrada.' });
    }

    await prisma.transaction.deleteMany({
      where: { id, storeId: req.storeId }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Erro ao excluir transação.' });
  }
};
