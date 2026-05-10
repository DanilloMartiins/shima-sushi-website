CREATE TABLE scraped_products (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    preco NUMERIC(10, 2) NOT NULL,
    url_imagem VARCHAR(1000),
    data_atualizacao TIMESTAMP NOT NULL
);

-- Indexando o nome para buscas mais rápidas no cardápio, se necessário
CREATE INDEX idx_scraped_products_nome ON scraped_products(nome);
