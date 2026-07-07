'use client';

import React, { useState, useMemo } from 'react';
import { ShieldAlert, ShieldCheck, HelpCircle, FileDigit, CheckCircle, RefreshCw } from 'lucide-react';
import { EvidenceFile, ConnectionStatus } from '../types/forensic';

interface HashVerificationTabProps {
  evidenceFiles: EvidenceFile[];
  status: ConnectionStatus;
  onLogActivity: (module: string, activity: string) => void;
}

export default function HashVerificationTab({
  evidenceFiles,
  status,
  onLogActivity
}: HashVerificationTabProps) {
  const [selectedFileId, setSelectedFileId] = useState<string>('');
  const [algoType, setAlgoType] = useState<'SHA-256' | 'MD5'>('SHA-256');
  const [inputHash, setInputHash] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<'MATCHED' | 'ALTERED' | 'PENDING'>('PENDING');

  // Find currently active file details
  const activeFile = useMemo(() => {
    return evidenceFiles.find(f => f.id === selectedFileId) || null;
  }, [evidenceFiles, selectedFileId]);

  // Handle manual database changes
  const handleFileChange = (id: string) => {
    setSelectedFileId(id);
    setVerificationResult('PENDING');
    setInputHash('');
  };

  const executeHashMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFile || !inputHash) return;

    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      const cleanInput = inputHash.trim().toLowerCase();
      const targetHash = algoType === 'SHA-256' ? activeFile.sha256 : activeFile.md5;

      const matched = cleanInput === targetHash.toLowerCase();
      setVerificationResult(matched ? 'MATCHED' : 'ALTERED');
      
      onLogActivity('Hash Verification', `Verified hash for "${activeFile.name}" using ${algoType}: result=${matched ? 'MATCHED' : 'ALTERED'}`);
    }, 500);
  };

  const fillCorrectHash = () => {
    if (!activeFile) return;
    const targetHash = algoType === 'SHA-256' ? activeFile.sha256 : activeFile.md5;
    setInputHash(targetHash);
    setVerificationResult('PENDING');
  };

  return (
    <div className="space-y-6">
      {status === 'DISCONNECTED' || evidenceFiles.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-lg h-60">
          <FileDigit className="w-12 h-12 text-zinc-700 mb-3 animate-pulse" />
          <h2 className="text-lg font-bold font-sans tracking-tight text-zinc-300">Evidence Browser Empty</h2>
          <p className="text-xs text-zinc-500 max-w-sm mt-1">
            Acquire devices to register filesystems before running cryptographic chain-of-custody validation.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          
          {/* Validation controller form panel */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg flex flex-col justify-between lg:col-span-1">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-1.5 border-b border-zinc-850 pb-2">
                <FileDigit className="w-4 h-4 text-blue-500" />
                VERIFICATION SETUP
              </h3>

              <form onSubmit={executeHashMatch} className="space-y-4">
                {/* File select */}
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 uppercase font-bold">Select Acquired File</label>
                  <select
                    value={selectedFileId}
                    onChange={(e) => handleFileChange(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-lg p-2.5 outline-none font-semibold focus:border-blue-500 transition-colors cursor-pointer"
                  >
                    <option value="">-- Choose file block --</option>
                    {evidenceFiles.map(file => (
                      <option key={file.id} value={file.id}>{file.name} ({file.size})</option>
                    ))}
                  </select>
                </div>

                {/* Algo select */}
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 uppercase font-bold">Cryptographic Type</label>
                  <div className="flex gap-2">
                    {(['SHA-256', 'MD5'] as const).map(algo => (
                      <button
                        key={algo}
                        type="button"
                        onClick={() => { setAlgoType(algo); setVerificationResult('PENDING'); }}
                        className={`flex-1 py-2 rounded-lg border text-xs font-semibold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                          algoType === algo
                            ? 'bg-zinc-800 border-blue-500 text-blue-400'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                        }`}
                      >
                        {algo}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input hash signature */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] text-zinc-500 uppercase font-bold">Expected Hash String</label>
                    {activeFile && (
                      <button
                        type="button"
                        onClick={fillCorrectHash}
                        className="text-[9px] text-blue-500 hover:underline font-bold uppercase cursor-pointer"
                      >
                        Autofill Current
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={inputHash}
                    onChange={(e) => { setInputHash(e.target.value); setVerificationResult('PENDING'); }}
                    placeholder={algoType === 'SHA-256' ? 'f2d4e081884c7d65...' : '7f48ef...'}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 font-mono text-xs text-zinc-200 outline-none focus:border-blue-500 placeholder-zinc-700 select-text"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!activeFile || !inputHash || isVerifying}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-bold rounded-lg transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isVerifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Validate Signature'}
                </button>
              </form>
            </div>

            <div className="text-[10px] text-zinc-500 italic mt-6 leading-normal font-sans border-t border-zinc-850 pt-4">
              🛡️ <strong>Validation Note:</strong> MD5 hashes are 32 hexadecimal characters. SHA-256 matches 64 characters. Any altered space or payload character invalidates custody.
            </div>
          </div>

          {/* Verification matching display banner panel */}
          <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-1.5 border-b border-zinc-850 pb-2">
              <CheckCircle className="w-4 h-4 text-blue-500" />
              INTEGRITY MATCH BANNER
            </h3>

            {/* Verification Result Area */}
            <div className="flex-1 flex flex-col items-center justify-center py-6">
              {verificationResult === 'PENDING' && (
                <div className="text-center space-y-2 select-none">
                  <HelpCircle className="w-16 h-16 text-zinc-700 mx-auto animate-pulse" />
                  <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-tight">Awaiting Validation Trigger</h4>
                  <p className="text-[10px] text-zinc-500 max-w-xs mx-auto">
                    Choose a file, paste your reference hash logs, and click &quot;Validate Signature&quot; to analyze chain of custody.
                  </p>
                </div>
              )}

              {verificationResult === 'MATCHED' && activeFile && (
                <div className="text-center space-y-3 bg-emerald-950/20 border border-emerald-500/20 p-6 rounded-xl max-w-sm">
                  <ShieldCheck className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
                  <div>
                    <h4 className="text-base font-bold text-emerald-400 uppercase tracking-tight">CRYPTO INTEGRITY VERIFIED</h4>
                    <span className="text-[9px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full mt-1 inline-block">
                      Hash Matched
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-normal font-sans">
                    Computed local signature matching identical character string. The integrity of case file <strong>{activeFile.name}</strong> is physically validated. No payload corruption detected.
                  </p>
                </div>
              )}

              {verificationResult === 'ALTERED' && activeFile && (
                <div className="text-center space-y-3 bg-red-950/20 border border-red-500/20 p-6 rounded-xl max-w-sm">
                  <ShieldAlert className="w-16 h-16 text-red-400 mx-auto animate-ping" />
                  <div>
                    <h4 className="text-base font-bold text-red-400 uppercase tracking-tight">CUSTODY HANDSHAKE FAILED</h4>
                    <span className="text-[9px] font-mono font-semibold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full mt-1 inline-block">
                      Mismatched Signature
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-normal font-sans">
                    ⚠️ <strong>WARNING:</strong> Pasted checksum does not match computed target hash. The file block may have been modified, corrupted, or altered since physical dumping.
                  </p>
                </div>
              )}
            </div>

            {/* Active file metadata check */}
            {activeFile ? (
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 font-mono text-[10px] space-y-1 mt-4">
                <div className="text-zinc-500 font-bold uppercase">Computed Hash references:</div>
                <div className="flex justify-between py-0.5 border-b border-zinc-900">
                  <span className="text-zinc-500">File:</span>
                  <span className="text-zinc-300 truncate max-w-[200px]">{activeFile.name}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-zinc-900">
                  <span className="text-zinc-500">SHA-256:</span>
                  <span className="text-zinc-300 truncate max-w-[200px] select-all">{activeFile.sha256}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-zinc-500">MD5:</span>
                  <span className="text-zinc-300 truncate max-w-[200px] select-all">{activeFile.md5}</span>
                </div>
              </div>
            ) : (
              <div className="bg-zinc-950/40 border border-dashed border-zinc-800 rounded-lg p-3 text-[10px] text-zinc-600 text-center font-mono mt-4">
                No active target metadata loaded.
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
