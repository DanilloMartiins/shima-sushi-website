INSERT INTO categories (name, description, active)
SELECT 'Combinados', 'Combinados de sushi para compartilhar ou devorar sozinho', TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE LOWER(name) = LOWER('Combinados')
);

INSERT INTO categories (name, description, active)
SELECT 'Temakis', 'Temakis tradicionais e empanados (Hot)', TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE LOWER(name) = LOWER('Temakis')
);

INSERT INTO categories (name, description, active)
SELECT 'Bebidas', 'Bebidas para acompanhar seu pedido', TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE LOWER(name) = LOWER('Bebidas')
);

INSERT INTO categories (name, description, active)
SELECT 'Acompanhamentos', 'Entradas, conservas e molhos extras', TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE LOWER(name) = LOWER('Acompanhamentos')
);

INSERT INTO products (name, description, price, image_url, available, category_id)
SELECT
    'Combinado Salmao (20 pecas)',
    '10 sashimis de salmao, 5 niguiris de salmao e 5 uramakis de salmao.',
    55.00,
    '/assets/images/combinado_salmao.png',
    TRUE,
    c.id
FROM categories c
WHERE LOWER(c.name) = LOWER('Combinados')
  AND NOT EXISTS (
    SELECT 1 FROM products p
    WHERE LOWER(p.name) = LOWER('Combinado Salmao (20 pecas)') AND p.category_id = c.id
);

INSERT INTO products (name, description, price, image_url, available, category_id)
SELECT
    'Combinado Especial (30 pecas)',
    '10 sashimis variados, 10 niguiris variados e 10 enrolados especiais.',
    85.00,
    '/assets/images/combinado_especial.png',
    TRUE,
    c.id
FROM categories c
WHERE LOWER(c.name) = LOWER('Combinados')
  AND NOT EXISTS (
    SELECT 1 FROM products p
    WHERE LOWER(p.name) = LOWER('Combinado Especial (30 pecas)') AND p.category_id = c.id
);

INSERT INTO products (name, description, price, image_url, available, category_id)
SELECT
    'Combinado Hot (16 pecas)',
    '8 hot rolls classicos e 8 hot rolls especiais com cream cheese e cebolinha.',
    45.00,
    '/assets/images/combinado_hot.png',
    TRUE,
    c.id
FROM categories c
WHERE LOWER(c.name) = LOWER('Combinados')
  AND NOT EXISTS (
    SELECT 1 FROM products p
    WHERE LOWER(p.name) = LOWER('Combinado Hot (16 pecas)') AND p.category_id = c.id
);

INSERT INTO products (name, description, price, image_url, available, category_id)
SELECT
    'Temaki de Salmao Completo',
    'Salmao batido com cream cheese e cebolinha.',
    25.00,
    '/assets/images/product_placeholder.png',
    TRUE,
    c.id
FROM categories c
WHERE LOWER(c.name) = LOWER('Temakis')
  AND NOT EXISTS (
    SELECT 1 FROM products p
    WHERE LOWER(p.name) = LOWER('Temaki de Salmao Completo') AND p.category_id = c.id
);

INSERT INTO products (name, description, price, image_url, available, category_id)
SELECT
    'Temaki Hot',
    'Temaki de salmao empanado e frito, com cream cheese e molho tare.',
    28.00,
    '/assets/images/product_placeholder.png',
    TRUE,
    c.id
FROM categories c
WHERE LOWER(c.name) = LOWER('Temakis')
  AND NOT EXISTS (
    SELECT 1 FROM products p
    WHERE LOWER(p.name) = LOWER('Temaki Hot') AND p.category_id = c.id
);

INSERT INTO products (name, description, price, image_url, available, category_id)
SELECT
    'Temaki Skin',
    'Pele de salmao grelhada, cream cheese e molho tare.',
    20.00,
    '/assets/images/product_placeholder.png',
    TRUE,
    c.id
FROM categories c
WHERE LOWER(c.name) = LOWER('Temakis')
  AND NOT EXISTS (
    SELECT 1 FROM products p
    WHERE LOWER(p.name) = LOWER('Temaki Skin') AND p.category_id = c.id
);

INSERT INTO products (name, description, price, image_url, available, category_id)
SELECT
    'Refrigerante lata',
    'Bebida gelada em lata.',
    6.00,
    '/assets/images/product_placeholder.png',
    TRUE,
    c.id
FROM categories c
WHERE LOWER(c.name) = LOWER('Bebidas')
  AND NOT EXISTS (
    SELECT 1 FROM products p
    WHERE LOWER(p.name) = LOWER('Refrigerante lata') AND p.category_id = c.id
);

INSERT INTO products (name, description, price, image_url, available, category_id)
SELECT
    'Agua Mineral',
    'Agua mineral sem gas.',
    3.00,
    '/assets/images/product_placeholder.png',
    TRUE,
    c.id
FROM categories c
WHERE LOWER(c.name) = LOWER('Bebidas')
  AND NOT EXISTS (
    SELECT 1 FROM products p
    WHERE LOWER(p.name) = LOWER('Agua Mineral') AND p.category_id = c.id
);

INSERT INTO products (name, description, price, image_url, available, category_id)
SELECT
    'Cha Gelado (Copo)',
    'Cha gelado com limao.',
    8.00,
    '/assets/images/product_placeholder.png',
    TRUE,
    c.id
FROM categories c
WHERE LOWER(c.name) = LOWER('Bebidas')
  AND NOT EXISTS (
    SELECT 1 FROM products p
    WHERE LOWER(p.name) = LOWER('Cha Gelado (Copo)') AND p.category_id = c.id
);

INSERT INTO products (name, description, price, image_url, available, category_id)
SELECT
    'Sunomono',
    'Saladinha de pepino agridoce com gergelim.',
    12.00,
    '/assets/images/product_placeholder.png',
    TRUE,
    c.id
FROM categories c
WHERE LOWER(c.name) = LOWER('Acompanhamentos')
  AND NOT EXISTS (
    SELECT 1 FROM products p
    WHERE LOWER(p.name) = LOWER('Sunomono') AND p.category_id = c.id
);

INSERT INTO products (name, description, price, image_url, available, category_id)
SELECT
    'Porcao de Gengibre',
    'Porcao de gengibre em conserva.',
    5.00,
    '/assets/images/product_placeholder.png',
    TRUE,
    c.id
FROM categories c
WHERE LOWER(c.name) = LOWER('Acompanhamentos')
  AND NOT EXISTS (
    SELECT 1 FROM products p
    WHERE LOWER(p.name) = LOWER('Porcao de Gengibre') AND p.category_id = c.id
);

INSERT INTO products (name, description, price, image_url, available, category_id)
SELECT
    'Edamame',
    'Porcao de graos de soja verde cozidos e salgados.',
    15.00,
    '/assets/images/product_placeholder.png',
    TRUE,
    c.id
FROM categories c
WHERE LOWER(c.name) = LOWER('Acompanhamentos')
  AND NOT EXISTS (
    SELECT 1 FROM products p
    WHERE LOWER(p.name) = LOWER('Edamame') AND p.category_id = c.id
);

INSERT INTO store_settings (
    id,
    store_open,
    opening_message,
    closing_message,
    whatsapp_number,
    delivery_fee,
    minimum_order_value
) VALUES (
    1,
    TRUE,
    'Loja aberta. Seu sushi sera preparado com ingredientes frescos e muito carinho!',
    'Loja fechada no momento. Voltamos no proximo horario de atendimento.',
    '5581989543788',
    0.00,
    10.00
)
ON CONFLICT (id) DO NOTHING;
