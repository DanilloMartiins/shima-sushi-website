ALTER TABLE products ADD COLUMN is_customizable BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE customization_groups (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    name VARCHAR(120) NOT NULL,
    min_selected INTEGER NOT NULL DEFAULT 0,
    max_selected INTEGER NOT NULL DEFAULT 1,
    display_order INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT fk_customization_groups_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE customization_options (
    id BIGSERIAL PRIMARY KEY,
    group_id BIGINT NOT NULL,
    name VARCHAR(120) NOT NULL,
    price_addition NUMERIC(10,2) NOT NULL DEFAULT 0,
    display_order INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT fk_customization_options_group FOREIGN KEY (group_id) REFERENCES customization_groups(id) ON DELETE CASCADE
);

ALTER TABLE order_items ADD COLUMN customizations VARCHAR(2000);
