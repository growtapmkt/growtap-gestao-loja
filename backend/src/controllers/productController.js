const prisma = require('../config/db');

exports.getAllProducts = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(limit) || null;

    const where = { storeId: req.storeId };

    const queryOptions = {
      where,
      include: {
        variations: { orderBy: { order: 'asc' } },
        category: true,
        brand: true,
        characteristics: {
          include: {
            characteristic: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    };

    if (pageSize) {
      queryOptions.skip = (pageNumber - 1) * pageSize;
      queryOptions.take = pageSize;
    }

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany(queryOptions),
      prisma.product.count({ where })
    ]);

    res.json({
      success: true,
      count: products.length,
      total: totalCount,
      page: pageNumber,
      pages: pageSize ? Math.ceil(totalCount / pageSize) : 1,
      products,
    });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar produtos no banco de dados.'
    });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const {
      name, sku, description, categoryId, price,
      barcode, isCombo, isFractional, controlStock,
      availableQty, minStockQty, catalogMinStock,
      receiptMessage, supplier, brandId, cost, profitPercent, profitAmount,
      showInCatalog, isPromotionalPrice, promotionalDiscountPercentage, promotionalPrice, variations, image, images, characteristics
    } = req.body;

    // Sincronizar image (capa) com images[0] se necessário
    const finalImages = Array.isArray(images) ? images : (image ? [image] : []);
    const coverImage = image || (finalImages.length > 0 ? finalImages[0] : null);

    // 1. Validar campos obrigatórios
    if (!name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Nome e Preço são obrigatórios.'
      });
    }

    // 2. Verificar se o SKU já existe (somente se preenchido)
    if (sku && sku.trim() !== '') {
      const existingProduct = await prisma.product.findFirst({
        where: { sku: sku.trim(), storeId: req.storeId }
      });

      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'Já existe um produto com este SKU.'
        });
      }
    }

    // 3. Criar o produto com variações e imagem
    // 3. Criar o produto com Sequencial Formatado (ERP)
    const newProduct = await prisma.$transaction(async (tx) => {
      let nextDisplayId;

      // a) Configurações de Código
      const storeConfig = await tx.store.findUnique({
        where: { id: req.storeId },
        select: { productPrefix: true, productPadding: true }
      });
      const prefix = storeConfig?.productPrefix || 'PROD';
      const padding = storeConfig?.productPadding || 4;

      // b) Gerenciar contador sequencial (Produto + Variações)
      const variationsCount = variations ? variations.length : 0;

      let startVarCode = 0;

      const counter = await tx.storeCounter.findUnique({
        where: { storeId: req.storeId }
      });

      if (counter) {
        // Incrementa em lote para produto e variação
        const updated = await tx.storeCounter.update({
          where: { storeId: req.storeId },
          data: {
            productCount: { increment: 1 },
            variationCount: { increment: variationsCount }
          },
          select: { productCount: true, variationCount: true }
        });
        nextDisplayId = updated.productCount;
        // Se criei N variações, meu range é [updated.variationCount - N + 1, updated.variationCount]
        startVarCode = updated.variationCount - variationsCount + 1;
      } else {
        // Se não existir, busca último produto para backfill básico
        const lastProduct = await tx.product.findFirst({
          where: { storeId: req.storeId },
          orderBy: { displayId: 'desc' },
          select: { displayId: true }
        });
        nextDisplayId = (lastProduct?.displayId || 0) + 1;

        // Cria novo contador (Inicia variationCount em variationsCount se houver)
        await tx.storeCounter.create({
          data: {
            storeId: req.storeId,
            productCount: nextDisplayId,
            variationCount: variationsCount
          }
        });
        startVarCode = 1;
      }

      // c) Format: PROD-0001
      const formattedCode = `${prefix}-${String(nextDisplayId).padStart(padding, '0')}`;

      // d) Criar produto
      return await tx.product.create({
        data: {
          displayId: nextDisplayId,
          productCode: formattedCode,
          storeId: req.storeId,
          name,
          sku: sku ? sku.trim() : null,
          description: description || null,
          categoryId: categoryId || null,
          price: parseFloat(price),
          barcode,
          image: coverImage,
          images: finalImages,
          isCombo: !!isCombo,
          isFractional: !!isFractional,
          controlStock: controlStock !== undefined ? !!controlStock : true,
          availableQty: availableQty !== undefined ? parseInt(availableQty) : 0,
          minStockQty: minStockQty !== undefined ? parseInt(minStockQty) : 0,
          catalogMinStock: catalogMinStock !== undefined ? parseInt(catalogMinStock) : 0,
          receiptMessage: receiptMessage || null,
          brandId: brandId || null, // Se brandId for vazio, passa null
          supplier, // Legacy
          cost: cost !== undefined ? parseFloat(cost) : 0,
          profitPercent: profitPercent !== undefined ? parseFloat(profitPercent) : 0,
          profitAmount: profitAmount !== undefined ? parseFloat(profitAmount) : 0,
          isPromotionalPrice: !!isPromotionalPrice,
          promotionalDiscountPercentage: promotionalDiscountPercentage !== undefined && promotionalDiscountPercentage !== null ? parseFloat(promotionalDiscountPercentage) : null,
          promotionalPrice: promotionalPrice !== undefined && promotionalPrice !== null ? parseFloat(promotionalPrice) : null,
          showInCatalog: showInCatalog !== undefined ? !!showInCatalog : true,
          active: true,
          variations: {
            create: variations && variations.length > 0 ? variations.map((v, idx) => ({
              variationCode: startVarCode + idx, // <--- Código Sequencial ERP
              color: v.primaryValue || v.color,
              size: v.secondaryValue || v.size,
              quantity: parseInt(v.stock || v.quantity || 0) || 0,
              images: v.images || [],
              order: idx,
              storeId: req.storeId
            })) : []
          },
          characteristics: {
            create: characteristics && characteristics.length > 0 ? characteristics.map(c => ({
              characteristicId: c.characteristicId,
              value: c.value,
              storeId: req.storeId
            })) : []
          }
        },
        include: {
          variations: { orderBy: { order: 'asc' } }, // Incluir variações no retorno
          characteristics: true,
          brand: true
        }
      });
    });

    res.status(201).json({
      success: true,
      message: 'Produto cadastrado com sucesso!',
      product: newProduct
    });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno ao cadastrar produto.'
    });
  }
};

