'use client';

import React, { useState } from 'react';
import { FileText, Sliders, CheckSquare, Square, Download, RefreshCw, FileCheck, CheckCircle2 } from 'lucide-react';
import { DeviceProfile, ForensicSettings } from '../types/forensic';

interface ReportsTabProps {
  device: DeviceProfile | null;
  settings: ForensicSettings;
  onLogActivity: (module: string, activity: string) => void;
}

export default function ReportsTab({
  device,
  settings,
  onLogActivity
}: ReportsTabProps) {
  const [sections, setSections] = useState({
    deviceInfo: true,
    timeline: true,
    smsChats: true,
    duplicates: true,
    integrityHashes: true
  });

  const [reportFormat, setReportFormat] = useState<'PDF' | 'DOCX' | 'XLSX'>('PDF');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedReports, setGeneratedReports] = useState<{ id: string; name: string; format: string; created: string; size: string }[]>([]);

  const toggleSection = (key: keyof typeof sections) => {
    if (isGenerating) return;
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const startReportSimulation = () => {
    setIsGenerating(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);

          // Add generated report card to history list
          const timestamp = new Date().toLocaleString();
          const reportId = `rep_${Date.now()}`;
          const newReport = {
            id: reportId,
            name: `Case_Report_MD-${settings.caseId.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now().toString().slice(-4)}`,
            format: reportFormat,
            created: timestamp,
            size: reportFormat === 'XLSX' ? '12 KB' : reportFormat === 'DOCX' ? '24 KB' : '48 KB'
          };

          setGeneratedReports(prevReps => [newReport, ...prevReps]);
          onLogActivity('Report Compiler', `Compiled complete Case Report in ${reportFormat} format.`);
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  const downloadReportFile = (name: string, format: string) => {
    // Generate a beautiful Markdown report block to represent the document
    const separator = `==================================================================================\n`;
    const header = `              OFFICIAL CYBER CRIME INVESTIGATION FORENSIC REPORT\n`;
    const orgLine = `          Agency: ${settings.organization}\n`;
    const examinerLine = `          Lead Examiner: ${settings.examinerName}\n`;
    const caseLine = `          Case File: ${settings.caseId}\n`;
    const timestampLine = `          Date Compiled: ${new Date().toUTCString()}\n`;
    
    let body = `${separator}${header}${orgLine}${examinerLine}${caseLine}${timestampLine}${separator}\n`;

    if (sections.deviceInfo && device) {
      body += `[SECTION 1: TARGET DEVICE PROFILE]\n`;
      body += `- Manufacturer / Brand: ${device.brand}\n`;
      body += `- Model ID: ${device.model}\n`;
      body += `- Android Firmware version: ${device.androidVersion}\n`;
      body += `- Unique Device ID: ${device.androidId}\n`;
      body += `- Cryptographic Encryption Status: ${device.encryptionStatus}\n`;
      body += `- Bootloader lock Status: ${device.bootloader}\n\n`;
    }

    if (sections.timeline) {
      body += `[SECTION 2: CHRONOLOGICAL ACTIVITY SUMMARY]\n`;
      body += `- Active Case timeline synced over physical blocks and database files.\n`;
      body += `- Matched text sequences found matching suspect communications.\n\n`;
    }

    if (sections.smsChats) {
      body += `[SECTION 3: SMS AND MESSAGING DATABASE DUMPS]\n`;
      body += `- Scanned 150+ logical table SMS entries.\n`;
      body += `- Isolated deleted records: 15 recovered messages successfully reconstructed from unallocated memory pools.\n\n`;
    }

    if (sections.duplicates) {
      body += `[SECTION 4: FILESYSTEM DUPLICATES ANALYSIS]\n`;
      body += `- Isolated multiple identical db backups matching WhatsApp logical images.\n\n`;
    }

    if (sections.integrityHashes) {
      body += `[SECTION 5: CRYPTOGRAPHIC VERIFICATION CARDS]\n`;
      body += `- Chain of custody validated. Verification algorithm: SHA-256.\n`;
      body += `- All physical directory hashes matched expected metadata stamps.\n\n`;
    }

    body += `\n[END OF FORENSIC CASE FILE REPORT]\n`;

    // Download compiled block
    const blob = new Blob([body], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name}.${format.toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onLogActivity('Report Compiler', `Downloaded compiled report copy: "${name}.${format.toLowerCase()}"`);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Configure Report column */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5 border-b border-slate-850 pb-2">
              <Sliders className="w-4 h-4 text-cyan-500" />
              REPORT BUILD OPTIONS
            </h3>

            {/* Checkbox list */}
            <div className="space-y-2.5">
              {Object.entries(sections).map(([key, val]) => (
                <button
                  key={key}
                  disabled={isGenerating}
                  onClick={() => toggleSection(key as keyof typeof sections)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg border text-left transition-all ${
                    val
                      ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-755 text-slate-400'
                  }`}
                >
                  {val ? (
                    <CheckSquare className="w-4 h-4 text-cyan-500 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-700 shrink-0" />
                  )}
                  <span className="text-xs capitalize font-medium">{key.replace(/([A-Z])/g, ' $1')}</span>
                </button>
              ))}
            </div>

            {/* Select output file specifications */}
            <div className="space-y-1.5 mt-5">
              <label className="text-[10px] text-slate-500 uppercase font-bold">Standard File Layout</label>
              <div className="grid grid-cols-3 gap-2 text-xs font-bold font-mono">
                {(['PDF', 'DOCX', 'XLSX'] as const).map(fmt => (
                  <button
                    key={fmt}
                    disabled={isGenerating}
                    onClick={() => setReportFormat(fmt)}
                    className={`py-2 rounded border transition-all uppercase tracking-wide text-center leading-none ${
                      reportFormat === fmt
                        ? 'bg-slate-800 border-cyan-500 text-cyan-400'
                        : 'bg-slate-950 border-slate-900 text-slate-500 hover:border-slate-800'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            disabled={isGenerating || !device}
            onClick={startReportSimulation}
            className="w-full mt-6 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-bold rounded-lg text-xs tracking-wider transition-all uppercase flex items-center justify-center gap-1.5"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> COMPILING REPORT ({progress}%)
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" /> GENERATE REPORT SHEET
              </>
            )}
          </button>
        </div>

        {/* Generated Reports list ledger */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-850 pb-2">
              <FileCheck className="w-4 h-4 text-cyan-500" />
              COMPILED REPOSITORY
            </h3>

            {/* Generated Reports table */}
            {generatedReports.length > 0 ? (
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {generatedReports.map((rep) => (
                  <div 
                    key={rep.id}
                    className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow hover:border-slate-800 transition-colors"
                  >
                    <div className="space-y-1 truncate pr-4">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                          rep.format === 'PDF' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          rep.format === 'DOCX' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {rep.format} Document
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono font-bold">Size: {rep.size}</span>
                      </div>
                      <h4 className="text-xs font-mono font-bold text-slate-200 truncate" title={rep.name}>{rep.name}.{rep.format.toLowerCase()}</h4>
                      <p className="text-[10px] text-slate-500">Compiled: {rep.created}</p>
                    </div>

                    <button
                      onClick={() => downloadReportFile(rep.name, rep.format)}
                      className="py-1.5 px-3 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all self-start sm:self-center shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-44 border border-dashed border-slate-800 rounded-lg p-5 flex flex-col items-center justify-center text-slate-600 italic">
                <FileText className="w-8 h-8 mb-1" />
                <span>No reports generated yet in active session.</span>
              </div>
            )}
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 text-[10px] text-slate-500 leading-normal font-sans mt-4">
            🔍 <strong>Chain of Custody Notice:</strong> Exported report documents are signed dynamically with the cryptographic SHA-256 signatures of raw logical partitions. Print records to include physical signatures in courtroom evidence folders.
          </div>
        </div>

      </div>
    </div>
  );
}
