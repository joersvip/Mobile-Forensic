'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, Database, ShieldAlert, Calendar, Search, 
  RotateCw, ZoomIn, ZoomOut, Maximize2, Play, Pause, 
  Volume2, Eye, FileSpreadsheet, Layers, Info, History, 
  FileCode, Terminal, HelpCircle, Check, ShieldCheck, 
  Activity, Clock, ChevronRight, ChevronLeft, Filter
} from 'lucide-react';

interface Artifact {
  id: string;
  filename: string;
  type: 'Gambar' | 'Video' | 'Audio' | 'Dokumen' | 'Arsip' | 'Basis data' | 'File aplikasi' | 'File lainnya';
  location: string;
  sizeBytes: number;
  mimeType: string;
  sha256: string;
  md5: string;
  createdTime: string;
  modifiedTime: string;
  accessTime: string;
  detectedTime: string;
  status: 'Kemungkinan Terhapus' | 'Terhapus (Carved)' | 'Orphan MFT' | 'Residual Cache';
  notes: string;
  // Specific mock data for inside individual previews
  previewData?: any;
}

const INITIAL_ARTIFACTS: Artifact[] = [
  {
    id: 'art_1',
    filename: 'whatsapp_messages.db',
    type: 'Basis data',
    location: '/data/data/com.whatsapp/databases/msgstore.db',
    sizeBytes: 1572864,
    mimeType: 'application/x-sqlite3',
    sha256: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
    md5: '8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c',
    createdTime: '2026-06-28T09:15:33Z',
    modifiedTime: '2026-07-04T18:44:12Z',
    accessTime: '2026-07-05T12:00:15Z',
    detectedTime: '2026-07-06T03:10:00Z',
    status: 'Terhapus (Carved)',
    notes: 'Basis data WhatsApp ditemukan di partisi unallocated. Berisi 3 tabel tersisa.',
    previewData: {
      tables: ['messages', 'contacts', 'calls'],
      schema: {
        messages: ['_id', 'chat_row_id', 'from_me', 'key_id', 'text_data', 'timestamp'],
        contacts: ['jid', 'display_name', 'phone_number', 'status'],
        calls: ['_id', 'caller_jid', 'receiver_jid', 'call_type', 'duration_seconds', 'timestamp']
      },
      rows: {
        messages: [
          { _id: '1', chat_row_id: '12', from_me: '0', key_id: 'MSG88231', text_data: 'Tolong siapkan dokumen kesepakatannya malam ini.', timestamp: '2026-07-04 18:30:12' },
          { _id: '2', chat_row_id: '12', from_me: '1', key_id: 'MSG88232', text_data: 'Baik, sudah saya simpan di folder backup.', timestamp: '2026-07-04 18:31:44' },
          { _id: '3', chat_row_id: '12', from_me: '0', key_id: 'MSG88233', text_data: 'Hapus semua file setelah selesai agar tidak terdeteksi.', timestamp: '2026-07-04 18:35:00' },
          { _id: '4', chat_row_id: '14', from_me: '0', key_id: 'MSG88290', text_data: 'Lokasi pertemuan dirubah ke gedung pusat.', timestamp: '2026-07-04 18:40:15' }
        ],
        contacts: [
          { jid: '628123456789@s.whatsapp.net', display_name: 'Andi Siregar', phone_number: '+628123456789', status: 'Available' },
          { jid: '628998877665@s.whatsapp.net', display_name: 'Budi (Vendor)', phone_number: '+628998877665', status: 'Busy' },
          { jid: '628771122334@s.whatsapp.net', display_name: 'Chandra Susilo', phone_number: '+628771122334', status: 'Urgent calls only' }
        ],
        calls: [
          { _id: '1', caller_jid: '628123456789@s.whatsapp.net', receiver_jid: 'self', call_type: 'AUDIO', duration_seconds: '185', timestamp: '2026-07-04 15:10:00' },
          { _id: '2', caller_jid: 'self', receiver_jid: '628998877665@s.whatsapp.net', call_type: 'VIDEO', duration_seconds: '45', timestamp: '2026-07-04 16:22:11' }
        ]
      }
    }
  },
  {
    id: 'art_2',
    filename: 'evidence_snapshot.png',
    type: 'Gambar',
    location: '/sdcard/DCIM/Screenshots/evidence_snapshot.png',
    sizeBytes: 819200,
    mimeType: 'image/png',
    sha256: '2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c',
    md5: '7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b',
    createdTime: '2026-07-03T14:22:11Z',
    modifiedTime: '2026-07-03T14:22:11Z',
    accessTime: '2026-07-05T15:30:12Z',
    detectedTime: '2026-07-06T04:22:00Z',
    status: 'Kemungkinan Terhapus',
    notes: 'Tangkapan layar transaksi kripto yang dihapus dari galeri foto utama.',
    previewData: {
      exif: {
        'Camera Model': 'SM-G998B (Galaxy S21 Ultra)',
        'Software': 'Android 13.0 build (T1A5)',
        'Resolution': '1080 x 2400 pixels',
        'Focal Length': '5.4mm',
        'ISO Speed': 'ISO 100',
        'Aperture': 'f/1.8',
        'Created Date': '2026-07-03 14:22:11 UTC'
      },
      imageUrl: 'https://picsum.photos/seed/screenshot/600/400'
    }
  },
  {
    id: 'art_3',
    filename: 'blackmail_recording.wav',
    type: 'Audio',
    location: '/sdcard/VoiceRecorder/rec_20260702_001.wav',
    sizeBytes: 4194304,
    mimeType: 'audio/wav',
    sha256: 'f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4',
    md5: 'b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4',
    createdTime: '2026-07-02T11:05:00Z',
    modifiedTime: '2026-07-02T11:08:14Z',
    accessTime: '2026-07-04T19:00:00Z',
    detectedTime: '2026-07-06T06:15:00Z',
    status: 'Terhapus (Carved)',
    notes: 'Rekaman ancaman pemerasan suara berdurasi 30 detik. Header diperbaiki manual.',
    previewData: {
      duration: '00:32',
      codec: 'PCM Audio (Waveform Audio)',
      sampleRate: '44100 Hz',
      channels: 'Mono',
      waveformData: [12, 24, 45, 18, 5, 40, 85, 95, 60, 20, 10, 30, 75, 88, 41, 15, 8, 33, 62, 99, 112, 84, 50, 10, 4, 18, 52, 70, 45, 12]
    }
  },
  {
    id: 'art_4',
    filename: 'confidential_agreement.pdf',
    type: 'Dokumen',
    location: '/sdcard/Documents/confidential_agreement.pdf',
    sizeBytes: 1250000,
    mimeType: 'application/pdf',
    sha256: 'c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7',
    md5: 'a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7',
    createdTime: '2026-06-20T10:11:45Z',
    modifiedTime: '2026-06-20T10:11:45Z',
    accessTime: '2026-07-02T16:45:00Z',
    detectedTime: '2026-07-06T05:30:00Z',
    status: 'Orphan MFT',
    notes: 'Naskah kontrak perjanjian rahasia dengan pihak ketiga yang dihapus.',
    previewData: {
      pages: [
        { pageNum: 1, text: "SURAT PERJANJIAN KERJASAMA KHUSUS\n\nPasal 1: Tujuan Kerjasama\nPara pihak sepakat untuk melakukan transfer aset digital senilai Rp 2.500.000.000 (Dua Milyar Lima Ratus Juta Rupiah) secara tertutup tanpa melibatkan otoritas resmi perbankan guna menghindari pelaporan keuangan tahunan.\n\nPasal 2: Kerahasiaan Informasi\nSemua bentuk komunikasi, transaksi, dan data pribadi yang terjalin selama proses ini wajib dihapus secara permanen dari seluruh perangkat komunikasi elektronik selambat-lambatnya 24 jam setelah kesepakatan ditandatangani." },
        { pageNum: 2, text: "Pasal 3: Penyelesaian Sengketa\nJika terjadi perselisihan atau pembocoran data ke pihak berwajib, kedua belah pihak sepakat untuk menanggung segala risiko hukum secara mandiri tanpa melibatkan afiliasi perusahaan.\n\nTertanda,\nPihak Pertama (Pemberi Dana)   |   Pihak Kedua (Penerima Dana)" }
      ]
    }
  },
  {
    id: 'art_5',
    filename: 'hidden_ledger.xlsx',
    type: 'Dokumen',
    location: '/sdcard/Download/hidden_ledger.xlsx',
    sizeBytes: 312000,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    sha256: '5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b',
    md5: 'e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5',
    createdTime: '2026-07-01T08:00:00Z',
    modifiedTime: '2026-07-04T12:30:00Z',
    accessTime: '2026-07-05T09:15:00Z',
    detectedTime: '2026-07-06T08:05:00Z',
    status: 'Residual Cache',
    notes: 'Log transaksi keuangan rahasia tersembunyi di folder download.',
    previewData: {
      sheets: {
        'Aset Utama': [
          ['No', 'Tanggal', 'Uraian Transaksi', 'Jumlah (IDR)', 'Metode', 'Status'],
          ['1', '2026-07-01', 'Setoran Awal Konsorsium', '1.200.000.000', 'Crypto USDT', 'Sukses'],
          ['2', '2026-07-02', 'Biaya Operasional Lapangan', '150.000.000', 'Tunai / Cash', 'Sukses'],
          ['3', '2026-07-03', 'Pembelian Hardware Enkripsi', '320.000.000', 'Transfer Bank', 'Sukses'],
          ['4', '2026-07-04', 'Fee Broker / Perantara', '250.000.000', 'Crypto USDT', 'Pending']
        ],
        'Rekening Bayangan': [
          ['No', 'Nama Pemilik', 'Nama Bank', 'Nomor Rekening', 'Limit Transaksi'],
          ['1', 'CV Berjaya Mandiri', 'Bank Central Asia', '8823019283', '5.000.000.000'],
          ['2', 'PT Samudra Jaya', 'Bank Mandiri', '12400928131', '3.000.000.000']
        ]
      }
    }
  },
  {
    id: 'art_6',
    filename: 'ransom_note.txt',
    type: 'Dokumen',
    location: '/sdcard/ransom_note.txt',
    sizeBytes: 450,
    mimeType: 'text/plain',
    sha256: '4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a',
    md5: 'c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9',
    createdTime: '2026-07-04T23:59:00Z',
    modifiedTime: '2026-07-05T00:04:12Z',
    accessTime: '2026-07-05T01:10:00Z',
    detectedTime: '2026-07-06T09:12:00Z',
    status: 'Terhapus (Carved)',
    notes: 'File notepad berisi pesan tuntutan tebusan sandera digital.',
    previewData: {
      content: "PERINGATAN KERAS!\n\nSeluruh data penting perusahaan Anda telah kami kunci menggunakan algoritma enkripsi militer AES-256.\n\nJangan mencoba mengembalikan file secara mandiri tanpa kunci dekripsi privat kami. Jika Anda ingin memulihkan sistem Anda, kirimkan dana tebusan sebesar 2.5 BTC ke wallet berikut:\n\nbc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjh9\n\nBatas waktu pembayaran adalah 48 Jam. Jika lewat, kunci privat akan kami musnahkan dan data Anda hilang selamanya."
    }
  },
  {
    id: 'art_7',
    filename: 'suspicious_video.mp4',
    type: 'Video',
    location: '/sdcard/DCIM/Camera/suspicious_video.mp4',
    sizeBytes: 15728640,
    mimeType: 'video/mp4',
    sha256: 'f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6',
    md5: 'd3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8',
    createdTime: '2026-07-02T22:15:00Z',
    modifiedTime: '2026-07-02T22:17:40Z',
    accessTime: '2026-07-03T11:00:00Z',
    detectedTime: '2026-07-06T10:30:00Z',
    status: 'Terhapus (Carved)',
    notes: 'Rekaman CCTV unallocated berdurasi 15 detik menunjukkan akses fisik ilegal.',
    previewData: {
      duration: '00:15',
      codec: 'H.264 / AVC (Advanced Video Coding)',
      resolution: '1920 x 1080 (Full HD)',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
    }
  },
  {
    id: 'art_8',
    filename: 'suspect_confession.docx',
    type: 'Dokumen',
    location: '/sdcard/Documents/suspect_confession.docx',
    sizeBytes: 450000,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    sha256: '7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5',
    md5: '4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8',
    createdTime: '2026-06-18T14:20:00Z',
    modifiedTime: '2026-06-18T14:25:33Z',
    accessTime: '2026-07-02T10:00:00Z',
    detectedTime: '2026-07-06T11:15:00Z',
    status: 'Orphan MFT',
    notes: 'Draft surat pernyataan pengakuan kesalahan internal perusahaan.',
    previewData: {
      paragraphs: [
        "PERNYATAAN PENGAKUAN TERTULIS",
        "Saya yang bertandatangan di bawah ini, menyatakan dengan sadar dan tanpa paksaan bahwa saya telah membocorkan data source code rahasia milik PT Indotekno Global ke forum luar pada tanggal 12 Juni 2026.",
        "Hal ini saya lakukan demi mendapatkan keuntungan finansial pribadi karena himpitan ekonomi keluarga.",
        "Saya siap menanggung segala bentuk konsekuensi hukum dan ganti rugi yang ditetapkan oleh manajemen perusahaan.",
        "Jakarta, 18 Juni 2026\n\n(Hendra Lesmana)"
      ]
    }
  }
];

