CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    status VARCHAR(30) NOT NULL,
    payment_method VARCHAR(30) NOT NULL,
    delivery_type VARCHAR(20) NOT NULL,
    delivery_address VARCHAR(500),
    notes VARCHAR(500),
    total_amount NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES users(id),
    CONSTRAINT ck_orders_total_non_negative CHECK (total_amount >= 0),
    CONSTRAINT ck_orders_status CHECK (status IN (
        'CREATED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'
    )),
    CONSTRAINT ck_orders_payment_method CHECK (payment_method IN (
        'PIX', 'CARTAO_CREDITO', 'DINHEIRO'
    )),
    CONSTRAINT ck_orders_delivery_type CHECK (delivery_type IN (
        'RETIRADA', 'ENTREGA'
    ))
);

CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT ck_order_items_quantity_positive CHECK (quantity > 0),
    CONSTRAINT ck_order_items_unit_price_non_negative CHECK (unit_price >= 0),
    CONSTRAINT ck_order_items_subtotal_non_negative CHECK (subtotal >= 0)
);

CREATE INDEX idx_orders_customer_id ON orders (customer_id);
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_orders_created_at ON orders (created_at);
CREATE INDEX idx_order_items_order_id ON order_items (order_id);
