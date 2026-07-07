import { DeviceProfile, SmsRecord, ContactRecord, CallRecord, ApkRecord, EvidenceFile, AuditLog } from '../types/forensic';

// Templates for Simulation Case Study
export const SIMULATION_DEVICES: DeviceProfile[] = [
  {
    id: 'samsung_s24',
    brand: 'Samsung',
    model: 'SM-S928B (Galaxy S24 Ultra)',
    product: 'eureka',
    androidVersion: '14.0.0 (API 34)',
    buildNumber: 'UP1A.231005.007.S928BXXU1AXB5',
    kernel: '6.1.25-android15-9-g8a3a2e5d6d4a (64-bit)',
    abi: 'arm64-v8a',
    cpu: 'Snapdragon 8 Gen 3 for Galaxy (8 Cores)',
    ram: '12 GB LPDDR5X',
    internalStorage: '512 GB (UFS 4.0)',
    externalStorage: 'Not Supported',
    battery: '5000 mAh (Health: 94%, Temp: 32.5°C)',
    androidId: '3aef8c2d91b4200f',
    imei: '358921124801759',
    imsi: '510101234567891',
    iccid: '8982101123456789012F',
    securityPatch: '2026-06-01',
    selinuxStatus: 'Enforcing',
    encryptionStatus: 'File-Based Encryption (FBE) - Active',
    bootloader: 'Locked (KNOX Warranty Void: 0x0)',
    usbDebugging: 'Enabled (Authorized)',
    rootStatus: 'Not Rooted (Magisk Not Detected)'
  },
  {
    id: 'google_pixel8',
    brand: 'Google',
    model: 'Pixel 8 Pro (GC3VE)',
    product: 'husky',
    androidVersion: '14.0.0 (API 34)',
    buildNumber: 'UD1A.231105.004',
    kernel: '5.15.110-g92fe4a3d6d (64-bit)',
    abi: 'arm64-v8a',
    cpu: 'Google Tensor G3 (9 Cores)',
    ram: '12 GB LPDDR5',
    internalStorage: '256 GB',
    externalStorage: 'Not Supported',
    battery: '5050 mAh (Health: 98%, Temp: 31.2°C)',
    androidId: '8fbc200f91b43aed',
    imei: '357820124801123',
    imsi: '510101987654321',
    iccid: '8982101987654321012F',
    securityPatch: '2026-05-05',
    selinuxStatus: 'Enforcing',
    encryptionStatus: 'File-Based Encryption (FBE) - Active',
    bootloader: 'Unlocked (Bootloader Unlocked Warning)',
    usbDebugging: 'Enabled (Authorized)',
    rootStatus: 'Rooted (Magisk v26.1 Detected in System)'
  },
  {
    id: 'oneplus_12',
    brand: 'OnePlus',
    model: 'CPH2581 (OnePlus 12)',
    product: 'OP5B3L1',
    androidVersion: '14.0.0 (API 34)',
    buildNumber: 'CPH2581_14.0.0.300(EX01)',
    kernel: '6.1.57-android14 (64-bit)',
    abi: 'arm64-v8a',
    cpu: 'Snapdragon 8 Gen 3 (8 Cores)',
    ram: '16 GB LPDDR5X',
    internalStorage: '1024 GB (1TB UFS 4.0)',
    externalStorage: 'Not Supported',
    battery: '5400 mAh (Health: 91%, Temp: 33.1°C)',
    androidId: '91b4200f3aef8c2d',
    imei: '351234124801999',
    imsi: '510102124567812',
    iccid: '8982102124567812012F',
    securityPatch: '2026-04-01',
    selinuxStatus: 'Permissive (Modified)',
    encryptionStatus: 'FBE - Decrypted / Custom Recovery Active',
    bootloader: 'Unlocked',
    usbDebugging: 'Enabled (Authorized)',
    rootStatus: 'Rooted (KernelSU - Active)'
  }
];

