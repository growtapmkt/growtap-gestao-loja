const prisma = require('../config/db');

exports.createCategory = async (req, res) => {
  try {
    const { 
      name, description, parentId, 
      type, status, order, 
      public: publico, seasonality, expectedMargin 
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'O nome da categoria é obrigatório.' });
    }

    // Check existing name within the store
    const existing = await prisma.category.findFirst({ 
      where: { 
        name,
        storeId: req.storeId 
      } 
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Já existe uma categoria com este nome.' });
    }

    const category = await prisma.category.create({
      data: {
        storeId: req.storeId,
        name,
        description: description || null,
        parentId: parentId || null,
        type: type || 'ROUPA',
        status: status || 'ATIVA',
        order: parseInt(order) || 0,
        public: publico || 'UNISSEX',
        seasonality: seasonality || 'ATEMPORAL',
        expectedMargin: expectedMargin ? parseFloat(expectedMargin) : null
      }
    });

    res.status(201).json({ success: true, category });
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    res.status(500).json({ success: false, message: 'Erro interno ao criar categoria.' });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const { status } = req.query;
    const categories = await prisma.category.findMany({
      where: {
        storeId: req.storeId,
        status: status ? status : undefined
      },
      orderBy: [
        { order: 'asc' },
        { name: 'asc' }
      ],
      include: {
        parent: {
          select: { name: true }
        },
        _count: {
          select: { products: true }
        }
      }
    });

    res.json({ success: true, categories });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar categorias.' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, description, parentId, 
      type, status, order, 
      public: publico, seasonality, expectedMargin 
    } = req.body;

    const existing = await prisma.category.findFirst({ 
      where: { id, storeId: req.storeId } 
    });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Categoria não encontrada.' });
    }

    const updated = await prisma.category.updateMany({
      where: { id, storeId: req.storeId },
      data: {
        name: name || undefined,
        description: description !== undefined ? description : undefined,
        parentId: parentId !== undefined ? parentId : undefined,
        type: type || undefined,
        status: status || undefined,
        order: order !== undefined ? parseInt(order) : undefined,
        public: publico || undefined,
        seasonality: seasonality || undefined,
        expectedMargin: expectedMargin !== undefined ? parseFloat(expectedMargin) : undefined
      }
    });

    res.json({ success: true, category: updated });
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    res.status(500).json({ success: false, message: 'Erro ao atualizar categoria.' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se existem produtos vinculados e se pertence à loja
    const category = await prisma.category.findFirst({
      where: { id, storeId: req.storeId },
      include: { _count: { select: { products: true } } }
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Categoria não encontrada.' });
    }

    if (category._count.products > 0) {
      // Regra: Inativar em vez de excluir se houver produtos
      await prisma.category.updateMany({
      where: { id, storeId: req.storeId },
        data: { status: 'INATIVA' }
      });
      return res.json({ 
        success: true, 
        message: 'A categoria possui produtos vinculados e foi inativada por segurança.' 
      });
    }

    await prisma.category.deleteMany({
      where: { id, storeId: req.storeId }
    });
    res.json({ success: true, message: 'Categoria excluída com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir categoria:', error);
    res.status(500).json({ success: false, message: 'Erro ao excluir categoria.' });
  }
};
