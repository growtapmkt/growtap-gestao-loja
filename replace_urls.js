const fs = require('fs');
const path = require('path');

const dirs = [
  'g:/6- GrowTap - Gestão de Loja/Sistema/components',
  'g:/6- GrowTap - Gestão de Loja/Sistema/src' // caso exista a pasta src
];

let filesChanged = 0;

function replaceInDir(currentDir) {
  if (!fs.existsSync(currentDir)) return;
  const files = fs.readdirSync(currentDir);
  for (const file of files) {
    const fullPath = path.join(currentDir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      // Single quotes
      const singleQuoteRegex = /'http:\/\/localhost:5000\/api([^']*)'/g;
      if (singleQuoteRegex.test(content)) {
        content = content.replace(singleQuoteRegex, '`${import.meta.env.VITE_API_URL}$1`');
        modified = true;
      }
      
      // Double quotes
      const doubleQuoteRegex = /"http:\/\/localhost:5000\/api([^"]*)"/g;
      if (doubleQuoteRegex.test(content)) {
        content = content.replace(doubleQuoteRegex, '`${import.meta.env.VITE_API_URL}$1`');
        modified = true;
      }

      // Template literals
      const templateLiteralRegex = /`http:\/\/localhost:5000\/api([^`]*)`/g;
      if (templateLiteralRegex.test(content)) {
        content = content.replace(templateLiteralRegex, '`${import.meta.env.VITE_API_URL}$1`');
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Atualizou: ${fullPath}`);
        filesChanged++;
      }
    }
  }
}

console.log("Iniciando varredura...");
dirs.forEach(replaceInDir);
console.log(`Substituído com sucesso em ${filesChanged} arquivos.`);
