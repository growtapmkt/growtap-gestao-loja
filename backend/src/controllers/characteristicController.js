const prisma = require('../config/db');

exports.createCharacteristic = async (req, res) => {
  try {
    const { name, options, status, order } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'O nome da característica é obrigatório.' });
    }

    const existing = await prisma.characteristic.findFirst({ where: { name, storeId: req.storeId } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Já existe uma característica com este nome.' });
    }

    const characteristic = await prisma.characteristic.create({
      data: {
        storeId: req.storeId,
        name,
        options: options || null,
        status: status || 'ATIVA',
        order: parseInt(order) || 0
      }
    });

    res.status(201).json({ success: true, characteristic });
  } catch (error) {
    console.error('Erro ao criar característica:', error);
    res.status(500).json({ success: false, message: 'Erro interno ao criar característica.' });
  }
};

exports.getAllCharacteristics = async (req, res) => {
  try {
    const { status } = req.query;
    const characteristics = await prisma.characteristic.findMany({
      where: {
        storeId: req.storeId,
        status: status ? status : undefined
      },
      orderBy: [
        { order: 'asc' },
        { name: 'asc' }
      ],
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    res.json({ success: true, characteristics });
  } catch (error) {
    console.error('Erro ao buscar características:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar características.' });
  }
};

exports.updateCharacteristic = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, options, status, order } = req.body;

    const existing = await prisma.characteristic.findFirst({ where: { id, storeId: req.storeId } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Característica não encontrada.' });
    }

    const updated = await prisma.characteristic.updateMany({
      where: { id, storeId: req.storeId },
      data: {
        name: name || undefined,
        options: options !== undefined ? options : undefined,
        status: status || undefined,
        order: order !== undefined ? parseInt(order) : undefined
      }
    });

    res.json({ success: true, characteristic: updated });
  } catch (error) {
    console.error('Erro ao atualizar característica:', error);
    res.status(500).json({ success: false, message: 'Erro ao atualizar característica.' });
  }
};

exports.deleteCharacteristic = async (req, res) => {
  try {
    const { id } = req.params;

    const characteristic = await prisma.characteristic.findFirst({
      where: { id, storeId: req.storeId },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!characteristic) {
      return res.status(404).json({ success: false, message: 'Característica não encontrada.' });
    }

    if (characteristic._count.products > 0) {
      // Regra: Inativar em vez de excluir se estiver sendo usada
      await prisma.characteristic.updateMany({
      where: { id, storeId: req.storeId },
        data: { status: 'INATIVA' }
      });
      return res.json({ 
        success: true, 
        message: 'A característica está vinculada a produtos e foi inativada por segurança.' 
      });
    }

    await prisma.characteristic.deleteMany({
      where: { id, storeId: req.storeId }
    });
    res.json({ success: true, message: 'Característica excluída com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir característica:', error);
    res.status(500).json({ success: false, message: 'Erro ao excluir característica.' });
  }
};
