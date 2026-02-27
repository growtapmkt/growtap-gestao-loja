const fs = require('fs');
const path = require('path');
const models = ['Product', 'Client', 'Sale', 'User', 'ProductVariation', 'Banner', 'CatalogConfig', 'Conditional'];

const dir = 'src/controllers';
fs.readdirSync(dir).forEach(file => {
  if (!file.endsWith('.js')) return;
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  models.forEach(model => {
    const m = model.charAt(0).toLowerCase() + model.slice(1);
    
    // Replace deleteMany({ where: ... }) -> updateMany({ where: ..., data: { deletedAt: new Date() } })
    const regexMany = new RegExp('prisma\\\\.' + m + '\\\\.deleteMany\\\\s*\\\\(\\\\s*\\\\{\\\\s*where:\\s*([^}]+)\\\\s*\\\\}\\\\s*\\\\)', 'g');
    if (regexMany.test(content)) {
      content = content.replace(regexMany, (match, whereContent) => {
        return 'prisma.' + m + '.updateMany({ where: ' + whereContent.trim() + ', data: { deletedAt: new Date() } })';
      });
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
});
console.log('Soft deletes applied successfully.');
