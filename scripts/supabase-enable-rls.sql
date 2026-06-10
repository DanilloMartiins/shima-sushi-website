-- ============================================================
-- Script: Ativar RLS e criar policies seguras no Supabase
-- Projeto: Seu Shima Sushi
-- Descricao: Habilita Row Level Security em todas as tabelas
--            do schema public e cria policies padrao para
--            usuarios autenticados (role = 'authenticated')
-- ============================================================

-- ============================================================
-- 1. users
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_authenticated" ON public.users
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "users_insert_authenticated" ON public.users
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "users_update_authenticated" ON public.users
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "users_delete_authenticated" ON public.users
    FOR DELETE
    TO authenticated
    USING (true);

-- ============================================================
-- 2. refresh_tokens
-- ============================================================
ALTER TABLE public.refresh_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "refresh_tokens_select_authenticated" ON public.refresh_tokens
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "refresh_tokens_insert_authenticated" ON public.refresh_tokens
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "refresh_tokens_update_authenticated" ON public.refresh_tokens
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "refresh_tokens_delete_authenticated" ON public.refresh_tokens
    FOR DELETE
    TO authenticated
    USING (true);

-- ============================================================
-- 3. categories
-- ============================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_select_authenticated" ON public.categories
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "categories_insert_authenticated" ON public.categories
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "categories_update_authenticated" ON public.categories
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "categories_delete_authenticated" ON public.categories
    FOR DELETE
    TO authenticated
    USING (true);

-- ============================================================
-- 4. products
-- ============================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_select_authenticated" ON public.products
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "products_insert_authenticated" ON public.products
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "products_update_authenticated" ON public.products
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "products_delete_authenticated" ON public.products
    FOR DELETE
    TO authenticated
    USING (true);

-- ============================================================
-- 5. store_settings
-- ============================================================
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "store_settings_select_authenticated" ON public.store_settings
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "store_settings_insert_authenticated" ON public.store_settings
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "store_settings_update_authenticated" ON public.store_settings
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "store_settings_delete_authenticated" ON public.store_settings
    FOR DELETE
    TO authenticated
    USING (true);

-- ============================================================
-- 6. orders
-- ============================================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders_select_authenticated" ON public.orders
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "orders_insert_authenticated" ON public.orders
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "orders_update_authenticated" ON public.orders
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "orders_delete_authenticated" ON public.orders
    FOR DELETE
    TO authenticated
    USING (true);

-- ============================================================
-- 7. order_items
-- ============================================================
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "order_items_select_authenticated" ON public.order_items
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "order_items_insert_authenticated" ON public.order_items
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "order_items_update_authenticated" ON public.order_items
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "order_items_delete_authenticated" ON public.order_items
    FOR DELETE
    TO authenticated
    USING (true);

-- ============================================================
-- 8. scraped_products
-- ============================================================
ALTER TABLE public.scraped_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scraped_products_select_authenticated" ON public.scraped_products
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "scraped_products_insert_authenticated" ON public.scraped_products
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "scraped_products_update_authenticated" ON public.scraped_products
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "scraped_products_delete_authenticated" ON public.scraped_products
    FOR DELETE
    TO authenticated
    USING (true);

-- ============================================================
-- 9. user_addresses
-- ============================================================
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_addresses_select_authenticated" ON public.user_addresses
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "user_addresses_insert_authenticated" ON public.user_addresses
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "user_addresses_update_authenticated" ON public.user_addresses
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "user_addresses_delete_authenticated" ON public.user_addresses
    FOR DELETE
    TO authenticated
    USING (true);

-- ============================================================
-- 10. webhook_events
-- ============================================================
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "webhook_events_select_authenticated" ON public.webhook_events
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "webhook_events_insert_authenticated" ON public.webhook_events
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "webhook_events_update_authenticated" ON public.webhook_events
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "webhook_events_delete_authenticated" ON public.webhook_events
    FOR DELETE
    TO authenticated
    USING (true);

-- ============================================================
-- 11. inventory_items
-- ============================================================
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inventory_items_select_authenticated" ON public.inventory_items
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "inventory_items_insert_authenticated" ON public.inventory_items
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "inventory_items_update_authenticated" ON public.inventory_items
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "inventory_items_delete_authenticated" ON public.inventory_items
    FOR DELETE
    TO authenticated
    USING (true);

-- ============================================================
-- 12. inventory_transactions
-- ============================================================
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inventory_transactions_select_authenticated" ON public.inventory_transactions
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "inventory_transactions_insert_authenticated" ON public.inventory_transactions
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "inventory_transactions_update_authenticated" ON public.inventory_transactions
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "inventory_transactions_delete_authenticated" ON public.inventory_transactions
    FOR DELETE
    TO authenticated
    USING (true);

-- ============================================================
-- 13. customization_groups
-- ============================================================
ALTER TABLE public.customization_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customization_groups_select_authenticated" ON public.customization_groups
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "customization_groups_insert_authenticated" ON public.customization_groups
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "customization_groups_update_authenticated" ON public.customization_groups
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "customization_groups_delete_authenticated" ON public.customization_groups
    FOR DELETE
    TO authenticated
    USING (true);

-- ============================================================
-- 14. customization_options
-- ============================================================
ALTER TABLE public.customization_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customization_options_select_authenticated" ON public.customization_options
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "customization_options_insert_authenticated" ON public.customization_options
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "customization_options_update_authenticated" ON public.customization_options
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "customization_options_delete_authenticated" ON public.customization_options
    FOR DELETE
    TO authenticated
    USING (true);
