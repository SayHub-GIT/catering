-- Jalankan script ini di SQL Editor Supabase untuk mematikan RLS (Row Level Security)
-- agar aplikasi bisa leluasa memasukkan dan membaca data.

ALTER TABLE public.pelanggans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.jenis_pembayarans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.detail_jenis_pembayarans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pakets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pesanans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.detail_pemesanans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengirimans DISABLE ROW LEVEL SECURITY;
