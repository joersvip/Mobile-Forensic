'use client';

import React, { useState, useMemo } from 'react';
import { Database, Search, ArrowRight, Download, Terminal, CheckCircle, HelpCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { SmsRecord, ContactRecord, CallRecord } from '../types/forensic';
import { MOCK_SMS, MOCK_CONTACTS, MOCK_CALLS, MOCK_APKS } from '../lib/forensic-data';

interface SQLiteAnalyzerTabProps {
  initialSelectedDb?: string;
  onLogActivity: (module: string, activity: string) => void;
}

export default function SQLiteAnalyzerTab({
  initialSelectedDb = 'mmssms.db',
  onLogActivity
}: SQLiteAnalyzerTabProps) {
  const [selectedDb, setSelectedDb] = useState<string>(initialSelectedDb);
  const [selectedTable, setSelectedTable] = useState<string>('sms');
  const [sqlQuery, setSqlQuery] = useState<string>('SELECT * FROM sms WHERE isDeleted = 0');
  const [gridSearch, setGridSearch] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // List of databases and their schema tables
  const DB_SCHEMAS = useMemo(() => {
    return {
      'mmssms.db': {
        tables: ['sms', 'threads', 'deleted_records'],
        description: 'Android logical SMS provider database. Contains incoming and outgoing text threads.'
      },
      'contacts2.db': {
        tables: ['contacts', 'accounts', 'starred_favorites'],
        description: 'Android contacts database containing name, phone, email, and notes.'
      },
      'whatsapp_history.db': {
        tables: ['messages', 'chats', 'whatsapp_users'],
        description: 'Decrypted WhatsApp DB backup recovered from app private sandbox.'
      }
    };
  }, []);

  // Update table when DB changes
  const handleDbChange = (dbName: string) => {
    setSelectedDb(dbName);
    setPage(1);
    const tables = DB_SCHEMAS[dbName as keyof typeof DB_SCHEMAS].tables;
    setSelectedTable(tables[0]);
    
    // Set default queries
    if (dbName === 'mmssms.db') {
      setSqlQuery('SELECT * FROM sms WHERE isDeleted = 0');
    } else if (dbName === 'contacts2.db') {
      setSqlQuery('SELECT * FROM contacts WHERE starred = 1');
    } else {
      setSqlQuery('SELECT * FROM messages ORDER BY timestamp DESC');
    }
    onLogActivity('Database Analyzer', `Loaded database file: "${dbName}"`);
  };

  // Raw rows in selected database tables
  const rawTableRows = useMemo(() => {
    if (selectedDb === 'mmssms.db') {
      if (selectedTable === 'sms') {
        return MOCK_SMS.filter(s => !s.isDeleted);
      }
      if (selectedTable === 'threads') {
        return [
          { thread_id: 1, recipient: '+62811223344', message_count: 5, snippet: 'Pertemuan diatur jam 8 malam...' },
          { thread_id: 2, recipient: '+628551234567', message_count: 3, snippet: 'Ready 1 unit. Transaksi cash...' },
          { thread_id: 3, recipient: '+628129999888', message_count: 2, snippet: 'Bro, server backup sudah online...' }
        ];
      }
      if (selectedTable === 'deleted_records') {
        return MOCK_SMS.filter(s => s.isDeleted);
      }
    }

    if (selectedDb === 'contacts2.db') {
      if (selectedTable === 'contacts') {
        return MOCK_CONTACTS;
      }
      if (selectedTable === 'accounts') {
        return [
          { account_id: 1, type: 'com.google', name: 'target.suspect@gmail.com', sync_state: 'ACTIVE' },
          { account_id: 2, type: 'com.whatsapp', name: 'target.whatsapp.primary', sync_state: 'ACTIVE' },
          { account_id: 3, type: 'com.telegram', name: 'tg_avatar_suspect', sync_state: 'STANDBY' }
        ];
      }
      if (selectedTable === 'starred_favorites') {
        return MOCK_CONTACTS.filter(c => c.starred);
      }
    }

    if (selectedDb === 'whatsapp_history.db') {
      if (selectedTable === 'messages') {
        return [
          { id: 101, chat_id: 1, sender: 'Bos Rahasia', body: 'Kunci enkripsi payload: antg_sec_key_2026', timestamp: '2026-07-06T10:11:00Z' },
          { id: 102, chat_id: 1, sender: 'You', body: 'Diterima, langsung di-shredding setelah deploy.', timestamp: '2026-07-06T10:13:20Z' },
          { id: 103, chat_id: 2, sender: 'Budi Server', body: 'Docker container port 3000 running in secure shell.', timestamp: '2026-07-05T14:15:00Z' },
          { id: 104, chat_id: 3, sender: 'Soni Spoofer', body: 'Lokasi Monas sudah saya kalibrasi di GPS joystick.', timestamp: '2026-07-06T08:14:00Z' }
        ];
      }
      if (selectedTable === 'chats') {
        return [
          { chat_id: 1, title: 'Operasional Inti', last_message: 'Diterima, langsung di-shredding...' },
          { chat_id: 2, title: 'Server Sysops', last_message: 'Docker container port 3000...' },
          { chat_id: 3, title: 'Map Calibration', last_message: 'Lokasi Monas sudah...' }
        ];
      }
      if (selectedTable === 'whatsapp_users') {
        return MOCK_CONTACTS.slice(0, 5).map(c => ({ user_id: c.id, display_name: c.name, phone: c.phone, status_phrase: 'Active only on VPN' }));
      }
    }

    return [];
  }, [selectedDb, selectedTable]);

  // SQL SANDBOX INTERMEDIATE COMPILER
  const { queryResultRows, queryError } = useMemo(() => {
    const q = sqlQuery.trim().toLowerCase();
    
    try {
      if (!q.startsWith('select')) {
        throw new Error('Forensic read-only SQL Sandbox. Only "SELECT" statements are authorized.');
      }

      // Extract target table
      let tableName = '';
      const fromMatch = q.match(/from\s+([a-zA-Z0-9_]+)/);
      if (fromMatch) {
        tableName = fromMatch[1];
      } else {
        throw new Error('SQL Syntax Error: missing "FROM" clause.');
      }

      // Check if table exists in active DB
      const validTables = DB_SCHEMAS[selectedDb as keyof typeof DB_SCHEMAS].tables;
      if (!validTables.includes(tableName)) {
        throw new Error(`Table "${tableName}" not found in database "${selectedDb}". Valid tables: ${validTables.join(', ')}`);
      }

      // Fetch base rows for this table
      let baseRows: any[] = [];
      if (selectedDb === 'mmssms.db') {
        if (tableName === 'sms') baseRows = MOCK_SMS.filter(s => !s.isDeleted);
        else if (tableName === 'threads') baseRows = [{ thread_id: 1, recipient: '+62811223344', message_count: 5, snippet: 'Pertemuan diatur jam...' }];
        else if (tableName === 'deleted_records') baseRows = MOCK_SMS.filter(s => s.isDeleted);
      } else if (selectedDb === 'contacts2.db') {
        if (tableName === 'contacts') baseRows = MOCK_CONTACTS;
        else if (tableName === 'accounts') baseRows = [{ account_id: 1, type: 'com.google', name: 'target.suspect@gmail.com', sync_state: 'ACTIVE' }];
        else if (tableName === 'starred_favorites') baseRows = MOCK_CONTACTS.filter(c => c.starred);
      } else if (selectedDb === 'whatsapp_history.db') {
        if (tableName === 'messages') baseRows = [{ id: 101, chat_id: 1, sender: 'Bos Rahasia', body: 'Kunci enkripsi payload: antg_sec_key_2026', timestamp: '2026-07-06T10:11:00Z' }, { id: 102, chat_id: 1, sender: 'You', body: 'Diterima, langsung di-shredding setelah deploy.', timestamp: '2026-07-06T10:13:20Z' }];
        else if (tableName === 'chats') baseRows = [{ chat_id: 1, title: 'Operasional Inti', last_message: 'Diterima...' }];
        else if (tableName === 'whatsapp_users') baseRows = MOCK_CONTACTS.slice(0, 3).map(c => ({ user_id: c.id, display_name: c.name, phone: c.phone }));
      }

      // Filter based on simple WHERE condition
      let filtered = [...baseRows];
      const whereMatch = q.match(/where\s+([a-zA-Z0-9_]+)\s*(=|like)\s*['"]?([^'"]+)['"]?/);
      if (whereMatch) {
        const col = whereMatch[1];
        const operator = whereMatch[2];
        const value = whereMatch[3].replace(/%/g, ''); // strip sql wildcards

        filtered = filtered.filter(row => {
          const rowVal = String(row[col] || '').toLowerCase();
          if (operator === '=') {
            return rowVal === value.toLowerCase();
          } else { // like
            return rowVal.includes(value.toLowerCase());
          }
        });
      }

      // Handle projections (Columns list)
      const selectColsPart = q.substring(6, q.indexOf('from')).trim();
      if (selectColsPart !== '*') {
        const columns = selectColsPart.split(',').map(s => s.trim());
        filtered = filtered.map(row => {
          const projected: any = {};
          columns.forEach(col => {
            if (row[col] !== undefined) {
              projected[col] = row[col];
            }
          });
          return projected;
        });
      }

      return { queryResultRows: filtered, queryError: null };
    } catch (err: any) {
      return { queryResultRows: [], queryError: err.message as string };
    }
  }, [sqlQuery, selectedDb, DB_SCHEMAS]);

  // Handle spreadsheet inline search
  const gridFilteredRows = useMemo(() => {
    return rawTableRows.filter(row => {
      if (!gridSearch) return true;
      const query = gridSearch.toLowerCase();
      return Object.values(row).some(val => String(val).toLowerCase().includes(query));
    });
  }, [rawTableRows, gridSearch]);

  // Pagination bounds
  const totalPages = Math.ceil(gridFilteredRows.length / rowsPerPage) || 1;
  const paginatedGridRows = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return gridFilteredRows.slice(start, start + rowsPerPage);
  }, [gridFilteredRows, page]);

  // Headers for grid display
  const tableHeaders = useMemo(() => {
    if (rawTableRows.length === 0) return [];
    return Object.keys(rawTableRows[0]);
  }, [rawTableRows]);

  const handleExportData = () => {
    // Generate simple downloadable CSV log
    if (gridFilteredRows.length === 0) return;
    
    const headers = tableHeaders.join(',');
    const rows = gridFilteredRows.map(row => {
      return Object.values(row).map(val => {
        const str = String(val).replace(/"/g, '""');
        return str.includes(',') || str.includes('\n') ? `"${str}"` : str;
      }).join(',');
    });

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Forensic_Table_${selectedDb}_${selectedTable}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    onLogActivity('SQLite Analyzer', `Exported DB table ${selectedTable} (${gridFilteredRows.length} rows) to CSV file.`);
  };

  return (
    <div className="space-y-6">
      {/* DB and table selector grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Selection side block */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 border-b border-zinc-850 pb-2">
            <Database className="w-4 h-4 text-blue-500" />
            SQLITE SCHEMAS
          </h3>

          {/* DB select input */}
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 uppercase font-bold">Loaded Database File</label>
            <select
              value={selectedDb}
              onChange={(e) => handleDbChange(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-lg p-2.5 outline-none font-semibold focus:border-blue-500 transition-colors cursor-pointer"
            >
              {Object.keys(DB_SCHEMAS).map(dbName => (
                <option key={dbName} value={dbName}>{dbName}</option>
              ))}
            </select>
          </div>

          <p className="text-[11px] text-zinc-500 leading-normal italic bg-zinc-950 p-2.5 rounded border border-zinc-900">
            {DB_SCHEMAS[selectedDb as keyof typeof DB_SCHEMAS].description}
          </p>

          {/* Tables select input */}
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 uppercase font-bold">Database Tables</label>
            <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
              {DB_SCHEMAS[selectedDb as keyof typeof DB_SCHEMAS].tables.map(tbl => (
                <button
                  key={tbl}
                  onClick={() => { setSelectedTable(tbl); setPage(1); }}
                  className={`w-full text-left p-2 rounded text-xs transition-all flex items-center justify-between cursor-pointer ${
                    selectedTable === tbl
                      ? 'bg-purple-500/10 border-l-2 border-purple-500 text-purple-400 font-bold'
                      : 'bg-zinc-950 border border-zinc-900 text-zinc-400 hover:border-zinc-800'
                  }`}
                >
                  <span>{tbl}</span>
                  <span className="text-[9px] font-mono font-bold text-zinc-600 bg-zinc-900 px-1 py-0.5 rounded">
                    TABLE
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SQL Terminal sandbox */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl flex flex-col justify-between">
          <div className="bg-zinc-900 px-4 py-2 border-b border-zinc-800 flex items-center justify-between text-zinc-400">
            <span className="flex items-center gap-1.5 text-xs uppercase font-semibold text-zinc-200 tracking-wide">
              <Terminal className="w-4 h-4 text-purple-500" />
              SQL QUERY COMPILER (READ-ONLY)
            </span>
            <span className="text-[9px] font-bold text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
              In-Memory JS Engine
            </span>
          </div>

          {/* Terminal Editor */}
          <div className="p-4 space-y-3">
            <textarea
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 font-mono text-xs text-zinc-100 placeholder-zinc-700 outline-none focus:border-purple-500 h-28 leading-relaxed resize-none"
              placeholder="SELECT * FROM sms WHERE sender = '+62811223344'"
            />

            {/* Error monitor if syntax is wrong */}
            {queryError ? (
              <div className="bg-red-950/20 border border-red-500/20 rounded p-2.5 text-[11px] text-red-400 flex items-center gap-2 font-mono">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{queryError}</span>
              </div>
            ) : (
              <div className="bg-zinc-900/40 border border-zinc-800 rounded p-2.5 text-[10px] text-zinc-400 flex items-start gap-2 leading-normal">
                <HelpCircle className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-zinc-300">Sandbox Queries supported:</span> SELECT [column_list] FROM [table] WHERE [column] = [value] / LIKE %value%. Case-insensitive. Try editing values!
                </div>
              </div>
            )}
          </div>

          {/* Sandbox execution outputs count */}
          <div className="bg-zinc-900 px-4 py-2 border-t border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-500 shrink-0">
            <span>Result Count: <strong className="text-purple-400">{queryResultRows.length} rows</strong></span>
            <span>Execution Speed: <strong className="text-emerald-500">&lt;1ms (Local)</strong></span>
          </div>
        </div>
      </div>

      {/* Structured Spreadsheet data block */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-zinc-800/80">
          <div>
            <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Spreadsheet Grid View</span>
            <h4 className="text-sm font-bold text-zinc-200 uppercase tracking-tight">
              TABLE CONTENT - {selectedDb} [{selectedTable}]
            </h4>
          </div>

          {/* Search table grid and downloader */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-600" />
              <input
                type="text"
                value={gridSearch}
                onChange={(e) => { setGridSearch(e.target.value); setPage(1); }}
                placeholder="Search cell values..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded pl-8 pr-3 py-1.5 text-xs text-zinc-300 outline-none focus:border-blue-500 placeholder-zinc-700"
              />
            </div>

            <button
              onClick={handleExportData}
              disabled={gridFilteredRows.length === 0}
              className="py-1.5 px-3 bg-purple-900/60 hover:bg-purple-800 disabled:opacity-40 text-purple-200 border border-purple-500/20 rounded font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all w-full sm:w-auto justify-center cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> EXPORT EXCEL/CSV
            </button>
          </div>
        </div>

        {/* Dynamic Spreadsheet Table */}
        {paginatedGridRows.length > 0 ? (
          <div className="space-y-4">
            <div className="overflow-x-auto border border-zinc-950 rounded-lg">
              <table className="w-full border-collapse text-left font-mono text-[11px] leading-relaxed select-text antialiased">
                <thead>
                  <tr className="bg-zinc-950 border-b border-zinc-800 text-zinc-500 font-bold uppercase text-[9px] tracking-wider">
                    {tableHeaders.map(h => (
                      <th key={h} className="py-2.5 px-3">{h.replace(/_/g, ' ')}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedGridRows.map((row, rIdx) => (
                    <tr key={rIdx} className="border-b border-zinc-800/40 hover:bg-zinc-950/60 transition-colors">
                      {tableHeaders.map((h, cIdx) => {
                        const val = String((row as any)[h] !== undefined ? (row as any)[h] : '-');
                        const isDeletedCell = h === 'isDeleted' || val === 'true';
                        return (
                          <td 
                            key={cIdx} 
                            className={`py-2.5 px-3 whitespace-pre-wrap max-w-[220px] ${
                              h === 'id' || h === 'sender' || h === 'recipient' || h === 'phone'
                                ? 'text-blue-500 font-semibold'
                                : 'text-zinc-300'
                            }`}
                          >
                            {isDeletedCell && h === 'body' ? (
                                <span className="text-red-400 line-through decoration-red-500/80">{val}</span>
                            ) : (
                              val
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
              <span>Showing {(page - 1) * rowsPerPage + 1} to {Math.min(page * rowsPerPage, gridFilteredRows.length)} of {gridFilteredRows.length} rows</span>
              
              <div className="flex items-center space-x-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="p-1 border border-zinc-850 bg-zinc-950 text-zinc-400 hover:text-white rounded disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-mono">{page} / {totalPages}</span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="p-1 border border-zinc-850 bg-zinc-950 text-zinc-400 hover:text-white rounded disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-zinc-600 italic">
            No rows match grid filtering keywords.
          </div>
        )}
      </div>
    </div>
  );
}
