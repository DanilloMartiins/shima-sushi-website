ALTER TABLE orders
    ADD COLUMN payment_status VARCHAR(20),
    ADD COLUMN transaction_id VARCHAR(100),
    ADD COLUMN gateway_reference VARCHAR(100),
    ADD COLUMN paid_at TIMESTAMP,
    ADD COLUMN pix_copia_e_cola VARCHAR(2000);