const prisma = require('../config/db');

exports.createBrand = async (req, res) => {
  try {
    const { 
      name, cnpj, email, phone, contactPerson, 
      cep, address, number, complement, neighborhood, 
      city, state, website, notes, active,
      whatsapp, instagram, registrationType
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'O nome da marca é obrigatório.' });
    }



    const existing = await prisma.brand.findFirst({ where: { name, storeId: req.storeId } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Já existe uma marca com este nome.' });
    }

    if (cnpj) {
      const existingCnpj = await prisma.brand.findFirst({ where: { cnpj, storeId: req.storeId } });
      if (existingCnpj) {
        return res.status(400).json({ success: false, message: 'Já existe uma marca com este CNPJ.' });
      }
    }

    const brand = await prisma.brand.create({
      data: {
        storeId: req.storeId,
        name,
        cnpj: cnpj || null,
        email: email || null,
        phone: phone || null,
        contactPerson: contactPerson || null,
        cep: cep || null,
        address: address || null,
        number: number || null,
        complement: complement || null,
        neighborhood: neighborhood || null,
        city: city || null,
        state: state || null,
        website: website || null,
        notes: notes || null,
        whatsapp: whatsapp || null,
        instagram: instagram || null,
        registrationType: registrationType || 'COMPLETE',
        active: active !== false
      }
    });

    res.status(201).json({ success: true, brand });
  } catch (error) {
    console.error('Erro ao criar marca:', error);
    res.status(500).json({ success: false, message: 'Erro interno ao criar marca.' });
  }
};

exports.getAllBrands = async (req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      where: { storeId: req.storeId },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    res.json({ success: true, brands });
  } catch (error) {
    console.error('Erro ao buscar marcas:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar marcas.' });
  }
};

exports.updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, cnpj, email, phone, contactPerson, 
      cep, address, number, complement, neighborhood, 
      city, state, website, notes, active,
      whatsapp, instagram, registrationType
    } = req.body;

    const existing = await prisma.brand.findFirst({ where: { id, storeId: req.storeId } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Marca não encontrada.' });
    }

    const updated = await prisma.brand.updateMany({
      where: { id, storeId: req.storeId },
      data: {
        name: name || undefined,
        cnpj: cnpj !== undefined ? cnpj : undefined,
        email: email !== undefined ? email : undefined,
        phone: phone !== undefined ? phone : undefined,
        contactPerson: contactPerson !== undefined ? contactPerson : undefined,
        cep: cep !== undefined ? cep : undefined,
        address: address !== undefined ? address : undefined,
        number: number !== undefined ? number : undefined,
        complement: complement !== undefined ? complement : undefined,
        neighborhood: neighborhood !== undefined ? neighborhood : undefined,
        city: city !== undefined ? city : undefined,
        state: state !== undefined ? state : undefined,
        website: website !== undefined ? website : undefined,
        notes: notes !== undefined ? notes : undefined,
        active: active !== undefined ? active : undefined,
        whatsapp: whatsapp !== undefined ? whatsapp : undefined,
        instagram: instagram !== undefined ? instagram : undefined,
        registrationType: registrationType !== undefined ? registrationType : undefined
      }
    });

    res.json({ success: true, brand: updated });
  } catch (error) {
    console.error('Erro ao atualizar marca:', error);
    res.status(500).json({ success: false, message: 'Erro ao atualizar marca.' });
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await prisma.brand.findFirst({
      where: { id, storeId: req.storeId },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!brand) {
      return res.status(404).json({ success: false, message: 'Marca não encontrada.' });
    }

    if (brand._count.products > 0) {
      // Inativar pois tem produtos vinculados
      await prisma.brand.updateMany({
      where: { id, storeId: req.storeId },
        data: { active: false }
      });
      return res.json({ 
        success: true, 
        message: 'A marca possui produtos vinculados e foi inativada por segurança.' 
      });
    }

    await prisma.brand.deleteMany({
      where: { id, storeId: req.storeId }
    });
    res.json({ success: true, message: 'Marca excluída com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir marca:', error);
    res.status(500).json({ success: false, message: 'Erro ao excluir marca.' });
  }
};
