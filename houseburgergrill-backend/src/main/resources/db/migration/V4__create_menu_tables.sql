CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Evita duplicidade por nome, inclusive variando maiusculas/minusculas.
CREATE UNIQUE INDEX uk_categories_name_lower ON categories (LOWER(name));

CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    description VARCHAR(500) NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    image_url VARCHAR(400) NOT NULL,
    available BOOLEAN NOT NULL DEFAULT TRUE,
    category_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_products_price_non_negative CHECK (price >= 0),
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE INDEX idx_products_category_id ON products (category_id);
CREATE INDEX idx_products_available ON products (available);

CREATE TABLE store_settings (
    id INTEGER PRIMARY KEY,
    store_open BOOLEAN NOT NULL,
    opening_message VARCHAR(255) NOT NULL,
    closing_message VARCHAR(255) NOT NULL,
    whatsapp_number VARCHAR(30) NOT NULL,
    delivery_fee NUMERIC(10,2) NOT NULL,
    minimum_order_value NUMERIC(10,2) NOT NULL,
    CONSTRAINT ck_store_settings_single_row CHECK (id = 1),
    CONSTRAINT ck_store_settings_delivery_fee_non_negative CHECK (delivery_fee >= 0),
    CONSTRAINT ck_store_settings_min_order_non_negative CHECK (minimum_order_value >= 0)
);