export const SIMULATION_SMS: SmsRecord[] = [
  { id: 1, sender: '+62811223344', body: 'Pertemuan diatur jam 8 malam di koordinat yang saya kirim.', timestamp: '2026-07-06T10:15:30Z', status: 'RECEIVED', isDeleted: false, type: 'SMS' },
  { id: 2, sender: '+62811223344', body: 'Gunakan aplikasi aman, hapus pesan ini setelah membaca.', timestamp: '2026-07-06T10:16:45Z', status: 'RECEIVED', isDeleted: false, type: 'SMS' },
  { id: 3, sender: 'You', body: 'Siap. File rahasia koordinat.txt sudah saya simpan di folder dokumen.', timestamp: '2026-07-06T10:20:12Z', status: 'SENT', isDeleted: false, type: 'SMS' },
  { id: 4, sender: '+62811223344', body: '[RECOVERED FROM FREEBLOCK] Pembayaran via Bitcoin ke alamat: bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', timestamp: '2026-07-05T18:32:00Z', status: 'RECEIVED', isDeleted: true, type: 'SMS' },
  { id: 5, sender: '+628551234567', body: 'Halo, apakah barang ready? Pengiriman ke Jakarta Selatan.', timestamp: '2026-07-04T12:05:00Z', status: 'RECEIVED', isDeleted: false, type: 'SMS' },
  { id: 6, sender: 'You', body: 'Ready 10 unit. Transaksi cash on delivery saja biar aman.', timestamp: '2026-07-04T12:10:30Z', status: 'SENT', isDeleted: false, type: 'SMS' },
  { id: 7, sender: '+628551234567', body: '[RECOVERED] Jangan hubungi nomor ini lagi. Polisi sedang mengintai lokasi.', timestamp: '2026-07-04T15:40:22Z', status: 'RECEIVED', isDeleted: true, type: 'SMS' },
  { id: 8, sender: 'InfoSMS', body: 'Paket internet 10GB Anda telah aktif. Berlaku s.d 2026-08-01.', timestamp: '2026-07-03T09:00:00Z', status: 'RECEIVED', isDeleted: false, type: 'SMS' },
  { id: 9, sender: '+628129999888', body: 'Bro, server backup sudah online di port 3000. Cek root aksesnya.', timestamp: '2026-07-02T14:22:15Z', status: 'RECEIVED', isDeleted: false, type: 'SMS' },
  { id: 10, sender: 'You', body: 'Oke, segera dicheck. MD5 hash file backup harus cocok dengan yang kemarin.', timestamp: '2026-07-02T14:30:00Z', status: 'SENT', isDeleted: false, type: 'SMS' },
  { id: 11, sender: '+62811223344', body: 'Jangan lupa pasang VPN sebelum melakukan penarikan dana.', timestamp: '2026-07-01T11:05:10Z', status: 'RECEIVED', isDeleted: false, type: 'SMS' },
  { id: 12, sender: 'You', body: 'Sudah di-setting, rute terowongan aman melewati server Swedia.', timestamp: '2026-07-01T11:15:00Z', status: 'SENT', isDeleted: false, type: 'SMS' },
  { id: 13, sender: '+62899111222', body: '[RECOVERED] Berkas kontrak rahasia_meeting_plan.pdf sudah dikirim via email palsu.', timestamp: '2026-06-30T16:50:00Z', status: 'RECEIVED', isDeleted: true, type: 'SMS' },
  { id: 14, sender: 'Bank_Alert', body: 'Transfer Keluar Rp 50.000.000 ke Rekening 9012345678 BERHASIL.', timestamp: '2026-06-29T08:12:44Z', status: 'RECEIVED', isDeleted: false, type: 'SMS' },
  { id: 15, sender: '+62811223344', body: 'Bagus. Hapus semua data log SMS hari ini.', timestamp: '2026-06-29T08:30:00Z', status: 'RECEIVED', isDeleted: false, type: 'SMS' }
];

