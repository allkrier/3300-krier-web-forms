-- Run this in your Supabase SQL Editor:
-- Project Settings > SQL Editor

-- Create the survey responses table
CREATE TABLE IF NOT EXISTS survey_responses (
  id SERIAL PRIMARY KEY,
  age INTEGER NOT NULL CHECK (age >= 18 AND age <= 24),
  major TEXT NOT NULL,
  hours_per_week TEXT NOT NULL,
  free_time_hobbies TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (required for public access without auth)
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Allow anyone (unauthenticated) to submit a survey response
CREATE POLICY "Allow public inserts"
  ON survey_responses
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anyone (unauthenticated) to read aggregated results
CREATE POLICY "Allow public reads"
  ON survey_responses
  FOR SELECT
  TO anon
  USING (true);
