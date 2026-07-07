'use client';

import React, { useState } from 'react';
import { Sliders, ShieldCheck, CheckCircle, RefreshCw, Trash2, Database } from 'lucide-react';
import { ForensicSettings } from '../types/forensic';

interface SettingsTabProps {
  settings: ForensicSettings;
  onSaveSettings: (settings: ForensicSettings) => void;
  onLogActivity: (module: string, activity: string) => void;
}

export default function SettingsTab({
  settings,
  onSaveSettings,
  onLogActivity
}: SettingsTabProps) {
  const [examinerName, setExaminerName] = useState(settings.examinerName);
  const [agency, setAgency] = useState(settings.organization);
  const [caseId, setCaseId] = useState(settings.caseId);
  const [outputDir, setOutputDir] = useState(settings.outputPath);
  const [defaultHash, setDefaultHash] = useState<'SHA-256' | 'MD5'>('SHA-256');
  const [isSuccess, setIsSuccess] = useState(false);

  const [isSimActive, setIsSimActive] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('forensic_sim_mode') === 'active';
    }
    return false;
  });

  const enableSimMode = () => {
    localStorage.setItem('forensic_sim_mode', 'active');
    onLogActivity('Settings', 'Mengaktifkan Mode Simulasi: Memuat berkas dan data kasus forensik simulasi (CASE-POL-2026-07A) ke sistem.');
    window.location.reload();
  };

  const disableSimMode = () => {
    localStorage.setItem('forensic_sim_mode', 'inactive');
    onLogActivity('Settings', 'Menonaktifkan Mode Simulasi: Menghapus seluruh data kasus dummy dari workspace luring.');
    window.location.reload();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSaveSettings({
      examinerName,
      organization: agency,
      caseId,
      outputPath: outputDir
    });

    setIsSuccess(true);
    onLogActivity('Settings', `Updated investigator case profile [Case: ${caseId}, Examiner: ${examinerName}]`);

    setTimeout(() => {
      setIsSuccess(false);
    }, 2500);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-850 pb-2">
          <Sliders className="w-4 h-4 text-cyan-500" />
          GLOBAL CASE INVESTIGATOR IDENTIFICATION
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Examiner */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase font-bold">Examiner Name / Badge ID</label>
              <input
                type="text"
                value={examinerName}
                onChange={(e) => setExaminerName(e.target.value)}
                placeholder="Rian Adiputra (Badge #4812)"
                required
                className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-250 outline-none focus:border-cyan-500 font-sans"
              />
            </div>

            {/* Department */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase font-bold">Organization / Police Department</label>
              <input
                type="text"
                value={agency}
                onChange={(e) => setAgency(e.target.value)}
                placeholder="Polda Metro Jaya - Cyber Crime Unit"
                required
                className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-250 outline-none focus:border-cyan-500 font-sans"
              />
            </div>

            {/* Case ID */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase font-bold">Case Reference Number</label>
              <input
                type="text"
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                placeholder="CASE/POL/2026/07-01A"
                required
                className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-250 outline-none focus:border-cyan-500 font-sans font-mono"
              />
            </div>

            {/* Path */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase font-bold">Forensic Output destination pathway</label>
              <input
                type="text"
                value={outputDir}
                onChange={(e) => setOutputDir(e.target.value)}
                placeholder="/var/forensics/cases/2026/"
                required
                className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-250 outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-850/80 flex items-center justify-between gap-4 flex-wrap">
            {isSuccess ? (
              <div className="bg-emerald-950/20 border border-emerald-500/20 p-2 rounded-lg flex items-center space-x-2 text-emerald-400 text-xs font-semibold animate-pulse">
                <CheckCircle className="w-4 h-4" />
                <span>Global configuration profile saved successfully.</span>
              </div>
            ) : (
              <span className="text-[10px] text-slate-500 font-sans italic">
                ⚠️ Modifying these credentials will update the header tags on exported PDF and Word files.
              </span>
            )}

            <button
              type="submit"
              className="py-2 px-5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition-all uppercase tracking-wider flex items-center gap-1"
            >
              <ShieldCheck className="w-4 h-4" /> Save Profile Config
            </button>
          </div>
        </form>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-850 pb-2">
          <Database className="w-4 h-4 text-cyan-500" />
          MANAJEMEN KASUS & INTEGRITAS WORKSPACE
        </h3>

        <div className="space-y-4">
          <div className="p-4 rounded-lg border bg-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-4 border-slate-850">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-300 block uppercase">
                STATUS WORKSPACE AKTIF
              </span>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                Sistem forensik ini bekerja secara luring (offline) dengan integritas tinggi. Anda dapat beralih antara lingkungan latihan simulasi dengan data sampel, atau membersihkan seluruh data dummy untuk memulai kasus investigasi riil.
              </p>
            </div>
            
            <div className="flex-shrink-0 self-start md:self-center">
              {isSimActive ? (
                <span className="px-3 py-1.5 bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  MODE SIMULASI AKTIF
                </span>
              ) : (
                <span className="px-3 py-1.5 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  MODE PRODUKSI (BERSIH)
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Clean Case Action */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-850 space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-200 block uppercase">
                  Sesi Investigasi Bersih (Kosong)
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Hapus seluruh data dummy, daftar suspect, koordinat lokasi, log SMS, riwayat panggilan, dan artefak terhapus dari memori luring. Ini akan menyiapkan unit kerja forensik Anda siap 100% untuk digunakan pada kasus nyata.
                </p>
              </div>

              <button
                type="button"
                onClick={disableSimMode}
                disabled={!isSimActive}
                className={`w-full py-2.5 px-4 font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 uppercase ${
                  isSimActive 
                    ? 'bg-rose-950/40 hover:bg-rose-900/50 text-rose-400 border border-rose-500/30 active:scale-[0.98]' 
                    : 'bg-slate-850 text-slate-500 border border-slate-800 cursor-not-allowed'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                Hapus Semua Data Dummy
              </button>
            </div>

            {/* Load Simulation Case Study */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-850 space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-200 block uppercase">
                  Muat Kasus Simulasi (Latihan)
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Injeksi basis data simulasi kasus <code className="font-mono text-cyan-400 font-bold">CASE-POL-2026-07A</code> ke dalam sistem. Ini berguna untuk mendemonstrasikan kapabilitas suite, menguji fitur analisis SQLite, ekstraksi lokasi GPS, dan pemulihan berkas terhapus.
                </p>
              </div>

              <button
                type="button"
                onClick={enableSimMode}
                disabled={isSimActive}
                className={`w-full py-2.5 px-4 font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 uppercase ${
                  !isSimActive 
                    ? 'bg-cyan-600 hover:bg-cyan-500 text-white active:scale-[0.98]' 
                    : 'bg-slate-850 text-slate-500 border border-slate-800 cursor-not-allowed'
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                Muat Kasus Simulasi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
