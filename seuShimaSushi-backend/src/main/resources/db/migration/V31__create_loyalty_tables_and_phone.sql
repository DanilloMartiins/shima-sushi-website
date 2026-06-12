CREATE TABLE loyalty_settings (
    id BIGINT PRIMARY KEY DEFAULT 1,
    stamps_needed INTEGER NOT NULL DEFAULT 10,
    prize_description VARCHAR(255) NOT NULL DEFAULT '1 produto grátis do cardápio',
    min_order_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT ck_loyalty_settings_single_row CHECK (id = 1)
);

CREATE TABLE loyalty_cards (
    id BIGSERIAL PRIMARY KEY,
    customer_clerk_id VARCHAR(100) NOT NULL,
    stamps INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_loyalty_cards_customer UNIQUE (customer_clerk_id)
);

CREATE TABLE loyalty_transactions (
    id BIGSERIAL PRIMARY KEY,
    card_id BIGINT NOT NULL,
    type VARCHAR(20) NOT NULL,
    order_id BIGINT,
    description VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_loyalty_transactions_card FOREIGN KEY (card_id) REFERENCES loyalty_cards(id),
    CONSTRAINT fk_loyalty_transactions_order FOREIGN KEY (order_id) REFERENCES orders(id),
    CONSTRAINT ck_loyalty_transactions_type CHECK (type IN ('EARNED', 'REDEEMED'))
);

INSERT INTO loyalty_settings (id, stamps_needed, prize_description, min_order_amount)
VALUES (1, 10, '1 produto grátis do cardápio', 0);

ALTER TABLE users ADD COLUMN phone VARCHAR(20);
