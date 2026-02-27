const prisma = require('./config/db');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  try {
    const adminEmail = 'admin@tatiesystem.com';
    const adminPassword = 'Admin@123';

    // Verifica se já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingUser) {
      console.log('✅ Usuário administrador já existe no banco.');
      return;
    }

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Cria o usuário
    const admin = await prisma.user.create({
      data: {
        name: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    console.log('🚀 Primeiro usuário administrador criado com sucesso!');
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🔐 Senha: ${adminPassword} (Salva como hash no banco)`);
  } catch (error) {
    console.error('❌ Erro ao criar administrador:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
