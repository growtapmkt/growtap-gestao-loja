const prisma = require('../config/db');

exports.getClients = async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      where: { storeId: req.storeId },
      include: {
        sales: { where: { storeId: req.storeId }, orderBy: { createdAt: 'desc' },
          take: 5
        },
        conditionals: { where: { status: 'PENDING', storeId: req.storeId },
          include: {
             items: { where: { storeId: req.storeId,  storeId: req.storeId }, include: { variation: { include: { product: true } } }
             }
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, clients });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao buscar clientes.' });
  }
};

exports.getClientStats = async (req, res) => {
  const { id } = req.params;
  try {
    const sales = await prisma.sale.findMany({
      where: { clientId: id, storeId: req.storeId }
    });

    const totalSpent = sales.reduce((acc, sale) => acc + sale.total, 0);
    const orderCount = sales.length;
    
    // Calculate last order
    const lastOrder = sales.length > 0 ? sales.sort((a,b) => b.createdAt - a.createdAt)[0].createdAt : null;

    // Return rate calculation (very simplified: based on finished vs partial returned conditionals)
    const conditionals = await prisma.conditional.findMany({
      where: { clientId: id, storeId: req.storeId }
    });
    
    const returnedConditionals = conditionals.filter(c => c.status === 'RETURNED').length;
    const returnRate = conditionals.length > 0 ? (returnedConditionals / conditionals.length) * 100 : 0;

    res.json({ 
      success: true, 
      stats: {
        totalSpent,
        orderCount,
        lastOrder,
        returnRate: returnRate.toFixed(1) + '%'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar estatísticas.' });
  }
};

exports.getClientById = async (req, res) => {
  const { id } = req.params;
  try {
    const client = await prisma.client.findFirst({
      where: { id, storeId: req.storeId },
      include: {
        sales: { where: { storeId: req.storeId }, orderBy: { createdAt: 'desc' }
        },
        conditionals: { where: { storeId: req.storeId }, include: {
            items: { where: { storeId: req.storeId }, include: { variation: { include: { product: true } } }
            }
          }
        }
      }
    });
    
    if (!client) {
      return res.status(404).json({ success: false, message: 'Cliente não encontrado.' });
    }
    
    res.json({ success: true, client });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao buscar cliente.' });
  }
};

exports.createClient = async (req, res) => {
  try {
    const data = { ...req.body };
    
    // Validar CPF e Email únicos na loja
    if (data.email) {
      const existingEmail = await prisma.client.findFirst({ where: { email: data.email, storeId: req.storeId } });
      if (existingEmail) return res.status(400).json({ success: false, message: 'Email já cadastrado.' });
    }
    if (data.cpf) {
      const existingCpf = await prisma.client.findFirst({ where: { cpf: data.cpf, storeId: req.storeId } });
      if (existingCpf) return res.status(400).json({ success: false, message: 'CPF já cadastrado.' });
    }

    // Converter birthday para objeto Date se existir
    if (data.birthday) {
      data.birthday = new Date(data.birthday);
    }

    // Adicionar storeId
    data.storeId = req.storeId;

    const client = await prisma.client.create({
      data: data,
      include: {
        sales: true,
        conditionals: true
      }
    });
    res.json({ success: true, client });
  } catch (error) {
    console.error(error);
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'CPF ou Email já cadastrado para outro cliente.' });
    }
    res.status(400).json({ success: false, message: 'Erro ao criar cliente. Verifique se os dados estão corretos.' });
  }
};

exports.updateClient = async (req, res) => {
  const { id } = req.params;
  try {
    const data = { ...req.body };
    
    // Converter birthday para objeto Date se existir
    if (data.birthday) {
      data.birthday = new Date(data.birthday);
    }

    const client = await prisma.client.findFirst({ where: { id, storeId: req.storeId } });
    if (!client) return res.status(404).json({ success: false, message: 'Cliente não encontrado.' });

    const updatedClient = await prisma.client.updateMany({
      where: { id, storeId: req.storeId },
      data: data,
      include: {
        sales: { where: { storeId: req.storeId }, orderBy: { createdAt: 'desc' },
          take: 5
        },
        conditionals: { where: { status: 'PENDING', storeId: req.storeId },
          include: {
            items: { where: { storeId: req.storeId }, include: { variation: { include: { product: true } } }
            }
          }
        }
      }
    });
    res.json({ success: true, client });
  } catch (error) {
    console.error(error);
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'CPF ou Email já cadastrado para outro cliente.' });
    }
    res.status(400).json({ success: false, message: 'Erro ao atualizar cliente.' });
  }
};

exports.deleteClient = async (req, res) => {
  const { id } = req.params;
  try {
    const client = await prisma.client.findFirst({ where: { id, storeId: req.storeId } });
    if (!client) return res.status(404).json({ success: false, message: 'Cliente não encontrado.' });
    
    await prisma.client.deleteMany({
      where: { id, storeId: req.storeId }
    });
    res.json({ success: true, message: 'Cliente excluído com sucesso.' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Erro ao excluir cliente.' });
  }
};
