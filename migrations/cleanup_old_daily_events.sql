-- Remove old daily noise events (spike, drop, streak)
-- Keep only the new weekly insight events
DELETE FROM events 
WHERE event_type IN ('spike', 'drop', 'streak');
