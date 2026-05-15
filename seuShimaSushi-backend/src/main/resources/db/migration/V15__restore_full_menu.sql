-- Limpa os produtos encurtados que o scraper salvou por engano
DELETE FROM scraped_products;

-- Restaura os dados REAIS e COMPLETOS da V13
INSERT INTO scraped_products (nome, preco, url_imagem, categoria, data_atualizacao)
VALUES 
-- Experiência do Chef
('Experiência do Chef (20 peças)', 129.90, 'https://cdn-production.yooga.com.br/59ab7ba597d80b0c6bc51315707b3194.jpeg', 'Experiência do Chef', CURRENT_TIMESTAMP),
('Experiência do Chef (36 peças)', 210.00, 'https://cdn-production.yooga.com.br/c3852615a0f361cc908d618fe4990988.jpeg', 'Experiência do Chef', CURRENT_TIMESTAMP),

-- Combinado
('Combinado Gojuu (50 peças)', 114.90, 'https://cdn-production.yooga.com.br/a821d3b89bb4c1f7bb0816791fc9cf07.png', 'Combinado', CURRENT_TIMESTAMP),
('Combinado Hot (20 peças)', 69.90, 'https://cdn-production.yooga.com.br/edb721a0b7a8a53af03c942e5207e176.png', 'Combinado', CURRENT_TIMESTAMP),
('Combinado Ipê (30 peças)', 104.90, 'https://cdn-production.yooga.com.br/f7676f1c094eb957e33a122974d1d261.jpeg', 'Combinado', CURRENT_TIMESTAMP),
('Combinado Nagano (30 peças)', 99.90, 'https://cdn-production.yooga.com.br/3506420220809023453XKQ0YhRa8.jpeg', 'Combinado', CURRENT_TIMESTAMP),
('Combinado Hakone (14 peças)', 74.90, NULL, 'Combinado', CURRENT_TIMESTAMP),
('Combinado Yokohama (10 peças)', 69.90, 'https://cdn-production.yooga.com.br/3f22dc95e56205b759165d1c72fb48b6.png', 'Combinado', CURRENT_TIMESTAMP),
('Combinado Tokyo (35 peças)', 184.95, 'https://cdn-production.yooga.com.br/2fa9cb09a29d855d314bded66c68123b.png', 'Combinado', CURRENT_TIMESTAMP),
('Combinado Castanheiras (38 peças)', 179.85, 'https://cdn-production.yooga.com.br/1ba021a946c0ab11bf942a9ae1d1a127.png', 'Combinado', CURRENT_TIMESTAMP),
('Combinado de Salmão (50peças)', 189.90, 'https://cdn-production.yooga.com.br/e5fcb9e2f566d58af3f1251be6a37c58.jpeg', 'Combinado', CURRENT_TIMESTAMP),
('Combinado Juuni (12 peças)', 69.90, 'https://cdn-production.yooga.com.br/b7858fc8537822b9f422bed2ce281eba.png', 'Combinado', CURRENT_TIMESTAMP),
('Combinado de Salmão (17 peças)', 81.90, 'https://cdn-production.yooga.com.br/7b9d5f1e256596671e9719ebad627221.jpeg', 'Combinado', CURRENT_TIMESTAMP),
('Combinado Sensei (78 peças)', 255.90, 'https://cdn-production.yooga.com.br/3506420220809023021d9JAMXKEx.jpeg', 'Combinado', CURRENT_TIMESTAMP),
('Combinado Sanjuro Tsu', 195.90, 'https://cdn-production.yooga.com.br/d49dc734ae55001daf5fd5ad2951a802.jpeg', 'Combinado', CURRENT_TIMESTAMP),
('Combinado José Shimabuko', 169.90, 'https://cdn-production.yooga.com.br/893bc8717abbaa66081baef7e9e1bc04.jpeg', 'Combinado', CURRENT_TIMESTAMP),
('Combinado Okinawa ', 284.90, 'https://cdn-production.yooga.com.br/d28b89115d005df8d3e07c9495667f94.jpeg', 'Combinado', CURRENT_TIMESTAMP),
('Combinado Rojeshi', 104.90, 'https://cdn-production.yooga.com.br/e6d9d19a4e66e430fece2579c3932e24.jpeg', 'Combinado', CURRENT_TIMESTAMP),

