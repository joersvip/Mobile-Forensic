# Mobile Forensic Analysis Suite

**Mobile Forensic Analysis Suite** adalah aplikasi analisis forensik perangkat seluler profesional berstandar kepolisian yang dirancang untuk membantu penyidik, analis keamanan siber, dan ahli forensik digital dalam mengidentifikasi, memulihkan, dan mendokumentasikan bukti digital secara sah dan steril.

Aplikasi ini beroperasi sepenuhnya secara lokal (**offline-first**) untuk menjamin integritas data (Chain of Custody) dan kepatuhan hukum tanpa risiko kebocoran data ke jaringan publik.

---

## 🌟 Fitur Utama & Modul Forensik

### 1. Keamanan & Autentikasi Wajah Berkelanjutan (Continuous Face Security)
*   **Login Mandiri Lokal (Offline)**: Autentikasi pengguna menggunakan verifikasi kombinasional antara Username, Password, dan Pengenalan Wajah yang dijalankan secara lokal pada peramban (browser).
*   **Continuous Verifier (Anti-Intrusion)**: Menggunakan umpan kamera langsung secara berkala untuk mendeteksi apakah analis forensik yang sah masih berada di depan pos kerja. Jika analis meninggalkan tempat kerja atau terdeteksi wajah asing, aplikasi akan mengunci diri secara otomatis dalam waktu 5 detik untuk mencegah akses ilegal.
*   **Audit Log Keamanan**: Setiap upaya login, kegagalan pencocokan wajah, dan aktivitas penguncian darurat dicatat secara permanen lengkap dengan parameter sidik jari perangkat (IP, OS, Browser).

### 2. Hubungkan Perangkat & Akuisisi Logis (Logical Acquisition)
*   **Manajemen Perangkat Terhubung**: Mendeteksi perangkat seluler yang terhubung via USB/ADB, menganalisis profil perangkat keras (CPU, RAM, IMEI, IMSI, Status Bootloader, status Root).
*   **Akuisisi Data Logis**: Melakukan ekstraksi struktur file, log panggilan, log SMS, daftar aplikasi terpasang, dan rute lokasi secara terstruktur dengan output laporan terverifikasi hash kriptografi.

### 3. Deleted Artifact Analysis (Modul Baru)
*   Membantu analis mengidentifikasi artefak yang menunjukkan keberadaan data yang telah dihapus berdasarkan citra forensik atau salinan cadangan yang diperoleh secara sah.
*   **Analisis Metadata & EXIF**: Mengekstrak metadata gambar dan koordinat GPS dari file foto.
*   **Pemulihan Database Terhapus**: Membaca basis data SQLite hasil akuisisi dan memulihkan baris obrolan/kontak yang ditandai terhapus di memori tak terisi (*unallocated partition*).
*   **Cache & Thumbnail Visualizer**: Pratinjau visual terhadap sisa cache aplikasi, log aktivitas sistem, dan berkas residual.

### 4. SQLite Database Analyzer
*   Mengeksplorasi struktur tabel basis data aplikasi seperti `mmssms.db` (SMS) dan `contacts2.db` (Daftar Kontak).
*   Menjalankan query SQL interaktif untuk menyaring bukti obrolan dan memulihkan pesan terhapus (*carved records*) yang tersisa dalam basis data SQLite.

### 5. Jejak Pemetaan Lokasi GPS (Location History & Geo-mapping)
*   Memetakan seluruh titik koordinat GPS yang berhasil diekstrak dari EXIF gambar, database seluler, dan cache Wi-Fi.
*   Menghitung statistik pergerakan suspect, estimasi jarak tempuh total (Km), serta visualisasi peta rute perjalanan interaktif.

### 6. Timeline Kronologis Kejadian (Unified Timeline)
*   Menggabungkan pesan SMS, riwayat panggilan suara, dan waktu modifikasi berkas ke dalam satu visualisasi urutan waktu kronologis (Timeline) guna mempermudah penyidik menyusun kronologi perkara.

### 7. Ekspor Laporan Hukum (Forensic Export)
*   Menghasilkan berita acara pemeriksaan (BAP) digital resmi dalam format **PDF** atau **Word (DOCX)**.
*   Menyertakan perhitungan nilai hash integritas (**MD5, SHA-256**) untuk setiap file bukti digital guna pembuktian sah di persidangan.

---

## ⚙️ Panduan Instalasi (Installation Guide)

Ikuti langkah-langkah di bawah ini untuk memasang dan menjalankan aplikasi ini di lingkungan lokal Anda.

### Prasyarat Sistem
Pastikan perangkat Anda sudah terinstal perangkat lunak berikut:
*   **Node.js** (Versi 18.x atau yang lebih baru direkomendasikan)
*   **npm** (Bawaan dari instalasi Node.js) atau **yarn**

