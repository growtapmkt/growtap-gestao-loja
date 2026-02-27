const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'components');

function processDirectory(directory) {
  const files = fs.readdirSync(directory);

  files.forEach(file => {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && file !== 'node_modules') {
      processDirectory(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      if (content.includes('.toFixed(2)') || content.includes('.toFixed(1)')) {
        console.log(`Updating ${file}...`);
        
        // Let's do a simple exact replacement to match the robust formatting
        content = content.replace(/\.toFixed\(2\)/g, `.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })`);
        content = content.replace(/\.toFixed\(1\)/g, `.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })`);
        
        fs.writeFileSync(fullPath, content, 'utf8');
      }
    }
  });
}

processDirectory(componentsDir);
console.log('Done!');
