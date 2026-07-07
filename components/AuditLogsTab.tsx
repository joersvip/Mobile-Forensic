'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, Trash2, Download, AlertTriangle, CheckCircle, Shield, 
  Terminal, ArrowUpDown, Filter, RefreshCw, X, ShieldAlert
} from 'lucide-react';
import { SecurityAuditLog } from '../types/forensic';
import { getClientPlatformInfo } from '../lib/crypto-helper';

export default function AuditLogsTab() {
  const [logs, setLogs] = useState<SecurityAuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [resultFilter, setResultFilter] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Load logs from local storage
  const loadLogs = () => {
    const logsStr = localStorage.getItem('forensic_audit_logs');
    if (logsStr) {
      setLogs(JSON.parse(logsStr));
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadLogs();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      log.username.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.ip_address.toLowerCase().includes(q) ||
      log.browser.toLowerCase().includes(q) ||
      log.operating_system.toLowerCase().includes(q);
    
    const matchesFilter = resultFilter === 'ALL' || log.result === resultFilter;

    return matchesSearch && matchesFilter;
  });

  // Sorted logs
  const sortedLogs = [...filteredLogs].sort((a, b) => {
    const dateA = new Date(a.timestamp).getTime();
    const dateB = new Date(b.timestamp).getTime();
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  // Toggle Sort order
  const toggleSort = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  // Clear Audit Log
  const handleClearLogs = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus seluruh log audit keamanan? Tindakan ini dicatat sebagai peristiwa keamanan penting.")) {
      const platform = getClientPlatformInfo();
      const currentSessionStr = localStorage.getItem('forensic_active_session');
      const activeUser = currentSessionStr ? JSON.parse(currentSessionStr) : null;
      const username = activeUser?.username || 'admin';

      // Clear but retain a log that the audit log itself was cleared
      const newLog: SecurityAuditLog = {
        id: `aud_${Date.now()}`,
        timestamp: new Date().toISOString(),
        username,
        action: 'Log Audit Keamanan dibersihkan secara paksa oleh Administrator.',
        ip_address: platform.ip,
        browser: platform.browser,
        operating_system: platform.os,
        result: 'WARNING'
      };

      localStorage.setItem('forensic_audit_logs', JSON.stringify([newLog]));
      setLogs([newLog]);
      alert("Log audit dibersihkan. Peristiwa pembersihan log telah disimpan.");
    }
  };

  // Export CSV Helper
  const handleExportCSV = () => {
    if (logs.length === 0) {
      alert("Tidak ada data log untuk diekspor.");
      return;
    }

    const headers = ['ID', 'Waktu', 'Username', 'Aksi/Peristiwa', 'IP Address', 'Browser', 'OS', 'Hasil'];
    const rows = sortedLogs.map(log => [
      log.id,
      new Date(log.timestamp).toLocaleString(),
      log.username,
      `"${log.action.replace(/"/g, '""')}"`,
      log.ip_address,
      log.browser,
      log.operating_system,
      log.result
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Security_Audit_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Plaintext Ledger File
  const handleExportTXT = () => {
    if (logs.length === 0) {
      alert("Tidak ada data log untuk diekspor.");
      return;
    }

    let txt = `========================================================================\n`;
    txt += `                 MOBILE FORENSIC SUITE - SECURITY AUDIT LEDGER\n`;
    txt += `                    Generated: ${new Date().toLocaleString()}\n`;
    txt += `========================================================================\n\n`;

    sortedLogs.forEach((log, index) => {
      txt += `[${index + 1}] TIME: ${new Date(log.timestamp).toLocaleString()}\n`;
      txt += `    USER: ${log.username} | RESULT: ${log.result}\n`;
      txt += `    ACTION: ${log.action}\n`;
      txt += `    IP/OS: ${log.ip_address} | ${log.operating_system} | ${log.browser}\n`;
      txt += `------------------------------------------------------------------------\n`;
    });

    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Security_Audit_Ledger_${new Date().toISOString().split('T')[0]}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      
      {/* Top Banner Control bar */}
      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-3 bg-zinc-950/20">
        
        {/* Left filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Cari kata kunci log..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 text-zinc-100 pl-9 pr-4 py-2 rounded-lg border border-zinc-800 text-xs focus:outline-none focus:border-blue-500 transition-all font-mono"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <select
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value)}
              className="w-full sm:w-auto bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:border-blue-500 font-mono"
            >
              <option value="ALL">SEMUA HASIL</option>
              <option value="SUCCESS">✅ SUCCESS</option>
              <option value="FAILED">❌ FAILED</option>
              <option value="BLOCKED">🚫 BLOCKED</option>
              <option value="WARNING">⚠️ WARNING</option>
              <option value="SYSTEM">⚙️ SYSTEM</option>
            </select>
          </div>

        </div>

        {/* Right exports and actions */}
        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          
          <button
            onClick={toggleSort}
            className="p-2 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
            title="Ubah Urutan Waktu"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>SORT: {sortOrder.toUpperCase()}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="p-2 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
            title="Unduh format CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleExportTXT}
            className="p-2 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
            title="Unduh format TXT"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>TXT</span>
          </button>

          <button
            onClick={handleClearLogs}
            className="p-2 bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 border border-rose-900/30 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
            title="Kosongkan Semua Log Audit"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>CLEAR</span>
          </button>

        </div>

      </div>

      {/* Main Table Layout */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-[10px] uppercase font-mono tracking-wider bg-zinc-950/30 select-none">
                <th className="py-3 px-4 font-bold">Waktu Peristiwa</th>
                <th className="py-3 px-4 font-bold">Username</th>
                <th className="py-3 px-4 font-bold">Hasil</th>
                <th className="py-3 px-4 font-bold">Aksi / Deskripsi Aktivitas Keamanan</th>
                <th className="py-3 px-4 font-bold">Stasiun Pengenal (IP)</th>
                <th className="py-3 px-4 font-bold">Browser / Sistem Operasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850/50 text-xs font-mono">
              {sortedLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-zinc-500">
                    Tidak ada log audit keamanan yang cocok.
                  </td>
                </tr>
              ) : (
                sortedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-850/10 transition-colors">
                    <td className="py-3.5 px-4 text-zinc-400 select-none text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-100 font-bold">
                      {log.username}
                    </td>
                    <td className="py-3.5 px-4 select-none">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                        log.result === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        log.result === 'FAILED' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                        log.result === 'BLOCKED' ? 'bg-red-500/15 text-red-400 border-red-500/30' :
                        log.result === 'WARNING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {log.result}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-200 text-[11px] font-sans max-w-sm leading-relaxed whitespace-normal break-words">
                      {log.action}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400 text-[11px]">
                      {log.ip_address}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-500 text-[10px] truncate max-w-xs" title={`${log.browser} on ${log.operating_system}`}>
                      {log.operating_system} • {log.browser}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
