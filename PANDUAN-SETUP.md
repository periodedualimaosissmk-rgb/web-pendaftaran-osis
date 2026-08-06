# Panduan Setup — Website Pendaftaran OSIS
### SMKS Tunas Harapan Pasarkemis

Website ini terdiri dari halaman statis (HTML/CSS/JS) + Google Spreadsheet
sebagai "database", persis seperti web Lomba Agustusan. Setiap **jabatan**
otomatis punya **sheet (tab) sendiri**, dan pas foto/tanda tangan otomatis
diunggah ke **Google Drive** (linknya dicatat di sheet).

## 1. Struktur file

```
index.html                  → halaman utama, daftar semua jabatan
style.css                   → tampilan (dipakai semua halaman pendaftaran)
script.js                   → logika form (dipakai semua halaman jabatan)
config.js                   → tempat menaruh URL Google Apps Script
apps-script.gs               → kode backend, ditempel di Google Apps Script

aset/
  logo.png                  → lambang OSIS (ganti dengan logo asli)
  background.jpg             → latar hero & kop form (ganti dengan foto/desain asli)
  contohfoto.jpg              → contoh pas foto 3x4 (ganti dengan contoh asli)
  contohttd.jpg               → contoh tanda tangan (ganti dengan contoh asli)

ketua-wakil-ketua/index.html            → form gabungan Ketua & Wakil Ketua OSIS
sekretaris-1/index.html
sekretaris-2/index.html
bendahara-1/index.html
bendahara-2/index.html
sekbid-1-kerohanian-kedisiplinan/index.html
sekbid-2-seni-kreativitas/index.html
sekbid-3-keamanan-kebersihan/index.html
sekbid-4-inventaris-pengelolaan/index.html
sekbid-5-komunikasi-publikasi/index.html

verifikasi/index.html        → halaman panitia: lihat & hapus data pendaftar
verifikasi/style.css
verifikasi/script.js
```

> **Ganti aset gambar:** file di folder `aset/` saat ini masih placeholder
> (dibuat otomatis). Cukup timpa 4 file itu dengan gambar asli **dengan nama
> file yang sama persis** (`logo.png`, `background.jpg`, `contohfoto.jpg`,
> `contohttd.jpg`) — tidak perlu ubah kode sama sekali.

## 2. Buat Google Spreadsheet + Apps Script

1. Buka **sheets.google.com** → buat spreadsheet baru, beri nama misalnya
   "Database Pendaftaran OSIS SMKS THP".
2. Di menu, klik **Ekstensi (Extensions) → Apps Script**.
3. Hapus kode default di editor, lalu **copy-paste seluruh isi file
   `apps-script.gs`** ke sana.
4. Klik **Simpan** (ikon disket).
5. Klik tombol **Deploy → New deployment (Deployment baru)**.
   - Pilih tipe: **Web app**.
   - Execute as: **Me (Saya)**.
   - Who has access: **Anyone (Siapa saja)**.
6. Klik **Deploy**, lalu **izinkan akses** saat diminta (Authorize access).
   Karena script ini juga menyimpan file ke Google Drive, akan ada
   permintaan izin tambahan untuk akses Drive — izinkan juga.
7. Setelah selesai, kamu dapat **URL Web App**, contoh:
   ```
   https://script.google.com/macros/s/AKfycb...xyz/exec
   ```

## 3. Sambungkan website ke Apps Script

Buka file **`config.js`** (di folder utama, dipakai bersama oleh semua
halaman termasuk `verifikasi/`), ganti baris:

```js
window.GAS_URL = "PASTE_URL_WEB_APP_ANDA_DI_SINI";
```

menjadi URL yang kamu dapat di langkah sebelumnya. Simpan file.

## 4. Ganti password admin (opsional tapi disarankan)

Password default untuk halaman verifikasi/admin adalah **`osistunas123`**.
Password ini dicek di **dua tempat** — kalau mau ganti, ubah di keduanya
supaya tetap cocok:

- `apps-script.gs` → baris `var ADMIN_PASSWORD = "osistunas123";`
- `verifikasi/script.js` → baris `const ADMIN_PASSWORD_HINT = "osistunas123";`

Setelah mengubah `apps-script.gs`, ingat untuk **Deploy → Manage
deployments → Edit (ikon pensil) → New version** supaya perubahan berlaku.

## 5. Nomor WhatsApp untuk laporan data palsu

Tombol "🚩 Lapor Data Palsu" di halaman verifikasi akan membuka WhatsApp ke
nomor **085178399532**. Untuk mengganti nomor ini, edit baris berikut di
`verifikasi/index.html`:

```html
<script>window.NOMOR_LAPOR_WA = "6285178399532";</script>
```

Gunakan format internasional (awalan `62`, tanpa tanda `+` atau `0` di
depan).

## 6. Coba jalankan

- Buka `index.html` di browser (atau upload semua file & folder ke hosting
  seperti Netlify/GitHub Pages/Vercel — struktur folder per jabatan tetap
  dipertahankan).
- Pilih salah satu jabatan, isi biodata, unggah pas foto & tanda tangan
  (bisa dari file atau langsung kamera di HP), lalu klik **Daftar
  Sekarang**.
- Cek Spreadsheet kamu — tab baru dengan nama jabatan tersebut akan muncul
  otomatis berisi data pendaftar. File foto & tanda tangan akan muncul di
  Google Drive kamu, di dalam folder **"Pendaftaran OSIS - Foto & TTD"**.
- Buka `verifikasi/index.html` untuk melihat daftar semua pendaftar,
  klik salah satu nama untuk melihat biodata lengkapnya.
- Untuk menghapus data: login dulu di kotak **Login Admin** dengan
  password `osistunas123` (atau password baru kalau sudah diganti), lalu
  tombol **🗑️ Hapus Data Ini** akan muncul di setiap detail pendaftar.

## Catatan penting

- Sama seperti web Lomba Agustusan, pengiriman data pendaftaran & hapus
  data memakai mode `no-cors` (fire-and-forget) karena keterbatasan CORS
  di Google Apps Script — jadi website tidak langsung tahu kalau ada
  error di server. **Selalu cek Spreadsheet** untuk memastikan data benar-
  benar masuk/terhapus, terutama saat pertama kali setup.
- Membaca daftar data di halaman `verifikasi/index.html` memakai `GET`
  biasa (bukan `no-cors`), jadi hasilnya bisa langsung dibaca dan
  ditampilkan.
- Foto & tanda tangan dikompres otomatis di browser sebelum dikirim
  (maks. lebar 900px) supaya tidak terlalu berat, lalu disimpan ke Google
  Drive dengan akses "siapa saja yang punya link bisa lihat" agar bisa
  ditampilkan di halaman verifikasi & spreadsheet.
- Login admin di halaman verifikasi adalah pengecekan sederhana di sisi
  browser (cukup untuk kebutuhan internal panitia) — password juga
  diverifikasi ulang di server (`apps-script.gs`) sebelum data benar-benar
  dihapus, jadi permintaan hapus dengan password salah akan ditolak oleh
  server.
- Setiap kali kamu **mengedit ulang kode `apps-script.gs`**, wajib
  **Deploy → Manage deployments → Edit (ikon pensil) → New version**
  supaya perubahan berlaku di URL yang sama.
