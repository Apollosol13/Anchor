-- Rate limiting table for AI Chat
CREATE TABLE IF NOT EXISTS ai_chat_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  message_count INTEGER DEFAULT 0,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, last_reset_date)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_ai_chat_usage_user_date 
ON ai_chat_usage(user_id, last_reset_date);

-- Enable RLS
ALTER TABLE ai_chat_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read their own usage
CREATE POLICY "Users can read own ai_chat_usage" ON ai_chat_usage
  FOR SELECT USING (auth.uid()::text = user_id);

-- RLS Policy: Service role can do everything
CREATE POLICY "Service role can do everything on ai_chat_usage" ON ai_chat_usage
  FOR ALL USING (true) WITH CHECK (true);

-- Function to increment usage count
CREATE OR REPLACE FUNCTION increment_ai_chat_usage(p_user_id TEXT)
RETURNS TABLE(message_count INTEGER, is_over_limit BOOLEAN) AS $$
DECLARE
  v_count INTEGER;
  v_limit INTEGER := 10; -- Default free tier limit per day
BEGIN
  -- Upsert usage record for today
  INSERT INTO ai_chat_usage (user_id, message_count, last_reset_date)
  VALUES (p_user_id, 1, CURRENT_DATE)
  ON CONFLICT (user_id, last_reset_date)
  DO UPDATE SET 
    message_count = ai_chat_usage.message_count + 1,
    updated_at = NOW()
  RETURNING ai_chat_usage.message_count INTO v_count;

  -- Return count and whether over limit
  RETURN QUERY SELECT v_count, v_count > v_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current usage
CREATE OR REPLACE FUNCTION get_ai_chat_usage(p_user_id TEXT)
RETURNS TABLE(message_count INTEGER, daily_limit INTEGER, messages_remaining INTEGER) AS $$
DECLARE
  v_count INTEGER;
  v_limit INTEGER := 10; -- Free tier limit
BEGIN
  -- Get today's usage
  SELECT COALESCE(message_count, 0) INTO v_count
  FROM ai_chat_usage
  WHERE user_id = p_user_id AND last_reset_date = CURRENT_DATE;

  -- If no record for today, count is 0
  IF v_count IS NULL THEN
    v_count := 0;
  END IF;

  RETURN QUERY SELECT 
    v_count,
    v_limit,
    GREATEST(0, v_limit - v_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