exports.addVariation = async (req, res) => {
  try {
    const { productId } = req.params;
    const { color, size, quantity } = req.body;

    // 1. Validar campos
    if ((!size && !color) || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'É necessário informar Cor ou Tamanho, e a Quantidade.'
      });
    }

    if (quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'A quantidade não pode ser negativa.'
      });
    }

    // 2. Verificar se o produto existe
    const product = await prisma.product.findFirst({
      where: { id: productId, storeId: req.storeId }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado.'
      });
    }

    // 3. Verificar se já existe essa variação (mesma cor e tamanho)
    const existingVariation = await prisma.productVariation.findFirst({ where: { productId, color: color || null, size, storeId: req.storeId } });

    if (existingVariation) {
      return res.status(400).json({
        success: false,
        message: 'Já existe uma variação com esta cor e tamanho para este produto.'
      });
    }

    // 4. Criar a variação com código sequencial (Transacional)
    const newVariation = await prisma.$transaction(async (tx) => {
      // a) Incrementar contador
      let varCode = 0;
      const counter = await tx.storeCounter.findUnique({ where: { storeId: req.storeId } });

      if (counter) {
        const updated = await tx.storeCounter.update({
          where: { storeId: req.storeId },
          data: { variationCount: { increment: 1 } },
          select: { variationCount: true }
        });
        varCode = updated.variationCount;
      } else {
        // Se não existir, cria (Fallback)
        await tx.storeCounter.create({
          data: {
            storeId: req.storeId,
            variationCount: 1,
            productCount: 0 // Mantém 0 pois só queremos variação agora? Não, isso é arriscado se já tiver produtos.
            // Melhor assumir que se chegou aqui sem contador, algo tá errado, mas vamos seguir.
          }
        });
        varCode = 1;
      }

      // b) Criar
      return await tx.productVariation.create({
        data: {
          productId,
          color: color || '',
          size,
          quantity: parseInt(quantity),
          variationCode: varCode,
          active: true,
          order: 9999,
          storeId: req.storeId
        }
      });
    });

    res.status(201).json({
      success: true,
      message: 'Variação adicionada com sucesso!',
      variation: newVariation
    });
  } catch (error) {
    console.error('Erro ao adicionar variação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno ao adicionar variação.'
    });
  }
};