-- Combinados Individuais
('Combinado Kaito -25 peças ', 99.90, 'https://cdn-production.yooga.com.br/f02a87bf2a18e67f7aad8ef6c312441e.jpeg', 'Combinados Individuais', CURRENT_TIMESTAMP),
('Combinado Haruto -15 peças ', 96.00, 'https://cdn-production.yooga.com.br/042ac3188deac1090f855fbc32ec5295.jpeg', 'Combinados Individuais', CURRENT_TIMESTAMP),

-- Poke
('Monte seu Poke G', 0.01, 'https://cdn-production.yooga.com.br/343eb1277a47ae6889dafdab15a1b8d1.jpeg', 'Poke', CURRENT_TIMESTAMP),
('Seu Shima Poke M', 0.01, 'https://cdn-production.yooga.com.br/543d11e6921e0ffce5c75519f6c95d89.jpeg', 'Poke', CURRENT_TIMESTAMP),

-- Yakisobas Individuais
('Individual Camarão 450g', 54.90, 'https://cdn-production.yooga.com.br/3506420220809011437xOUTKXqrX.jpeg', 'Yakisobas Individuais', CURRENT_TIMESTAMP),
('Individual De Carne 450g', 49.90, 'https://cdn-production.yooga.com.br/35064202208090115015DycfKiew.jpeg', 'Yakisobas Individuais', CURRENT_TIMESTAMP),
('Individual Frango 450g', 39.91, 'https://cdn-production.yooga.com.br/3506420220809011408FSJyg7tLY.jpeg', 'Yakisobas Individuais', CURRENT_TIMESTAMP),
('Yakisoba individual Misto 450g', 45.90, 'https://cdn-production.yooga.com.br/de3935a7aab287f20381955fc4f81cfa.jpeg', 'Yakisobas Individuais', CURRENT_TIMESTAMP),

-- Temaki
('Temaki de Salmão Completo', 45.90, 'https://cdn-production.yooga.com.br/1f8b57f164cd0ca9eabad32beec45142.jpeg', 'Temaki', CURRENT_TIMESTAMP),
('Temaki de Atum Completo', 39.90, 'https://cdn-production.yooga.com.br/467a50e2921a076e80d807d436c186ff.png', 'Temaki', CURRENT_TIMESTAMP),
('Temaki de Camarão Completo', 44.90, 'https://cdn-production.yooga.com.br/c2ce49f8c6570ad6a7d9b42857b5fcc1.jpeg', 'Temaki', CURRENT_TIMESTAMP),
('Temaki de Salmão com Shimeji', 48.90, 'https://cdn-production.yooga.com.br/a5f070de8a6d6c54f3ef1166f2ddb2e9.jpeg', 'Temaki', CURRENT_TIMESTAMP),
('Temaki de Salmão Hot', 49.00, 'https://cdn-production.yooga.com.br/457483d74fc1394884774804d2bd7279.png', 'Temaki', CURRENT_TIMESTAMP),
('Temaki de Salmão Empanado', 47.90, 'https://cdn-production.yooga.com.br/92dfd74a8cf90bf9ae40d34adc165e60.png', 'Temaki', CURRENT_TIMESTAMP),
('Temaki de Salmão e Camarão', 45.90, 'https://cdn-production.yooga.com.br/c2ce49f8c6570ad6a7d9b42857b5fcc1.jpeg', 'Temaki', CURRENT_TIMESTAMP),
('Temaki de Skin cheese', 20.90, 'https://cdn-production.yooga.com.br/cff4edd2bcdc8406ad4dfa76815bff02.jpeg', 'Temaki', CURRENT_TIMESTAMP),

