'use client';

import React, { useState, useMemo } from 'react';
import { Search, Sliders, FileText, ArrowRight, CheckCircle, HelpCircle, AlertCircle } from 'lucide-react';
import { SmsRecord, ContactRecord, EvidenceFile } from '../types/forensic';
import { MOCK_SMS, MOCK_CONTACTS, MOCK_FILES } from '../lib/forensic-data';

interface KeywordSearchTabProps {
  onLogActivity: (module: string, activity: string) => void;
  onNavigateToFile: (file: EvidenceFile) => void;
}

interface SearchResult {
  id: string;
  source: 'SMS DB' | 'Contacts DB' | 'File System';
  target: string;
  field: string;
  snippet: string;
  fileObj?: EvidenceFile;
}

export default function KeywordSearchTab({
  onLogActivity,
  onNavigateToFile
}: KeywordSearchTabProps) {
  const [searchQuery, setSearchQuery] = useState('bitcoin');
  const [searchMode, setSearchMode] = useState<'exact' | 'regex' | 'case-sensitive'>('exact');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Multi-target compiled search engine
  const searchResults = useMemo(() => {
    const query = searchQuery.trim();
    if (!query) return [];

    const results: SearchResult[] = [];
    const isRegex = searchMode === 'regex';
    const isCase = searchMode === 'case-sensitive';

    // Compile regex if in regex mode
    let regex: RegExp | null = null;
    if (isRegex) {
      try {
        regex = new RegExp(query, 'i');
      } catch (err) {
        // Fallback to exact matching if regex fails compile
        regex = null;
      }
    }

    // Matching helper
    const matchesString = (val: string): boolean => {
      const targetStr = String(val);
      if (isRegex && regex) {
        return regex.test(targetStr);
      }
      if (isCase) {
        return targetStr.includes(query);
      }
      return targetStr.toLowerCase().includes(query.toLowerCase());
    };

    // Highlight snippet maker
    const getSnippet = (text: string): string => {
      const idx = text.toLowerCase().indexOf(query.toLowerCase());
      if (idx === -1) return text;
      const start = Math.max(0, idx - 30);
      const end = Math.min(text.length, idx + query.length + 40);
      const prefix = start > 0 ? '...' : '';
      const suffix = end < text.length ? '...' : '';
      return `${prefix}${text.substring(start, end)}${suffix}`;
    };

    // 1. Scan SMS Messages
    MOCK_SMS.forEach(sms => {
      if (matchesString(sms.body)) {
        results.push({
          id: `sms_${sms.id}`,
          source: 'SMS DB',
          target: `mmssms.db [sms ID ${sms.id}]`,
          field: 'body',
          snippet: getSnippet(sms.body)
        });
      }
      if (matchesString(sms.sender)) {
        results.push({
          id: `sms_sender_${sms.id}`,
          source: 'SMS DB',
          target: `mmssms.db [sms ID ${sms.id}]`,
          field: 'sender',
          snippet: sms.sender
        });
      }
    });

    // 2. Scan Contacts
    MOCK_CONTACTS.forEach(contact => {
      if (matchesString(contact.name)) {
        results.push({
          id: `contact_name_${contact.id}`,
          source: 'Contacts DB',
          target: `contacts2.db [contact ID ${contact.id}]`,
          field: 'name',
          snippet: contact.name
        });
      }
      if (matchesString(contact.notes)) {
        results.push({
          id: `contact_notes_${contact.id}`,
          source: 'Contacts DB',
          target: `contacts2.db [contact ID ${contact.id}]`,
          field: 'notes',
          snippet: getSnippet(contact.notes)
        });
      }
    });

    // 3. Scan Filesystem items
    MOCK_FILES.forEach(file => {
      // Check file name
      if (matchesString(file.name)) {
        results.push({
          id: `file_name_${file.id}`,
          source: 'File System',
          target: file.path,
          field: 'file_name',
          snippet: file.name,
          fileObj: file
        });
      }

      // Check text / document contents
      if (file.content && matchesString(file.content)) {
        results.push({
          id: `file_content_${file.id}`,
          source: 'File System',
          target: file.path,
          field: 'content',
          snippet: getSnippet(file.content),
          fileObj: file
        });
      }

      // Check EXIF
      if (file.exif) {
        if (file.exif.camera && matchesString(file.exif.camera)) {
          results.push({
            id: `file_exif_cam_${file.id}`,
            source: 'File System',
            target: file.path,
            field: 'EXIF camera',
            snippet: file.exif.camera,
            fileObj: file
          });
        }
        if (file.exif.gps && matchesString(file.exif.gps)) {
          results.push({
            id: `file_exif_gps_${file.id}`,
            source: 'File System',
            target: file.path,
            field: 'EXIF GPS coordinates',
            snippet: file.exif.gps,
            fileObj: file
          });
        }
      }
    });

    return results;
  }, [searchQuery, searchMode]);

  // Filter results by classification
  const filteredResults = useMemo(() => {
    return searchResults.filter(res => {
      if (typeFilter === 'all') return true;
      if (typeFilter === 'database' && res.source.includes('DB')) return true;
      if (typeFilter === 'files' && res.source === 'File System') return true;
      return false;
    });
  }, [searchResults, typeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogActivity('Universal Search', `Executed matching search for query: "${searchQuery}" (${searchMode})`);
  };

  return (
    <div className="space-y-6">
      {/* Search Configuration control */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Panel 1: Settings */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-1.5 border-b border-zinc-850 pb-2">
              <Sliders className="w-4 h-4 text-blue-500" />
              SEARCH MECHANISM
            </h3>

            <div className="space-y-4">
              {/* Method select */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase font-bold">Matching Mode</label>
                <div className="grid grid-cols-3 gap-1.5 text-[10px] font-bold">
                  {(['exact', 'regex', 'case-sensitive'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setSearchMode(mode)}
                      className={`py-2 px-1 rounded border transition-all uppercase leading-none truncate cursor-pointer ${
                        searchMode === mode
                          ? 'bg-zinc-800 border-blue-500 text-blue-400 font-bold'
                          : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:border-zinc-800'
                      }`}
                      title={mode === 'regex' ? 'Regular Expression (Case-Insensitive)' : mode}
                    >
                      {mode.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scope select */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase font-bold">Target Vector Scope</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-lg p-2.5 outline-none font-semibold focus:border-blue-500 transition-colors cursor-pointer"
                >
                  <option value="all">All Available Scopes</option>
                  <option value="database">SQLite Databases records only</option>
                  <option value="files">Physical storage file blocks only</option>
                </select>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-zinc-500 italic mt-6 leading-normal font-sans border-t border-zinc-800/60 pt-4">
            🔍 <strong>Forensic Note:</strong> Exact searches also index headers of files. Regex supports standard expression matchings (e.g., [a-z0-9] tokens).
          </div>
        </div>

        {/* Panel 2: Big Search input Bar */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
              <Search className="w-4 h-4 text-blue-500" />
              UNIVERSAL INDEX SCANNER
            </h3>

            <form onSubmit={handleSearchSubmit} className="relative mt-2 shrink-0">
              <Search className="absolute left-3 top-3 w-5 h-5 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type forensic tokens to search (e.g. 'bitcoin', 'kunci', 'pertemuan', 'secret', 'bc1')..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-11 pr-24 py-3 text-sm text-zinc-100 outline-none focus:border-blue-500 transition-colors placeholder-zinc-750 font-sans"
              />
              <button
                type="submit"
                className="absolute right-2.5 top-2 py-1.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-md transition-all uppercase tracking-wider cursor-pointer"
              >
                Scan All
              </button>
            </form>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 text-xs text-zinc-500 font-mono border-t border-zinc-850 pt-4 shrink-0">
            <div>
              Total Matches found: <span className="text-blue-400 font-bold">{filteredResults.length} index hits</span>
            </div>
            <div className="text-right">
              Indexed tables: <span className="text-zinc-400 font-bold">SMS, Contacts, Files, EXIF</span>
            </div>
          </div>
        </div>
      </div>

      {/* Compiled Results Board */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 border-b border-zinc-850 pb-3">
          <FileText className="w-4 h-4 text-blue-500" />
          MATCH FINDINGS GRID ({filteredResults.length} hits)
        </h3>

        {filteredResults.length > 0 ? (
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 select-text">
            {filteredResults.map((res) => (
              <div 
                key={res.id}
                className="bg-zinc-950 border border-zinc-850 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md hover:border-zinc-800 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                      res.source === 'SMS DB' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      res.source === 'Contacts DB' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {res.source}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">{res.target}</span>
                  </div>

                  <h5 className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mt-1">
                    Matched field: <span className="text-zinc-400 font-mono font-normal normal-case">{res.field}</span>
                  </h5>

                  {/* Highlights string matches */}
                  <p className="text-xs text-zinc-300 font-mono bg-zinc-900/60 p-2.5 rounded border border-zinc-900 leading-relaxed font-bold">
                    {res.snippet}
                  </p>
                </div>

                {res.fileObj && (
                  <button
                    onClick={() => onNavigateToFile(res.fileObj!)}
                    className="py-1.5 px-3 bg-blue-950 hover:bg-blue-900 text-blue-300 border border-blue-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all self-start md:self-center cursor-pointer"
                  >
                    View File <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-zinc-600 italic">
            {searchQuery ? 'No search matches found across logical tables.' : 'Enter search terms above to start indexing.'}
          </div>
        )}
      </div>
    </div>
  );
}