exports.deleteVariation = async (req, res) => {
  try {
    const { variationId } = req.params;

    const variation = await prisma.productVariation.findFirst({
      where: { id: variationId, storeId: req.storeId }
    });

    if (!variation) {
      return res.status(404).json({
        success: false,
        message: 'Variação não encontrada.'
      });
    }

    // 1. Verificar se a variação tem vendas
    const hasSales = await prisma.saleItem.findFirst({
      where: { variationId }
    });

    if (hasSales) {
      // Bloqueio de Hard Delete (Requisito de Segurança)
      return res.status(400).json({
        success: false,
        message: 'Esta variação possui histórico de vendas e não pode ser excluída. Por favor, utilize a opção "Desativar" (active=false) para removê-la da lista de vendas.'
      });
    }

    // 2. Se não tem vendas, pode excluir (Hard Delete seguro)
    await prisma.productVariation.deleteMany({
      where: { id: variationId, storeId: req.storeId }
    });

    res.json({
      success: true,
      message: 'Variação removida com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao excluir variação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno ao excluir variação.'
    });
  }
};

exports.updateVariation = async (req, res) => {
  try {
    const { variationId } = req.params;
    const { color, size, quantity } = req.body;

    const variation = await prisma.productVariation.findFirst({
      where: { id: variationId, storeId: req.storeId }
    });

    if (!variation) {
      return res.status(404).json({
        success: false,
        message: 'Variação não encontrada.'
      });
    }

    const newQty = quantity !== undefined ? parseInt(quantity) : variation.quantity;
    // Permite atualizar também o status (active)
    const updateData = {
      color: color !== undefined ? color : undefined,
      size: size !== undefined ? size : undefined,
      quantity: newQty,
      active: req.body.active !== undefined ? req.body.active : undefined, // Soft Delete param
      lastEntryDate: newQty > variation.quantity ? new Date() : undefined
    };

    // Clean undefined keys
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const updatedVariation = await prisma.productVariation.updateMany({
      where: { id: variationId, storeId: req.storeId },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Variação atualizada com sucesso!',
      variation: updatedVariation
    });
  } catch (error) {
    console.error('Erro ao atualizar variação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno ao atualizar variação.'
    });
  }
};

