const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function backfill() {
  try {
    console.log('Iniciando Backfill de storeId...');

    // 1. Backfill ProductVariation
    const variations = await prisma.productVariation.findMany({
      where: { storeId: null },
      include: { product: { select: { storeId: true } } }
    });
    console.log(`Encontradas ${variations.length} variações sem storeId.`);
    
    for (const v of variations) {
      if (v.product && v.product.storeId) {
        await prisma.productVariation.update({
          where: { id: v.id },
          data: { storeId: v.product.storeId }
        });
      }
    }

    // 2. Backfill ProductCharacteristic
    const chars = await prisma.productCharacteristic.findMany({
      where: { storeId: null },
      include: { product: { select: { storeId: true } } }
    });
    console.log(`Encontradas ${chars.length} características de produto sem storeId.`);
    
    for (const c of chars) {
      if (c.product && c.product.storeId) {
        await prisma.productCharacteristic.update({
          where: { id: c.id },
          data: { storeId: c.product.storeId }
        });
      }
    }

    // 3. Backfill SaleItem
    const saleItems = await prisma.saleItem.findMany({
      where: { storeId: null },
      include: { sale: { select: { storeId: true } } }
    });
    console.log(`Encontrados ${saleItems.length} itens de venda sem storeId.`);
    
    for (const si of saleItems) {
      if (si.sale && si.sale.storeId) {
        await prisma.saleItem.update({
          where: { id: si.id },
          data: { storeId: si.sale.storeId }
        });
      }
    }

    // 4. Backfill ConditionalItem
    const condItems = await prisma.conditionalItem.findMany({
      where: { storeId: null },
      include: { conditional: { select: { storeId: true } } }
    });
    console.log(`Encontrados ${condItems.length} itens de condicional sem storeId.`);
    
    for (const ci of condItems) {
      if (ci.conditional && ci.conditional.storeId) {
        await prisma.conditionalItem.update({
          where: { id: ci.id },
          data: { storeId: ci.conditional.storeId }
        });
      }
    }

    console.log('Backfill concluído com sucesso!');
  } catch (err) {
    console.error('Erro no backfill:', err);
  } finally {
    await prisma.$disconnect();
  }
}

backfill();
