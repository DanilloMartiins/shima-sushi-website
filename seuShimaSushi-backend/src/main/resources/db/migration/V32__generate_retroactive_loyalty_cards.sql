-- Cria cartão pra todo customer que tem pedido COMPLETED mas não tem cartão
INSERT INTO loyalty_cards (customer_clerk_id, stamps, created_at, updated_at)
SELECT DISTINCT o.customer_clerk_id, COUNT(o.id), NOW(), NOW()
FROM orders o
LEFT JOIN loyalty_cards lc ON lc.customer_clerk_id = o.customer_clerk_id
WHERE o.status = 'COMPLETED'
AND lc.id IS NULL
GROUP BY o.customer_clerk_id;

-- Cria cartão com 0 selos pra customers que não tem pedido ainda
INSERT INTO loyalty_cards (customer_clerk_id, stamps, created_at, updated_at)
SELECT DISTINCT u.clerk_id, 0, NOW(), NOW()
FROM users u
WHERE u.role = 'CUSTOMER'
AND u.clerk_id IS NOT NULL
AND u.clerk_id NOT IN (SELECT customer_clerk_id FROM loyalty_cards);

-- Adiciona transações de selo pra cada pedido COMPLETED existente
INSERT INTO loyalty_transactions (card_id, type, order_id, description, created_at)
SELECT lc.id, 'EARNED', o.id, CONCAT('Selo ganho pelo pedido #', o.id), o.updated_at
FROM orders o
JOIN loyalty_cards lc ON lc.customer_clerk_id = o.customer_clerk_id
WHERE o.status = 'COMPLETED'
AND NOT EXISTS (
    SELECT 1 FROM loyalty_transactions lt
    WHERE lt.card_id = lc.id AND lt.order_id = o.id
);