exports.updateProduct = async (req, res) => {
  // --- Helpers de Sanitização e Segurança (Zero Trust) ---
  const toFloat = (val) => {
    if (val === undefined || val === null || val === '') return undefined;
    const strVal = String(val).trim().replace(',', '.');
    const parsed = parseFloat(strVal);
    // Proteção contra Infinity ou NaN
    return isFinite(parsed) ? parsed : undefined;
  };

  const toInt = (val) => {
    if (val === undefined || val === null || val === '') return undefined;
    const strVal = String(val).trim();
    const parsed = parseInt(strVal, 10);
    return isFinite(parsed) ? parsed : undefined;
  };

  const toBool = (val) => {
    if (val === undefined || val === null) return undefined;
    return String(val) === 'true' || val === true;
  };

  const toStrArray = (arr) => {
    if (!Array.isArray(arr)) return undefined;
    // Filtra strings vazias e garante tipo String
    return arr
      .map(item => String(item || '').trim())
      .filter(item => item !== '' && item !== 'null' && item !== 'undefined');
  };

  try {
    const { productId } = req.params;
    const body = req.body;
    const storeId = req.storeId; // Contexto de segurança

    // --- Início da Transação Interativa (ACID) ---
    const updatedProduct = await prisma.$transaction(async (tx) => {
      // 1. Verificar Existência, Propriedade e Optimistic Locking
      const existingProduct = await tx.product.findFirst({
        where: { id: productId, storeId: storeId },
        select: { id: true, sku: true, updatedAt: true }
      });

      if (!existingProduct) {
        throw new Error('PRODUCT_NOT_FOUND');
      }

      // [ENTERPRISE] Optimistic Concurrency Control
      // Se o frontend enviar 'lastUpdatedAt', garantimos que ninguém mexeu no registro antes
      if (body.lastUpdatedAt) {
        const dbTime = new Date(existingProduct.updatedAt).getTime();
        const reqTime = new Date(body.lastUpdatedAt).getTime();
        // Tolerância de 1s para drifts de relógio
        if (Math.abs(dbTime - reqTime) > 1000) {
          throw new Error('CONCURRENCY_CONFLICT');
        }
      }

      // 2. Validação de SKU Duplicado (Store Scoped)
      if (body.sku && body.sku !== existingProduct.sku) {
        const checkSku = await tx.product.findFirst({
          where: {
            sku: String(body.sku).trim(),
            storeId: storeId,
            id: { not: productId }
          },
          select: { id: true }
        });
        if (checkSku) throw new Error('DUPLICATE_SKU');
      }

      // 3. Montagem do Payload Seguro (Allowlist strategy)
      const data = {};

      // Strings
      if (body.name !== undefined) data.name = String(body.name).trim();
      if (body.sku !== undefined) data.sku = body.sku ? String(body.sku).trim() : null;
      if (body.description !== undefined) data.description = body.description;

      // Nullables
      if (body.supplier !== undefined) data.supplier = body.supplier ? String(body.supplier).trim() : null;
      if (body.barcode !== undefined) data.barcode = body.barcode ? String(body.barcode).trim() : null;
      if (body.receiptMessage !== undefined) data.receiptMessage = body.receiptMessage || null;

      // Foreign Keys
      if (body.categoryId !== undefined) data.categoryId = body.categoryId || null;
      if (body.brandId !== undefined) data.brandId = body.brandId || null;

      // Numéricos (Sanitizados)
      const numericFields = {
        price: toFloat(body.price),
        cost: toFloat(body.cost),
        profitPercent: toFloat(body.profitPercent),
        profitAmount: toFloat(body.profitAmount),
        availableQty: toInt(body.availableQty),
        minStockQty: toInt(body.minStockQty),
        catalogMinStock: toInt(body.catalogMinStock),
        promotionalDiscountPercentage: toFloat(body.promotionalDiscountPercentage),
        promotionalPrice: toFloat(body.promotionalPrice)
      };

      Object.keys(numericFields).forEach(key => {
        if (numericFields[key] !== undefined) data[key] = numericFields[key];
        if (body[key] === null) data[key] = null; // permite anular explicitamente
      });

      // Booleanos
      ['active', 'isCombo', 'isFractional', 'controlStock', 'showInCatalog', 'isPromotionalPrice'].forEach(field => {
        if (body[field] !== undefined) {
          data[field] = toBool(body[field]);
        }
      });

      // Imagens (Lógica unificada para evitar desincronia entre 'image' e 'images')
      if (body.images !== undefined) {
        data.images = toStrArray(body.images) || [];
        data.image = data.images.length > 0 ? data.images[0] : null;
      } else if (body.image !== undefined) {
        const singleImg = body.image ? String(body.image).trim() : null;
        data.image = singleImg || null; // Se string vazia, vira null
        data.images = singleImg ? [singleImg] : [];
      }

      // 4. Executar Update do Produto Base
      await tx.product.updateMany({
        where: { id: productId, storeId: req.storeId },
        data: data
      });

      // 5. Gestão de Variações (Lógica Refatorada e Segura - Smart Reconcile v3 - Com Contadores)
      if (Array.isArray(body.variations)) {
        console.log(`[UpdateProduct] Iniciando sincronização de ${body.variations.length} variações para o Produto ${productId}`);

        // a) Indexar variações existentes
        const existingVariations = await tx.productVariation.findMany({ where: { productId } });
        const existingVarMap = new Map(existingVariations.map(v => [v.id, v]));
        const existingSigMap = new Map();

        existingVariations.forEach(ev => {
          const dbColor = (ev.color || '').trim().toLowerCase();
          const dbSize = (ev.size || '').trim().toLowerCase();
          const sig = `${dbColor}||${dbSize}`;
          existingSigMap.set(sig, ev);
        });

        const processedIds = new Set();
        const payloadSignatures = new Set();

        // b) Contagem prévia de NOVAS variações para reservar códigos em lote
        let newItemsCount = 0;
        for (const v of body.variations) {
          const color = v.primaryValue ? String(v.primaryValue).trim() : (v.color ? String(v.color).trim() : '');
          const size = v.secondaryValue ? String(v.secondaryValue).trim() : (v.size ? String(v.size).trim() : '');
          const currentSig = `${color.toLowerCase()}||${size.toLowerCase()}`;

          // Se tem ID válido OU assinatura válida -> Existe. Senão -> Novo.
          const exists = (v.id && existingVarMap.has(v.id)) || existingSigMap.has(currentSig);
          if (!exists) {
            newItemsCount++;
          }
        }

        let startVarCode = 0;
        if (newItemsCount > 0) {
          const counter = await tx.storeCounter.update({
            where: { storeId: req.storeId },
            data: { variationCount: { increment: newItemsCount } },
            select: { variationCount: true }
          });
          startVarCode = counter.variationCount - newItemsCount + 1;
        }

        let createdCount = 0; // Usado para acessar o bloco reservado
        let vIdx = 0; // Para ordenar as variações de acordo com a lista enviada

        for (const v of body.variations) {
          const color = v.primaryValue ? String(v.primaryValue).trim() : (v.color ? String(v.color).trim() : '');
          const size = v.secondaryValue ? String(v.secondaryValue).trim() : (v.size ? String(v.size).trim() : '');
          const rawQty = v.stock !== undefined ? v.stock : (v.quantity !== undefined ? v.quantity : 0);
          const quantity = Math.max(0, parseInt(rawQty) || 0);
          const images = toStrArray(v.images) || [];
          const active = v.active !== undefined ? v.active : true; // Default true se não enviado

          if (!size && !color) {
            throw new Error(`VARIATION_ERROR: É necessário informar Cor ou Tamanho.`);
          }

          const currentSig = `${color.toLowerCase()}||${size.toLowerCase()}`;
          if (payloadSignatures.has(currentSig)) {
            throw new Error(`VARIATION_ERROR: Variação duplicada no envio (Cor: ${color}, Tamanho: ${size}).`);
          }
          payloadSignatures.add(currentSig);

          let targetVar = null;
          if (v.id && existingVarMap.has(v.id)) {
            targetVar = existingVarMap.get(v.id);
          } else if (existingSigMap.has(currentSig)) {
            targetVar = existingSigMap.get(currentSig);
          }

          if (targetVar) {
            // UPDATE
            if (processedIds.has(targetVar.id)) {
              throw new Error(`VARIATION_ERROR: Conflito de dados nas variações.`);
            }

            await tx.productVariation.updateMany({
              where: { id: targetVar.id, storeId: req.storeId },
              data: {
                color, size, quantity, images, active,
                order: vIdx++,
                lastEntryDate: quantity > targetVar.quantity ? new Date() : undefined
              }
            });
            processedIds.add(targetVar.id);

          } else {
            // CREATE (usando código reservado)
            const myCode = startVarCode + createdCount;
            createdCount++;

            await tx.productVariation.create({
              data: {
                productId, color, size, quantity, images, active,
                order: vIdx++,
                variationCode: myCode, // <--- Código do ERP
                storeId: req.storeId
              }
            });
          }
        }

        // c) Identificar e Deletar variações omitidas
        const variationsToDelete = existingVariations.filter(ev => !processedIds.has(ev.id));

        if (variationsToDelete.length > 0) {
          for (const ev of variationsToDelete) {
            // Verificar se tem venda ANTES de deletar (Segurança Adicional)
            const hasSales = await tx.saleItem.findFirst({ where: { variationId: ev.id } });

            if (hasSales) {
              // Se o usuário removeu da lista, mas tem venda -> não posso deletar. 
              // A instrução diz "Retornar erro claro".
              const name = `${ev.color ? ev.color + ' - ' : ''}${ev.size}`;
              throw new Error(`VARIATION_IN_USE: A variação '${name}' possui vendas e não pode ser excluída. Por favor, desative-a em vez de excluir.`);
            } else {
              // Hard delete seguro
              await tx.productVariation.deleteMany({
                where: { id: ev.id, storeId: req.storeId }
              });
            }
          }
        }
      }

      // 6. Características (Wipe & Replace Strategy)
      if (body.characteristics !== undefined) {
        await tx.productCharacteristic.deleteMany({ where: { productId, storeId: req.storeId } });

        if (Array.isArray(body.characteristics) && body.characteristics.length > 0) {
          const validChars = body.characteristics
            .filter(c => c.characteristicId && c.value)
            .map(c => ({
              productId,
              characteristicId: c.characteristicId,
              value: String(c.value).trim(),
              storeId: req.storeId
            }));

          if (validChars.length > 0) {
            await tx.productCharacteristic.createMany({
              data: validChars
            });
          }
        }
      }

      // 7. Retorno (Read-Your-Writes Consistency)
      return await tx.product.findUnique({
        where: { id: productId },
        include: {
          variations: { orderBy: { order: 'asc' } },
          category: true,
          brand: true,
          characteristics: { include: { characteristic: true } }
        }
      });
    }, {
      maxWait: 5000,
      timeout: 20000 // 20s para garantir operações pesadas de imagem/variação
    });

    res.json({
      success: true,
      message: 'Produto atualizado com sucesso!',
      product: updatedProduct
    });

  } catch (error) {
    console.error(`Erro Crítico UpdateProduct [Store: ${req.storeId}, Prod: ${req.params.productId}]:`, error);

    const errorMap = {
      'PRODUCT_NOT_FOUND': { status: 404, msg: 'Produto não encontrado.' },
      'DUPLICATE_SKU': { status: 400, msg: 'Já existe outro produto com este SKU.' },
      'CONCURRENCY_CONFLICT': { status: 409, msg: 'O produto foi alterado por outro usuário. Recarregue a página.' }
    };

    if (errorMap[error.message]) {
      const { status, msg } = errorMap[error.message];
      return res.status(status).json({ success: false, message: msg });
    }

    // Erros customizados de Variação
    if (error.message && (error.message.startsWith('VARIATION_ERROR') || error.message.startsWith('VARIATION_IN_USE'))) {
      // Remove o prefixo técnico da mensagem
      const cleanMsg = error.message.replace(/^(VARIATION_ERROR|VARIATION_IN_USE):\s*/, '');
      return res.status(400).json({ success: false, message: cleanMsg });
    }

    // Fallback: Erro de Constraint do Prisma
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Dados duplicados (SKU ou Código) detectados.' });
    }

    res.status(500).json({
      success: false,
      message: 'Erro interno ao atualizar produto.',
      error: error.message
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const exist = await prisma.product.findFirst({
      where: { id: productId, storeId: req.storeId }
    });
    if (!exist) {
      return res.status(404).json({ success: false, message: 'Produto não encontrado.' });
    }

    // Primeiro deletar variações (devido ao relacionamento se não houver cascade)
    // Se no prisma schema estiver com onDelete: Cascade, isso não é necessário explicitamente.
    // Mas por segurança:
    // 1. Verificar se pode excluir (Deep check for sales)
    const activeSales = await prisma.saleItem.findFirst({
      where: {
        variation: {
          productId: productId
        }
      }
    });

    if (activeSales) {
      // Bloqueio de Hard Delete - Transforma em Soft Delete
      await prisma.$transaction([
        prisma.product.updateMany({
          where: { id: productId, storeId: req.storeId }, data: { active: false }
        }),
        prisma.productVariation.updateMany({ where: { productId }, data: { active: false } })
      ]);

      return res.json({
        success: true,
        message: 'Produto arquivado com sucesso (possui histórico de vendas).'
      });
    }

    // 2. Se limpo, Hard Delete
    await prisma.productVariation.deleteMany({ where: { productId, storeId: req.storeId } });

    await prisma.productCharacteristic.deleteMany({ where: { productId, storeId: req.storeId } });

    await prisma.product.deleteMany({
      where: { id: productId, storeId: req.storeId }
    });

    res.json({
      success: true,
      message: 'Produto excluído permanentemente!'
    });
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno ao excluir produto.'
    });
  }
};

