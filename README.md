# DietTrackbyMo

Aplikasi web untuk mencatat dan memantau program diet: berat badan, olahraga,
kebiasaan sehat, dan jurnal makanan — dengan autentikasi dan database Supabase.

## Fitur

1. Dashboard: berat badan terakhir, target, perubahan mingguan, total olahraga,
   konsumsi air, dan persentase pencapaian target (ditampilkan dengan "growth ring").
2. Form laporan olahraga harian (jenis, durasi, intensitas, kalori, langkah, catatan).
3. Form laporan berat badan mingguan (berat, lingkar perut, %lemak tubuh, catatan, foto progres).
4. Grafik perkembangan berat badan per minggu.
5. Habit tracker: olahraga, minum air, makan sayur, tidur cukup, hindari minuman manis.
6. Jurnal makanan harian.
7. Laporan mingguan otomatis (perbandingan dengan minggu sebelumnya).
8. Halaman profil (tinggi badan, berat awal, berat target, tingkat aktivitas, target harian).
9. Dashboard admin (jumlah pengguna & aktivitas aplikasi).

Setiap pengguna hanya bisa melihat dan mengubah datanya sendiri — ditegakkan lewat
Supabase Row Level Security (RLS), bukan hanya di sisi tampilan.

## 1. Siapkan Supabase

1. Buat project baru di [supabase.com](https://supabase.com).
2. Buka **SQL Editor** → New query, lalu jalankan seluruh isi file
   [`supabase/schema.sql`](./supabase/schema.sql). Ini akan membuat:
   - Tabel `profiles`, `exercise_logs`, `weight_logs`, `habit_logs`, `food_journal`.
   - Semua kebijakan Row Level Security (RLS) agar data antar pengguna terisolasi.
   - Bucket storage publik `progress-photos` untuk foto progres berat badan.
3. Di **Project Settings → API**, salin `Project URL` dan `anon public key`.
4. (Opsional) Untuk mengaktifkan verifikasi email saat daftar, atur di
   **Authentication → Providers → Email**.

### Menjadikan pengguna sebagai admin

Setelah seseorang mendaftar melalui aplikasi, jalankan query berikut di SQL
Editor untuk memberi akses ke Dashboard Admin:

```sql
update public.profiles set is_admin = true where id = '<user-id-pengguna>';
```

`user-id` bisa dilihat di **Authentication → Users**.

## 2. Jalankan aplikasi secara lokal

```bash
npm install
cp .env.example .env
# lalu isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di file .env
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`.

## 3. Build untuk produksi

```bash
npm run build
```

Hasil build ada di folder `dist/`, siap di-deploy ke Vercel, Netlify, Cloudflare
Pages, atau layanan hosting statis lainnya. Jangan lupa atur environment
variable `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` di platform hosting.

## Struktur Proyek

```
src/
  components/     Komponen UI yang dipakai ulang (Layout, GrowthRing, StatCard, WeightChart, dll.)
  contexts/       AuthContext — sesi login, profil, dan status admin
  lib/            Klien Supabase
  pages/          Setiap halaman/route aplikasi
supabase/
  schema.sql      Skema database, RLS, dan setup storage
```

## Catatan Desain

- Palet warna: hijau hutan (`forest`) sebagai warna utama yang menenangkan dan
  identik dengan pertumbuhan sehat, aksen mangga (`mango`) untuk motivasi/aksi.
- Tipografi: **Fraunces** untuk judul (hangat, berkarakter), **Inter** untuk teks
  UI, **IBM Plex Mono** untuk angka/statistik agar mudah dibaca dan konsisten.
- Elemen signature: "growth ring" (lingkaran progres bergaya lingkaran tahun
  pohon) pada dashboard — melambangkan progres bertahap dan sehat, bukan
  progress bar generik.
- Navigasi mobile-first: bottom navigation bar di layar kecil, navbar biasa di
  layar besar.
