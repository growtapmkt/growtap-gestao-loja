const prisma = require('./config/db');

async function seedClients() {
  try {
    const clientsData = [
      {
        name: 'Sarah Jenkins',
        email: 'sarah.jenkins@example.com',
        phone: '(555) 0123-4567',
        city: 'New York',
        state: 'NY',
        address: '452 Broadway Ave, Suite 12',
        topSize: 'Médio (M)',
        bottomSize: 'US 8',
        shoesSize: '39 EU',
        favoriteColors: ['#60a5fa', '#f1f5f9', '#1e293b'],
        personalNotes: 'Prefere tecidos naturais como linho e seda. Sempre avisá-la sobre novas coleções Boho-chic.'
      },
      {
        name: 'Emma Thompson',
        email: 'emma.t@example.com',
        phone: '(555) 0987-6543',
        city: 'London',
        state: 'UK',
        address: '10 Downing St',
        topSize: 'Small (S)',
        bottomSize: 'US 4',
        shoesSize: '37 EU',
        favoriteColors: ['#ef4444', '#000000'],
        personalNotes: 'Estilo clássico e minimalista.'
      }
    ];

    for (const data of clientsData) {
      await prisma.client.upsert({
        where: { email: data.email },
        update: data,
        create: data
      });
    }

    console.log('✅ Clientes semeados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao semear clientes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedClients();
