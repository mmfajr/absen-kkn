-- ========================================================
-- DATABASE SCHEMA: Absensi KKN 10 Mentaos 2026
-- Supabase Postgres Schema Setup
-- ========================================================

-- 1. Create Members Table
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id TEXT REFERENCES members(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  hours NUMERIC DEFAULT 8,
  has_geotag BOOLEAN DEFAULT FALSE,
  lat NUMERIC,
  lng NUMERIC,
  location_name TEXT DEFAULT 'Mentaos',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_member_date UNIQUE (member_id, date)
);

-- 3. Create Storage Bucket for Attendance Photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('attendance-photos', 'attendance-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Enable Row Level Security (RLS) & Public Policies
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read members" ON members;
DROP POLICY IF EXISTS "Allow public insert members" ON members;
DROP POLICY IF EXISTS "Allow public update members" ON members;
CREATE POLICY "Allow public read members" ON members FOR SELECT USING (true);
CREATE POLICY "Allow public insert members" ON members FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update members" ON members FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public read attendance" ON attendance;
DROP POLICY IF EXISTS "Allow public insert attendance" ON attendance;
DROP POLICY IF EXISTS "Allow public update attendance" ON attendance;
CREATE POLICY "Allow public read attendance" ON attendance FOR SELECT USING (true);
CREATE POLICY "Allow public insert attendance" ON attendance FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update attendance" ON attendance FOR UPDATE USING (true);

-- Storage bucket policies
DROP POLICY IF EXISTS "Public Read Storage" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert Storage" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Storage" ON storage.objects;
CREATE POLICY "Public Read Storage" ON storage.objects FOR SELECT USING (bucket_id = 'attendance-photos');
CREATE POLICY "Public Insert Storage" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'attendance-photos');
CREATE POLICY "Public Update Storage" ON storage.objects FOR UPDATE USING (bucket_id = 'attendance-photos');

-- 5. Seed Members Initial Data (16 Members)
INSERT INTO members (id, name, role) VALUES
  ('m-1', 'Muhammad Fajar', 'Ketua'),
  ('m-2', 'Muhammad Dien Akbar Putra Rasiobar', 'Sekretaris'),
  ('m-3', 'Siti Nurhaliza', 'Bendahara'),
  ('m-4', 'Devina Yulianti', 'Koordinator Acara'),
  ('m-5', 'Alisya Dwi Nurhaliza', 'Acara'),
  ('m-6', 'Kemuning Amalia Putri', 'Acara'),
  ('m-7', 'Saira Aulia Ananda', 'Acara'),
  ('m-8', 'Tuty Al Wiah H.J', 'Acara'),
  ('m-9', 'Rachmadsyah Buchari Pohan', 'Koordinator Media'),
  ('m-10', 'Elva Nurdiana', 'Media'),
  ('m-11', 'Khalisa Muthia Widodo', 'Media'),
  ('m-12', 'Siska Noraini', 'Media'),
  ('m-13', 'Naliza Safitri', 'Koordinator Humas & Perkap'),
  ('m-14', 'Adryan Maulana Saputra', 'Humas & Perkap'),
  ('m-15', 'Muhammad Faturrahman', 'Humas & Perkap'),
  ('m-16', 'Muhammad Noki', 'Humas & Perkap')
ON CONFLICT (id) DO NOTHING;