-- Hot (10 peças)
('Hot Skin', 20.00, 'https://cdn-production.yooga.com.br/3506420220809021517xalHsAD4t.jpeg', 'Hot (10 peças)', CURRENT_TIMESTAMP),
('Hot Philadelphia', 39.90, 'https://cdn-production.yooga.com.br/3506420220809021533PNZ5RFFiU.jpeg', 'Hot (10 peças)', CURRENT_TIMESTAMP),
('Hot Gambei', 42.90, 'https://cdn-production.yooga.com.br/f0168fd0d2589f06d4d37884cdb95f21.jpeg', 'Hot (10 peças)', CURRENT_TIMESTAMP),
('Hot Especial', 42.90, 'https://cdn-production.yooga.com.br/07937e17c5a33640ff47bbe74a3f183f.jpeg', 'Hot (10 peças)', CURRENT_TIMESTAMP),
('shima', 39.90, 'https://cdn-production.yooga.com.br/3506420220809021600LrQWQ9zrr.jpeg', 'Hot (10 peças)', CURRENT_TIMESTAMP),
('Haru Geléia', 39.90, 'https://cdn-production.yooga.com.br/3506420220809021612Wx7XlCW3q.jpeg', 'Hot (10 peças)', CURRENT_TIMESTAMP),
('Haru Geléia de Pimenta', 39.90, 'https://cdn-production.yooga.com.br/3506420220809021624t0xtGgm2F.jpeg', 'Hot (10 peças)', CURRENT_TIMESTAMP),

-- Entradas
('Sunomono Especial', 25.90, 'https://cdn-production.yooga.com.br/4dae1a8fe535a9d5cdf11e52e3cf0b84.png', 'Entradas', CURRENT_TIMESTAMP),
('Sunomono Simples', 15.90, 'https://cdn-production.yooga.com.br/0bc84094f0e2cb7e8ef6114ad890939c.jpeg', 'Entradas', CURRENT_TIMESTAMP),
('Tartar de Salmão Tradicional', 59.90, 'https://cdn-production.yooga.com.br/c5e5daffe9bac7d39294fa512a74cb54.jpeg', 'Entradas', CURRENT_TIMESTAMP),
('Camarão Empanado (10 unidades)', 45.90, 'https://cdn-production.yooga.com.br/3506420220809023838BUrpqSHTH.jpeg', 'Entradas', CURRENT_TIMESTAMP),
('Ika Furai (10 unidades)', 36.90, 'https://cdn-production.yooga.com.br/3df136ebf16044ca360b604de2dbe550.jpeg', 'Entradas', CURRENT_TIMESTAMP),
('Ika Grelhada (10 unidades)', 39.90, 'https://cdn-production.yooga.com.br/e0fb7ee141d5809ffc431b3c32632ebd.jpeg', 'Entradas', CURRENT_TIMESTAMP),
('Guioza no vapor (6 unidades)', 54.90, 'https://cdn-production.yooga.com.br/3506420220809023756jKesYbxeU.jpeg', 'Entradas', CURRENT_TIMESTAMP),
(' Harumaki Primavera (2 unidades)', 16.90, 'https://cdn-production.yooga.com.br/62a597ec287a0e59c80ae21ac687f7d1.jpeg', 'Entradas', CURRENT_TIMESTAMP),
('Harumaki de Frango com Catupiry (2 unidades)', 19.90, 'https://cdn-production.yooga.com.br/8db328e6133b21daf1af013e568877f6.jpeg', 'Entradas', CURRENT_TIMESTAMP),
('Kakiage (3 Unidades)', 14.90, 'https://cdn-production.yooga.com.br/0928bf8e531f4f2af965181b0e05bfd2.jpeg', 'Entradas', CURRENT_TIMESTAMP),

