ALTER TABLE store_settings
    ADD COLUMN store_profile_logo_url VARCHAR(500) NOT NULL DEFAULT '',
    ADD COLUMN store_profile_cover_url VARCHAR(500) NOT NULL DEFAULT '',
    ADD COLUMN store_profile_address_street VARCHAR(255) NOT NULL DEFAULT '',
    ADD COLUMN store_profile_address_number VARCHAR(20) NOT NULL DEFAULT '',
    ADD COLUMN store_profile_neighborhood VARCHAR(255) NOT NULL DEFAULT '',
    ADD COLUMN store_profile_zip_code VARCHAR(10) NOT NULL DEFAULT '',
    ADD COLUMN store_profile_reference_point VARCHAR(255) NOT NULL DEFAULT '';
