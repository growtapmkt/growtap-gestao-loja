const prisma = require('./config/db');
const bcrypt = require('bcryptjs');

async function createDefault() {
    try {
        const hashedPassword = await bcrypt.hash('123456', 10);

        console.log('Criando Loja Padrão...');
        const store = await prisma.store.create({
            data: {
                name: 'GrowTap Shop',
                plan: 'PRO_PLUS'
            }
        });
        console.log(`Loja criada: ${store.id} - ${store.name}`);

        console.log('Criando Usuário Admin...');
        const user = await prisma.user.create({
            data: {
                name: 'Administrador',
                email: 'admin@growtap.com',
                password: hashedPassword,
                role: 'OWNER',
                storeId: store.id
            }
        });

        console.log(`Usuário criado:\nEmail: ${user.email}\nSenha: 123456\nStore ID: ${store.id}`);

    } catch (error) {
        console.error('Erro ao criar usuário:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createDefault();
