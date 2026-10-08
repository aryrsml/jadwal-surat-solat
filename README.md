# Jadwal Surat Solat

Menampilkan surat yang dibaca di waktu solat yang sedang berlangsung. Urutan surat berotasi tiap hari (patokan WIB), jam solat diambil dari API myquran. Static export, tanpa backend.

## Mengganti daftar surat

Edit satu file saja: `lib/surah-groups.ts`.

- Tiap grup = satu "piring" yang ikut berputar. Jumlah grup harus 5, sama dengan jumlah waktu solat.
- `ANCHOR_DATE` = tanggal hari ke-0. Pada tanggal itu: grup pertama = Subuh, kedua = Dzuhur, dst. Tiap hari berikutnya semua bergeser satu waktu solat.
- Setelah edit, jalankan `npm test` untuk memastikan polanya masih benar.

## Mengganti kota

1. Cari ID kota: `https://api.myquran.com/v2/sholat/kota/cari/nama-kota`
2. Isi `NEXT_PUBLIC_CITY_ID` di `.env.local` (lokal) atau di environment variables hosting.

Nilai ini ikut masuk ke bundle saat build, jadi ganti kota berarti build ulang.

## Jalankan lokal

```bash
npm ci
npm run dev        # http://localhost:3000
npm test
npm run typecheck
```

## Deploy

### Cloudflare Pages

1. Push project ke GitHub, lalu di Cloudflare: Workers & Pages > Create > Pages > Connect to Git.
2. Build command: `npm run build`
3. Build output directory: `out`
4. Environment variables: `NEXT_PUBLIC_CITY_ID` = ID kota kamu, dan `NODE_VERSION` = `22`.

File `public/_headers` otomatis dipakai Cloudflare Pages untuk header keamanan dan CSP.

### GitHub Pages

1. Push ke branch `main`.
2. Settings > Pages > Source: **GitHub Actions**.
3. Settings > Secrets and variables > Actions > Variables: tambah `NEXT_PUBLIC_CITY_ID`.
4. Workflow `.github/workflows/deploy-gh-pages.yml` jalan otomatis di setiap push. Alamat: `https://<user>.github.io/<nama-repo>/`.

Catatan: GitHub Pages tidak mendukung custom header, jadi `_headers` tidak berlaku di sana.

## Kalau jadwal gagal dimuat

- Buka DevTools > Console. Pesan CORS berarti API myquran memblokir panggilan langsung dari browser; solusinya proxy lewat Cloudflare Pages Function.
- Respons 404 pada endpoint jadwal: coba format tanggal `YYYY/MM/DD` di `lib/prayer-times.ts`.
- Pesan CSP: pastikan `connect-src` di `public/_headers` memuat `https://api.myquran.com`.

## Keamanan

- ID kota divalidasi regex dan di-encode sebelum masuk URL.
- Respons API divalidasi per field sebelum dipakai; format asing ditolak.
- Tidak ada `dangerouslySetInnerHTML`, tidak ada input pengguna.
- Versi dependency dipin dan `package-lock.json` ikut di-commit; pakai `npm ci` dan jalankan `npm audit` sesekali.
