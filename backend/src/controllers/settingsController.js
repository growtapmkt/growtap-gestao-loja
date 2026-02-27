const prisma = require('../config/db');

// Helper para validar storeId e garantir que a loja existe
const getValidStoreId = async (req) => {
  let storeId = req.storeId;

  if (storeId) {
    // Verifica se a loja existe
    const storeExists = await prisma.store.findFirst({
      where: { id: storeId , storeId: req.storeId }
    });
    if (storeExists) return storeId;
  }

  // Se o ID do token for inválido (store deletada) ou inexistente, tenta recuperar via user
  if (req.user && req.user.id) {
    const user = await prisma.user.findFirst({
      where: { id: req.user.id, storeId: req.storeId || undefined },
      select: { storeId: true }
    });

    if (user && user.storeId) {
      // Verifica se essa nova loja existe
      const freshStore = await prisma.store.findFirst({
      where: { id: user.storeId , storeId: req.storeId }
    });
      if (freshStore) return user.storeId;
    }
  }

  return null;
};

exports.getSettings = async (req, res) => {
  try {
    const storeId = await getValidStoreId(req);

    if (!storeId) {
      return res.status(401).json({ success: false, message: 'Loja não encontrada. Por favor, faça login novamente.' });
    }

    let settings = await prisma.storeSettings.findFirst({
      where: { storeId: storeId } // req.storeId enforced
    });

    if (!settings) {
      // Criar configurações padrão se não existir
      settings = await prisma.storeSettings.create({
        data: {
          storeId: storeId,
          storeName: 'Minha Loja',
        }
      });
    }

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar configurações.' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const storeId = await getValidStoreId(req);

    if (!storeId) {
      return res.status(401).json({ success: false, message: 'Loja não encontrada. Por favor, faça login novamente.' });
    }

    // Remove campos protegidos ou inexistentes no schema
    const { id, storeId: _storeId, store, createdAt, updatedAt, catalogTheme, previewMobile, ...dataToUpdate } = req.body;

    const settings = await prisma.storeSettings.upsert({
      where: { storeId: storeId }, // req.storeId explicit in where
      update: {
        ...dataToUpdate,
        updatedAt: new Date(),
        storeId: storeId
      },
      create: {
        storeId: storeId,
        ...dataToUpdate
      }
    });

    res.json({
      success: true,
      settings,
      message: 'Configurações atualizadas com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);

    if (error.code === 'P2003') {
      return res.status(400).json({ success: false, message: 'Erro de integridade: Loja não encontrada. Tente fazer login novamente.' });
    }

    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar configurações.',
      debug: error.message
    });
  }
};
