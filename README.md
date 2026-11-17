# Rusyaidan Qur'an Mastery

Aplikasi web modern untuk mengevaluasi dan memperkuat hafalan Al-Qur'an secara terfokus, dengan data belajar tersinkron ke Firebase Cloud Firestore:

1. **Verse Transition (Transisi Ayat)** — Kemampuan menyambung dari satu ayat ke ayat berikutnya secara tepat, lancar, dan mantap.
2. **Verse Retention (Retensi Ayat)** — Kemampuan mengingat keseluruhan ayat dengan akurat dan konsisten (direncanakan untuk fase berikutnya, berstatus *Coming Soon* pada rilis ini).

---

## 1. Sumber Data Al-Qur'an Otentik (*Dataset Source Documentation*)

Sesuai ketentuan, aplikasi ini menggunakan dataset Al-Qur'an terverifikasi dan otentik:

- **Sumber:** [Tanzil Project](https://tanzil.net/) / Al-Quran Cloud
- **Mushaf & Rasm:** Medina Mushaf (*Uthmani Hafs Text*)
- **Karakteristik Teks:** Menjaga harakat lengkap, tanda waqaf mushaf standar, penomoran ayat, tanda juz, dan simbol-simbol ortografi Al-Qur'an asli tanpa paraphrasing atau modifikasi buatan.
- **Cakupan Dataset Bundled:**
  - Seluruh **114 surah dan 6.236 ayat** tersedia secara lokal, beserta metadata surah.
  - Saat surah ditambahkan, ayatnya langsung tersedia untuk pratinjau dan pendaftaran transisi; tidak perlu memasukkan teks ayat manual.
- **Arsitektur:** Menggunakan modul `src/services/quranService.ts` dengan fungsi lookup lokal seperti:
  - `getVerse(7, 36)` -> Mengambil teks otentik Al-A'raf ayat 36
  - `getVerse(7, 37)` -> Mengambil teks otentik Al-A'raf ayat 37
  - `getSurah(surahNumber)` -> Mengambil metadata surah
  - `toArabicNumerals(num)` -> Mengonversi angka ke penomoran ayat Arab (contoh: 36 -> ٣٦)

---

## 2. Fitur Utama

### A. Dashboard Beranda (*Home Page*)
- Menampilkan identitas visual elegan bernuansa hijau *emerald*.
- Kartu koleksi awal: **Al-A'raf** (Surah 7) dan **At-Tawbah** (Surah 9).
- Metrik dinamis: jumlah pasangan transisi terdaftar, rata-rata skor kekuatan hafalan, dan total koleksi aktif.
- Tombol **+ Tambah Surah** untuk mendaftarkan surah lain dari 114 Surah Al-Qur'an.

### B. Halaman Detail Surah (*Surah Detail*)
- Informasi Surah: nomor, nama Latin, kaligrafi nama Arab, jumlah ayat, dan juz.
- Pilihan fitur:
  - **Verse Transition:** Fitur utama aktif. Membuka menu pilihan (`Lihat Daftar` & `Acak`).
  - **Verse Retention:** Ditampilkan secara visual dengan lencana `Coming Soon` (terkunci aman tanpa broken link).

### C. Menu Pilihan Transisi (*Verse Transition Menu Modal*)
- Menyediakan dua tindakan utama:
  1. `Lihat Daftar`: Membuka daftar seluruh pasangan ayat terdaftar untuk surah terkait.
  2. `Acak`: Memulai sesi latihan acak interaktif.

### D. Manajemen Transisi Ayat (*Verse Transition List*)
- Menampilkan seluruh pasangan ayat yang didaftarkan pengguna (contoh: `Al-A'raf 36 → 37`).
- Menampilkan teks lengkap ayat pertama diikuti cuplikan ayat selanjutnya:
  `وَٱلَّذِينَ كَذَّبُوا۟ بِـَٔايَٰتِنَا وَٱسْتَكْبَرُوا۟ عَنْهَآ أُو۟لَٰٓئِكَ أَصْحَٰبُ ٱلنَّارِ ۖ هُمْ فِيهَا خَٰلِدُونَ ٣٦ فَمَنْ أَظْلَمُ مِمَّنِ ٱفْتَرَىٰ عَلَى...`
- Menampilkan skor kekuatan hafalan (1–10) dengan kontrol perubahan cepat.
- **Klik Kartu Transisi:** Membuka modal rincian yang menampilkan teks lengkap kedua ayat berurutan secara nyaman dengan tipografi RTL dan penomoran ayat Arab.
- **+ Tambah Ayat:** Modal pendaftaran dengan validasi ketat:
  - Memvalidasi batas nomor ayat surah.
  - Memvalidasi bahwa ayat harus berurutan ($N$ dan $N+1$).
  - Menolak duplikasi pasangan yang sudah terdaftar.
  - Menampilkan *live preview* kedua ayat langsung dari dataset lokal sebelum disimpan.
  - Memberikan skor awal *default* `5/10`.

### E. Latihan Acak (*Random Practice*)
- Mengundi **hanya** dari daftar transisi yang telah didaftarkan pengguna.
- Menghindari perulangan ayat yang sama secara berturut-turut.
- Menampilkan ayat pemicu (*cue*) di dalam kartu horizontal *emerald* yang menonjol di tengah layar dengan tipografi Uthmani yang nyaman dibaca.
- Ayat sambungan sengaja disembunyikan selama latihan agar menguji hafalan pengguna secara murni (tersedia tombol intip untuk koreksi mandiri setelah melafalkan).
- **Simulasi Perekaman Visual (*Dummy Recording Interface*):**
  - Menggunakan interaksi *press-and-hold* (tekan dan tahan).
  - Menampilkan animasi gelombang suara (*sound-wave pulse*) dan penghitung waktu berjalan.
  - Ketika dilepas, status berubah menjadi *Recorded* / *Terekam*.
  - **Catatan Keamanan & Privasi:** Tidak mengakses mikrofon riil, tidak memanggil `getUserMedia`, dan tidak menyimpan file audio apapun.
- **Penilaian Kekuatan Hafalan Mandiri (1–10):**
  - Rentang 1 (lemah/baru) hingga 10 (sangat lancar/mutqin).
  - Pengguna dapat menaikkan/menurunkan dengan tombol `[-]` dan `[+]` atau memilih langsung pil nilai 1–10.
  - Skor tersimpan seketika ke Firestore dan independen untuk setiap pasangan ayat.
- **Navigasi Lanjut:**
  - Tombol **Lanjut Transisi Berikutnya** mengundi transisi berikutnya dan mereset status rekaman ke *idle*.

---

## 3. Arsitektur Data & Persistensi (*Data Architecture*)

- **Cloud Firestore:** Koleksi dan transisi disimpan di bawah `users/{anonymousUid}/collections` dan `users/{anonymousUid}/transitions`. Anonymous Authentication membuat identitas privat per browser tanpa formulir atau layar login.
- **Migrasi satu kali:** Jika ruang Firestore untuk UID tersebut kosong, data lama dari IndexedDB disalin ke Firestore. Jika sudah ada data cloud, data cloud tidak ditimpa. IndexedDB lama tetap dibiarkan sebagai salinan lokal.
- **IndexedDB:** `RusyaidanQuranMasteryDB` (Version 1) digunakan untuk membaca data lama saat migrasi; store-nya `collections` dan `transitions`.
- **Firebase Analytics:** Mengirim analitik penggunaan sesuai konfigurasi proyek.

Sebelum menjalankan aplikasi, aktifkan **Authentication → Sign-in method → Anonymous** di Firebase Console dan publikasikan aturan dari [`firestore.rules`](./firestore.rules) melalui **Firestore Database → Rules**. Konfigurasi aplikasi dibaca dari variabel `VITE_FIREBASE_*` di `.env`.

---

## 4. Struktur Proyek

```
rusyaidan-quran-mastery/
├── public/
│   ├── favicon.svg             # Favicon SVG bernuansa emerald
│   └── ...
├── scripts/
│   ├── fetch-quran-data.mjs    # Skrip pengunduh & pemverifikasi dataset Tanzil
│   └── verify-logic.mjs        # Skrip verifikasi logika & skenario pengujian
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Navbar.tsx                   # Navigasi atas & modal informasi aplikasi
│   │   ├── Home.tsx                     # Dashboard utama (Al-A'raf, At-Tawbah, dsb)
│   │   ├── SurahDetail.tsx              # Detail surah & pemilihan mode evaluasi
│   │   ├── VerseTransitionMenuModal.tsx # Modal menu Transisi (Lihat Daftar / Acak)
│   │   ├── VerseTransitionList.tsx      # Daftar transisi ayat terdaftar & skor
│   │   ├── AddTransitionModal.tsx       # Modal penambahan & validasi 2 ayat
│   │   ├── VerseDetailModal.tsx         # Modal tampilan lengkap 2 ayat berurutan
│   │   ├── RandomPractice.tsx           # Latihan acak, cue card, dummy recording, skor
│   │   └── AddCollectionModal.tsx       # Penambahan koleksi dari 114 Surah
│   ├── data/
│   │   ├── quranData.json               # Dataset ayat Al-Qur'an Uthmani lokal
│   │   └── surahList.json               # Metadata 114 Surah
│   ├── services/
│   │   ├── quranService.ts              # Query ayat lokal, format penomoran Arab
│   │   └── dbService.ts                 # Firestore dan migrasi IndexedDB
│   ├── types/
│   │   └── quran.ts                     # TypeScript interfaces & types
│   ├── App.tsx                          # Root controller & navigasi layar
│   ├── index.css                        # Styling Tailwind CSS & keyframe animasi gelombang
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 5. Cara Menjalankan Aplikasi (*How to Run*)

### Kebutuhan Sistem:
- Node.js (v18 ke atas disarankan)
- npm

### Langkah-langkah:

1. **Masuk ke direktori proyek:**
   ```bash
   cd "C:\Users\HP\.gemini\antigravity\scratch\rusyaidan-quran-mastery"
   ```

2. **Menjalankan Development Server:**
   ```bash
   npm run dev
   ```
   Buka URL lokal yang ditampilkan (misalnya `http://localhost:5173/`) di peramban Anda.

3. **Membangun untuk Produksi (*Production Build*):**
   ```bash
   npm run build
   ```

4. **Memperbarui dataset seluruh surah dari Al-Quran Cloud:**
   ```bash
   npm run fetch:quran-data
   ```
   Skrip memvalidasi jumlah dan urutan seluruh 6.236 ayat sebelum memperbarui file dataset.

5. **Menjalankan Linter / Pengecekan Kode:**
   ```bash
   npm run lint
   ```

6. **Menjalankan Verifikasi Logika & Dataset:**
   ```bash
   node scripts/verify-logic.mjs
   ```

---

## 6. Verifikasi Skenario Pengujian (*Acceptance Scenarios*)

Seluruh skenario telah teruji dan terverifikasi:
- **Scenario A (Aplikasi Awal):** Menampilkan Al-A'raf dan At-Tawbah secara elegan dengan info surah dan statistik.
- **Scenario B (Pendaftaran Transisi):** Pendaftaran Al-A'raf 36 → 37 menarik teks asli dari dataset lokal dan memberikan skor awal 5/10.
- **Scenario C (Validasi):** Menolak duplikat, menolak nomor ayat non-konsekutif, dan menolak ayat di luar batas surah.
- **Scenario D (Rincian Ayat):** Membuka rincian lengkap ayat 36 dan 37 dengan rasm Uthmani dan tanda ayat Arab.
- **Scenario E (Latihan Acak):** Mengundi hanya dari ayat yang telah terdaftar, ayat sambungan disembunyikan.
- **Scenario F (Simulasi Rekaman):** Tekan dan tahan memunculkan animasi gelombang suara dan timer; dilepas menampilkan status terekam tanpa izin mikrofon.
- **Scenario G (Skor Hafalan):** Mengubah skor (1–10) tersimpan seketika di Firestore dan tidak tertukar antar pasangan ayat.
- **Scenario H (Tombol Lanjut):** Memilih transisi acak berikutnya tanpa pengulangan langsung dan mereset status rekaman.
- **Scenario I (Persistensi):** Menyimpan seluruh data pendaftaran dan skor di Firestore lintas *refresh*.
