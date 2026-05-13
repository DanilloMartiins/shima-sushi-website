-- Limpa o cache de teste antigo
DELETE FROM scraped_products;

-- Insere os dados REAIS baseados no JSON encontrado
INSERT INTO scraped_products (nome, preco, url_imagem, data_atualizacao)
VALUES 
('Experiência do Chef (20 peças)', 129.90, 'https://cdn-production.yooga.com.br/59ab7ba597d80b0c6bc51315707b3194.jpeg', CURRENT_TIMESTAMP),
('Experiência do Chef (36 peças)', 210.00, 'https://cdn-production.yooga.com.br/c3852615a0f361cc908d618fe4990988.jpeg', CURRENT_TIMESTAMP),
('Combinado Gojuu (50 peças)', 114.90, 'https://cdn-production.yooga.com.br/a821d3b89bb4c1f7bb0816791fc9cf07.png', CURRENT_TIMESTAMP),
('Combinado Hot (20 peças)', 69.90, 'https://cdn-production.yooga.com.br/edb721a0b7a8a53af03c942e5207e176.png', CURRENT_TIMESTAMP),
('Combinado Ipê (30 peças)', 104.90, 'https://cdn-production.yooga.com.br/f7676f1c094eb957e33a122974d1d261.jpeg', CURRENT_TIMESTAMP),
('Combinado Yokohama (10 peças)', 69.90, 'https://cdn-production.yooga.com.br/3f22dc95e56205b759165d1c72fb48b6.png', CURRENT_TIMESTAMP),
('Temaki de Salmão Completo', 45.90, 'https://cdn-production.yooga.com.br/1f8b57f164cd0ca9eabad32beec45142.jpeg', CURRENT_TIMESTAMP),
('Temaki de Salmão Hot', 49.00, 'https://cdn-production.yooga.com.br/457483d74fc1394884774804d2bd7279.png', CURRENT_TIMESTAMP),
('Sunomono Especial', 25.90, 'https://cdn-production.yooga.com.br/4dae1a8fe535a9d5cdf11e52e3cf0b84.png', CURRENT_TIMESTAMP),
('Ceviche Tradicional', 49.90, 'https://cdn-production.yooga.com.br/4fa597b381be59e363042cacb7e0e622.png', CURRENT_TIMESTAMP),
('Yakisoba de Camarão', 79.90, 'https://cdn-production.yooga.com.br/3506420220809011437xOUTKXqrX.jpeg', CURRENT_TIMESTAMP);
