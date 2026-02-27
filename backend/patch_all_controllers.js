const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, 'src', 'controllers');
const files = fs.readdirSync(controllersDir).filter(f => f.endsWith('.js'));

let totalReplacements = 0;

files.forEach(file => {
  const filePath = path.join(controllersDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip auth controller logic for some global queries if needed, but actually we want it applied to mostly everything.
  // Wait, User login searches by email, we shouldn't inject storeId on email lookup if it's across all stores. 
  // Actually, users login by email globally or by store? The system has unique emails for now.
  // Let's protect specific standard operations:
  
  // 1. findUnique({ where: { id: ... } }) -> findFirst({ where: { id: ..., storeId: req.storeId } })
  content = content.replace(/findUnique\(\s*\{\s*where:\s*\{\s*id(:\s*[^,}]+)?\s*\}\s*\}\s*\)/g, (match, idGroup) => {
    totalReplacements++;
    const idStr = idGroup ? `id${idGroup}` : 'id';
    return `findFirst({\n      where: { ${idStr}, storeId: req.storeId }\n    })`;
  });

  // 2. update({ where: { id: ... }, data ... }) -> updateMany({ where: { id: ..., storeId: req.storeId }, data ... })
  content = content.replace(/update\(\s*\{\s*where:\s*\{\s*id(:\s*[^,}]+)?\s*\},/g, (match, idGroup) => {
    totalReplacements++;
    const idStr = idGroup ? `id${idGroup}` : 'id';
    return `updateMany({\n      where: { ${idStr}, storeId: req.storeId },`;
  });

  // 3. delete({ where: { id: ... } }) -> deleteMany({ where: { id: ..., storeId: req.storeId } })
  content = content.replace(/delete\(\s*\{\s*where:\s*\{\s*id(:\s*[^,}]+)?\s*\}\s*\}/g, (match, idGroup) => {
    totalReplacements++;
    const idStr = idGroup ? `id${idGroup}` : 'id';
    return `deleteMany({\n      where: { ${idStr}, storeId: req.storeId }\n    }`;
  });

  // Apply to general deleteMany that didn't have storeId
  content = content.replace(/deleteMany\(\s*\{\s*where:\s*\{\s*([^}]*?)\s*\}\s*\}/g, (match, innerWhere) => {
    if (!innerWhere.includes('storeId')) {
       totalReplacements++;
       return `deleteMany({ where: { ${innerWhere.trim()}${innerWhere.trim().endsWith(',') ? '' : ','} storeId: req.storeId } }`;
    }
    return match;
  });

  fs.writeFileSync(filePath, content, 'utf8');
});

console.log(`Patch concluído! Total de substituições: ${totalReplacements}`);
