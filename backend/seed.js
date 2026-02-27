const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed...');

  // 1. Criar Usuário Admin
  const email = 'admin@growtap.com';
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await prisma.user.create({
      data: {
        email,
        name: 'Administrador GrowTap',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });
    console.log('✅ Usuário Admin criado: admin@growtap.com / admin123');
  } else {
    console.log('ℹ️ Usuário Admin já existe.');
  }
  
  // 2. Criar Categorias (se não existirem)
  const existingCategory = await prisma.category.findFirst({ where: { name: 'Roupas' } });
  
  if (!existingCategory) {
      const roupas = await prisma.category.create({
        data: {
          name: 'Roupas',
          type: 'ROUPA',
          status: 'ATIVA',
          public: 'UNISSEX',
          seasonality: 'ATEMPORAL'
        }
      });
      console.log('✅ Categoria Roupas criada');

      await prisma.category.create({
        data: {
          name: 'Camisetas',
          parentId: roupas.id,
          type: 'ROUPA',
          status: 'ATIVA',
          public: 'UNISSEX',
          seasonality: 'ATEMPORAL'
        }
      });

      await prisma.category.create({
        data: {
          name: 'Calças',
          parentId: roupas.id,
          type: 'ROUPA',
          status: 'ATIVA',
          public: 'UNISSEX',
          seasonality: 'ATEMPORAL'
        }
      });
  } else {
      console.log('ℹ️ Categorias já pularam, seed anterior executado.');
  }

  // 3. Criar Características (se não existirem)
  const existingChar = await prisma.characteristic.findUnique({ where: { name: 'Tamanho' } });
  
  if (!existingChar) {
      await prisma.characteristic.create({
        data: {
          name: 'Tamanho',
          options: 'P,M,G,GG,XG',
          status: 'ATIVA',
          order: 1
        }
      });
      console.log('✅ Característica Tamanho criada');
  }

  const existingChar2 = await prisma.characteristic.findUnique({ where: { name: 'Tecido' } });
  if (!existingChar2) {
      await prisma.characteristic.create({
        data: {
          name: 'Tecido',
          options: 'Algodão,Poliéster,Viscose,Linho',
          status: 'ATIVA',
          order: 2
        }
      });
      console.log('✅ Característica Tecido criada');
  }

  const existingChar3 = await prisma.characteristic.findUnique({ where: { name: 'Cor' } });
  if (!existingChar3) {
      await prisma.characteristic.create({
        data: {
          name: 'Cor',
          options: 'Preto,Branco,Azul,Vermelho,Verde',
          status: 'ATIVA',
          order: 3
        }
      });
      console.log('✅ Característica Cor criada');
  }

  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
