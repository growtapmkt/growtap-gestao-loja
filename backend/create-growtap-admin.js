const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createAdmin() {
    try {
        const hashedPassword = await bcrypt.hash('123456', 10);
        const email = 'admin@growtap.com';

        // Check if there is a store, else create one
        let store = await prisma.store.findFirst();
        if (!store) {
            store = await prisma.store.create({
                data: {
                    name: 'Loja Principal DEV',
                    plan: 'PRO_PLUS'
                }
            });
            console.log('✅ Loja padrão criada:', store.id);

            // Create counter for the store
            await prisma.storeCounter.create({
                data: {
                    storeId: store.id
                }
            });
            // Create settings
            await prisma.storeSettings.create({
                data: {
                    storeId: store.id,
                    storeName: store.name
                }
            });
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

        // Check if user exists
        let user = await prisma.user.findUnique({
            where: { email }
        });

        if (user) {
            console.log('Usuário já existe. Atualizando senha, role e storeId...');
            user = await prisma.user.update({
                where: { email },
                data: {
                    password: hashedPassword,
                    role: 'ADMIN',
                    storeId: store.id
                }
            });
        } else {
            console.log('Criando novo usuário admin...');
            user = await prisma.user.create({
                data: {
                    email: email,
                    password: hashedPassword,
                    name: 'Admin GrowTap',
                    role: 'ADMIN',
                    storeId: store.id
                }
            });
        }

        console.log('✅ Usuário admin configurado com sucesso e vinculado à loja!');
        console.log('\n📧 Email:', user.email);
        console.log('🔑 Senha: 123456');
    } catch (error) {
        console.error('❌ Erro ao criar usuário:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
