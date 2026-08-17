-- ============================================================
-- Script: Unifica categorias 'Combinado' e 'Combinados'
-- Projeto: Seu Shima Sushi
-- Motivo: A migration V13/V15 criou 'Combinado' (singular)
--         enquanto o seed V5 criou 'Combinados' (plural),
--         resultando em duas abas no cardapio.
-- ============================================================

-- 1. Verifica se as duas categorias existem
DO $$
DECLARE
  v_plural_id INT;
  v_singular_id INT;
BEGIN
  SELECT id INTO v_plural_id FROM categories WHERE name = 'Combinados' LIMIT 1;
  SELECT id INTO v_singular_id FROM categories WHERE name = 'Combinado' LIMIT 1;

  -- 2. Move os produtos de 'Combinado' para 'Combinados'
  IF v_singular_id IS NOT NULL THEN
    IF v_plural_id IS NOT NULL THEN
      UPDATE products SET category_id = v_plural_id WHERE category_id = v_singular_id;
    END IF;

    -- 3. Remove a categoria duplicada
    DELETE FROM categories WHERE name = 'Combinado';
  END IF;
END $$;
