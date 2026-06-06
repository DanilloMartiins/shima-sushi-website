ALTER TABLE store_settings
    ADD COLUMN estimated_delivery_time VARCHAR(255) NOT NULL DEFAULT '40 - 60 min',
    ADD COLUMN business_hours TEXT NOT NULL DEFAULT '[]',
    ADD COLUMN payment_methods TEXT NOT NULL DEFAULT '{"cash":true,"pix":true,"creditCard":true,"debitCard":true,"mealVoucher":false}';
