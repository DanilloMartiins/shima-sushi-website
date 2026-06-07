-- Adiciona role SUPER_ADMIN ao CHECK constraint e atualiza o admin atual
ALTER TABLE users DROP CONSTRAINT IF EXISTS ck_users_role;
ALTER TABLE users ADD CONSTRAINT ck_users_role CHECK (role IN ('ADMIN', 'CUSTOMER', 'SUPER_ADMIN'));

-- Promove o admin atual para SUPER_ADMIN
UPDATE users SET role = 'SUPER_ADMIN' WHERE role = 'ADMIN';
