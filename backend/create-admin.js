const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const user = await prisma.user.create({
      data: {
        email: 'williamvilella00@gmail.com',
        password: hashedPassword,
        name: 'Administrador',
        role: 'ADMIN'
      }
    });
    
    console.log('✅ Usuário admin criado com sucesso!');
    console.log('\n📧 Email: admin@tatiesystem.com');
    console.log('🔑 Senha: admin123');
    console.log('\n⚠️  IMPORTANTE: Altere a senha após o primeiro login!');
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
