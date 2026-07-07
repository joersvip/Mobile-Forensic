# Mobile Forensic Analysis Suite v2.0

**Mobile Forensic Analysis Suite v2.0** adalah platform digital forensik perangkat seluler profesional berstandar kepolisian yang dirancang untuk membantu penyidik cyber crime, analis keamanan, dan ahli forensik digital dalam mengidentifikasi, mengekstrak, menganalisis, dan mendokumentasikan bukti digital secara sah (admissible) dan steril.

Platform ini beroperasi sepenuhnya secara lokal (**offline-first**) untuk menjamin integritas data (**Chain of Custody**), kepatuhan hukum (*compliance*), tanpa risiko kebocoran data sensitif ke jaringan publik atau server cloud.

---

## 🌟 Fitur Utama & Modul Forensik Terintegrasi

### 1. Keamanan Biometrik & Autentikasi Wajah Berkelanjutan (Continuous Face Security)
*   **Offline Face Registration & Auth**: Melakukan registrasi akun penyidik dan pencocokan pola wajah (facial embedding matching) secara lokal pada sandbox peramban tanpa internet.
*   **Continuous Verifier (Anti-Intrusion)**: Memantau feed kamera secara berkala. Jika penyidik meninggalkan komputer atau ada wajah tidak dikenal (intruder) yang masuk ke jangkauan kamera, aplikasi akan mengunci diri secara otomatis dalam waktu **5 detik** untuk mencegah pengubahan data bukti.
*   **Security Audit Logs**: Setiap log aktivitas, kegagalan pencatatan wajah, atau penguncian darurat dicatat permanen lengkap dengan parameter sidik jari perangkat (IP, browser, dan operating system).

### 2. Hubungkan Perangkat & Akuisisi Nyata (Real Hardware Interconnection)
Kami menyediakan empat jalur interkoneksi perangkat nyata dan simulasi secara fleksibel:
*   **WebUSB Hardware Link (Direct Browser-to-USB)**: Membaca deskriptor USB dari perangkat fisik secara langsung lewat browser controller untuk membaca Vendor ID (VID), Product ID (PID), dan serial number fisik orisinal.
*   **Local ADB Daemon (Host Native Scan)**: Menginterogasi server ADB yang aktif di komputer host/stasiun kerja forensik Anda melalui endpoint backend `/api/devices` (menjalankan `adb devices -l` secara native).
*   **Wireless ADB over Wi-Fi**: Mengaktifkan link socket nirkabel portabel ke perangkat android di jaringan Wi-Fi lokal yang sama melalui endpoint backend `/api/devices/connect` (menjalankan `adb connect <ip:port>` secara native).
*   **Training & Case Simulation**: Modul simulasi forensik offline interaktif untuk pelatihan analisis kasus tanpa membutuhkan hardware fisik.

### 3. Modul Analisis AI Lokal Mandiri (Local AI Engine)
Sistem kecerdasan buatan berkinerja tinggi yang berjalan sepenuhnya offline memanfaatkan memori lokal tanpa API eksternal:
*   **OCR Text Extractor**: Mengekstrak teks dari foto bukti transfer, tangkapan layar obrolan, atau dokumen kerja dengan algoritma segmentasi piksel lokal.
*   **Image Object Classifier**: Mengklasifikasikan kategori foto bukti (e.g. senjata tajam, peta koordinat GPS, dokumen palsu) dengan kalkulasi tingkat akurasi (*confidence rate*).
*   **Semantic Vector Search**: Melakukan pencarian konsep semantik melintasi berkas kasus menggunakan indeks kemiripan kosinus (*Cosine Similarity*) untuk melacak kata kunci konseptual seperti "dana", "sandi", "payload", dsb.
*   **Artifact Grouping Match (Clustering)**: Pengelompokan cerdas otomatis yang mengorelasikan sisa-sisa bukti finansial maupun aktivitas malware ke dalam kluster kasus tertentu.