### Langkah 1: Kloning atau Unduh Repositori
Ekstrak berkas ZIP kode sumber atau lakukan kloning langsung menggunakan git:
```bash
git clone <url-repositori-anda>
cd <nama-folder-aplikasi>
```

### Langkah 2: Instalasi Dependensi
Jalankan perintah berikut untuk menginstal seluruh paket pustaka yang dibutuhkan:
```bash
npm install
```

### Langkah 3: Konfigurasi Variabel Lingkungan (Opsional)
Salin berkas contoh konfigurasi lingkungan jika tersedia atau buat berkas `.env.local` pada direktori utama:
```bash
cp .env.example .env.local
```
*(Catatan: Aplikasi ini dirancang untuk bekerja secara offline tanpa ketergantungan server eksternal, sehingga konfigurasi API key bersifat opsional kecuali Anda ingin mengintegrasikannya dengan layanan cloud tambahan).*

### Langkah 4: Jalankan Server Pengembangan
Jalankan aplikasi di mode pengembangan (development mode) pada mesin lokal Anda:
```bash
npm run dev
```
Setelah perintah berhasil dijalankan, buka peramban Anda dan akses tautan berikut:
**[http://localhost:3000](http://localhost:3000)**

### Langkah 5: Build untuk Mode Produksi
Jika ingin melakukan kompilasi aplikasi agar siap dijalankan secara optimal di lingkungan produksi:
```bash
npm run build
npm start
```

---

## 🚀 Panduan Penggunaan (Usage Guide)

Untuk memanfaatkan kapabilitas penuh dari **Mobile Forensic Analysis Suite**, silakan ikuti alur skenario operasional berikut:

### Sesi 1: Registrasi & Pendaftaran Wajah (Awal)
1.  Saat pertama kali membuka aplikasi, Anda akan diarahkan ke halaman **Sistem Autentikasi Pengguna**.
2.  Karena sistem beroperasi secara offline, Anda harus **mendaftarkan akun baru** terlebih dahulu dengan mengeklik tombol **Registrasi Akun Baru**.
3.  Masukkan Username dan Password baru, lalu aktifkan Webcam perangkat untuk menangkap gambar wajah Anda sebagai kunci enkripsi biometrik lokal.
4.  Setelah registrasi sukses, lakukan **Login** menggunakan kredensial yang baru saja Anda buat bersama pencocokan wajah langsung secara real-time.

### Sesi 2: Menjaga Kredensial (Continuous Face Security)
1.  Setelah berhasil login ke Dashboard, sistem pengawasan **Continuous Verifier (Anti-Intrusion)** akan aktif di pojok kiri bawah.
2.  Modul ini akan memantau umpan kamera Anda setiap beberapa detik secara aman dan lokal.
3.  Jika analis meninggalkan meja kerja, memalingkan wajah, atau jika ada orang asing yang masuk ke jangkauan kamera, sistem akan mendeteksi intrusi tersebut dan **mengunci antarmuka aplikasi secara otomatis dalam waktu 5 detik**.
4.  Untuk membukanya kembali, analis terdaftar harus mengonfirmasi ulang wajahnya di depan kamera.

### Sesi 3: Memilih Mode Kasus (Workspace Initialization)
Sistem mendukung dua mode operasional yang dapat diakses melalui modul **Settings (Pengaturan)** di bagian kiri bawah navigasi:

*   **Mode Produksi (Steril - Kasus Nyata)**:
    *   Secara default, workspace berada dalam keadaan kosong (steril). Sangat cocok untuk mengunggah citra forensik asli dari barang bukti kasus nyata yang sedang Anda tangani menggunakan fitur *drag & drop* file.
*   **Mode Simulasi (Kasus Latihan: CASE-POL-2026-07A)**:
    *   Jika Anda ingin mencoba seluruh modul analisis, buka tab **Settings**, lalu klik tombol **Muat Kasus Simulasi**.
    *   Sistem akan secara instan menginjeksi basis data latihan berkualitas tinggi termasuk perangkat Samsung Galaxy S24, rekaman ancaman, log database, percakapan SMS terlarang, dan jejak lokasi tersangka di area DKI Jakarta.

### Sesi 4: Menjalankan Analisis Kasus
Setelah mengaktifkan **Mode Simulasi**, Anda dapat menjelajahi modul-modul analisis bukti berikut:
1.  **Dashboard**: Lihat ringkasan sebaran tingkat bahaya aplikasi terpasang, total ukuran bukti digital, integritas log kerja, dan status verifikasi biometrik.
2.  **Connect Device**: Menganalisis parameter perangkat yang terhubung melalui antarmuka ADB.
3.  **Logical Acquisition**: Melakukan akuisisi logis terstruktur dari sistem Android suspect.
4.  **Evidence Explorer (Deleted Artifacts)**: Mengekstrak metadata tersembunyi pada berkas gambar (EXIF), membaca dokumen rahasia, serta melacak berkas residual berbahaya seperti `.apk` ilegal.
5.  **SQLite Analyzer**: Lakukan simulasi pembongkaran database `mmssms.db` dan lakukan query SQL kustom interaktif untuk melihat pesan-pesan tersembunyi serta memulihkan data obrolan yang sengaja dihapus tersangka.
6.  **Location History**: Melacak pergerakan tersangka menggunakan data koordinat GPS yang terekstrak dari metadata gambar dan log jaringan, dilengkapi estimasi total jarak perpindahan.
7.  **Unified Timeline**: Melihat urutan waktu kejadian kronologis (kronologi perkara) yang menyatukan peristiwa SMS, panggilan telepon, dan aktivitas berkas dalam urutan waktu yang rapi.
8.  **Export Report**: Susun Berita Acara Pemeriksaan (BAP) digital berstandar hukum dalam format PDF atau Word lengkap dengan stempel hash integritas digital (MD5 & SHA-256) untuk menjamin orisinalitas bukti di depan hakim.

---

## 🗄️ Manajemen Workspace & Integritas Bukti

Aplikasi ini mendukung dua mode sesi kerja yang dapat dikonfigurasi melalui menu **Settings (Pengaturan)**:

### A. Mode Produksi (Sesi Bersih - Siap Pakai)
*   **Kondisi Standar / Default**: Saat pertama kali dijalankan, sistem berada pada **Mode Produksi Bersih**. Tidak ada data dummy suspect, tidak ada riwayat SMS, panggilan, koordinat, atau perangkat terhubung yang ter-load secara bawaan.
*   Workspace berada dalam keadaan steril 100% dan siap digunakan oleh analis untuk mengunggah file bukti nyata atau menghubungkan perangkat fisik asli guna memulai investigasi legal.

### B. Mode Simulasi (Kasus Latihan: `CASE-POL-2026-07A`)
*   Untuk keperluan pelatihan, evaluasi, demonstrasi, dan pengujian sistem, analis dapat memuat kasus simulasi interaktif melalui menu **Settings**.
*   Setelah diaktifkan, sistem akan menginjeksikan data kasus forensik simulasi bernilai fidelitas tinggi (high-fidelity) termasuk:
    *   **Perangkat**: Samsung Galaxy S24 Ultra terhubung ADB.
    *   **Pesan obrolan tersembunyi**: Bukti transaksi mencurigakan dan file payload `.apk` berbahaya.
    *   **Koordinat Lokasi**: Jejak perpindahan tersangka di area DKI Jakarta.
    *   **Artefak Terhapus**: Berkas PDF rahasia kerja sama gelap dan rekaman ancaman (.wav) yang berhasil dipulihkan.

---

## 🛠️ Stack Teknologi

Aplikasi dibangun menggunakan teknologi modern berkinerja tinggi:
-   **Framework**: Next.js 15 (App Router) dengan TypeScript.
-   **Gaya & Tata Letak**: Tailwind CSS v4 dengan palet warna bernuansa militer-industri gelap (*Cosmic Charcoal* dan aksen *Neon Cyan*) yang aman bagi mata penyidik selama berjam-jam bekerja.
-   **Animasi**: Framer Motion (`motion/react`) untuk transisi antar modul yang mulus.
-   **Ikonografi**: Lucide React.
-   **Visualisasi Data**: Recharts & D3 untuk diagram statistik sebaran artefak.
-   **Persistensi Data**: `localStorage` terenkripsi dan simulasi basis data relasional lokal yang aman di dalam sandbox peramban.

---

## 🔒 Dokumen Kepatuhan Chain of Custody

Setiap kali data diekstrak atau dokumen laporan forensik diekspor, sistem akan secara otomatis melampirkan:
1.  **Metadata Berkas**: Nama file, jalur mutlak (*absolute path*), ukuran byte, mime-type, serta waktu pembuatan, modifikasi, dan pembacaan terakhir.
2.  **Kunci Integritas**: Tanda tangan digital menggunakan algoritma hashing **SHA-256** dan **MD5** yang dihitung secara dinamis untuk mendeteksi perubahan sekecil apa pun pada file bukti digital.
3.  **Audit Trail**: Catatan log audit lengkap yang melacak nama pemeriksa forensik (*Examiner Name*), divisi organisasi (*Cyber Crime Unit*), nomor registrasi perkara (*Case Reference Number*), serta stempel waktu (UTC/WIB).
