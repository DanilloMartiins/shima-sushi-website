-- Corrige o Clerk ID do admin pro valor real (o V19 rodou com placeholder)
UPDATE users SET clerk_id = '${admin_clerk_id}' WHERE role = 'ADMIN';