### 4. SQLite Database Analyzer & Carving
*   Mengeksplorasi tabel basis data internal Android (`mmssms.db`, `contacts.db`).
*   **Interactive SQL Sandbox**: Menyediakan editor query SQL langsung untuk menyaring bukti obrolan dan mencari pesan atau kontak yang ditandai terhapus di memori tak terisi (*carved database records*).

### 5. Jejak Pemetaan Lokasi GPS (Location History & Geo-mapping)
*   Mengekstrak koordinat GPS tersembunyi dari EXIF gambar, cache Wi-Fi, dan menampilkannya pada peta rute perjalanan interaktif tersangka beserta statistik estimasi total jarak perpindahan (Km).

### 6. Timeline Kronologis Kejadian (Unified Timeline)
*   Menggabungkan log panggilan telepon, pesan masuk/keluar, dan modifikasi berkas ke dalam satu urutan waktu kronologis yang runut untuk mempermudah rekonstruksi perkara di pengadilan.

### 7. Ekspor Laporan Hukum (Forensic Export)
*   Menghasilkan Berita Acara Pemeriksaan (BAP) digital dalam format PDF atau Word (DOCX).
*   Menghitung nilai integritas berkas bukti secara real-time dengan algoritma hashing standar forensik (**MD5 & SHA-256**) untuk menjamin orisinalitas bukti di depan hakim.

---

## 💻 Panduan Instalasi & Kesesuaian Kali Linux (Native Setup)

Aplikasi ini kompatibel penuh dengan **Kali Linux** sebagai sistem operasi standar digital forensik Anda.

### Prasyarat Sistem pada Kali Linux:
```bash
sudo apt update && sudo apt upgrade -y
```

### Langkah 1: Instalasi Node.js & NPM
```bash
# Mengunduh repositori NodeSource Node.js v20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Menginstal Node.js dan perkakas kompilasi
sudo apt-get install -y nodejs build-essential
```

### Langkah 2: Instalasi Kebutuhan ADB (Android Debug Bridge)
```bash
sudo apt install -y adb fastboot
```

### Langkah 3: Konfigurasi Akses Webcam (Continuous Face Security)
```bash
sudo usermod -aG video $USER
# Silakan log out dan log in kembali setelah menjalankan perintah ini.
```

### Langkah 4: Kloning & Pemasangan Dependensi

Sejak versi **NPM v9+**, terdapat kebijakan keamanan ketat baru di mana skrip instalasi (*postinstall/install scripts*) dari paket eksternal (seperti modul kompilasi biner asli `sharp`, `@tailwindcss/oxide`, atau `re2`) diblokir sementara sampai disetujui oleh Administrator sistem. Hal ini akan memunculkan peringatan `npm warn allow-scripts`.

Untuk memasang dependensi dengan lancar di Kali Linux, silakan pilih salah satu metode persetujuan di bawah ini:

*   **Opsi A (Rekomendasi - Sekali Jalan)**:
    Jalankan instalasi dengan bendera instruksi eksplisit agar mengizinkan kompilasi pustaka biner asli secara otomatis:
    ```bash
    git clone <url-repositori-anda>
    cd <nama-folder-aplikasi>
    npm install --allow-scripts
    ```

*   **Opsi B (Menyetujui Skrip Tertunda)**:
    Jika Anda sudah terlanjur menjalankan `npm install` biasa dan mendapatkan daftar peringatan, jalankan perintah persetujuan berikut:
    ```bash
    npm approve-scripts --allow-scripts-pending
    ```

*   **Opsi C (Mengizinkan Skrip Secara Global)**:
    Konfigurasikan lingkungan NPM di workstation Kali Linux Anda agar selalu memperbolehkan skrip instalasi untuk repositori tepercaya:
    ```bash
    npm config set allow-scripts true
    npm install
    ```

### Langkah 5: Menjalankan Aplikasi
*   **Mode Pengembangan (Development)**:
    ```bash
    npm run dev
    ```
    Buka peramban di alamat: **`http://localhost:3000`**
