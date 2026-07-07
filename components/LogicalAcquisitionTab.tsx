'use client';

import React, { useState } from 'react';
import { Smartphone, HardDrive, ShieldCheck, Download, CheckSquare, Square, RefreshCw, AlertTriangle } from 'lucide-react';
import { DeviceProfile, ConnectionStatus } from '../types/forensic';

interface LogicalAcquisitionTabProps {
  device: DeviceProfile | null;
  status: ConnectionStatus;
  onStartAcquisition: () => void;
}

export default function LogicalAcquisitionTab({
  device,
  status,
  onStartAcquisition
}: LogicalAcquisitionTabProps) {
  const [categories, setCategories] = useState({
    contacts: true,
    sms: true,
    callLogs: true,
    calendar: true,
    pictures: true,
    videos: true,
    audio: true,
    documents: true,
    downloads: true,
    installedApps: true,
    apkFiles: true,
    permissions: true
  });

  const [hashAlgorithm, setHashAlgorithm] = useState<'MD5' | 'SHA-256'>('SHA-256');
  const [isCompress, setIsCompress] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [isExtracting, setIsExtracting] = useState(false);

  const toggleCategory = (key: keyof typeof categories) => {
    if (isExtracting) return;
    setCategories(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const startExtractionSimulation = () => {
    if (status !== 'CONNECTED' || isExtracting) return;

    setIsExtracting(true);
    setProgress(0);
    setLogs([]);

    const logSteps = [
      { text: 'Initializing Logical Acquisition session...', delay: 0, progress: 5 },
      { text: 'Validating cryptographic key handshake...', delay: 600, progress: 10 },
      { text: `Configured validation: ${hashAlgorithm} verification active`, delay: 1200, progress: 15 },
      { text: 'Analyzing folder tables under root /sdcard partition...', delay: 1800, progress: 20 },
      ...(categories.contacts ? [
        { text: 'Reading contacts provider (contacts2.db)...', delay: 2400, progress: 28 },
        { text: 'Successfully copied 45 active contacts. Computed integrity hash.', delay: 3000, progress: 32 }
      ] : []),
      ...(categories.sms ? [
        { text: 'Extracting SMS provider tables (mmssms.db)...', delay: 3600, progress: 40 },
        { text: 'Successfully copied 150+ messages (including 15 recovered rows from database free blocks).', delay: 4200, progress: 45 }
      ] : []),
      ...(categories.callLogs ? [
        { text: 'Acquiring call logging registry blocks...', delay: 4800, progress: 52 },
        { text: 'Dumping raw incoming/outgoing timestamps... Completed.', delay: 5400, progress: 56 }
      ] : []),
      ...(categories.pictures || categories.videos ? [
        { text: 'Crawling DCIM media storage indexes...', delay: 6000, progress: 65 },
        { text: 'Found 3 JPG/PNG assets. Extracting EXIF camera headers & GPS tags...', delay: 6600, progress: 72 }
      ] : []),
      ...(categories.documents ? [
        { text: 'Parsing documents registry: TXT, PDF, DOCX file sectors...', delay: 7200, progress: 80 },
        { text: 'Successfully computed hashes for raw text files and binary PDFs.', delay: 7800, progress: 85 }
      ] : []),
      ...(categories.installedApps ? [
        { text: 'Dumping packages registry and active APK manifest lists...', delay: 8400, progress: 90 },
        { text: 'Retrieved application permissions vectors.', delay: 9000, progress: 95 }
      ] : []),
      { text: `Compiling acquired filesystem logical image: Case_MD-2026-07-Logical.tar.gz`, delay: 9600, progress: 98 },
      { text: 'Verification SUCCESS. All cryptographic block integrity checks PASSED.', delay: 10200, progress: 100 }
    ];

    logSteps.forEach((step, idx) => {
      setTimeout(() => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${step.text}`]);
        setProgress(step.progress);

        if (step.progress === 100) {
          setIsExtracting(false);
          // Callback to parent context
          onStartAcquisition();
        }
      }, step.delay);
    });
  };

  return (
    <div className="space-y-6">
      {status === 'DISCONNECTED' ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-lg">
          <Smartphone className="w-12 h-12 text-zinc-700 mb-3 animate-pulse" />
          <h2 className="text-lg font-bold font-sans tracking-tight text-zinc-300">Device Connection Required</h2>
          <p className="text-xs text-zinc-500 max-w-sm mt-1">
            You must connect a target device profile via the &quot;Device Info&quot; tab before triggering logical acquisition modules.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Target Profile and Checklist Column */}
          <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Extraction Target</span>
                <h3 className="text-base font-bold font-sans text-zinc-200 mt-0.5">{device?.model}</h3>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                status === 'ACQUIRED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
              }`}>
                {status === 'ACQUIRED' ? 'Acquisition Verified' : 'Awaiting Extraction'}
              </span>
            </div>

            {/* Checklist Box */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">SELECT ARTIFACT CATEGORIES</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Object.entries(categories).map(([key, val]) => (
                  <button
                    key={key}
                    disabled={isExtracting || status === 'ACQUIRED'}
                    onClick={() => toggleCategory(key as keyof typeof categories)}
                    className={`flex items-center space-x-3 p-3 rounded-lg border text-left transition-all cursor-pointer ${
                      val
                        ? 'bg-blue-500/10 border-blue-500 text-blue-400'
                        : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-400'
                    } disabled:opacity-70`}
                  >
                    {val ? (
                      <CheckSquare className="w-4 h-4 text-blue-500 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-zinc-700 shrink-0" />
                    )}
                    <span className="text-xs capitalize font-medium">{key.replace(/([A-Z])/g, ' $1')}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Parameters Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-800/80">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">INTEGRITY ALGORITHM</h4>
                <div className="flex gap-2">
                  {(['MD5', 'SHA-256'] as const).map(algo => (
                    <button
                      key={algo}
                      disabled={isExtracting || status === 'ACQUIRED'}
                      onClick={() => setHashAlgorithm(algo)}
                      className={`flex-1 py-2 rounded-lg border text-xs font-semibold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                        hashAlgorithm === algo
                          ? 'bg-zinc-850 border-blue-500 text-blue-400'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                      }`}
                    >
                      {algo}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">OUTPUT ENVELOPE</h4>
                <button
                  disabled={isExtracting || status === 'ACQUIRED'}
                  onClick={() => setIsCompress(!isCompress)}
                  className={`w-full py-2 rounded-lg border text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    isCompress
                      ? 'bg-zinc-850 border-blue-500 text-blue-400'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                  }`}
                >
                  {isCompress ? 'TAR.GZ Package (Compressed)' : 'Raw Files directory (Plain)'}
                </button>
              </div>
            </div>
          </div>

          {/* Start and Logs progression column */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <Download className="w-4 h-4 text-blue-500" />
                DUMP LOGS TERMINAL
              </h3>

              {/* Progress visual bar */}
              {(isExtracting || progress > 0) && (
                <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">Extraction Block Copy</span>
                    <span className="text-blue-400 font-bold">{progress}%</span>
                  </div>
                  <div className="w-full bg-zinc-850 h-2.5 rounded-full overflow-hidden border border-zinc-800">
                    <div 
                      className="bg-blue-500 h-full transition-all duration-300 shadow-[0_0_10px_#3b82f6]"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Active logging monitor */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 h-[220px] overflow-y-auto font-mono text-[10px] space-y-2 select-text">
                {logs.length > 0 ? (
                  logs.map((log, idx) => (
                    <div key={idx} className="text-zinc-300 leading-normal border-l border-blue-900/50 pl-2">
                      {log}
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-600 italic">
                    <RefreshCw className="w-6 h-6 mb-1 text-zinc-800" />
                    <span>Awaiting task trigger...</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800/80 mt-4">
              {status === 'ACQUIRED' ? (
                <div className="bg-emerald-950/20 border border-emerald-500/20 p-3 rounded-lg flex items-center space-x-2 text-emerald-400 text-xs">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <span>Logical image successfully saved and hashes verified. Browse files in &quot;Evidence Browser&quot;.</span>
                </div>
              ) : (
                <button
                  disabled={isExtracting}
                  onClick={startExtractionSimulation}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-lg text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isExtracting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> EXTRACTING BLOCKS...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" /> START LOGICAL ACQUISITION
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
