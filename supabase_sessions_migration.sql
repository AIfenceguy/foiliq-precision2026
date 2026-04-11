-- FoilIQ — Sessions + Referee Notes tables
-- Run once in Supabase SQL editor

CREATE TABLE IF NOT EXISTS competition_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fencer TEXT NOT NULL,
  session_type TEXT NOT NULL,
  event_key TEXT,
  event_date DATE DEFAULT CURRENT_DATE,
  data JSONB,
  ai_output TEXT,
  tournament TEXT DEFAULT 'precision_2026',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE competition_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open_sessions" ON competition_sessions FOR ALL USING (true) WITH CHECK (true);
GRANT ALL ON competition_sessions TO anon, authenticated;

CREATE TABLE IF NOT EXISTS referee_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fencer TEXT,
  event_key TEXT NOT NULL,
  event_date DATE DEFAULT CURRENT_DATE,
  observation TEXT NOT NULL,
  tournament TEXT DEFAULT 'precision_2026',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE referee_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open_ref" ON referee_notes FOR ALL USING (true) WITH CHECK (true);
GRANT ALL ON referee_notes TO anon, authenticated;