exports.bulkChangeStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Nenhum produto selecionado.' });
    }

    if (!['Ativo', 'Inativo'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status inválido.' });
    }

    const active = status === 'Ativo';

    await prisma.product.updateMany({
      where: {
        id: { in: ids },
        storeId: req.storeId
      },
      data: { active }
    });

    res.json({
      success: true,
      message: `Status de ${ids.length} produto(s) alterado(s) com sucesso.`
    });
  } catch (error) {
    console.error('Erro ao alterar status em massa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno ao alterar status em massa.'
    });
  }
};

exports.bulkDeleteProducts = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Nenhum produto selecionado.' });
    }

    // Identificar produtos com vendas
    const variationsWithSales = await prisma.saleItem.findMany({
      where: {
        variation: {
          productId: { in: ids }
        }
      },
      include: {
        variation: {
          select: { productId: true }
        }
      }
    });

    const productsWithSales = new Set(variationsWithSales.map(s => s.variation.productId));
    const productsToDelete = ids.filter(id => !productsWithSales.has(id));

    // Desativar (Soft Delete) aqueles que têm vendas
    if (productsWithSales.size > 0) {
      await prisma.$transaction([
        prisma.product.updateMany({
          where: { id: { in: Array.from(productsWithSales) }, storeId: req.storeId },
          data: { active: false }
        }),
        prisma.productVariation.updateMany({
          where: { productId: { in: Array.from(productsWithSales) }, storeId: req.storeId },
          data: { active: false }
        })
      ]);
    }

    // Excluir permanentemente aqueles sem vendas
    if (productsToDelete.length > 0) {
      await prisma.productVariation.deleteMany({
        where: { productId: { in: productsToDelete }, storeId: req.storeId }
      });
      await prisma.productCharacteristic.deleteMany({
        where: { productId: { in: productsToDelete }, storeId: req.storeId }
      });
      await prisma.product.deleteMany({
        where: { id: { in: productsToDelete }, storeId: req.storeId }
      });
    }

    let message = `${productsToDelete.length} produto(s) excluído(s) com sucesso.`;
    if (productsWithSales.size > 0) {
      message += ` ${productsWithSales.size} produto(s) de histórico desativado(s).`;
    }

    res.json({
      success: true,
      message
    });

  } catch (error) {
    console.error('Erro ao excluir produtos em massa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno ao excluir produtos em massa.'
    });
  }
};
