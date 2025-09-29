-- Add cancel_at_period_end column to subscriptions table
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT FALSE;

-- Add dodo_customer_id column to subscriptions table
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS dodo_customer_id TEXT;
