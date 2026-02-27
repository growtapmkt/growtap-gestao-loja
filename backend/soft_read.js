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
    // lowercase first
    const m = model.charAt(0).toLowerCase() + model.slice(1);
    
    // Pattern to find prisma.model.method({ where: {
    const methods = ['findFirst', 'findMany', 'count', 'updateMany', 'aggregate', 'groupBy'];
    
    methods.forEach(method => {
      // Very naive regex: matches prisma.model.method({ where: {
      const regexWhere = new RegExp('prisma\\\\.' + m + '\\\\.' + method + '\\\\s*\\\\(\\\\s*\\\\{[\\\\s\\\\S]*?where:\\s*\\\\{', 'g');
      
      content = content.replace(regexMany => {
         // this is getting too complex with simple regex. Let's just do it manually for safety where it matters, or use a simpler injection.
      });
    });
  });

});
