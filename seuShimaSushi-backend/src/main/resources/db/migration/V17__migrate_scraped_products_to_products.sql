-- Cria as categorias que vieram do scraping mas nao existem na tabela categories
INSERT INTO categories (name, description, active)
SELECT 'Experiencia do Chef', 'Experiencias especiais preparadas pelo chef', TRUE
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE LOWER(name) = LOWER('Experiencia do Chef'));

INSERT INTO categories (name, description, active)
SELECT 'Combinado', 'Combinados de sushi variados', TRUE
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE LOWER(name) = LOWER('Combinado'));

INSERT INTO categories (name, description, active)
SELECT 'Combinados Individuais', 'Combinados para uma pessoa', TRUE
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE LOWER(name) = LOWER('Combinados Individuais'));

INSERT INTO categories (name, description, active)
SELECT 'Poke', 'Pokes frescos e saborosos', TRUE
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE LOWER(name) = LOWER('Poke'));

INSERT INTO categories (name, description, active)
SELECT 'Yakisobas Individuais', 'Yakisobas porcao individual', TRUE
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE LOWER(name) = LOWER('Yakisobas Individuais'));

INSERT INTO categories (name, description, active)
SELECT 'Temaki', 'Temakis tradicionais e empanados (Hot)', TRUE
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE LOWER(name) = LOWER('Temaki'));

INSERT INTO categories (name, description, active)
SELECT 'Hot (10 pecas)', 'Hots rolls empanados e fritos', TRUE
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE LOWER(name) = LOWER('Hot (10 pecas)'));

INSERT INTO categories (name, description, active)
SELECT 'Entradas', 'Entradas e porcoes para compartilhar', TRUE
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE LOWER(name) = LOWER('Entradas'));

INSERT INTO categories (name, description, active)
SELECT 'Seja o chefe', 'Monte sua propria combinacao', TRUE
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE LOWER(name) = LOWER('Seja o chefe'));

INSERT INTO categories (name, description, active)
SELECT 'Ceviche', 'Ceviches frescos', TRUE
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE LOWER(name) = LOWER('Ceviche'));

INSERT INTO categories (name, description, active)
SELECT 'Yakisobas', 'Yakisobas completos', TRUE
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE LOWER(name) = LOWER('Yakisobas'));

INSERT INTO categories (name, description, active)
SELECT 'Sushi', 'Sushis variados (2, 4 ou 6 pecas)', TRUE
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE LOWER(name) = LOWER('Sushi'));

INSERT INTO categories (name, description, active)
SELECT 'Pratos Quentes', 'Pratos quentes especiais', TRUE
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE LOWER(name) = LOWER('Pratos Quentes'));

INSERT INTO categories (name, description, active)
SELECT 'Carpaccio', 'Carpaccios de salmao', TRUE
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE LOWER(name) = LOWER('Carpaccio'));

INSERT INTO categories (name, description, active)
SELECT 'Sashimi', 'Sashimi fatiado na hora', TRUE
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE LOWER(name) = LOWER('Sashimi'));

INSERT INTO categories (name, description, active)
SELECT 'Gunka (6 pecas)', 'Gunkas especiais', TRUE
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE LOWER(name) = LOWER('Gunka (6 pecas)'));

INSERT INTO categories (name, description, active)
SELECT 'Uramaki (8 pecas)', 'Uramakis variados', TRUE
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE LOWER(name) = LOWER('Uramaki (8 pecas)'));

INSERT INTO categories (name, description, active)
SELECT 'Makimono (8 pecas)', 'Makimonos tradicionais', TRUE
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE LOWER(name) = LOWER('Makimono (8 pecas)'));

INSERT INTO categories (name, description, active)
SELECT 'Especiais', 'Rolls especiais do chef', TRUE
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE LOWER(name) = LOWER('Especiais'));

INSERT INTO categories (name, description, active)
SELECT 'Complementos', 'Complementos e adicionais', TRUE
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE LOWER(name) = LOWER('Complementos'));

INSERT INTO categories (name, description, active)
SELECT 'Sobremesa', 'Sobremesas orientais', TRUE
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE LOWER(name) = LOWER('Sobremesa'));

-- Copia os produtos do scraped_products pra tabela products
-- Mapeia a categoria pelo nome, e gera uma descricao basica
INSERT INTO products (name, description, price, image_url, available, category_id)
SELECT
    sp.nome,
    CASE
        WHEN sp.categoria = 'Complementos' THEN 'Complemento para o seu pedido'
        WHEN sp.categoria = 'Seja o chefe!' THEN 'Monte sua combinacao personalizada'
        ELSE 'Produto da categoria ' || sp.categoria
    END,
    sp.preco,
    CASE
        WHEN sp.url_imagem IS NULL THEN '/assets/images/product_placeholder.png'
        ELSE sp.url_imagem
    END,
    TRUE,
    c.id
FROM scraped_products sp
JOIN categories c ON LOWER(c.name) = LOWER(sp.categoria)
WHERE NOT EXISTS (
    SELECT 1 FROM products p
    WHERE LOWER(p.name) = LOWER(sp.nome)
);
