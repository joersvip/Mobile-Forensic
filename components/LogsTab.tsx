'use client';

import React, { useState, useMemo } from 'react';
import { FileText, Search, Download, Trash2, Sliders, Calendar, Play } from 'lucide-react';
import { AuditLog, ConnectionStatus } from '../types/forensic';

interface LogsTabProps {
  logs: AuditLog[];
  status: ConnectionStatus;
  onClearLogs: () => void;
  onLogActivity: (module: string, activity: string) => void;
}

export default function LogsTab({
  logs,
  status,
  onClearLogs,
  onLogActivity
}: LogsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>('all');

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Module filter
      if (moduleFilter !== 'all' && log.module !== moduleFilter) {
        return false;
      }

      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesAction = log.action.toLowerCase().includes(query);
        const matchesModule = log.module.toLowerCase().includes(query);
        const matchesStamp = log.timestamp.toLowerCase().includes(query);
        return matchesAction || matchesModule || matchesStamp;
      }

      return true;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [logs, moduleFilter, searchQuery]);

  // Extract unique module names for filtering
  const uniqueModules = useMemo(() => {
    const set = new Set<string>();
    logs.forEach(l => set.add(l.module));
    return Array.from(set);
  }, [logs]);

  const downloadAuditLogs = () => {
    if (filteredLogs.length === 0) return;

    // Compile pretty string log
    const fileHeader = `======================================================================\n`;
    const appBanner = `           MOBILE FORENSIC ANALYSIS SUITE - AUDIT ACTIVITY LOG\n`;
    const subBanner = `           Generated at: ${new Date().toUTCString()}\n`;
    const borderLine = `======================================================================\n\n`;
    
    const logsBody = filteredLogs.map(log => {
      return `[${log.timestamp}] [${log.module.toUpperCase()}] ${log.action}`;
    }).join('\n');

    const fullLogText = `${fileHeader}${appBanner}${subBanner}${borderLine}${logsBody}`;

    const blob = new Blob([fullLogText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Forensic_Audit_Trail_${Date.now()}.log`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onLogActivity('System Logs', `Downloaded current audit activity log (${filteredLogs.length} rows).`);
  };

  return (
    <div className="space-y-6">
      {/* Search and control Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        
        {/* Module select filters */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-600" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter audit records..."
              className="w-full bg-slate-950 border border-slate-800 rounded pl-8 pr-3 py-1.5 text-xs text-slate-300 outline-none focus:border-cyan-500 placeholder-slate-700 font-sans"
            />
          </div>

          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-xs text-slate-300 outline-none font-semibold focus:border-cyan-500"
          >
            <option value="all">All Logs Module</option>
            {uniqueModules.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Action triggers */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={downloadAuditLogs}
            disabled={filteredLogs.length === 0}
            className="py-1.5 px-3 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/20 rounded text-cyan-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" /> Download Audit
          </button>
          
          <button
            onClick={onClearLogs}
            disabled={logs.length === 0}
            className="py-1.5 px-3 bg-slate-950 hover:bg-red-950 border border-slate-850 hover:border-red-500/10 rounded text-slate-400 hover:text-red-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Audit
          </button>
        </div>
      </div>

      {/* Audit ledger table box */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-850 pb-3 shrink-0">
          <FileText className="w-4 h-4 text-cyan-500" />
          FORENSIC LEDGER CHRONO-RECORDS ({filteredLogs.length} entries)
        </h3>

        {filteredLogs.length > 0 ? (
          <div className="overflow-y-auto max-h-[420px] border border-slate-950 rounded-lg select-text">
            <table className="w-full border-collapse text-left font-mono text-[11px] leading-relaxed antialiased">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-850 text-slate-500 font-bold uppercase text-[9px] tracking-wider">
                  <th className="py-2.5 px-4">Absolute Timestamp</th>
                  <th className="py-2.5 px-4">Forensic Module</th>
                  <th className="py-2.5 px-4">Action Detail logged</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-800/40 hover:bg-slate-950/60 transition-colors">
                    <td className="py-2 px-4 text-cyan-500 font-semibold">{log.timestamp}</td>
                    <td className="py-2 px-4 font-sans text-[10px]">
                      <span className="px-2 py-0.5 rounded font-bold uppercase bg-slate-950 border border-slate-850 text-slate-400">
                        {log.module}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-slate-300 font-sans tracking-tight leading-normal">{log.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-600 italic font-mono text-xs">
            No audit ledger entries match selection query filter parameters.
          </div>
        )}
      </div>
    </div>
  );
}
