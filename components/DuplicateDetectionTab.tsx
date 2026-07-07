'use client';

import React, { useMemo } from 'react';
import { ShieldCheck, Copy, AlertTriangle, FileText, ArrowRight, HardDrive } from 'lucide-react';
import { EvidenceFile, ConnectionStatus } from '../types/forensic';

interface DuplicateDetectionTabProps {
  evidenceFiles: EvidenceFile[];
  status: ConnectionStatus;
  onNavigateToFile: (file: EvidenceFile) => void;
}

export default function DuplicateDetectionTab({
  evidenceFiles,
  status,
  onNavigateToFile
}: DuplicateDetectionTabProps) {
  
  // Find duplicate sets based on SHA-256 signatures
  const duplicateGroups = useMemo(() => {
    const hashGroups: { [hash: string]: EvidenceFile[] } = {};
    
    evidenceFiles.forEach(file => {
      const hash = file.sha256;
      if (!hashGroups[hash]) {
        hashGroups[hash] = [];
      }
      hashGroups[hash].push(file);
    });

    // Only return groups containing more than 1 file
    return Object.entries(hashGroups)
      .filter(([_, files]) => files.length > 1)
      .map(([hash, files]) => ({
        hash,
        files,
        totalSize: files[0].size,
        category: files[0].category
      }));
  }, [evidenceFiles]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-cyan-500/10 text-cyan-500 rounded-lg border border-cyan-500/20">
            <Copy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold font-sans text-slate-100 uppercase tracking-tight">Duplicate File Detector</h2>
            <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
              Isolates exact binary duplicates across acquired paths by checking matching SHA-256 cryptographic signatures. Finding duplicates can identify backup duplicates or identical malicious files renamed across folders.
            </p>
          </div>
        </div>

        <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 text-right shrink-0">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Identified Duplicates</span>
          <span className="text-2xl font-bold font-mono text-cyan-400 leading-none">{duplicateGroups.length} sets</span>
        </div>
      </div>

      {status === 'DISCONNECTED' || evidenceFiles.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-lg h-60">
          <Copy className="w-12 h-12 text-slate-700 mb-3 animate-pulse" />
          <h2 className="text-lg font-bold font-sans tracking-tight text-slate-300">Evidence Browser Empty</h2>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            Perform logical acquisition to acquire filesystem directories before running duplicate signature checkers.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-850 pb-2">
            <AlertTriangle className="w-4 h-4 text-cyan-500" />
            MATCHED INTEGRITY GROUPS ({duplicateGroups.length} sets)
          </h3>

          {duplicateGroups.length > 0 ? (
            <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1 select-text">
              {duplicateGroups.map((group, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-850 rounded-xl p-4 space-y-3 shadow-md hover:border-slate-800 transition-colors">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-900 pb-2">
                    <div className="truncate">
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold font-mono">SHA-256 Signatures matched:</span>
                      <div className="text-xs font-mono font-bold text-cyan-500 select-all break-all leading-tight mt-0.5">{group.hash}</div>
                    </div>
                    <div className="flex items-center space-x-2 text-xs shrink-0">
                      <span className="bg-slate-900 px-2 py-1 rounded text-slate-400 font-mono text-[10px] uppercase font-bold">Size: {group.totalSize}</span>
                      <span className="bg-cyan-950/20 text-cyan-400 px-2 py-1 rounded font-mono text-[10px] uppercase font-bold border border-cyan-500/10">{group.files.length} instances</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {group.files.map((file, fIdx) => (
                      <div 
                        key={file.id}
                        className="bg-slate-900/40 border border-slate-900/60 p-3 rounded-lg flex items-center justify-between text-xs gap-3"
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <FileText className="w-4 h-4 text-cyan-600 shrink-0" />
                          <div className="truncate">
                            <div className="text-slate-200 font-semibold truncate max-w-[180px] sm:max-w-xs">{file.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono truncate max-w-[220px] sm:max-w-md" title={file.path}>{file.path}</div>
                          </div>
                        </div>

                        <button
                          onClick={() => onNavigateToFile(file)}
                          className="py-1 px-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all shrink-0"
                        >
                          Explore <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-lg h-40">
              <ShieldCheck className="w-10 h-10 text-emerald-500/20 mb-2" />
              <h4 className="text-xs font-bold text-emerald-400 uppercase">System Integrity Secured</h4>
              <p className="text-[10px] text-slate-500 mt-1">
                No duplicate cryptographic signatures were found across the acquired directories.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
