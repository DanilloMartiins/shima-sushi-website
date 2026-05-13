CREATE TABLE user_addresses (
    id BIGSERIAL PRIMARY KEY,
    clerk_user_id VARCHAR(100) NOT NULL,
    street VARCHAR(255) NOT NULL,
    number VARCHAR(20) NOT NULL,
    neighborhood VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL DEFAULT 'Garanhuns',
    zip_code VARCHAR(20),
    complement VARCHAR(255),
    reference_point VARCHAR(255),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- Índice para buscar rápido o endereço do usuário
CREATE INDEX idx_user_addresses_clerk_id ON user_addresses(clerk_user_id);
-- Garante que o ID do usuário seja indexado junto com a flag de padrão
CREATE INDEX idx_user_addresses_default ON user_addresses(clerk_user_id, is_default);