export const SIMULATION_CONTACTS: ContactRecord[] = [
  { id: 1, name: 'Andi Kurir', phone: '+628551234567', email: 'andi.delivery@protonmail.com', address: 'Jl. Melati No. 45, Jakarta Selatan', starred: true, notes: 'Kontak penghubung untuk pengiriman paket offline.' },
  { id: 2, name: 'Budi Server', phone: '+628129999888', email: 'budi_sysadm@onionmail.org', address: 'Apartemen Green View Tower B-12, Tangerang', starred: false, notes: 'Administrator server bayangan. Mengelola backup DB.' },
  { id: 3, name: 'Bos Rahasia', phone: '+62811223344', email: 'silent_boss@secmail.io', address: 'Tidak Diketahui', starred: true, notes: 'HANYA HUBUNGI JIKA DARURAT. Selalu gunakan VPN.' },
  { id: 4, name: 'Hendra VPN', phone: '+628135555666', email: 'hendra_net@gmail.com', address: 'Perum Gading Indah Blok C-5, Bekasi', starred: false, notes: 'Penyedia akun VPN dan proxy server.' },
  { id: 5, name: 'Rani Finance', phone: '+628198888777', email: 'rani.f@cashmail.net', address: 'Sudirman Central Business District, Jakarta Pusat', starred: false, notes: 'Mengatur pencairan dana ke rekening penampung.' },
  { id: 6, name: 'Soni Spoofer', phone: '+62899111222', email: 'soni_gps@proton.me', address: 'Margonda Raya No. 10, Depok', starred: false, notes: 'Spesialis spoofing lokasi dan modifikasi GPS.' },
  { id: 7, name: 'Keluarga Ibu', phone: '+628123456789', email: 'ibu.tercinta@yahoo.com', address: 'Yogyakarta, Sleman', starred: false, notes: 'Kontak personal.' },
  { id: 8, name: 'Pak RT', phone: '+6281311112222', email: 'rt_lingkungan@gmail.com', address: 'Jl. Mawar No. 2, Jakarta', starred: false, notes: 'RT Rumah Tinggal.' }
];

export const SIMULATION_CALLS: CallRecord[] = [
  { id: 1, name: 'Bos Rahasia', phone: '+62811223344', type: 'INCOMING', duration: 320, timestamp: '2026-07-06T10:10:00Z' },
  { id: 2, name: 'Bos Rahasia', phone: '+62811223344', type: 'OUTGOING', duration: 45, timestamp: '2026-07-06T09:45:00Z' },
  { id: 3, name: 'Andi Kurir', phone: '+628551234567', type: 'INCOMING', duration: 120, timestamp: '2026-07-04T12:00:00Z' },
  { id: 4, name: 'Budi Server', phone: '+628129999888', type: 'OUTGOING', duration: 540, timestamp: '2026-07-02T14:10:00Z' },
  { id: 5, name: 'Bos Rahasia', phone: '+62811223344', type: 'MISSED', duration: 0, timestamp: '2026-07-01T22:30:00Z' },
  { id: 6, name: 'Rani Finance', phone: '+628198888777', type: 'INCOMING', duration: 180, timestamp: '2026-06-29T08:00:00Z' },
  { id: 7, name: 'Soni Spoofer', phone: '+62899111222', type: 'OUTGOING', duration: 310, timestamp: '2026-06-30T16:40:00Z' },
  { id: 8, name: 'Keluarga Ibu', phone: '+628123456789', type: 'INCOMING', duration: 620, timestamp: '2026-06-28T19:30:00Z' }
];

