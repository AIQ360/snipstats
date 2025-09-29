-- Add columns to match Dodo Payments API structure
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS subscription_period_interval TEXT,
ADD COLUMN IF NOT EXISTS subscription_period_count INTEGER,
ADD COLUMN IF NOT EXISTS payment_frequency_interval TEXT,
ADD COLUMN IF NOT EXISTS payment_frequency_count INTEGER,
ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS previous_billing_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;

-- Update existing records to have proper values
UPDATE subscriptions 
SET 
  subscription_period_interval = CASE 
    WHEN plan_id = 'monthly' THEN 'Month'
    WHEN plan_id = 'annual' THEN 'Year'
    ELSE 'Month'
  END,
  subscription_period_count = 1,
  payment_frequency_interval = CASE 
    WHEN plan_id = 'monthly' THEN 'Month'
    WHEN plan_id = 'annual' THEN 'Year'
    ELSE 'Month'
  END,
  payment_frequency_count = 1
WHERE subscription_period_interval IS NULL;
