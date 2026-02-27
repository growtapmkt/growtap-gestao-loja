const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function setupSystem() {
  const adminEmail = 'williamvilella00@gmail.com';
  const adminPassword = 'souzavile00';

  console.log('🔄 Iniciando configuração do sistema...');

  try {
    // 1. Criar ou Buscar a Loja Principal
    let store = await prisma.store.findFirst();
    
    if (!store) {
      console.log('🏪 Criando Loja Principal...');
      store = await prisma.store.create({
        data: {
          name: 'Minha Loja GrowTap',
          plan: 'PRO'
        }
      });
      console.log('✅ Loja criada com ID:', store.id);
    } else {
      console.log('ℹ️ Loja já existente encontrada (ID:', store.id, ')');
    }

    // 1.5 Garantir que existe um Plano e uma Assinatura
    let plan = await prisma.plan.findFirst();
    if (!plan) {
      console.log('📦 Criando plano padrão PRO_PLUS...');
      plan = await prisma.plan.create({
        data: {
          name: 'PRO_PLUS',
          description: 'Plano Pro Plus (Dev)',
          priceMonthly: 0,
          priceYearly: 0,
          features: {},
          limits: { maxProducts: 9999, maxUsers: 999, maxSalesPerMonth: 9999, advancedReports: true, apiAccess: true }
        }
      });
    }

    const existingSubscription = await prisma.storeSubscription.findFirst({
      where: { storeId: store.id }
    });

    if (!existingSubscription) {
      console.log('✅ Criando assinatura ativa para a loja...');
      await prisma.storeSubscription.create({
        data: {
          storeId: store.id,
          planId: plan.id,
          status: 'ACTIVE',
          startedAt: new Date(),
          autoRenew: true
        }
      });
    }

    // 2. Garantir que o usuário ADMIN existe e está vinculado à loja
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    // Tenta atualizar se existir, senão cria (upsert)
    const user = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        password: hashedPassword,
        role: 'ADMIN',
        storeId: store.id,
        name: 'Administrador do Sistema'
      },
      create: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Administrador do Sistema',
        role: 'ADMIN',
        storeId: store.id
      }
    });
    
    console.log('✅ Usuário ADMIN configurado/atualizado:', user.email);

    // 3. Criar e atualizar configurações (StoreSettings)
    try {
        const settings = await prisma.storeSettings.findUnique({
            where: { storeId: store.id }
        });

        if (!settings) {
            console.log('⚙️ Criando configurações padrão...');
            await prisma.storeSettings.create({
                data: {
                    storeId: store.id,
                    storeName: 'Minha Loja GrowTap',
                    document: '00.000.000/0001-00',
                    phone: '(11) 99999-9999',
                    address: 'Rua Exemplo, 123 - Centro',
                    email: adminEmail,
                    
                    // Defaults visuais
                    catalogPrimaryColor: '#0158ad',
                    catalogSecondaryColor: '#1e293b',
                    catalogActive: true
                }
            });
            console.log('✅ Configurações padrão criadas.');
        } else {
            console.log('ℹ️ Configurações já existem.');
        }

    } catch (settingsError) {
        console.warn('⚠️ Erro ao criar configurações (StoreSettings):', settingsError.message);
    }

    console.log('\n--- RESUMO DA OPERAÇÃO ---');
    console.log('🎉 Sistema PRONTO para uso!');
    console.log(`📧 Login: ${adminEmail}`);
    console.log(`🔑 Senha: ${adminPassword}`);
    console.log('--------------------------');

  } catch (error) {
    console.error('❌ Erro fatal na configuração:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupSystem();
