-- SipSweet Lamia Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Settings Table
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nickname TEXT NOT NULL DEFAULT 'Princess' CHECK (nickname IN ('Princess', 'Babe', 'Sweetie')),
    daily_goal_ml INTEGER NOT NULL DEFAULT 2000 CHECK (daily_goal_ml >= 500 AND daily_goal_ml <= 5000),
    interval_min INTEGER NOT NULL DEFAULT 120 CHECK (interval_min >= 15 AND interval_min <= 480),
    flower_type TEXT NOT NULL DEFAULT 'rose' CHECK (flower_type IN ('rose', 'tulip', 'daisy')),
    dnd_start_time TIME DEFAULT '02:00:00',
    dnd_end_time TIME DEFAULT '11:00:00',
    dnd_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Water Intake Logs Table
CREATE TABLE intake_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    amount_ml INTEGER NOT NULL CHECK (amount_ml > 0 AND amount_ml <= 2000),
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Push Notification Subscriptions Table
CREATE TABLE push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endpoint TEXT NOT NULL UNIQUE,
    keys JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_intake_logs_date ON intake_logs(date);
CREATE INDEX idx_intake_logs_logged_at ON intake_logs(logged_at);
CREATE INDEX idx_push_subscriptions_active ON push_subscriptions(is_active) WHERE is_active = TRUE;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_settings_updated_at 
    BEFORE UPDATE ON user_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_push_subscriptions_updated_at 
    BEFORE UPDATE ON push_subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default user settings (optional - for single user app)
INSERT INTO user_settings (nickname, daily_goal_ml, interval_min, flower_type, dnd_start_time, dnd_end_time, dnd_enabled)
VALUES ('Princess', 2000, 120, 'rose', '02:00:00', '11:00:00', TRUE)
ON CONFLICT DO NOTHING;

-- Row Level Security (RLS) - Enable for security
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a single-user app)
-- In production, you might want to add authentication-based policies

-- User Settings Policies
CREATE POLICY "Allow all operations on user_settings" ON user_settings
    FOR ALL USING (true) WITH CHECK (true);

-- Intake Logs Policies
CREATE POLICY "Allow all operations on intake_logs" ON intake_logs
    FOR ALL USING (true) WITH CHECK (true);

-- Push Subscriptions Policies
CREATE POLICY "Allow all operations on push_subscriptions" ON push_subscriptions
    FOR ALL USING (true) WITH CHECK (true);

-- Create a view for daily progress (optional but useful)
CREATE OR REPLACE VIEW daily_progress AS
SELECT 
    date,
    COUNT(*) as sip_count,
    SUM(amount_ml) as total_ml,
    AVG(amount_ml) as avg_sip_ml,
    MIN(logged_at) as first_sip,
    MAX(logged_at) as last_sip
FROM intake_logs
GROUP BY date
ORDER BY date DESC;

-- Grant permissions to the view
GRANT SELECT ON daily_progress TO anon, authenticated;

-- Success message
SELECT 'SipSweet Lamia database schema created successfully! 🌸' as message;