export const SIMULATION_APKS: ApkRecord[] = [
  { id: 1, name: 'Telegram', packageName: 'org.telegram.messenger', version: '10.5.2', size: '64.2 MB', isSystem: false, dangerLevel: 'SAFE', permissions: ['Camera', 'Microphone', 'Storage', 'Contacts', 'Location', 'Notifications'] },
  { id: 2, name: 'WhatsApp', packageName: 'com.whatsapp', version: '2.24.4.15', size: '52.1 MB', isSystem: false, dangerLevel: 'SAFE', permissions: ['Contacts', 'Storage', 'Camera', 'Microphone', 'Location', 'Call Logs', 'SMS'] },
  { id: 3, name: 'Signal', packageName: 'org.thoughtcrime.securesms', version: '6.45.3', size: '48.9 MB', isSystem: false, dangerLevel: 'SAFE', permissions: ['Contacts', 'Storage', 'Camera', 'Microphone', 'SMS', 'Call Logs'] },
  { id: 4, name: 'Fake GPS location', packageName: 'com.lexa.fakegps', version: '2.0.8', size: '4.8 MB', isSystem: false, dangerLevel: 'WARNING', permissions: ['Location', 'Storage', 'Draw Over Other Apps'] },
  { id: 5, name: 'Orbot Tor Proxy', packageName: 'org.torproject.android', version: '17.2.1-RC-1', size: '28.1 MB', isSystem: false, dangerLevel: 'WARNING', permissions: ['Internet', 'Run at Startup', 'Access Network State'] },
  { id: 6, name: 'GPS JoyStick', packageName: 'com.theappninjas.gpsjoystick', version: '4.3.2', size: '15.4 MB', isSystem: false, dangerLevel: 'WARNING', permissions: ['Location', 'Storage', 'System Alert Window'] },
  { id: 7, name: 'Magisk', packageName: 'com.topjohnwu.magisk', version: '26.1', size: '12.8 MB', isSystem: false, dangerLevel: 'CRITICAL', permissions: ['Superuser Root Access', 'Storage', 'Install Packages'] },
  { id: 8, name: 'Root Checker Pro', packageName: 'com.joeykrim.rootcheck', version: '5.2.0', size: '8.2 MB', isSystem: false, dangerLevel: 'WARNING', permissions: ['Storage', 'Check Root Status'] },
  { id: 9, name: 'Wi-Fi Kill', packageName: 'net.ponury.wifikill', version: '2.3.2', size: '3.1 MB', isSystem: false, dangerLevel: 'CRITICAL', permissions: ['Root Access', 'Access Wi-Fi State', 'Change Wi-Fi Multicast State'] },
  { id: 10, name: 'System Settings', packageName: 'com.android.settings', version: '14-34', size: '185.0 MB', isSystem: true, dangerLevel: 'SAFE', permissions: ['All System Permissions'] },
  { id: 11, name: 'Google Play Services', packageName: 'com.google.android.gms', version: '24.08.12', size: '245.3 MB', isSystem: true, dangerLevel: 'SAFE', permissions: ['All Core Permissions'] }
];

