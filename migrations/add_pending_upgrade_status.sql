-- Add pending_upgrade status to the subscriptions table
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS pending_upgrade_plan_id TEXT REFERENCES subscription_plans(id);
