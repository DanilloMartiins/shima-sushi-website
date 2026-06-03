-- Vincula o ID do Clerk ao usuario admin pra ele ter acesso ao painel
UPDATE users SET clerk_id = '${admin_clerk_id}' WHERE role = 'ADMIN' AND clerk_id IS NULL;