-- Seja o chefe!
('Seja o chef!', 0.01, NULL, 'Seja o chefe!', CURRENT_TIMESTAMP),
('Shimarrito ', 34.90, 'https://cdn-production.yooga.com.br/6a98a705b461d712350689a974bf2965.png', 'Seja o chefe!', CURRENT_TIMESTAMP),

-- Ceviche
('Ceviche Tradicional', 49.90, 'https://cdn-production.yooga.com.br/4fa597b381be59e363042cacb7e0e622.png', 'Ceviche', CURRENT_TIMESTAMP),

-- Yakisobas
('Yakisoba de Camarão', 79.90, 'https://cdn-production.yooga.com.br/3506420220809011437xOUTKXqrX.jpeg', 'Yakisobas', CURRENT_TIMESTAMP),
('Yakisoba de Frango', 64.00, 'https://cdn-production.yooga.com.br/3506420220809011408FSJyg7tLY.jpeg', 'Yakisobas', CURRENT_TIMESTAMP),
('Yakisoba de Filé Mignon', 74.90, 'https://cdn-production.yooga.com.br/35064202208090115015DycfKiew.jpeg', 'Yakisobas', CURRENT_TIMESTAMP),
('Yakisoba Misto', 70.90, 'https://cdn-production.yooga.com.br/de3935a7aab287f20381955fc4f81cfa.jpeg', 'Yakisobas', CURRENT_TIMESTAMP),

-- Sushi
('Sushi de Hadock (2 peças)', 14.00, 'https://cdn-production.yooga.com.br/3506420220809022120KPN9H4pEf.jpeg', 'Sushi', CURRENT_TIMESTAMP),
('Sushi de Hadock (4 peças)', 24.00, 'https://cdn-production.yooga.com.br/3506420220809022112AILxnbo3R.jpeg', 'Sushi', CURRENT_TIMESTAMP),
('Sushi de Peixe Branco (2 peças)', 10.00, 'https://cdn-production.yooga.com.br/3506420220809022054gfT5r9hnQ.jpeg', 'Sushi', CURRENT_TIMESTAMP),
('Sushi de Peixe Branco (4 peças)', 18.00, 'https://cdn-production.yooga.com.br/3506420220809022044uAEDuTFoT.jpeg', 'Sushi', CURRENT_TIMESTAMP),
('Sushi de Peixe Branco (6 peças)', 24.00, 'https://cdn-production.yooga.com.br/3506420220809022034uBwifav8G.jpeg', 'Sushi', CURRENT_TIMESTAMP),
('Sushi Skin (2 peças)', 8.00, 'https://cdn-production.yooga.com.br/3506420220809022024JB9qr2QdX.jpeg', 'Sushi', CURRENT_TIMESTAMP),
('Sushi Skin (4 peças)', 14.00, 'https://cdn-production.yooga.com.br/3506420220809022016C1EKmUdjm.jpeg', 'Sushi', CURRENT_TIMESTAMP),
('Sushi Skin (6 peças)', 20.00, 'https://cdn-production.yooga.com.br/3506420220809022007Jq3IF4qC0.jpeg', 'Sushi', CURRENT_TIMESTAMP),
('Sushi de Kani (2 peças)', 10.00, 'https://cdn-production.yooga.com.br/3506420220809021956sbBPuWL1k.jpeg', 'Sushi', CURRENT_TIMESTAMP),
('Sushi de Kani (4 peças)', 18.00, 'https://cdn-production.yooga.com.br/3506420220809021947aYDjO7iuO.jpeg', 'Sushi', CURRENT_TIMESTAMP),
('Sushi de Salmão (2 peças)', 12.00, 'https://cdn-production.yooga.com.br/3506420220809021929iSracqklt.jpeg', 'Sushi', CURRENT_TIMESTAMP),
('Sushi de Salmão (4 peças)', 20.00, 'https://cdn-production.yooga.com.br/3506420220809021921TTgkuricd.jpeg', 'Sushi', CURRENT_TIMESTAMP),
('Sushi de Salmão (6 peças)', 28.00, 'https://cdn-production.yooga.com.br/3506420220809021912B0dAiiBNu.jpeg', 'Sushi', CURRENT_TIMESTAMP),
('Sushi de Atum (2 peças)', 10.00, 'https://cdn-production.yooga.com.br/3506420220809021903W6iLvlihc.jpeg', 'Sushi', CURRENT_TIMESTAMP),
('Sushi de Atum (4 peças)', 18.00, 'https://cdn-production.yooga.com.br/3506420220809021855TrFPSzk1S.jpeg', 'Sushi', CURRENT_TIMESTAMP),
('Sushi Poró (2 peças)', 14.00, 'https://cdn-production.yooga.com.br/3506420220809021814n7C1v35As.jpeg', 'Sushi', CURRENT_TIMESTAMP),
('Sushi Poró (4 peças)', 28.00, 'https://cdn-production.yooga.com.br/3506420220809021805SZt5XvZ5C.jpeg', 'Sushi', CURRENT_TIMESTAMP),
('Shake Toro (2 peças)', 14.00, NULL, 'Sushi', CURRENT_TIMESTAMP),
('Shake Toro (4 peças)', 28.00, NULL, 'Sushi', CURRENT_TIMESTAMP),

