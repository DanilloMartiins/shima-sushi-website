-- Atualiza o clerk_id do admin com o ID real do usuario no Clerk

UPDATE users
SET clerk_id = 'user_3De3NSZ1E0OVrz83mzJH6R9Z64q'
WHERE role = 'ADMIN';