*   **Mode Produksi (Build & Start)**:
    ```bash
    npm run build
    npm start
    ```

---

## 📦 Panduan Kompilasi Aplikasi Native Desktop QT (Installer Builder)

Kami menyediakan skrip utilitas khusus untuk mengompilasi dan mengemas platform digital forensik ini menjadi aplikasi desktop native executable (Qt/PySide6 framework wrapper) yang siap diinstal di berbagai sistem operasi tanpa memerlukan instalasi Node.js di komputer target.

Skrip kompilasi terletak di: `/src/installer/build_installers.py`

### Prasyarat Kompilasi:
1. Pastikan Python 3 sudah terinstal di sistem Anda.
2. Instal dependensi compiler PyInstaller dan PySide6:
   ```bash
   pip install pyinstaller pyside6
   ```

### Langkah Kompilasi ke Executable Native:
Jalankan skrip pembangun installer di direktori proyek:
```bash
python3 src/installer/build_installers.py
```

### Hasil Kompilasi & Dukungan OS:
Skrip pembangun akan mendeteksi sistem operasi host Anda secara otomatis dan menghasilkan paket installer yang sesuai:
*   **Windows (`win32`)**: Menghasilkan file executable portabel `.exe` dalam folder `/dist` dan memicu konfigurasi pembungkus file MSI (Microsoft Installer) menggunakan WiX Toolset.
*   **macOS (`darwin`)**: Menghasilkan bundel aplikasi native `.app` dan membungkusnya ke dalam citra disk DMG (`.dmg`).
*   **Linux (`linux`)**: Menghasilkan executable biner Linux ELF portabel dan mempersiapkan struktur paket `.deb` untuk Debian/Ubuntu/Kali Linux.

---

## 🐳 Panduan Instalasi Menggunakan Docker

Anda dapat menjalankan suite forensik ini di dalam Docker untuk menghindari instalasi perkakas tambahan pada sistem host Anda.

```bash
# Membangun dan menjalankan kontainer via Docker Compose
docker compose up -d --build
```
Aplikasi akan dapat diakses pada alamat **`http://localhost:3000`**. Untuk modul kamera, peramban web host Anda yang akan mengeksekusi analisis wajah secara aman sehingga driver kamera hardware tidak perlu diekspos ke dalam kontainer Linux Docker secara langsung.

---

## 🚀 Tutorial Langkah demi Langkah Penggunaan Praktis

Gunakan tutorial terstruktur di bawah ini untuk melakukan analisis kasus siber nyata:

### 📖 Tutorial 1: Registrasi Akun & Pendaftaran Biometrik Wajah
1.  Buka aplikasi di peramban (**`http://localhost:3000`**).
2.  Karena sistem beroperasi offline, klik **Registrasi Akun Baru** pada layar login.
3.  Masukkan Username (contoh: `investigator_rian`), Password, Nama Lengkap, dan pilih peran Anda (`Administrator` atau `Examiner`).
4.  Izinkan akses Webcam pada peramban Anda, posisikan wajah Anda tepat di tengah kotak deteksi kamera, lalu klik **Daftarkan Wajah & Akun**.
5.  Setelah sukses, masuk menggunakan kredensial tersebut dengan mengarahkan wajah Anda ke kamera untuk autentikasi ganda secara instan.

### 📖 Tutorial 2: Menghubungkan Hardware Perangkat Nyata (Real Interconnection)
1.  Buka tab **Connected Devices** di panel navigasi kiri.
2.  Pada bar metode koneksi di bagian atas, pilih salah satu metode interkoneksi nyata:
    *   **Metode WebUSB Hardware**: Hubungkan ponsel Android target menggunakan kabel USB ke PC Anda. Klik tombol **Hubungkan Perangkat USB Fisik Nyata**, lalu pilih perangkat USB Anda pada popup browser.
        *   *Catatan keamanan: Jika popup pemilih tidak muncul, pastikan Anda telah membuka aplikasi di tab browser baru (bukan di dalam iframe preview).*
    *   **Metode Local ADB Daemon**: Aktifkan USB Debugging di ponsel target. Jalankan program ADB lokal Anda di Kali Linux host. Klik tombol **Pindai Server ADB Lokal** untuk membaca properti firmware dan serial number orisinal secara langsung lewat Next.js API Route.
    *   **Metode ADB over Wi-Fi**: Masukkan alamat IP nirkabel target (misalnya: `192.168.1.104:5555`) lalu klik **Koneksikan Wireless** untuk mengikat jaringan nirkabel lewat daemon ADB.
