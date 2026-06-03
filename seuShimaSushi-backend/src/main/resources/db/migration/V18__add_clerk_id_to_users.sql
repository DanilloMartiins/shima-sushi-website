-- Adiciona o ID do Clerk na tabela de usuarios pra vincular a conta do Clerk com a role local
ALTER TABLE users ADD COLUMN clerk_id VARCHAR(100);

-- Garante que nao vai ter dois usuarios com o mesmo Clerk ID
CREATE UNIQUE INDEX uk_users_clerk_id ON users(clerk_id);
