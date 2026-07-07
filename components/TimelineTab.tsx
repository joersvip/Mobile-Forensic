'use client';

import React, { useState, useMemo } from 'react';
import { Clock, Sliders, Calendar, Activity, MessageSquare, Phone, FileText, Search } from 'lucide-react';
import { SmsRecord, CallRecord, EvidenceFile } from '../types/forensic';
import { MOCK_SMS, MOCK_CALLS, MOCK_FILES } from '../lib/forensic-data';

interface TimelineTabProps {
  onLogActivity: (module: string, activity: string) => void;
}

interface TimelineEvent {
  id: string;
  timestamp: string;
  type: 'sms' | 'call' | 'file_mod' | 'file_cre';
  label: string;
  detail: string;
  meta: string;
  color: string;
}

export default function TimelineTab({ onLogActivity }: TimelineTabProps) {
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Merge events chronologically
  const timelineEvents = useMemo(() => {
    const list: TimelineEvent[] = [];

    // 1. Add SMS
    MOCK_SMS.forEach(sms => {
      list.push({
        id: `sms_${sms.id}`,
        timestamp: sms.timestamp,
        type: 'sms',
        label: sms.status === 'RECEIVED' ? `SMS received from ${sms.sender}` : 'SMS sent to Bos Rahasia',
        detail: sms.body,
        meta: sms.isDeleted ? 'RECOVERED DELETED SMS' : 'Active Provider Block',
        color: sms.isDeleted ? 'text-red-400 bg-red-500/10 border-red-500/20' : 'text-blue-400 bg-blue-500/10 border-blue-500/20'
      });
    });

    // 2. Add Calls
    MOCK_CALLS.forEach(call => {
      list.push({
        id: `call_${call.id}`,
        timestamp: call.timestamp,
        type: 'call',
        label: `${call.type} Call - ${call.name}`,
        detail: `Duration: ${call.duration} seconds. Telephone: ${call.phone}`,
        meta: 'Call Log Provider Registry',
        color: call.type === 'MISSED' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
      });
    });

    // 3. Add File created/modified dates
    MOCK_FILES.forEach(file => {
      // Creation
      list.push({
        id: `file_cre_${file.id}`,
        timestamp: file.createdTime,
        type: 'file_cre',
        label: `File Block Created - ${file.name}`,
        detail: `Path: ${file.path}. MIME: ${file.mimeType}`,
        meta: `SHA-256: ${file.sha256.substring(0, 16)}...`,
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
      });

      // Modification if different
      if (file.createdTime !== file.modifiedTime) {
        list.push({
          id: `file_mod_${file.id}`,
          timestamp: file.modifiedTime,
          type: 'file_mod',
          label: `File Metadata Modified - ${file.name}`,
          detail: `Sector update. Computed md5: ${file.md5}`,
          meta: `Path: ${file.path}`,
          color: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
        });
      }
    });

    // Sort chronologically descending (newest first)
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, []);

  // Filter events
  const filteredEvents = useMemo(() => {
    return timelineEvents.filter(evt => {
      // Time filter
      const date = new Date(evt.timestamp);
      const now = new Date('2026-07-06T20:41:40Z'); // Static context date
      const diffMs = now.getTime() - date.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (timeFilter === 'today' && diffDays > 1) return false;
      if (timeFilter === 'week' && diffDays > 7) return false;
      if (timeFilter === 'month' && diffDays > 30) return false;

      // Type filter
      if (typeFilter !== 'all') {
        if (typeFilter === 'sms' && evt.type !== 'sms') return false;
        if (typeFilter === 'call' && evt.type !== 'call') return false;
        if (typeFilter === 'file' && !evt.type.startsWith('file')) return false;
      }

      // Search matching
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesLabel = evt.label.toLowerCase().includes(query);
        const matchesDetail = evt.detail.toLowerCase().includes(query);
        const matchesMeta = evt.meta.toLowerCase().includes(query);
        return matchesLabel || matchesDetail || matchesMeta;
      }

      return true;
    });
  }, [timelineEvents, timeFilter, typeFilter, searchQuery]);

  // Aggregate stats per day for SVG Charting
  const chartFreqData = useMemo(() => {
    const days = ['06 Jul', '05 Jul', '04 Jul', '03 Jul', '02 Jul', '01 Jul', '30 Jun', '29 Jun'];
    const counts = days.map(day => {
      const matchEvents = timelineEvents.filter(evt => {
        const dateStr = new Date(evt.timestamp).toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
        return dateStr === day;
      });
      return matchEvents.length;
    });

    const max = Math.max(...counts) || 1;
    return days.map((day, idx) => ({
      day,
      count: counts[idx],
      percent: (counts[idx] / max) * 100
    }));
  }, [timelineEvents]);

  if (!isMounted) {
    return (
      <div className="space-y-6">
        <div className="h-48 bg-slate-900 border border-slate-800 rounded-xl animate-pulse" />
        <div className="h-96 bg-slate-900 border border-slate-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Visual Activity Chart and Configuration Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Filters control block */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5 border-b border-slate-850 pb-2">
              <Sliders className="w-4 h-4 text-cyan-500" />
              TIMELINE FILTERS
            </h3>

            <div className="space-y-4">
              {/* Scale select */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase font-bold">Temporal Interval</label>
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                  {(['all', 'today', 'week', 'month'] as const).map(scale => (
                    <button
                      key={scale}
                      onClick={() => setTimeFilter(scale)}
                      className={`py-2 rounded border transition-all uppercase text-[10px] tracking-wider ${
                        timeFilter === scale
                          ? 'bg-slate-800 border-cyan-500 text-cyan-400'
                          : 'bg-slate-950 border-slate-900 text-slate-500 hover:border-slate-800'
                      }`}
                    >
                      {scale === 'all' ? 'All History' : scale}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type select */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase font-bold">Artifact Classification</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg p-2.5 outline-none font-semibold focus:border-cyan-500 transition-colors"
                >
                  <option value="all">All Classifications</option>
                  <option value="sms">SMS / Chats</option>
                  <option value="call">Call registries</option>
                  <option value="file">Filesystem I/O (Created/Modified)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 mt-4 relative">
            <Search className="absolute left-2.5 top-6.5 w-3.5 h-3.5 text-slate-600" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search timeline events..."
              className="w-full bg-slate-950 border border-slate-800 rounded pl-8 pr-3 py-2 text-xs text-slate-300 outline-none focus:border-cyan-500 placeholder-slate-700"
            />
          </div>
        </div>

        {/* Visual frequency activity grid graph */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-850 pb-2 shrink-0">
            <Activity className="w-4 h-4 text-cyan-500" />
            FORENSIC ACTIVITY DENSITY (BY DAY)
          </h3>

          {/* SVG frequency column bars */}
          <div className="flex h-32 items-end justify-between px-2 pt-4 relative select-none">
            {chartFreqData.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1 group">
                <span className="text-[9px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity mb-1 font-bold">
                  {item.count}
                </span>
                <div className="w-4 sm:w-6 bg-slate-950 border border-slate-800 rounded-t overflow-hidden relative h-20 flex items-end">
                  <div 
                    className="bg-gradient-to-t from-cyan-600 to-cyan-400 w-full rounded-t transition-all duration-500"
                    style={{ height: `${item.percent}%` }}
                  />
                </div>
                <span className="text-[9px] font-mono font-bold text-slate-400 mt-2 truncate max-w-[40px]">{item.day}</span>
              </div>
            ))}
          </div>

          <div className="text-[10px] text-slate-500 text-center uppercase font-mono mt-2 tracking-wide">
            Timeline statistics synchronized with case file block acquisitions
          </div>
        </div>
      </div>

      {/* Chronological Vertical List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-850 pb-3">
          <Clock className="w-4 h-4 text-cyan-500" />
          CHRONOLOGICAL LOGGED HISTORY ({filteredEvents.length} events)
        </h3>

        {filteredEvents.length > 0 ? (
          <div className="relative pl-6 border-l border-slate-850 space-y-6 py-2 select-text">
            {filteredEvents.slice(0, 50).map((evt) => (
              <div key={evt.id} className="relative group">
                {/* Visual line pin indicator */}
                <span className="absolute -left-[30px] top-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 bg-slate-950 flex items-center justify-center transition-all group-hover:scale-125 z-10">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    evt.type === 'sms' ? 'bg-blue-500' :
                    evt.type === 'call' ? 'bg-yellow-500' :
                    evt.type === 'file_cre' ? 'bg-emerald-500' : 'bg-purple-500'
                  }`} />
                </span>

                <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md hover:border-slate-800 transition-colors">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase border ${evt.color}`}>
                        {evt.type === 'sms' && <span className="flex items-center gap-0.5"><MessageSquare className="w-2.5 h-2.5" /> SMS thread</span>}
                        {evt.type === 'call' && <span className="flex items-center gap-0.5"><Phone className="w-2.5 h-2.5" /> call log</span>}
                        {evt.type === 'file_cre' && <span className="flex items-center gap-0.5"><FileText className="w-2.5 h-2.5" /> Block Created</span>}
                        {evt.type === 'file_mod' && <span className="flex items-center gap-0.5"><FileText className="w-2.5 h-2.5" /> Block Modified</span>}
                      </span>
                      <h4 className="text-xs font-bold text-slate-200">{evt.label}</h4>
                    </div>

                    <p className="text-xs text-slate-400 font-sans tracking-tight leading-relaxed">{evt.detail}</p>
                    <div className="text-[9px] font-mono text-slate-500">{evt.meta}</div>
                  </div>

                  <div className="flex flex-col sm:items-end font-mono text-xs shrink-0">
                    <span className="text-cyan-500 font-bold flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(evt.timestamp).toLocaleDateString()}
                    </span>
                    <span className="text-slate-500 mt-0.5">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            ))}
            {filteredEvents.length > 50 && (
              <div className="text-slate-500 italic py-2 text-center text-xs font-mono">
                ... Truncated timeline for browser performance (Total {filteredEvents.length} events) ...
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-600 italic">
            No events match selected timeline queries or classification filters.
          </div>
        )}
      </div>
    </div>
  );
}