-- Pratos Quentes
('Shimeji', 31.90, 'https://cdn-production.yooga.com.br/3506420220809011534ksvoeHmhE.jpeg', 'Pratos Quentes', CURRENT_TIMESTAMP),
('Teppan de Salmão', 61.90, 'https://cdn-production.yooga.com.br/716c6e92b4b65856ed6224bb8a89f473.jpeg', 'Pratos Quentes', CURRENT_TIMESTAMP),
('Yakimeshi', 35.90, 'https://cdn-production.yooga.com.br/344c69aa5dd2f38fa76eaf095215164c.jpeg', 'Pratos Quentes', CURRENT_TIMESTAMP),

-- Carpaccio
('Carpaccio Barriga de Salmão', 55.90, 'https://cdn-production.yooga.com.br/533bced643dc79541a878b28a03e42d7.jpeg', 'Carpaccio', CURRENT_TIMESTAMP),
('Carpaccio de Salmão Flambado', 55.90, 'https://cdn-production.yooga.com.br/2caaffc0241d86d0afb96f3a21fa7611.png', 'Carpaccio', CURRENT_TIMESTAMP),

-- Sashimi
('Sashimi de Peixe Branco 5 peças', 23.90, 'https://cdn-production.yooga.com.br/3506420220809022408TmpQ276Xy.jpeg', 'Sashimi', CURRENT_TIMESTAMP),
('Sashimi de Peixe Branco 15 peças', 45.90, 'https://cdn-production.yooga.com.br/3506420220809022357DLjV4UyHs.jpeg', 'Sashimi', CURRENT_TIMESTAMP),
('Sashimi de Atum 5 peças', 23.90, 'https://cdn-production.yooga.com.br/3506420220809022250GlLVuFObY.jpeg', 'Sashimi', CURRENT_TIMESTAMP),
('Sashimi de Atum 15 peças', 50.90, 'https://cdn-production.yooga.com.br/35064202208090222417laAGxhZ5.jpeg', 'Sashimi', CURRENT_TIMESTAMP),
('Sashimi de Salmão 5 peças', 30.90, 'https://cdn-production.yooga.com.br/3506420220809022231OAxVYkBR3.jpeg', 'Sashimi', CURRENT_TIMESTAMP),
('Sashimi de Salmão 15 peças', 89.90, 'https://cdn-production.yooga.com.br/3506420220809022220fYr8RIq6F.jpeg', 'Sashimi', CURRENT_TIMESTAMP),
('Sashimi de salmão parte nobre', 35.90, NULL, 'Sashimi', CURRENT_TIMESTAMP),

