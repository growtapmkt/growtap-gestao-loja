const prisma = require('./config/db');

async function debug() {
    try {
        const users = await prisma.user.findMany();
        console.log(`Users Found: ${users.length}`);
        users.forEach(u => console.log(`User: ${u.email} (Role: ${u.role}) Linked to Store: ${u.storeId}`));

        const stores = await prisma.store.findMany();
        console.log(`Stores Found: ${stores.length}`);
        stores.forEach(s => console.log(`Store: ${s.name} (${s.id})`));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

debug();