export const SIMULATION_FILES: EvidenceFile[] = [
  // Pictures
  {
    id: 'pic_1',
    name: 'suspect_avatar.jpg',
    path: '/sdcard/Pictures/suspect_avatar.jpg',
    size: '154 KB',
    sizeBytes: 157696,
    category: 'picture',
    md5: '7d6bf60dc7d032549a1d5e6833c8ff0e',
    sha1: 'cd27429dcfde82bfd40082fcfda399c43aef8c2d',
    sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    sha512: 'e1a2f3a4b5c6d7e8f901...',
    mimeType: 'image/jpeg',
    createdTime: '2026-07-06T10:02:15Z',
    modifiedTime: '2026-07-06T10:02:15Z',
    accessTime: '2026-07-06T10:05:00Z',
    exif: {
      camera: 'Canon EOS R5',
      lens: 'RF24-105mm F4 L IS USM',
      dateTaken: '2026-07-05 14:32:10',
      gps: '-6.2088, 106.8456', // Jakarta (Pusat Kota)
      orientation: 'Horizontal (Normal)',
      resolution: '8192 x 5464 (44.7 MP)'
    }
  },
  {
    id: 'pic_2',
    name: 'suspicious_transaction_screenshot.png',
    path: '/sdcard/Pictures/Screenshots/suspicious_transaction_screenshot.png',
    size: '892 KB',
    sizeBytes: 913408,
    category: 'picture',
    md5: 'e2b86bfdc7d032549a1d5e6833c8ffaa',
    sha1: 'ef37429dcfde82bfd40082fcfda399c43aef8d9d',
    sha256: '83f51081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00b12',
    sha512: 'f1a2f3a4b5c6d7e8f901...',
    mimeType: 'image/png',
    createdTime: '2026-07-05T18:35:00Z',
    modifiedTime: '2026-07-05T18:35:00Z',
    accessTime: '2026-07-06T09:12:00Z',
    exif: {
      camera: 'Apple iPhone 15 Pro',
      lens: 'Built-in Triple Camera',
      dateTaken: '2026-07-05 18:34:55',
      gps: '48.8584, 2.2945', // Eiffel Tower, Paris
      orientation: 'Vertical',
      resolution: '2796 x 1290 (3.6 MP)'
    }
  },
  {
    id: 'pic_3',
    name: 'location_map_checkpoint.jpg',
    path: '/sdcard/Pictures/location_map_checkpoint.jpg',
    size: '340 KB',
    sizeBytes: 348160,
    category: 'picture',
    md5: 'a9b8c7d6e5f43210123456789abcdef0',
    sha1: '1234567890abcdef1234567890abcdef12345678',
    sha256: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
    sha512: 'a1b2c3d4...',
    mimeType: 'image/jpeg',
    createdTime: '2026-07-06T08:15:00Z',
    modifiedTime: '2026-07-06T08:15:00Z',
    accessTime: '2026-07-06T08:20:00Z',
    exif: {
      camera: 'Samsung Galaxy S24 Ultra',
      lens: 'f/1.7 24mm wide lens',
      dateTaken: '2026-07-06 08:14:30',
      gps: '-6.1754, 106.8272', // Monas, Jakarta
      orientation: 'Horizontal',
      resolution: '4000 x 3000 (12 MP)'
    }
  },
  
  // Documents
  {
    id: 'doc_1',
    name: 'confidential_coords.txt',
    path: '/sdcard/Documents/confidential_coords.txt',
    size: '1.2 KB',
    sizeBytes: 1228,
    category: 'document',
    md5: '8b7d903f7a4e6783938af62ef00bcfa1',
    sha1: 'da39a3ee5e6b4b0d3255bfef95601890afd80709',
    sha256: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
    sha512: 'f0023a4b...',
    mimeType: 'text/plain',
    createdTime: '2026-07-06T10:18:00Z',
    modifiedTime: '2026-07-06T10:19:30Z',
    accessTime: '2026-07-06T10:21:00Z',
    content: `CASE CONFIDENTIAL - TARGET GPS CO_ORDS
Date: July 6, 2026
-------------------------------------
Primary Meeting Point:
Latitude: -6.2088
Longitude: 106.8456
Altitude: 12.5m
Location: Central Jakarta Safehouse

Secondary Drop Point:
Latitude: -6.1754
Longitude: 106.8272
Location: Monument Area Gate 2

Backups Contact: Andi Kurir (+628551234567)
Crypto Wallet ID for payout: bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
Status: READY FOR DROP. DO NOT COMPROMISE.`
  },
  {
    id: 'doc_2',
    name: 'secret_meeting_plan.pdf',
    path: '/sdcard/Documents/secret_meeting_plan.pdf',
    size: '254 KB',
    sizeBytes: 260096,
    category: 'document',
    md5: 'f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8',
    sha1: 'abcdef9876543210abcdef9876543210abcdef98',
    sha256: '8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d',
    sha512: 'b1c2d3e4...',
    mimeType: 'application/pdf',
    createdTime: '2026-06-30T16:45:00Z',
    modifiedTime: '2026-06-30T16:45:00Z',
    accessTime: '2026-07-06T09:40:00Z',
    content: `%PDF-1.4\n%\u00e2\u00e3\u00cf\u00d3\n1 0 obj\n<<\n/Title (Secret Meeting Plan)\n/Creator (WPS Writer)\n>>\nstream\nCONFIDENTIAL MEETING MANIFEST\nCode Name: Operation Antigravity\nMeeting Time: July 6, 2026, 20:00 hrs Local Time\nParticipants: Bos Rahasia, Andi Kurir, Soni Spoofer\nAgenda:\n1. Cryptographic keys distribution\n2. Database backup verification\n3. Device wipe protocol execution in case of containment\nendstream\nendobj\nxref\n0 2\n0000000000 65535 f\n0000000015 00000 n\ntrailer\n<<\n/Size 2\n/Root 1 0 R\n>>\nstartxref\n310\n%%EOF`
  },
  {
    id: 'doc_3',
    name: 'ransom_note.docx',
    path: '/sdcard/Documents/ransom_note.docx',
    size: '45 KB',
    sizeBytes: 46080,
    category: 'document',
    md5: '3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f',
    sha1: 'a9b8c7d6e5f4a9b8c7d6e5f4a9b8c7d6e5f4a9b8',
    sha256: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    sha512: 'c1d2e3f4...',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    createdTime: '2026-06-25T11:20:00Z',
    modifiedTime: '2026-06-25T11:25:10Z',
    accessTime: '2026-07-05T14:15:00Z',
    content: '[Word Document binary content - Header: "IMPORTANT NOTICE"] Your database backups are encrypted with AES-256 algorithm. Send 0.5 BTC to our wallet or the keys will be destroyed. Contacts: silent_boss@secmail.io'
  },

  // Databases
  {
    id: 'db_1',
    name: 'mmssms.db',
    path: '/data/data/com.android.providers.telephony/databases/mmssms.db',
    size: '1.4 MB',
    sizeBytes: 1468006,
    category: 'database',
    md5: '9b8a7c6d5e4f3a2b1c0d9e8f7a6b5c4d',
    sha1: 'fedcba9876543210fedcba9876543210fedcba98',
    sha256: '4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b',
    sha512: 'd1e2f3a4...',
    mimeType: 'application/x-sqlite3',
    createdTime: '2026-07-06T10:20:12Z',
    modifiedTime: '2026-07-06T10:20:12Z',
    accessTime: '2026-07-06T10:21:00Z'
  },
  {
    id: 'db_2',
    name: 'contacts2.db',
    path: '/data/data/com.android.providers.contacts/databases/contacts2.db',
    size: '2.1 MB',
    sizeBytes: 2202009,
    category: 'database',
    md5: '1234567890abcdef1234567890abcdef',
    sha1: '90abcdef90abcdef90abcdef90abcdef90abcdef',
    sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    sha512: 'f001f002...',
    mimeType: 'application/x-sqlite3',
    createdTime: '2026-07-06T10:10:00Z',
    modifiedTime: '2026-07-06T10:10:00Z',
    accessTime: '2026-07-06T10:15:00Z'
  },
  {
    id: 'db_3',
    name: 'whatsapp_history.db',
    path: '/data/data/com.whatsapp/databases/whatsapp_history.db',
    size: '4.8 MB',
    sizeBytes: 5033164,
    category: 'database',
    md5: 'ca786f0dc7d032549a1d5e6833c8ff0e',
    sha1: '3da7429dcfde82bfd40082fcfda399c43aef8c2d',
    sha256: 'f2d4e081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    sha512: 'ff12ff34ff56...',
    mimeType: 'application/x-sqlite3',
    createdTime: '2026-07-05T14:20:00Z',
    modifiedTime: '2026-07-05T14:20:00Z',
    accessTime: '2026-07-05T14:30:00Z'
  },
  {
    id: 'db_4',
    name: 'recovery_backup.db.bak',
    path: '/sdcard/Backups/recovery_backup.db.bak',
    size: '4.8 MB',
    sizeBytes: 5033164,
    category: 'database',
    md5: 'ca786f0dc7d032549a1d5e6833c8ff0e',
    sha1: '3da7429dcfde82bfd40082fcfda399c43aef8c2d',
    sha256: 'f2d4e081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    sha512: 'ff12ff34ff56...',
    mimeType: 'application/x-sqlite3',
    createdTime: '2026-07-05T14:25:00Z',
    modifiedTime: '2026-07-05T14:25:00Z',
    accessTime: '2026-07-05T14:30:00Z'
  },

  // Audios
  {
    id: 'audio_1',
    name: 'voice_recording_deal.m4a',
    path: '/sdcard/VoiceRecorder/voice_recording_deal.m4a',
    size: '1.8 MB',
    sizeBytes: 1887436,
    category: 'audio',
    md5: 'da8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d',
    sha1: '34567890abcdef1234567890abcdef1234567890',
    sha256: '9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e',
    sha512: 'e2b3c4d5...',
    mimeType: 'audio/mp4',
    createdTime: '2026-07-04T15:35:00Z',
    modifiedTime: '2026-07-04T15:38:00Z',
    accessTime: '2026-07-04T15:40:00Z'
  },

  // Videos
  {
    id: 'video_1',
    name: 'safehouse_surveillance.mp4',
    path: '/sdcard/DCIM/Camera/safehouse_surveillance.mp4',
    size: '12.4 MB',
    sizeBytes: 13002342,
    category: 'video',
    md5: 'b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0',
    sha1: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
    sha256: '8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5f4e3d2c1b0a9f8e7d',
    sha512: 'f1f2f3f4...',
    mimeType: 'video/mp4',
    createdTime: '2026-07-05T14:10:00Z',
    modifiedTime: '2026-07-05T14:15:30Z',
    accessTime: '2026-07-05T14:30:00Z'
  },

  // Other/Downloads
  {
    id: 'apk_file',
    name: 'malicious_payload.apk',
    path: '/sdcard/Download/malicious_payload.apk',
    size: '3.1 MB',
    sizeBytes: 3250585,
    category: 'download',
    md5: '5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a',
    sha1: 'c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8',
    sha256: '9e3a7b6a8c8d8f9a90b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3',
    sha512: 'a1a2a3a4...',
    mimeType: 'application/vnd.android.package-archive',
    createdTime: '2026-07-05T11:00:00Z',
    modifiedTime: '2026-07-05T11:00:00Z',
    accessTime: '2026-07-05T11:05:00Z'
  }
];

