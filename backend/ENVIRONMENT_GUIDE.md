# Guia de Ambientes (DEV x PROD) - GrowTap

Este documento define as diretrizes rigorosas para manipulação dos bancos de dados do **GrowTap** e a troca segura de ambientes.

## ⚠️ Regras de Ouro
1. **NUNCA** utilizar o comando `npx prisma db push` em ambiente de produção.
2. **NUNCA** rodar `npx prisma migrate dev` no banco de produção.
3. Todas as alterações e `migrations` novas devem ser geradas, testadas e validadas no ambiente **DEV** primeiro.
4. O ambiente **PROD** deve ter seu esquema atualizado única e exclusivamente utilizando o comando `migrate:prod` (que executa `migrate deploy`).
5. Dados reais e de clientes não devem ser misturados com o ambiente de testes (DEV).
6. O arquivo `.env` nunca deve ser commitado no repositório.

---

## 🔄 Como Trocar de Ambiente

Para chavear a aplicação de um ambiente para outro, utilize os scripts automatizados disponíveis no `package.json`. Eles garantem que as variáveis de ambiente corretas sejam copiadas para o `.env` global principal antes de qualquer ação.

### 🏗️ Ambiente de Desenvolvimento (DEV)
```bash
# Aponta a aplicação para o banco DEV
npm run env:dev

# Cria/aplica migrations no banco DEV (gerando novos arquivos na pasta prisma/migrations)
npm run migrate:dev
```

### 🚀 Ambiente de Produção (PROD)
```bash
# Aponta a aplicação para o banco PROD
npm run env:prod

# Aplica migrations pendentes no banco PROD de forma SEGURA e INVISÍVEL (sem resetar dados)
npm run migrate:prod
```

## 🔐 Trava de Segurança
Foi adicionada uma trava de infraestrutura no `app.js` da aplicação principal. 
Se a variável `NODE_ENV` estiver configurada como `production`, mas a string constando no `DATABASE_URL` contiver referências à palavra "dev", o processo Node.js abortará a execução imediatamente, subindo um **Error (ERRO: Banco DEV sendo usado em produção.)**, impossibilitando corromper ou expor bases de teste de forma acidental para os usuários reais.
