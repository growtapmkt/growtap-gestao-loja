const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'src', 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// 1. Add storeId to ProductCharacteristic
schema = schema.replace(
  /model ProductCharacteristic \{([\s\S]*?)\}/,
  (match, content) => {
    if (!content.includes('storeId')) {
      return `model ProductCharacteristic {${content}  storeId        String?\n  store          Store?         @relation(fields: [storeId], references: [id], onDelete: Cascade)\n\n  @@index([storeId])\n  @@index([storeId, id])\n}`;
    }
    return match;
  }
);

// 2. Add storeId to ProductVariation
schema = schema.replace(
  /model ProductVariation \{([\s\S]*?)\}/,
  (match, content) => {
    if (!content.includes('storeId')) {
      const parts = match.split('@@unique');
      return `${parts[0]}  storeId        String?\n  store          Store?         @relation(fields: [storeId], references: [id], onDelete: Cascade)\n\n  @@index([storeId])\n  @@index([storeId, id])\n\n  @@unique${parts[1]}`;
    }
    return match;
  }
);

// 3. Add storeId to SaleItem
schema = schema.replace(
  /model SaleItem \{([\s\S]*?)\}/,
  (match, content) => {
    if (!content.includes('storeId')) {
      return `model SaleItem {${content}\n  storeId        String?\n  store          Store?         @relation(fields: [storeId], references: [id], onDelete: Cascade)\n\n  @@index([storeId])\n  @@index([storeId, id])\n}`;
    }
    return match;
  }
);

// 4. Add storeId to ConditionalItem
schema = schema.replace(
  /model ConditionalItem \{([\s\S]*?)\}/,
  (match, content) => {
    if (!content.includes('storeId')) {
      return `model ConditionalItem {${content}\n  storeId        String?\n  store          Store?         @relation(fields: [storeId], references: [id], onDelete: Cascade)\n\n  @@index([storeId])\n  @@index([storeId, id])\n}`;
    }
    return match;
  }
);

// 5. Add indexes to User
schema = schema.replace(
  /model User \{([\s\S]*?)\}/,
  (match, content) => {
    if (!content.includes('@@index([storeId])')) {
      return `model User {${content}\n  @@index([storeId])\n  @@index([storeId, id])\n}`;
    }
    return match;
  }
);

// Add to Product
schema = schema.replace(
  /model Product \{([\s\S]*?)\}/,
  (match, content) => {
    if (!content.includes('@@index([storeId])')) {
      return `model Product {${content}\n  @@index([storeId])\n  @@index([storeId, id])\n}`;
    }
    return match;
  }
);

// Add to Brand
schema = schema.replace(
  /model Brand \{([\s\S]*?)\}/,
  (match, content) => {
    if (!content.includes('@@index([storeId])')) {
      return `model Brand {${content}\n  @@index([storeId])\n  @@index([storeId, id])\n}`;
    }
    return match;
  }
);

// Add to Characteristic
schema = schema.replace(
  /model Characteristic \{([\s\S]*?)\}/,
  (match, content) => {
    if (!content.includes('@@index([storeId])')) {
      return `model Characteristic {${content}\n  @@index([storeId])\n  @@index([storeId, id])\n}`;
    }
    return match;
  }
);

// Add to Category
schema = schema.replace(
  /model Category \{([\s\S]*?)\}/,
  (match, content) => {
    if (!content.includes('@@index([storeId])')) {
      return `model Category {${content}\n  @@index([storeId])\n  @@index([storeId, id])\n}`;
    }
    return match;
  }
);

// Add to Client
schema = schema.replace(
  /model Client \{([\s\S]*?)\}/,
  (match, content) => {
    if (!content.includes('@@index([storeId])')) {
      return `model Client {${content}\n  @@index([storeId])\n  @@index([storeId, id])\n}`;
    }
    return match;
  }
);

// Add to Sale
schema = schema.replace(
  /model Sale \{([\s\S]*?)\}/,
  (match, content) => {
    if (!content.includes('@@index([storeId])')) {
      return `model Sale {${content}\n  @@index([storeId])\n  @@index([storeId, id])\n}`;
    }
    return match;
  }
);

// Add to Conditional
schema = schema.replace(
  /model Conditional \{([\s\S]*?)\}/,
  (match, content) => {
    if (!content.includes('@@index([storeId])')) {
      return `model Conditional {${content}\n  @@index([storeId])\n  @@index([storeId, id])\n}`;
    }
    return match;
  }
);

// Add to Transaction
schema = schema.replace(
  /model Transaction \{([\s\S]*?)\}/,
  (match, content) => {
    if (!content.includes('@@index([storeId])')) {
      return `model Transaction {${content}\n  @@index([storeId])\n  @@index([storeId, id])\n}`;
    }
    return match;
  }
);

// Add to StoreCounter
schema = schema.replace(
  /model StoreCounter \{([\s\S]*?)\}/,
  (match, content) => {
    if (!content.includes('@@index([storeId])')) {
      return `model StoreCounter {${content}\n  @@index([storeId])\n  @@index([storeId, id])\n}`;
    }
    return match;
  }
);

// Add to StoreSettings
schema = schema.replace(
  /model StoreSettings \{([\s\S]*?)\}/,
  (match, content) => {
    if (!content.includes('@@index([storeId])')) {
      return `model StoreSettings {${content}\n  @@index([storeId])\n  @@index([storeId, id])\n}`;
    }
    return match;
  }
);

fs.writeFileSync(schemaPath, schema, 'utf8');
console.log('Schema atualizado com sucesso!');
