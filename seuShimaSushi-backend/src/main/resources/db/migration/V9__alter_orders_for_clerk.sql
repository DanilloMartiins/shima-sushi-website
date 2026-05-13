-- Migration para trocar a FK de usuario pelo ID do Clerk
ALTER TABLE orders ADD COLUMN customer_clerk_id VARCHAR(100);

-- Se tiver pedidos antigos, a gente migra o ID numérico pra string só pra não perder dado
UPDATE orders SET customer_clerk_id = CAST(customer_id AS VARCHAR);

-- Agora podemos tirar a coluna antiga e a constraint
ALTER TABLE orders DROP COLUMN customer_id;

-- Deixamos a nova como obrigatória agora que limpamos tudo
ALTER TABLE orders ALTER COLUMN customer_clerk_id SET NOT NULL;

-- Criamos um índice pra ficar rápido buscar os pedidos de um cliente
CREATE INDEX idx_orders_customer_clerk_id ON orders(customer_clerk_id);
