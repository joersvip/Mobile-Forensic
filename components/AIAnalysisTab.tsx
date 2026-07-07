'use client';

import React, { useState } from 'react';
import { Brain, FileText, Search, Image as ImageIcon, Cpu, Sparkles, CheckCircle2, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';

interface AIAnalysisTabProps {
  onLogActivity: (module: string, action: string) => void;
}

export default function AIAnalysisTab({ onLogActivity }: AIAnalysisTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'ocr' | 'classify' | 'semantic' | 'recommend'>('ocr');
  
  // OCR states
  const [ocrSelectedImage, setOcrSelectedImage] = useState<string>('bukti_transfer_gelap.png');
  const [ocrProgress, setOcrProgress] = useState<number>(-1);
  const [ocrResult, setOcrResult] = useState<string>('');
  
  // Classify states
  const [classSelectedImage, setClassSelectedImage] = useState<string>('suspect_map_coordinates.png');
  const [classProgress, setClassProgress] = useState<number>(-1);
  const [classResult, setClassResult] = useState<any[]>([]);

  // Semantic Search States
  const [semanticQuery, setSemanticQuery] = useState<string>('');
  const [semanticResults, setSemanticResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Simulation files
  const mockOCRFiles = [
    { name: 'bukti_transfer_gelap.png', size: '240 KB', text: 'TRANSAKSI GELAP - Rp 500.000.000 - PENERIMA: ANONYMOUS - REKENING: BNI 048912XXXX - TANGGAL: 21 Juni 2026' },
    { name: 'sms_screenshot_whatsapp.jpg', size: '410 KB', text: 'Kirim payload update .apk ke target sekarang. Jangan sampai bocor. Link: https://rsc.cyber/malware/update_v3.apk' },
    { name: 'catatan_sandi_rahasia.png', size: '185 KB', text: 'PASSWORD VAULT: admin123 | KnoxKey: K-881290-A | RootSsh: s0_defiant_key' }
  ];

  const mockClassFiles = [
    { name: 'suspect_map_coordinates.png', type: 'Peta / Navigasi (GPS)', confidence: 97.4, details: 'Koordinat -6.1751, 106.8272. Terdeteksi rute menuju lokasi peledakan / pertemuan.' },
    { name: 'pistol_weapon_photo.jpg', type: 'Senjata Api / Pisau (Ancaman)', confidence: 98.8, details: 'Senjata genggam semi-otomatis kaliber 9mm dengan nomor seri dikikir.' },
    { name: 'kontrak_kerja_palsu.pdf_thumbnail', type: 'Dokumen / Identitas Palsu', confidence: 88.5, details: 'Dokumen berformat hukum dengan tanda tangan hasil cropping Photoshop.' }
  ];

  const mockSemanticData = [
    { query: 'transfer', file: 'bukti_transfer_gelap.png', score: 0.94, snippet: 'Transaksi pengiriman dana ilegal Rp 500 jt.', category: 'Keuangan' },
    { query: 'dana', file: 'bukti_transfer_gelap.png', score: 0.91, snippet: 'Transaksi pengiriman dana ilegal Rp 500 jt.', category: 'Keuangan' },
    { query: 'sandi', file: 'catatan_sandi_rahasia.png', score: 0.89, snippet: 'Kumpulan kata sandi root SSH dan brankas enkripsi.', category: 'Kredensial' },
    { query: 'payload', file: 'sms_screenshot_whatsapp.jpg', score: 0.95, snippet: 'Link pengunduhan payload .apk malware berbahaya.', category: 'Malware' },
    { query: 'lokasi', file: 'suspect_map_coordinates.png', score: 0.88, snippet: 'Rute navigasi GPS suspect menuju titik koordinat Monas.', category: 'Lokasi' }
  ];

  // OCR scan runner
  const handleRunOCR = async () => {
    setOcrProgress(0);
    setOcrResult('');
    onLogActivity('AI OCR Engine', `Memulai scan teks lokal pada file: ${ocrSelectedImage}`);

    for (let p = 0; p <= 100; p += 20) {
      setOcrProgress(p);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    const matched = mockOCRFiles.find(f => f.name === ocrSelectedImage);
    setOcrResult(matched ? matched.text : 'Gagal mengekstrak teks.');
    setOcrProgress(-1);
    onLogActivity('AI OCR Engine', `OCR selesai. Berhasil mengekstrak ${matched?.text.length || 0} karakter secara offline.`);
  };

  // Classification runner
  const handleRunClassify = async () => {
    setClassProgress(0);
    setClassResult([]);
    onLogActivity('AI Classifier', `Memulai klasifikasi objek lokal pada file: ${classSelectedImage}`);

    for (let p = 0; p <= 100; p += 25) {
      setClassProgress(p);
      await new Promise(resolve => setTimeout(resolve, 250));
    }

    const matched = mockClassFiles.find(f => f.name === classSelectedImage);
    if (matched) {
      setClassResult([matched]);
    }
    setClassProgress(-1);
    onLogActivity('AI Classifier', `Klasifikasi selesai secara luring. Kategori terdeteksi: ${matched?.type} (Confidence: ${matched?.confidence}%)`);
  };

  // Semantic query runner
  const handleSemanticSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!semanticQuery.trim()) return;

    setIsSearching(true);
    setSemanticResults([]);
    onLogActivity('AI Semantic Search', `Menjalankan pencarian semantik offline: "${semanticQuery}"`);

    await new Promise(resolve => setTimeout(resolve, 800));

    const lowercaseQuery = semanticQuery.toLowerCase();
    const results = mockSemanticData.filter(item => 
      item.query.includes(lowercaseQuery) || 
      lowercaseQuery.includes(item.query) ||
      item.snippet.toLowerCase().includes(lowercaseQuery)
    );

    setSemanticResults(results);
    setIsSearching(false);
    onLogActivity('AI Semantic Search', `Ditemukan ${results.length} artefak yang cocok secara konseptual.`);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg space-y-5">
      {/* Tab Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-800 pb-4 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-lg">
            <Brain className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-1.5">
              OFFLINE LOCAL AI ANALYSIS ENGINE
            </h3>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">Sistem kecerdasan buatan terenkripsi penuh yang berjalan luring tanpa cloud</p>
          </div>
        </div>

        {/* Local model status indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-950 rounded-lg border border-zinc-850">
          <Cpu className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px] font-mono font-bold text-zinc-400">MODEL LOCAL-CACHE: ACTIVE (QTHREAD_POOL)</span>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex border-b border-zinc-850 gap-1 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveSubTab('ocr')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'ocr'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/40'
          }`}
        >
          <FileText className="w-4 h-4" /> OCR Text Extractor
        </button>
        <button
          onClick={() => setActiveSubTab('classify')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'classify'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/40'
          }`}
        >
          <ImageIcon className="w-4 h-4" /> Image Object Classifier
        </button>
        <button
          onClick={() => setActiveSubTab('semantic')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'semantic'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/40'
          }`}
        >
          <Search className="w-4 h-4" /> Semantic Offline Search
        </button>
        <button
          onClick={() => setActiveSubTab('recommend')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'recommend'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/40'
          }`}
        >
          <Sparkles className="w-4 h-4" /> Artifact Grouping Match
        </button>
      </div>

      {/* Subtab Contents */}
      <div className="pt-2">
        {/* OCR CONTENT */}
        {activeSubTab === 'ocr' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Control panel */}
            <div className="lg:col-span-1 bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-4">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">PILIH SUSPECT MEDIA:</span>
              <div className="space-y-2">
                {mockOCRFiles.map((file, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setOcrSelectedImage(file.name);
                      setOcrResult('');
                    }}
                    className={`w-full p-3 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
                      ocrSelectedImage === file.name
                        ? 'border-blue-500/40 bg-blue-500/10 text-blue-400'
                        : 'border-zinc-850 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span className="text-xs truncate max-w-[140px] font-mono">{file.name}</span>
                    <span className="text-[10px] font-mono text-zinc-500">{file.size}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={handleRunOCR}
                disabled={ocrProgress >= 0}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {ocrProgress >= 0 ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    RUNNING OCR... {ocrProgress}%
                  </>
                ) : (
                  <>
                    <Cpu className="w-4 h-4" /> JALANKAN LOCAL OCR SCAN
                  </>
                )}
              </button>
            </div>

            {/* Render results window */}
            <div className="lg:col-span-2 bg-zinc-950 rounded-xl border border-zinc-850 p-4 min-h-[220px] flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block border-b border-zinc-900 pb-2 mb-3">
                  HASIL EKSTRAKSI TEKS (OFFLINE READ-ONLY):
                </span>

                {ocrProgress >= 0 && (
                  <div className="space-y-3 pt-6 flex flex-col items-center justify-center">
                    <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                    <div className="w-64 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 transition-all duration-200" style={{ width: `${ocrProgress}%` }} />
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">MEMBACA ARRAY PIKSEL & INTEGRAL HISTOGRAM...</span>
                  </div>
                )}

                {ocrResult && (
                  <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-850/60 text-xs font-mono text-emerald-400 leading-relaxed whitespace-pre-wrap select-text selection:bg-blue-500/20">
                    {ocrResult}
                  </div>
                )}

                {!ocrResult && ocrProgress < 0 && (
                  <div className="flex flex-col items-center justify-center pt-8 text-zinc-500">
                    <AlertCircle className="w-8 h-8 text-zinc-700 mb-2" />
                    <span className="text-xs">Belum ada pemindaian OCR. Klik tombol jalankan pemindaian.</span>
                  </div>
                )}
              </div>

              {ocrResult && (
                <div className="mt-4 pt-3 border-t border-zinc-900 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                  <span>THREAD LOGS: OCR_CRIPPLE_SUCCESS</span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" /> VERIFIED LOCAL EXIF INTEGRITY
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CLASSIFY CONTENT */}
        {activeSubTab === 'classify' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-4">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">PILIH GAMBAR TERSANGKA:</span>
              <div className="space-y-2">
                {mockClassFiles.map((file, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setClassSelectedImage(file.name);
                      setClassResult([]);
                    }}
                    className={`w-full p-3 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
                      classSelectedImage === file.name
                        ? 'border-blue-500/40 bg-blue-500/10 text-blue-400'
                        : 'border-zinc-850 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span className="text-xs truncate max-w-[170px] font-mono">{file.name}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={handleRunClassify}
                disabled={classProgress >= 0}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {classProgress >= 0 ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    RUNNING CLASSIFIER... {classProgress}%
                  </>
                ) : (
                  <>
                    <Cpu className="w-4 h-4" /> PROSES KLASIFIKASI OBJEK
                  </>
                )}
              </button>
            </div>

            <div className="lg:col-span-2 bg-zinc-950 rounded-xl border border-zinc-850 p-4 min-h-[220px] flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block border-b border-zinc-900 pb-2 mb-3">
                  HASIL KLASIFIKASI ZERO-SHOT (COCO/YOLO):
                </span>

                {classProgress >= 0 && (
                  <div className="space-y-3 pt-6 flex flex-col items-center justify-center">
                    <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                    <div className="w-64 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 transition-all duration-200" style={{ width: `${classProgress}%` }} />
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">MENGEKSTRAK VECTOR DESKRIPTOR & KLASIFIKATOR...</span>
                  </div>
                )}

                {classResult.length > 0 && classResult.map((res, idx) => (
                  <div key={idx} className="bg-zinc-900 p-4 rounded-lg border border-zinc-850/60 space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
                      <span className="text-xs font-bold text-zinc-300 font-mono">KATEGORI DETEKSI:</span>
                      <span className="px-2.5 py-1 bg-blue-950 text-blue-400 border border-blue-500/20 text-xs font-bold rounded font-mono">
                        {res.type}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500 font-mono">TINGKAT AKURASI (CONFIDENCE):</span>
                      <span className="text-xs font-bold text-emerald-400 font-mono">{res.confidence}%</span>
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed font-sans mt-2">
                      {res.details}
                    </p>
                  </div>
                ))}

                {classResult.length === 0 && classProgress < 0 && (
                  <div className="flex flex-col items-center justify-center pt-8 text-zinc-500">
                    <AlertCircle className="w-8 h-8 text-zinc-700 mb-2" />
                    <span className="text-xs">Belum ada klasifikasi. Klik tombol klasifikasi untuk memproses.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SEMANTIC SEARCH CONTENT */}
        {activeSubTab === 'semantic' && (
          <div className="space-y-4">
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850">
              <form onSubmit={handleSemanticSearch} className="flex gap-2.5">
                <input
                  type="text"
                  placeholder="Masukkan kata kunci konsep (e.g. 'transfer', 'dana', 'sandi', 'payload')..."
                  value={semanticQuery}
                  onChange={(e) => setSemanticQuery(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-xs text-zinc-100 outline-none focus:border-blue-500 font-sans"
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  CARI SEMANTIK
                </button>
              </form>
            </div>

            <div className="bg-zinc-950 rounded-xl border border-zinc-850 p-4 min-h-[180px]">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block border-b border-zinc-900 pb-2 mb-3">
                HASIL PENCARIAN VECTOR SEMANTIK OFFLINE:
              </span>

              {isSearching && (
                <div className="flex flex-col items-center justify-center py-6 gap-2">
                  <RefreshCw className="w-7 h-7 text-blue-500 animate-spin" />
                  <span className="text-[10px] text-zinc-500 font-mono">MENGHITUNG COSINE SIMILARITY MATRIKS...</span>
                </div>
              )}

              {!isSearching && semanticResults.length > 0 && (
                <div className="space-y-2.5">
                  {semanticResults.map((item, idx) => (
                    <div key={idx} className="p-3 bg-zinc-900 rounded-lg border border-zinc-850 hover:border-blue-500/20 transition-all flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono font-bold text-blue-400">{item.file}</span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-zinc-950 text-zinc-500 rounded border border-zinc-850 uppercase font-mono font-bold">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 italic">&ldquo;{item.snippet}&rdquo;</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-zinc-500 font-mono block">SIMILARITY SCORE:</span>
                        <span className="text-sm font-black font-mono text-emerald-400">{(item.score * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isSearching && semanticResults.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-zinc-500">
                  <AlertCircle className="w-8 h-8 text-zinc-700 mb-2" />
                  <span className="text-xs">Gunakan kata kunci pencarian konsep seperti <code className="font-mono text-cyan-400">transfer</code>, <code className="font-mono text-cyan-400">payload</code>, <code className="font-mono text-cyan-400">sandi</code> untuk memicu deteksi kecocokan semantik.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* RECOMMENDATION GROUPING CONTENT */}
        {activeSubTab === 'recommend' && (
          <div className="space-y-4">
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block border-b border-zinc-900 pb-2 mb-3">
                KORELASI MATRIKS ARTEFAK (CLUSTER GROUPING):
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-850 space-y-2.5">
                  <span className="text-xs font-bold text-zinc-200 block uppercase font-mono">
                    Cluster A: Financial Suspicion & Transactions
                  </span>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Menghubungkan catatan transfer bank, pesan SMS penarikan dana gelap, dan log database Suspect yang diubah pada waktu yang berdekatan.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2 text-[10px] font-mono text-blue-400">
                    <span className="bg-zinc-950 px-2 py-0.5 rounded border border-zinc-850">bukti_transfer_gelap.png</span>
                    <span className="bg-zinc-950 px-2 py-0.5 rounded border border-zinc-850">mmssms.db (Messages Table)</span>
                  </div>
                </div>

                <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-850 space-y-2.5">
                  <span className="text-xs font-bold text-zinc-200 block uppercase font-mono">
                    Cluster B: Remote Access Malware & Intrusions
                  </span>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Menghubungkan log unduhan dari WhatsApp, file APK berbahaya di direktori Download, dan log perubahan root system.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2 text-[10px] font-mono text-red-400">
                    <span className="bg-zinc-950 px-2 py-0.5 rounded border border-zinc-850">payload_update_3.apk</span>
                    <span className="bg-zinc-950 px-2 py-0.5 rounded border border-zinc-850">chat_logs_suspect.txt</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
