const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateAdminEmail() {
  try {
    // Buscar o usuário admin atual
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!adminUser) {
      console.log('❌ Nenhum usuário admin encontrado!');
      return;
    }

    // Atualizar o email
    const updatedUser = await prisma.user.update({
      where: { id: adminUser.id },
      data: { email: 'williamvilella00@gmail.com' }
    });
    
    console.log('✅ Email do administrador atualizado com sucesso!');
    console.log('\n📧 Novo Email: williamvilella00@gmail.com');
    console.log('🔑 Senha: admin123');
    console.log('\n⚠️  IMPORTANTE: Altere a senha após o primeiro login!');
  } catch (error) {
    console.error('❌ Erro ao atualizar email:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminEmail();