-- Gunka (6 peças)
('Gunka Salmão Tartar', 44.90, 'https://cdn-production.yooga.com.br/3506420220809022931gv88IqNox.jpeg', 'Gunka (6 peças)', CURRENT_TIMESTAMP),
('Gunka Salmão Shimeji', 44.90, 'https://cdn-production.yooga.com.br/f9423220e5a92d1e30f59394436d2346.jpeg', 'Gunka (6 peças)', CURRENT_TIMESTAMP),
('Gunka Salmão Gambei', 39.90, 'https://cdn-production.yooga.com.br/3506420220809022913E8nXgpiqZ.jpeg', 'Gunka (6 peças)', CURRENT_TIMESTAMP),
('Gunka Salmão Geléia de Amora', 38.90, 'https://cdn-production.yooga.com.br/3506420220809022845bn03hfOse.jpeg', 'Gunka (6 peças)', CURRENT_TIMESTAMP),
('Gunka Salmão Geléia de Pimenta', 38.90, 'https://cdn-production.yooga.com.br/3506420220809022832hIhuK70em.jpeg', 'Gunka (6 peças)', CURRENT_TIMESTAMP),
('Gunka Salmão com Molho de Maracujá', 39.90, 'https://cdn-production.yooga.com.br/3506420220809022815f2O9E8liX.jpeg', 'Gunka (6 peças)', CURRENT_TIMESTAMP),
('Gunka Atum Crispy de Gengibre', 36.90, 'https://cdn-production.yooga.com.br/3506420220809022757r3F1TEyVm.jpeg', 'Gunka (6 peças)', CURRENT_TIMESTAMP),
('Gunka Especial Shimeji', 49.90, 'https://cdn-production.yooga.com.br/3506420220809022738mf1XKYpea.jpeg', 'Gunka (6 peças)', CURRENT_TIMESTAMP),
('Gunka Vegetariano Pepino', 28.99, 'https://cdn-production.yooga.com.br/adf076ac0dd57a55f29953d58275370c.jpeg', 'Gunka (6 peças)', CURRENT_TIMESTAMP),
('Gunka Cream Cheese', 39.90, 'https://cdn-production.yooga.com.br/d917fcb71c1710dcf1227afce2529a8b.jpeg', 'Gunka (6 peças)', CURRENT_TIMESTAMP),

-- Uramaki (8 peças)
('Uramaki de Salmão', 41.90, 'https://cdn-production.yooga.com.br/3506420220809022634TL3FeEbgQ.jpeg', 'Uramaki (8 peças)', CURRENT_TIMESTAMP),
('Uramaki de Camarão', 39.90, 'https://cdn-production.yooga.com.br/120201112170357YBpu1ClGH.png', 'Uramaki (8 peças)', CURRENT_TIMESTAMP),
('Uramaki California', 20.90, 'https://cdn-production.yooga.com.br/3506420220809022554JYPmCD5pr.jpeg', 'Uramaki (8 peças)', CURRENT_TIMESTAMP),
('Uramaki Skin', 20.90, 'https://cdn-production.yooga.com.br/3506420220809022533inlhyxwSH.jpeg', 'Uramaki (8 peças)', CURRENT_TIMESTAMP),

-- Makimono (8 peças)
('Makimono Philadelphia', 40.90, 'https://cdn-production.yooga.com.br/3506420220809022514FHyKDTbVO.jpeg', 'Makimono (8 peças)', CURRENT_TIMESTAMP),
('Makimono Tekamaki', 35.90, 'https://cdn-production.yooga.com.br/3506420220809022501KxrHpITn3.jpeg', 'Makimono (8 peças)', CURRENT_TIMESTAMP),
('Makimono Salmãomaki', 40.90, 'https://cdn-production.yooga.com.br/3506420220809022441mBx4t9RsM.jpeg', 'Makimono (8 peças)', CURRENT_TIMESTAMP),
('Makimono Salmão Shimeji', 44.90, 'https://cdn-production.yooga.com.br/120201112170357YBpu1ClGH.png', 'Makimono (8 peças)', CURRENT_TIMESTAMP),

