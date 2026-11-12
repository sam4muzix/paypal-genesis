ALTER TABLE orders ADD COLUMN updated_at TEXT;
ALTER TABLE orders ADD COLUMN failure_reason TEXT;
CREATE UNIQUE INDEX idx_open_order ON orders(buyer_id,offer_id) WHERE status IN ('CREATED','APPROVED','CAPTURE_PENDING','UNKNOWN');
