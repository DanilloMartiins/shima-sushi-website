ALTER TABLE orders DROP CONSTRAINT IF EXISTS ck_orders_status;

ALTER TABLE orders ADD CONSTRAINT ck_orders_status CHECK (
    status IN (
        'CREATED',
        'PENDING_PAYMENT',
        'CONFIRMED',
        'PREPARING',
        'OUT_FOR_DELIVERY',
        'COMPLETED',
        'CANCELLED'
    )
);