-- Especiais
('Ebi Spice (8 peças)', 59.90, 'https://cdn-production.yooga.com.br/35064202208090239590qUxlmcZX.jpeg', 'Especiais', CURRENT_TIMESTAMP),
('Lua Cheia (8 peças)', 44.90, 'https://cdn-production.yooga.com.br/c138cd4629b9e3ba3ed57c61fdc1b3e3.jpeg', 'Especiais', CURRENT_TIMESTAMP),
('Ebi Especial (6 peças)', 59.90, 'https://cdn-production.yooga.com.br/60de92165eaa8e547617e4325ff2c1da.jpeg', 'Especiais', CURRENT_TIMESTAMP),

-- Complementos
('Os pedidos já acompanham 1 unidade de cada item a seguir', 0.00, NULL, 'Complementos', CURRENT_TIMESTAMP),
('Molho Teriaki', 3.00, NULL, 'Complementos', CURRENT_TIMESTAMP),
('Gengibre em Conserva', 3.00, NULL, 'Complementos', CURRENT_TIMESTAMP),
('Adaptador de Hashi', 2.00, 'https://cdn-production.yooga.com.br/536fdee543b0dd4fe34d0704e5c5ab85.webp', 'Complementos', CURRENT_TIMESTAMP),
('Adicional de 5 Reais!', 5.00, NULL, 'Complementos', CURRENT_TIMESTAMP),

-- Bebidas
('Agua Mineral Pedra Azul com Gás 510 ml', 6.00, 'https://cdn-production.yooga.com.br/344280ffc589a7ffbf154fbf0549e351.webp', 'Bebidas', CURRENT_TIMESTAMP),
('Agua Mineral Pedra Azul 510 ml', 5.00, 'https://cdn-production.yooga.com.br/129fc12c4d86db84253ccf0c8f78ade9.webp', 'Bebidas', CURRENT_TIMESTAMP),
('Agua Tonica Antartica 350 ml', 7.90, 'https://cdn-production.yooga.com.br/b39c049bd2ed1441964659522a1901e0.webp', 'Bebidas', CURRENT_TIMESTAMP),
('Coca Cola Sem Açúcar 350 ml', 9.90, 'https://cdn-production.yooga.com.br/91202145ba39b6a0ade32bbcb84975e4.jpeg', 'Bebidas', CURRENT_TIMESTAMP),
('Coca Cola Original 350 ml', 9.90, 'https://cdn-production.yooga.com.br/783586abae80e8e0abf8244268ab834b.jpeg', 'Bebidas', CURRENT_TIMESTAMP),
('Refrigerante H20 Limoneto 500ml', 9.00, 'https://cdn-production.yooga.com.br/aec27143b771134bc4997b24469a84ba.jpeg', 'Bebidas', CURRENT_TIMESTAMP),
('Guarana Antartica Lata 350 ml', 7.90, 'https://cdn-production.yooga.com.br/92766abdcf4900e3cda4ae9287b7676e.jpeg', 'Bebidas', CURRENT_TIMESTAMP),

-- Sobremesa
('Harumaki Romeu e Julieta (2 unidades)', 16.90, 'https://cdn-production.yooga.com.br/04f6db39b948f404636f0ad5c059460f.jpeg', 'Sobremesa', CURRENT_TIMESTAMP),
('Harumaki Banana com Nutella (2 unidades)', 16.90, 'https://cdn-production.yooga.com.br/6861ad23f4ffa8590c46c25b9033a377.jpeg', 'Sobremesa', CURRENT_TIMESTAMP);
