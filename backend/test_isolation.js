const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const app = require('./src/app');
const http = require('http');

const PORT = 3999;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

function createToken(userId, storeId) {
  return jwt.sign({ id: userId, storeId: storeId, role: 'OWNER' }, JWT_SECRET, { expiresIn: '1h' });
}

async function runTests() {
  const server = http.createServer(app).listen(PORT);
  console.log(`\n[Teste] Servidor de testes rodando na porta ${PORT}`);

  try {
    // 1. Setup Data
    const storeA = await prisma.store.create({ data: { name: 'Loja A - Isolada' } });
    const storeB = await prisma.store.create({ data: { name: 'Loja B - Isolada' } });
    
    const userA = await prisma.user.create({ data: { email: 'a@teste.com', password: '123', name: 'User A', storeId: storeA.id } });
    const userB = await prisma.user.create({ data: { email: 'b@teste.com', password: '123', name: 'User B', storeId: storeB.id } });

    const tokenA = createToken(userA.id, storeA.id);
    const tokenB = createToken(userB.id, storeB.id);

    // Produto da Loja A
    const prodA = await prisma.product.create({
      data: {
        name: 'Produto da Loja A',
        sku: 'SKU-A-' + Date.now(),
        price: 100,
        storeId: storeA.id,
        displayId: 1
      }
    });

    console.log(`[Setup] Criados: Loja A (${storeA.id}), Loja B (${storeB.id}), Produto A (${prodA.id})`);

    // Helper for fetch
    const request = async (method, path, token, body = null) => {
      const options = {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      if (body) options.body = JSON.stringify(body);
      const res = await fetch(`http://localhost:${PORT}${path}`, options);
      return { status: res.status, data: await res.json().catch(()=>({})) };
    };

    // 2. Tests
    console.log('\n--- INICIANDO BATERIA DE TESTES DE ISOLAMENTO ---');

    console.log('\nTeste 1: Usuário B tenta ver o Produto A (GET por ID)');
    let res = await request('GET', `/api/products/${prodA.id}`, tokenB);
    console.log(`Status Recebido: ${res.status}`);
    if (res.status === 404 || !res.data.success) console.log('✅ SUCESSO: Loja B bloqueada de ver Produto A');
    else throw new Error('❌ FALHA: Loja B viu Produto A!');

    console.log('\nTeste 2: Usuário B tenta alterar o Produto A (PUT por ID)');
    res = await request('PUT', `/api/products/${prodA.id}`, tokenB, { name: 'Hackeado pela Loja B' });
    console.log(`Status Recebido: ${res.status}`);
    if (res.status === 404 || !res.data.success) console.log('✅ SUCESSO: Loja B bloqueada de editar Produto A');
    else throw new Error('❌ FALHA: Loja B editou Produto A!');

    console.log('\nTeste 3: Usuário B tenta deletar o Produto A (DELETE por ID)');
    res = await request('DELETE', `/api/products/${prodA.id}`, tokenB);
    console.log(`Status Recebido: ${res.status}`);
    if (res.status === 404 || !res.data.success) console.log('✅ SUCESSO: Loja B bloqueada de deletar Produto A');
    else throw new Error('❌ FALHA: Loja B deletou Produto A!');

    console.log('\nTeste 4: Usuário B tenta buscar a lista de todos os produtos');
    res = await request('GET', `/api/products`, tokenB);
    console.log(`Resultados listados para B: ${res.data.count || 0}`);
    if (res.data.count === 0) console.log('✅ SUCESSO: Loja B não vê produtos da Loja A na listagem geral');
    else throw new Error('❌ FALHA: Loja B lista produtos da Loja A!');

    console.log('\nTeste 5: Injeção maliciosa de storeId no Body (POST - Criar Produto)');
    res = await request('POST', `/api/products`, tokenB, {
      name: 'Hack Produto', sku: 'HACK-123', price: 10, storeId: storeA.id
    });
    // Deve ignorar storeId do body e criar na Loja B, ou falhar. Mas NUNCA criar na Loja A.
    const verifyProd = await prisma.product.findFirst({ where: { sku: 'HACK-123', storeId: storeA.id } });
    if (!verifyProd) console.log('✅ SUCESSO: Tentativa de injeção de storeId falhou. Produto não está na Loja A.');
    else throw new Error('❌ FALHA DE SEGURANÇA: Produto foi criado injetado na Loja A!');

    console.log('\n--- TODOS OS TESTES PASSARAM COM SUCESSO! ISOLAMENTO ABSOLUTO CONFIRMADO. ---');

  } catch (error) {
    console.error('\n🚨 ERRO DURANTE O TESTE:', error.message);
  } finally {
    // Cleanup
    console.log('\nLimpando base de dados...');
    await prisma.user.deleteMany({ where: { email: { in: ['a@teste.com', 'b@teste.com'] } } });
    await prisma.product.deleteMany({ where: { OR: [{ sku: { startsWith: 'SKU-A-' } }, { sku: 'HACK-123' }] } });
    await prisma.store.deleteMany({ where: { name: { in: ['Loja A - Isolada', 'Loja B - Isolada'] } } });
    await prisma.$disconnect();
    server.close();
    console.log('[Teste] Servidor desligado.');
  }
}

runTests();