export default function DeletedArtifactsTab() {
  const [isMounted, setIsMounted] = useState(false);
  const [artifacts, setArtifacts] = useState<Artifact[]>(() => {
    if (typeof window !== 'undefined') {
      const isSimActive = localStorage.getItem('forensic_sim_mode') === 'active';
      return isSimActive ? INITIAL_ARTIFACTS : [];
    }
    return [];
  });
  const [selectedArtifactId, setSelectedArtifactId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const isSimActive = localStorage.getItem('forensic_sim_mode') === 'active';
      return isSimActive ? 'art_1' : '';
    }
    return '';
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('Semua');
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua');
  
  // Dynamic Preview Tab states
  const [activePreviewTab, setActivePreviewTab] = useState<'content' | 'hex' | 'timeline'>('content');
  
  // Image rotate & zoom parameters
  const [imgRotate, setImgRotate] = useState<number>(0);
  const [imgZoom, setImgZoom] = useState<number>(1);
  
  // Video & Audio player controls simulation
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackTime, setPlaybackTime] = useState<number>(0);

  // SQLite DB Explorer State
  const [sqliteActiveTable, setSqliteActiveTable] = useState<string>('messages');
  const [sqliteSearchQuery, setSqliteSearchQuery] = useState<string>('');
  const [sqlitePage, setSqlitePage] = useState<number>(0);
  const sqlitePageSize = 3;

  // Real-time Action Logs / Logging
  const [actionLogs, setActionLogs] = useState<{timestamp: string; user: string; file: string; action: string}[]>([
    { timestamp: '2026-07-06T21:30:15Z', user: 'joersVIP@gmail.com', file: 'whatsapp_messages.db', action: 'Inisiasi analisis database sqlite' }
  ]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  const selectedArtifact = useMemo(() => {
    return artifacts.find(a => a.id === selectedArtifactId) || null;
  }, [artifacts, selectedArtifactId]);

  // Handle logging user preview events
  const logPreviewEvent = (fileName: string, actionDesc: string) => {
    const timestamp = new Date().toISOString();
    setActionLogs(prev => [
      { timestamp, user: 'joersVIP@gmail.com', file: fileName, action: actionDesc },
      ...prev
    ]);
  };

  // Handle selecting an artifact through user action
  const handleSelectArtifact = (art: Artifact) => {
    setSelectedArtifactId(art.id);
    logPreviewEvent(art.filename, 'Membuka preview arsip forensic read-only.');
    
    // Reset play state and image edits
    setIsPlaying(false);
    setPlaybackTime(0);
    setImgRotate(0);
    setImgZoom(1);
    
    // Auto switch active table if DB changed
    if (art.type === 'Basis data' && art.previewData?.tables) {
      setSqliteActiveTable(art.previewData.tables[0]);
    }
  };

  // Filtered Artifacts list
  const filteredArtifacts = useMemo(() => {
    return artifacts.filter(art => {
      const matchSearch = art.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          art.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          art.sha256.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = selectedType === 'Semua' || art.type === selectedType;
      const matchStatus = selectedStatus === 'Semua' || art.status === selectedStatus;
      return matchSearch && matchType && matchStatus;
    });
  }, [artifacts, searchTerm, selectedType, selectedStatus]);

  // Generate Hex dump simulation of target artifact bytes
  const mockHexDump = useMemo(() => {
    if (!selectedArtifact) return [];
    
    const size = Math.min(256, selectedArtifact.sizeBytes);
    const dump = [];
    
    // Header Magic Bytes matching type
    let headerBytes = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
    if (selectedArtifact.mimeType === 'application/x-sqlite3') {
      headerBytes = [0x53, 0x51, 0x4c, 0x69, 0x74, 0x65, 0x20, 0x66]; // SQLite f
    } else if (selectedArtifact.mimeType === 'application/pdf') {
      headerBytes = [0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]; // %PDF-1.4
    } else if (selectedArtifact.mimeType === 'image/png') {
      headerBytes = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]; // .PNG...
    } else if (selectedArtifact.mimeType === 'audio/wav') {
      headerBytes = [0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00]; // RIFF
    }

    for (let offset = 0; offset < size; offset += 16) {
      const chunkBytes: number[] = [];
      for (let i = 0; i < 16; i++) {
        if (offset + i < size) {
          if (offset === 0 && i < headerBytes.length) {
            chunkBytes.push(headerBytes[i]);
          } else {
            // Generate deterministic pseudorandom data based on name & offset
            const seed = selectedArtifact.filename.charCodeAt(i % selectedArtifact.filename.length) + offset + i;
            chunkBytes.push(seed % 256);
          }
        }
      }

      const hexParts = chunkBytes.map(b => b.toString(16).padStart(2, '0').toUpperCase());
      const hexStr = hexParts.join(' ');
      
      const asciiParts = chunkBytes.map(b => {
        return (b >= 32 && b <= 126) ? String.fromCharCode(b) : '.';
      });
      const asciiStr = asciiParts.join('');

      dump.push({
        offset: offset.toString(16).padStart(8, '0').toUpperCase(),
        hex: hexStr,
        ascii: asciiStr
      });
    }
    return dump;
  }, [selectedArtifact]);

  // Stats calculation
  const stats = useMemo(() => {
    const totalCount = artifacts.length;
    const deletedCount = artifacts.filter(a => a.status === 'Terhapus (Carved)' || a.status === 'Orphan MFT').length;
    
    // Distribution by Type
    const typeCounts: Record<string, number> = {};
    artifacts.forEach(a => {
      typeCounts[a.type] = (typeCounts[a.type] || 0) + 1;
    });

    // Distribution by Status
    const statusCounts: Record<string, number> = {};
    artifacts.forEach(a => {
      statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
    });

    return {
      totalCount,
      deletedCount,
      typeCounts,
      statusCounts
    };
  }, [artifacts]);

  // Edit analyst notes
  const handleUpdateNotes = (id: string, newNotes: string) => {
    setArtifacts(prev => 
      prev.map(a => {
        if (a.id === id) {
          return { ...a, notes: newNotes };
        }
        return a;
      })
    );
    logPreviewEvent(selectedArtifact?.filename || '', 'Memperbarui catatan analis forensik.');
  };

  if (!isMounted) {
    return (
      <div className="h-64 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center animate-pulse">
        <span className="text-zinc-500 font-mono text-xs">Menginisiasi Deleted Artifact Analysis...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Title & Introduction Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-red-600/10 text-red-400 border border-red-500/20 rounded-lg">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-sans tracking-tight text-zinc-100 flex items-center gap-2">
              DELETED ARTIFACT ANALYSIS
              <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-mono uppercase tracking-widest">
                READ-ONLY INTEGRITY
              </span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Mengidentifikasi artefak yang menunjukkan keberadaan file yang telah dihapus dalam folder hasil akuisisi yang sah tanpa memodifikasi bukti digital.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[10px] font-mono text-zinc-500 bg-zinc-950 px-3 py-1.5 border border-zinc-850 rounded-lg">
          <Clock className="w-3.5 h-3.5 text-red-400 animate-pulse" />
          <span>Active Case Sync: Legally Acquired Image Mount</span>
        </div>
      </div>

      {/* Top Dashboard Row - Mini stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Total Artifacts</span>
            <span className="text-2xl font-bold text-zinc-100 font-mono">{stats.totalCount}</span>
          </div>
          <Layers className="w-8 h-8 text-zinc-600" />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Marked Deleted</span>
            <span className="text-2xl font-bold text-red-400 font-mono">{stats.deletedCount}</span>
          </div>
          <ShieldAlert className="w-8 h-8 text-red-500/30" />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">SQLite Databases</span>
            <span className="text-2xl font-bold text-blue-400 font-mono">
              {artifacts.filter(a => a.type === 'Basis data').length}
            </span>
          </div>
          <Database className="w-8 h-8 text-blue-500/30" />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Active Analysts</span>
            <span className="text-xs font-semibold text-zinc-200 block truncate mt-1">joersVIP@gmail.com</span>
          </div>
          <ShieldCheck className="w-8 h-8 text-emerald-500/30" />
        </div>

      </div>

      {/* Main Grid: Left List and Filter, Right Preview & Metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left 4 Cols: Interactive filter, List of artifacts */}
        <div className="lg:col-span-5 space-y-4 flex flex-col">
          
          {/* Filtering Engine */}
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-zinc-500" /> FILTER CARVING
              </span>
              <span className="text-[10px] font-mono text-zinc-500">{filteredArtifacts.length} dari {artifacts.length}</span>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Cari nama file, hash, atau path..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-950 text-zinc-200 pl-9 pr-4 py-2 rounded-lg border border-zinc-800 text-xs focus:outline-none focus:border-red-500 transition-all placeholder:text-zinc-600 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Jenis Artefak</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-zinc-950 text-zinc-300 border border-zinc-800 rounded-lg p-1.5 focus:outline-none focus:border-red-500"
                >
                  <option value="Semua">Semua Jenis</option>
                  <option value="Gambar">Gambar</option>
                  <option value="Video">Video</option>
                  <option value="Audio">Audio</option>
                  <option value="Dokumen">Dokumen</option>
                  <option value="Basis data">Basis Data</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Status Analisis</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-zinc-950 text-zinc-300 border border-zinc-800 rounded-lg p-1.5 focus:outline-none focus:border-red-500"
                >
                  <option value="Semua">Semua Status</option>
                  <option value="Terhapus (Carved)">Terhapus (Carved)</option>
                  <option value="Kemungkinan Terhapus">Kemungkinan Terhapus</option>
                  <option value="Orphan MFT">Orphan MFT</option>
                  <option value="Residual Cache">Residual Cache</option>
                </select>
              </div>
            </div>
          </div>

          {/* List of artifacts */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex-1 overflow-y-auto max-h-[580px] space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-800 pb-2 mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-red-500" /> RECOVERED FILES & FILESTEAD
            </h3>

            {filteredArtifacts.map(art => {
              const isSelected = art.id === selectedArtifactId;
              let icon = <FileText className="w-4 h-4" />;
              let typeColor = 'text-zinc-400 bg-zinc-950';

              if (art.type === 'Gambar') { typeColor = 'text-emerald-400 bg-emerald-500/5 border-emerald-500/20'; }
              else if (art.type === 'Video') { typeColor = 'text-purple-400 bg-purple-500/5 border-purple-500/20'; }
              else if (art.type === 'Audio') { typeColor = 'text-amber-400 bg-amber-500/5 border-amber-500/20'; }
              else if (art.type === 'Basis data') { typeColor = 'text-blue-400 bg-blue-500/5 border-blue-500/20'; icon = <Database className="w-4 h-4" />; }
              
              return (
                <div
                  key={art.id}
                  onClick={() => handleSelectArtifact(art)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-zinc-950 border-red-500 shadow-md shadow-red-950/20' 
                      : 'bg-zinc-950/40 hover:bg-zinc-950 border-zinc-850'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold border ${typeColor} flex items-center gap-1`}>
                      {icon} {art.type}
                    </span>
                    <span className="text-[9px] font-mono text-rose-400 bg-rose-500/5 border border-rose-500/10 px-2 py-0.5 rounded">
                      {art.status}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-zinc-100 font-sans tracking-tight leading-snug break-all">
                    {art.filename}
                  </h4>
                  <p className="text-[9px] font-mono text-zinc-500 mt-1 truncate">
                    {art.location}
                  </p>

                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-zinc-900 text-[9px] text-zinc-500 font-mono">
                    <span>{(art.sizeBytes / 1024).toFixed(1)} KB</span>
                    <span>Carved: {new Date(art.detectedTime).toISOString().substring(0,10)}</span>
                  </div>
                </div>
              );
            })}

            {filteredArtifacts.length === 0 && (
              <div className="py-12 text-center text-zinc-600 italic text-xs font-sans">
                Tidak ada artefak terhapus yang cocok dengan filter pencarian.
              </div>
            )}
          </div>

        </div>

        {/* Right 7 Cols: Previews, Metadata panel, notes */}
        <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
          
          {selectedArtifact ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg flex-1 flex flex-col justify-between space-y-6">
              
              {/* Preview tabs bar */}
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 border-b border-zinc-800 pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                    {selectedArtifact.filename}
                    <span className="text-[10px] bg-zinc-850 text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded font-mono">
                      READ-ONLY PREVIEW
                    </span>
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-mono">Location: {selectedArtifact.location}</p>
                </div>

                <div className="flex gap-1.5">
                  <button
                    onClick={() => setActivePreviewTab('content')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1 ${
                      activePreviewTab === 'content'
                        ? 'bg-zinc-950 text-red-400 border border-red-500/20'
                        : 'bg-zinc-950/40 hover:bg-zinc-950 text-zinc-400 border border-zinc-850'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" /> Content Preview
                  </button>
                  <button
                    onClick={() => setActivePreviewTab('hex')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1 ${
                      activePreviewTab === 'hex'
                        ? 'bg-zinc-950 text-red-400 border border-red-500/20'
                        : 'bg-zinc-950/40 hover:bg-zinc-950 text-zinc-400 border border-zinc-850'
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5" /> HEX View
                  </button>
                  <button
                    onClick={() => setActivePreviewTab('timeline')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1 ${
                      activePreviewTab === 'timeline'
                        ? 'bg-zinc-950 text-red-400 border border-red-500/20'
                        : 'bg-zinc-950/40 hover:bg-zinc-950 text-zinc-400 border border-zinc-850'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" /> Timeline
                  </button>
                </div>
              </div>

              {/* View Rendering Content */}
              <div className="flex-1 min-h-[360px] bg-zinc-950 rounded-xl border border-zinc-850 p-4 relative flex flex-col justify-between">
                
                {/* 1. Content Viewers depending on mimeTypes */}
                {activePreviewTab === 'content' && (
                  <div className="flex-1 flex flex-col justify-between h-full">
                    
                    {/* A. SQLite basis data database explorer */}
                    {selectedArtifact.type === 'Basis data' && selectedArtifact.previewData && (
                      <div className="space-y-4 flex-1 flex flex-col justify-between">
                        <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] text-zinc-500 uppercase font-bold">Pilih Tabel:</span>
                            <div className="flex gap-1.5">
                              {selectedArtifact.previewData.tables.map((t: string) => (
                                <button
                                  key={t}
                                  onClick={() => {
                                    setSqliteActiveTable(t);
                                    setSqlitePage(0);
                                  }}
                                  className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase cursor-pointer ${
                                    sqliteActiveTable === t
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-400'
                                  }`}
                                >
                                  {t} ({selectedArtifact.previewData.rows[t]?.length || 0})
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="relative">
                            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-zinc-600" />
                            <input
                              type="text"
                              placeholder="Cari dalam tabel..."
                              value={sqliteSearchQuery}
                              onChange={(e) => setSqliteSearchQuery(e.target.value)}
                              className="bg-zinc-900 text-zinc-300 pl-8 pr-3 py-1 rounded border border-zinc-800 text-[10px] focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* SQLite rows table */}
                        <div className="flex-1 overflow-x-auto min-h-[220px]">
                          <table className="w-full text-left font-mono text-[10px]">
                            <thead>
                              <tr className="bg-zinc-900/60 border-b border-zinc-800 text-zinc-500">
                                {selectedArtifact.previewData.schema[sqliteActiveTable]?.map((col: string) => (
                                  <th key={col} className="p-2.5 uppercase font-bold tracking-wider">{col}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-900 text-zinc-300">
                              {selectedArtifact.previewData.rows[sqliteActiveTable]
                                ?.filter((row: any) => {
                                  if (!sqliteSearchQuery) return true;
                                  return Object.values(row).some(val => 
                                    String(val).toLowerCase().includes(sqliteSearchQuery.toLowerCase())
                                  );
                                })
                                .slice(sqlitePage * sqlitePageSize, (sqlitePage + 1) * sqlitePageSize)
                                .map((row: any, rIdx: number) => (
                                  <tr key={rIdx} className="hover:bg-zinc-900/20">
                                    {selectedArtifact.previewData.schema[sqliteActiveTable].map((col: string) => (
                                      <td key={col} className="p-2.5 max-w-[160px] truncate">{row[col]}</td>
                                    ))}
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>

                        {/* SQLite pagination controls */}
                        <div className="border-t border-zinc-900 pt-3 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                          <span>Database read-only integrity locked</span>
                          <div className="flex items-center space-x-2">
                            <button
                              disabled={sqlitePage === 0}
                              onClick={() => setSqlitePage(p => p - 1)}
                              className="p-1 bg-zinc-900 border border-zinc-800 rounded disabled:opacity-40 cursor-pointer"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <span>Page {sqlitePage + 1}</span>
                            <button
                              disabled={(sqlitePage + 1) * sqlitePageSize >= (selectedArtifact.previewData.rows[sqliteActiveTable]?.length || 0)}
                              onClick={() => setSqlitePage(p => p + 1)}
                              className="p-1 bg-zinc-900 border border-zinc-800 rounded disabled:opacity-40 cursor-pointer"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* B. Image zoomable, rotating viewer with EXIF meta */}
                    {selectedArtifact.type === 'Gambar' && selectedArtifact.previewData && (
                      <div className="space-y-4 flex-1 flex flex-col md:flex-row gap-4 items-stretch">
                        <div className="flex-1 bg-zinc-900 border border-zinc-850 rounded-lg flex flex-col items-center justify-center p-3 relative overflow-hidden min-h-[220px]">
                          {/* Image box */}
                          <div 
                            className="transition-all duration-300 flex items-center justify-center"
                            style={{ 
                              transform: `rotate(${imgRotate}deg) scale(${imgZoom})`,
                            }}
                          >
                            <img
                              src={selectedArtifact.previewData.imageUrl}
                              alt={selectedArtifact.filename}
                              className="max-h-[160px] md:max-h-[200px] object-contain rounded border border-zinc-850 shadow-md"
                            />
                          </div>

                          {/* Controls overlay */}
                          <div className="absolute bottom-3 right-3 flex items-center space-x-1.5 bg-zinc-950/80 backdrop-blur border border-zinc-800 p-1 rounded-lg">
                            <button 
                              onClick={() => setImgRotate(r => r + 90)}
                              className="p-1 hover:bg-zinc-800 rounded text-zinc-400 cursor-pointer"
                              title="Rotate 90°"
                            >
                              <RotateCw className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => setImgZoom(z => Math.min(3, z + 0.25))}
                              className="p-1 hover:bg-zinc-800 rounded text-zinc-400 cursor-pointer"
                              title="Zoom In"
                            >
                              <ZoomIn className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => setImgZoom(z => Math.max(0.5, z - 0.25))}
                              className="p-1 hover:bg-zinc-800 rounded text-zinc-400 cursor-pointer"
                              title="Zoom Out"
                            >
                              <ZoomOut className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* EXIF Metadata right layout inside content */}
                        <div className="w-full md:w-[180px] bg-zinc-900/50 p-3 rounded-lg border border-zinc-850 text-[10px] space-y-2">
                          <span className="text-[9px] text-zinc-500 uppercase font-bold block border-b border-zinc-800 pb-1">EXIF TAG DATA</span>
                          <div className="space-y-2 max-h-[160px] overflow-y-auto">
                            {Object.entries(selectedArtifact.previewData.exif).map(([k, v]: any) => (
                              <div key={k}>
                                <span className="text-zinc-500 block font-mono">{k}:</span>
                                <span className="text-zinc-300 font-sans font-semibold">{v}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* C. Video built-in responsive HTML5 player & codec overlays */}
                    {selectedArtifact.type === 'Video' && selectedArtifact.previewData && (
                      <div className="space-y-4 flex-1 flex flex-col justify-between">
                        <div className="flex-1 bg-zinc-900 border border-zinc-850 rounded-lg flex items-center justify-center relative p-2 overflow-hidden min-h-[220px]">
                          <video 
                            src={selectedArtifact.previewData.videoUrl} 
                            className="max-h-[180px] object-contain rounded"
                            controls
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                          />
                        </div>

                        <div className="bg-zinc-900/50 border border-zinc-850 p-3 rounded-lg text-[10px] grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-zinc-500 font-mono block">Codec Format:</span>
                            <span className="text-zinc-200 font-sans font-bold">{selectedArtifact.previewData.codec}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 font-mono block">Resolution/Duration:</span>
                            <span className="text-zinc-200 font-sans font-bold">
                              {selectedArtifact.previewData.resolution} ({selectedArtifact.previewData.duration})
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* D. Audio built-in waveform player */}
                    {selectedArtifact.type === 'Audio' && selectedArtifact.previewData && (
                      <div className="space-y-6 flex-1 flex flex-col justify-center py-4">
                        <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-850 space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Codec: {selectedArtifact.previewData.codec}</span>
                            <span className="text-[10px] font-mono text-amber-400 font-bold">{selectedArtifact.previewData.duration} / Stereo</span>
                          </div>

                          {/* Simple interactive simulated Waveform */}
                          <div className="h-16 flex items-end justify-between gap-[3px] bg-zinc-950 p-2 rounded-lg border border-zinc-900">
                            {selectedArtifact.previewData.waveformData.map((h: number, idx: number) => {
                              // Simulate active playing coloring
                              const isPlayed = isPlaying && idx < (playbackTime * 1.5);
                              return (
                                <div
                                  key={idx}
                                  className={`flex-1 rounded-t transition-all ${
                                    isPlayed ? 'bg-amber-400' : 'bg-zinc-800'
                                  }`}
                                  style={{ height: `${h}%` }}
                                />
                              );
                            })}
                          </div>

                          {/* Play controls */}
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => {
                                setIsPlaying(!isPlaying);
                                if (!isPlaying) {
                                  // Simulation intervals for soundbar ticking
                                  const soundInterval = setInterval(() => {
                                    setPlaybackTime(t => {
                                      if (t >= 20) {
                                        setIsPlaying(false);
                                        clearInterval(soundInterval);
                                        return 0;
                                      }
                                      return t + 1;
                                    });
                                  }, 500);
                                }
                              }}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                            >
                              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                              {isPlaying ? 'PAUSE' : 'PLAY SYSTEM DECODER'}
                            </button>

                            <span className="text-[10px] font-mono text-zinc-500">Sample Rate: {selectedArtifact.previewData.sampleRate}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* E. PDF Embedded reader */}
                    {selectedArtifact.mimeType === 'application/pdf' && selectedArtifact.previewData && (
                      <div className="space-y-4 flex-1 flex flex-col justify-between">
                        <div className="flex-1 bg-zinc-900 border border-zinc-850 rounded-lg p-4 font-mono text-[11px] leading-relaxed max-h-[220px] overflow-y-auto space-y-4">
                          {selectedArtifact.previewData.pages.map((p: any) => (
                            <div key={p.pageNum} className="space-y-2">
                              <div className="flex items-center justify-between border-b border-zinc-950 pb-1.5 text-[10px] text-zinc-500">
                                <span>PDF Document Page {p.pageNum}</span>
                                <span>Hash Verified: Success</span>
                              </div>
                              <p className="text-zinc-200 font-sans whitespace-pre-wrap">{p.text}</p>
                            </div>
                          ))}
                        </div>

                        <div className="text-[10px] text-zinc-500 font-mono italic">
                          ℹ️ Embedded PDF Reader is running in sandbox read-only enforcement mode. Text search is fully enabled.
                        </div>
                      </div>
                    )}

                    {/* F. Microsoft Office (DOCX, XLSX) Previews */}
                    {selectedArtifact.filename.endsWith('.xlsx') && selectedArtifact.previewData && (
                      <div className="space-y-4 flex-1 flex flex-col justify-between">
                        <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-850 flex items-center justify-between text-[10px] text-zinc-400">
                          <span className="font-bold flex items-center gap-1 text-emerald-400">
                            <FileSpreadsheet className="w-3.5 h-3.5" /> EXCEL SPREADSHEET VIEWER
                          </span>
                          <span>Sheets: {Object.keys(selectedArtifact.previewData.sheets).join(', ')}</span>
                        </div>

                        <div className="flex-1 overflow-x-auto max-h-[180px] border border-zinc-850/50 rounded bg-zinc-950 p-2">
                          <table className="w-full text-left text-[10px] font-mono border-collapse">
                            <tbody>
                              {selectedArtifact.previewData.sheets['Aset Utama']?.map((row: string[], rIdx: number) => (
                                <tr 
                                  key={rIdx} 
                                  className={`border-b border-zinc-900 ${
                                    rIdx === 0 ? 'bg-zinc-900 text-zinc-400 font-bold' : 'text-zinc-300'
                                  }`}
                                >
                                  {row.map((cell: string, cIdx: number) => (
                                    <td key={cIdx} className="p-2 border-r border-zinc-900 min-w-[100px]">{cell}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {selectedArtifact.filename.endsWith('.docx') && selectedArtifact.previewData && (
                      <div className="space-y-4 flex-1 flex flex-col justify-between">
                        <div className="bg-zinc-900 border border-zinc-850 p-3 rounded-lg flex items-center gap-2 text-[10px] text-zinc-400">
                          <FileText className="w-4 h-4 text-blue-400" />
                          <span className="font-bold">MICROSOFT WORD SANDBOX VIEWER (Read-Only)</span>
                        </div>

                        <div className="flex-1 bg-zinc-900/30 p-4 rounded-lg border border-zinc-850/60 text-xs text-zinc-300 space-y-3 font-sans leading-relaxed max-h-[180px] overflow-y-auto">
                          {selectedArtifact.previewData.paragraphs.map((p: string, idx: number) => (
                            <p key={idx} className={idx === 0 ? 'font-bold text-center text-sm border-b border-zinc-900 pb-2 mb-2 text-zinc-100' : ''}>
                              {p}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* G. Text Plain/TXT Previews */}
                    {selectedArtifact.mimeType === 'text/plain' && selectedArtifact.previewData && (
                      <div className="space-y-4 flex-1 flex flex-col justify-between">
                        <div className="bg-zinc-900 p-2.5 rounded border border-zinc-850 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                          <span>UTF-8 plaintext decoder</span>
                          <span>Lines: {selectedArtifact.previewData.content.split('\n').length}</span>
                        </div>

                        <pre className="flex-1 bg-zinc-900/40 p-3.5 rounded border border-zinc-850/50 text-[10px] font-mono text-zinc-300 leading-relaxed overflow-y-auto max-h-[200px] whitespace-pre-wrap">
                          {selectedArtifact.previewData.content}
                        </pre>
                      </div>
                    )}

                  </div>
                )}

                {/* 2. Hex View tab */}
                {activePreviewTab === 'hex' && (
                  <div className="space-y-3 flex-1 flex flex-col justify-between font-mono text-[10px]">
                    <div className="flex items-center justify-between border-b border-zinc-900 pb-2 text-zinc-500">
                      <span>Offset / Address</span>
                      <span className="hidden md:inline">Hexadecimal bytes column representation (16 columns)</span>
                      <span>Printable ASCII</span>
                    </div>

                    <div className="flex-1 max-h-[220px] overflow-y-auto pr-1 select-all scrollbar-thin scrollbar-thumb-zinc-800">
                      {mockHexDump.map((line, idx) => (
                        <div key={idx} className="flex justify-between py-1 border-b border-zinc-950 hover:bg-zinc-900/10">
                          <span className="text-red-400/80 font-bold">{line.offset}</span>
                          <span className="text-zinc-300 tracking-wide font-medium font-mono text-center flex-1 mx-4 max-w-[340px] truncate">
                            {line.hex}
                          </span>
                          <span className="text-zinc-500 border-l border-zinc-900 pl-4">{line.ascii}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-zinc-900 pt-2.5 flex justify-between items-center text-[9px] text-zinc-600">
                      <span>Showing first {mockHexDump.length * 16} bytes</span>
                      <span>Signature: {selectedArtifact.sha256.substring(0, 16)}...</span>
                    </div>
                  </div>
                )}

                {/* 3. Timeline View tab */}
                {activePreviewTab === 'timeline' && (
                  <div className="space-y-4 flex-1 overflow-y-auto max-h-[260px] pr-2">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block border-b border-zinc-900 pb-2">
                      Kronologi Riwayat File Sistem
                    </span>

                    <div className="relative border-l border-zinc-800 ml-3 pl-4 space-y-5">
                      {/* Created timeline node */}
                      <div className="relative">
                        <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-zinc-950" />
                        <div className="text-[10px] font-mono text-zinc-500">{new Date(selectedArtifact.createdTime).toUTCString()}</div>
                        <div className="text-xs font-bold text-zinc-300 mt-0.5">Created Time (MFT Node Created)</div>
                        <p className="text-[10px] text-zinc-500 leading-relaxed mt-0.5">File dibuat pertama kali di sistem file local.</p>
                      </div>

                      {/* Modified timeline node */}
                      <div className="relative">
                        <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-zinc-950" />
                        <div className="text-[10px] font-mono text-zinc-500">{new Date(selectedArtifact.modifiedTime).toUTCString()}</div>
                        <div className="text-xs font-bold text-zinc-300 mt-0.5">Last Modified Time</div>
                        <p className="text-[10px] text-zinc-500 leading-relaxed mt-0.5">Data block terkahir dimodifikasi atau dirubah isinya.</p>
                      </div>

                      {/* Accessed timeline node */}
                      <div className="relative">
                        <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-yellow-500 border-2 border-zinc-950" />
                        <div className="text-[10px] font-mono text-zinc-500">{new Date(selectedArtifact.accessTime).toUTCString()}</div>
                        <div className="text-xs font-bold text-zinc-300 mt-0.5">Last Accessed Time</div>
                        <p className="text-[10px] text-zinc-500 leading-relaxed mt-0.5">Pembacaan disk block terakhir oleh sistem operasi target.</p>
                      </div>

                      {/* Detected timeline node */}
                      <div className="relative">
                        <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-zinc-950" />
                        <div className="text-[10px] font-mono text-zinc-500">{new Date(selectedArtifact.detectedTime).toUTCString()}</div>
                        <div className="text-xs font-bold text-red-400 mt-0.5">Evidence Scanned (Deleted Recovery)</div>
                        <p className="text-[10px] text-zinc-500 leading-relaxed mt-0.5">Pendeteksian oleh sistem modul `deleted_artifact_service.py` di cluster unallocated.</p>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Bottom detail row: Metadata and Analyst notes side-by-side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-zinc-800">
                
                {/* File Hashes and MIME definitions */}
                <div className="space-y-3 bg-zinc-950 p-4 rounded-xl border border-zinc-850">
                  <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1 border-b border-zinc-900 pb-2">
                    <Info className="w-3.5 h-3.5 text-zinc-500" /> FILE IDENTIFIERS (METADATA PANEL)
                  </h4>

                  <div className="space-y-2 text-[10px]">
                    <div>
                      <span className="text-zinc-500 font-mono block">MIME Type / Format:</span>
                      <span className="text-zinc-300 font-mono font-medium">{selectedArtifact.mimeType}</span>
                    </div>

                    <div>
                      <span className="text-zinc-500 font-mono block">SHA-256 Checksum:</span>
                      <span className="text-zinc-300 font-mono break-all font-medium select-all">{selectedArtifact.sha256}</span>
                    </div>

                    <div>
                      <span className="text-zinc-500 font-mono block">MD5 Checksum:</span>
                      <span className="text-zinc-300 font-mono break-all font-medium select-all">{selectedArtifact.md5}</span>
                    </div>
                  </div>
                </div>

                {/* Analyst Notes */}
                <div className="space-y-3 bg-zinc-950 p-4 rounded-xl border border-zinc-850 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1 border-b border-zinc-900 pb-2">
                      <FileText className="w-3.5 h-3.5 text-zinc-500" /> CATATAN ANALIS FORENSIK
                    </h4>
                    
                    <textarea
                      value={selectedArtifact.notes}
                      onChange={(e) => handleUpdateNotes(selectedArtifact.id, e.target.value)}
                      className="w-full bg-zinc-900 text-zinc-200 p-2.5 rounded-lg border border-zinc-800 text-xs focus:outline-none focus:border-red-500 h-20 resize-none font-sans"
                      placeholder="Masukkan catatan investigasi forensik terhadap barang bukti terhapus ini..."
                    />
                  </div>

                  <div className="flex items-center justify-between text-[9px] text-zinc-600 font-mono">
                    <span>Last Edit: Auto-Saved on change</span>
                    <span className="text-emerald-500 flex items-center gap-0.5"><Check className="w-3 h-3" /> Integrity Secure</span>
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="bg-zinc-900/40 border border-dashed border-zinc-800 rounded-xl p-16 text-center text-zinc-600 font-mono text-xs">
              Silakan klik salah satu berkas terhapus di kolom kiri untuk meluncurkan modul Preview dan verifikasi Hash.
            </div>
          )}

        </div>

      </div>

      {/* Visualizations / Charts row built from secure Tailwind SVG components */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Type Distribution and Chart */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-850 pb-3 mb-4 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-red-400" />
            GRAFIK DISTRIBUSI ARTEFAK FORENSIK
          </h3>

          <div className="space-y-4">
            {Object.entries(stats.typeCounts).map(([type, count]) => {
              const pct = (count / stats.totalCount) * 100;
              let barColor = 'bg-blue-500';
              if (type === 'Gambar') barColor = 'bg-emerald-500';
              if (type === 'Video') barColor = 'bg-purple-500';
              if (type === 'Audio') barColor = 'bg-amber-500';

              return (
                <div key={type} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-sans">
                    <span className="text-zinc-300 font-semibold">{type}</span>
                    <span className="text-zinc-500 font-mono">{count} berkas ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-900">
                    <div 
                      className={`h-full rounded-full ${barColor}`} 
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Audit logging timeline activity tracker */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-850 pb-3 mb-4 flex items-center gap-1.5">
              <History className="w-4 h-4 text-emerald-400" />
              LOG KEGIATAN PREVIEW ANALIS (REAL-TIME LOGGING)
            </h3>

            <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
              {actionLogs.map((log, idx) => (
                <div key={idx} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-850/60 font-mono text-[10px] space-y-1">
                  <div className="flex justify-between items-center text-zinc-500 text-[9px]">
                    <span>User: {log.user}</span>
                    <span>{new Date(log.timestamp).toUTCString().substr(17,8)} UTC</span>
                  </div>
                  <div className="text-zinc-300 font-semibold">{log.file}</div>
                  <p className="text-zinc-400 text-[10px] font-sans">{log.action}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-zinc-500 font-sans italic border-t border-zinc-850 pt-3 mt-4">
            ⚠️ <strong>Perhatian:</strong> Seluruh durasi dan modul penayangan direkam otomatis untuk kebutuhan akuntabilitas audit pemeriksaan digital.
          </p>
        </div>

      </div>

    </div>
  );
}