export const SIMULATION_AUDIT_LOGS: AuditLog[] = [
  { id: 'log_1', timestamp: '2026-07-06T20:00:00Z', module: 'System', action: 'Aplikasi Mobile Forensic Suite berhasil dijalankan secara lokal.' },
  { id: 'log_2', timestamp: '2026-07-06T20:01:15Z', module: 'Settings', action: 'Mengubah Folder Output default ke: /home/forensic/output_cases/case_2026_07' },
  { id: 'log_3', timestamp: '2026-07-06T20:02:10Z', module: 'Device Check', action: 'Memulai listener koneksi ADB... Menunggu perangkat terhubung.' }
];

// Active Exported Datasets (Init empty)
export const MOCK_DEVICES: DeviceProfile[] = [];
export const MOCK_SMS: SmsRecord[] = [];
export const MOCK_CONTACTS: ContactRecord[] = [];
export const MOCK_CALLS: CallRecord[] = [];
export const MOCK_APKS: ApkRecord[] = [];
export const MOCK_FILES: EvidenceFile[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

// Dynamic Seeding on runtime client import
if (typeof window !== 'undefined') {
  try {
    const isSimActive = localStorage.getItem('forensic_sim_mode') === 'active';
    if (isSimActive) {
      MOCK_DEVICES.push(...SIMULATION_DEVICES);
      MOCK_SMS.push(...SIMULATION_SMS);
      MOCK_CONTACTS.push(...SIMULATION_CONTACTS);
      MOCK_CALLS.push(...SIMULATION_CALLS);
      MOCK_APKS.push(...SIMULATION_APKS);
      MOCK_FILES.push(...SIMULATION_FILES);
      INITIAL_AUDIT_LOGS.push(...SIMULATION_AUDIT_LOGS);
    }
  } catch (e) {
    console.error("Gagal melakukan inisialisasi dataset modul", e);
  }
}

export function createNewLog(module: string, action: string): AuditLog {
  const now = new Date().toISOString();
  return {
    id: `log_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: now,
    module,
    action
  };
}
