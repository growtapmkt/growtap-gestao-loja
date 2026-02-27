const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const softDeleteModels = ['Product', 'Client', 'Sale', 'User', 'ProductVariation', 'Banner', 'CatalogConfig', 'Conditional'];

const extendedPrisma = prisma.$extends({
  model: {
    $allModels: {
      // Helper setup for future RLS
      async withRLS(storeId) {
        // await prisma.$executeRawUnsafe(`SET app.store_id = '${storeId}'`);
        // return this;
      }
    }
  },
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        // 1. Soft Delete Filter
        if (softDeleteModels.includes(model)) {
          if (['findUnique', 'findFirst', 'findMany', 'count', 'aggregate', 'groupBy'].includes(operation)) {
            args.where = args.where || {};
            args.where.deletedAt = null;
          }
        }
        
        // 2. Transational Audit Log (Fire and Forget)
        if (['create', 'update', 'updateMany', 'delete', 'deleteMany', 'upsert'].includes(operation) && model !== 'AuditLog') {
          const storeId = (args.data && args.data.storeId) || (args.where && args.where.storeId) || 'SYSTEM';
          const userId = (args.data && args.data.userId) || 'SYSTEM';
          const entityId = (args.where && args.where.id) || 'MULTIPLE';
          
          prisma.auditLog.create({
            data: {
              storeId: String(storeId),
              userId: String(userId),
              action: operation,
              entity: model,
              entityId: String(entityId),
              before: args.where ? JSON.parse(JSON.stringify(args.where)) : {},
              after: args.data ? JSON.parse(JSON.stringify(args.data)) : {}
            }
          }).catch(err => console.error('AuditLog Error:', err.message));
        }

        return query(args);
      },
    },
  },
});

module.exports = extendedPrisma;
