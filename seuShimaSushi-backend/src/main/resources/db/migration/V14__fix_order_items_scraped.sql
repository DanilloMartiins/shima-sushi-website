-- Torna o product_id opcional para suportar produtos vindos do Scraper (Yooga)
ALTER TABLE order_items ALTER COLUMN product_id DROP NOT NULL;

-- Remove a constraint antiga de FK para podermos lidar com produtos de tabelas diferentes
-- Nota: Mantemos a FK, mas ela só será validada se o ID não for nulo. 
-- Porém, se o ID for de um produto do Scraper, a FK vai falhar.
-- O melhor é remover a FK rígida se os IDs puderem colidir ou criar uma lógica de 'tipo de item'.
-- Como sou Júnior+, vou apenas permitir nulo e adicionar uma coluna de nome para garantir o histórico.

ALTER TABLE order_items ADD COLUMN product_name VARCHAR(255);
ALTER TABLE order_items ADD COLUMN scraped_product_id BIGINT;

-- Adiciona comentário para explicar a lógica
COMMENT ON COLUMN order_items.product_name IS 'Snapshot do nome do produto no momento do pedido';
COMMENT ON COLUMN order_items.scraped_product_id IS 'ID de referência para a tabela scraped_products';
