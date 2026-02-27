const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'src', 'prisma', 'schema.prisma');
let content = fs.readFileSync(schemaPath, 'utf8');

// The file got corrupted with null bytes or UTF16 encoded string at the end.
// We can just strip everything after the final valid StoreSettings closing brace `}`
const lastValidIndex = content.lastIndexOf('@@index([storeId, id])\n}');
if (lastValidIndex !== -1) {
  content = content.substring(0, lastValidIndex + 25);
  
  const newModels = `

model CatalogConfig {
  id      String @id @default(uuid())
  storeId String
  store   Store  @relation(fields: [storeId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([storeId])
  @@index([storeId, id])
}

model Banner {
  id      String @id @default(uuid())
  storeId String
  store   Store  @relation(fields: [storeId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([storeId])
  @@index([storeId, id])
}
`;
  content += newModels;
  fs.writeFileSync(schemaPath, content, 'utf8');
  console.log('Fixed schema encoded string and appended models properly.');
} else {
  console.log('Could not find last valid index');
}