3.  Pilih perangkat nyata yang terdeteksi pada daftar untuk memantau detail status diagnostik, baterai, dan ukuran partisi memori secara real-time.
4.  Gunakan tombol **Logical Copy** pada Ribbon atas untuk memulai ekstraksi file biner, daftar kontak, dan log panggilan secara steril.

### 📖 Tutorial 3: Melakukan Analisis Berkas & OCR dengan AI Lokal
1.  Navigasikan ke tab **Local AI Engine**.
2.  Pilih sub-tab **OCR Text Extractor**.
3.  Di panel kiri, pilih berkas gambar tersangka, misalnya `bukti_transfer_gelap.png`.
4.  Klik tombol **Jalankan Local OCR Scan**. Sistem akan memproses integral histogram piksel secara offline dan mengekstrak rincian teks gelap, seperti:
    *   *Transaksi gelap, nominal Rp 500.000.000, bank penerima, dan tanggal transaksi.*
5.  Buka sub-tab **Image Object Classifier** dan pilih foto senjata `pistol_weapon_photo.jpg`. Klik **Proses Klasifikasi Objek** untuk mendeteksi ancaman senjata semi-otomatis dengan tingkat akurasi di atas 98%.
6.  Buka sub-tab **Semantic Offline Search**, ketik konsep pencarian seperti `dana` atau `payload` untuk mencari dokumen atau riwayat obrolan yang memiliki relasi makna terdekat melalui kalkulasi matriks *Cosine Similarity*.

### 📖 Tutorial 4: Melakukan Query Database SQLite Tersangka
1.  Buka tab **SQLite Analyzer**.
2.  Pada dropdown pemilihan database, pilih basis data pesan tersangka: `mmssms.db`.
3.  Di editor SQL, Anda akan melihat struktur skema tabel `messages`.
4.  Untuk menganalisis pesan obrolan yang sengaja dihapus oleh tersangka, klik tombol **Jalankan Query Pemulihan Obrolan**.
5.  Sistem akan mengeksekusi fungsi carving biner memori tak terisi (*unallocated chunks*) pada file SQLite dan menampilkan baris-baris obrolan rahasia tersangka yang berwarna merah, bertanda **[DELETED_RECORD]**.

### 📖 Tutorial 5: Menyusun Berita Acara Pemeriksaan (BAP) & Hashing
1.  Buka tab **Hash Verification**. Klik **Mulai Verifikasi Hash Integritas** untuk menghitung tanda tangan SHA-256 dan MD5 dari semua berkas bukti guna memastikan tidak terjadi perubahan data sejak pertama kali diambil (*Chain of Custody*).
2.  Buka tab **Dashboard** untuk memverifikasi log audit sistem Anda sudah merekam aktivitas penelusuran bukti dengan steril.
3.  Gunakan menu laporan di aplikasi untuk mengekspor BAP hukum digital yang sah dalam format dokumen cetak resmi.

---

## 🔒 Jaminan Integritas & Chain of Custody

Untuk menjamin orisinalitas di hadapan persidangan pidana:
1.  Setiap biner dan berkas bukti digital yang dimuat langsung dihitung nilai hash SHA-256 dan MD5-nya secara dinamis.
2.  Sistem menyertakan stempel waktu (**UTC / WIB**) presisi tinggi pada setiap entri Audit Trail.
3.  Setiap laporan ekspor menyertakan tanda tangan digital penyidik (*Examiner Signature*) dan sidik jari kriptografi data mentah.
