const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, 'src', 'controllers');
const files = fs.readdirSync(controllersDir).filter(f => f.endsWith('.js'));

files.forEach(file => {
  const filePath = path.join(controllersDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Find all instances like: await prisma.model.deleteMany({ ... });
  // and safely wrap them or inject a check if it's assigned to a variable,
  // OR just add a global findFirst check at the start of delete operations.
  
  // Since AST manipulation is hard here, let's just do a simple replace
  // where "deleteMany" is the primary deletion. 
  // It's safer to just patch productController manually first for the test.

  fs.writeFileSync(filePath, content, 'utf8');
});

console.log('Done script structure.');
