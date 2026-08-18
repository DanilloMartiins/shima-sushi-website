-- Troco do cliente pago em dinheiro. Preciso pro motoqueiro saber quanto
-- dar de troco na entrega (no Brasil a gente nao confia em ninguem).
ALTER TABLE orders ADD COLUMN change_amount NUMERIC(10, 2);