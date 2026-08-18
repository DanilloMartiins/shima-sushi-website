-- Os itens "monte voce mesmo" do seed eram placeholders de R$ 0,01.
-- O admin cadastra as versoes customizaveis reais (com grupos e valores),
-- entao nao faz sentido eles continuarem no cardapio como produto simples.
DELETE FROM scraped_products WHERE nome IN ('Monte seu Poke G', 'Seu Shima Poke M', 'Seja o chef!');