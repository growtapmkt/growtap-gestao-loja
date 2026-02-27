const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'src', 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// Replace `storeId String?` and `store Store?` with mandatory versions for specific models

const modelsToUpdate = [
  'ProductCharacteristic',
  'ProductVariation',
  'SaleItem',
  'ConditionalItem'
];

modelsToUpdate.forEach(modelName => {
  const regex = new RegExp(`model ${modelName} \\{[\\s\\S]*?\\}`);
  schema = schema.replace(regex, (match) => {
    let replaced = match.replace(/storeId\s+String\?/g, 'storeId        String');
    replaced = replaced.replace(/store\s+Store\?\s+@relation/g, 'store          Store          @relation');
    return replaced;
  });
});

fs.writeFileSync(schemaPath, schema, 'utf8');
console.log('Schema updated: storeId is now mandatory for child models.');
