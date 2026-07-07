'use client';

import React, { useMemo } from 'react';
import { Shield, Cpu, HardDrive, Battery, CheckCircle, FileText, Activity, AlertTriangle, Smartphone, ShieldCheck, HelpCircle } from 'lucide-react';
import { DeviceProfile, EvidenceFile, AuditLog, ConnectionStatus } from '../types/forensic';

interface DashboardTabProps {
  device: DeviceProfile | null;
  status: ConnectionStatus;
  evidenceFiles: EvidenceFile[];
  logs: AuditLog[];
  onNavigate: (tab: string) => void;
}

export default function DashboardTab({ device, status, evidenceFiles, logs, onNavigate }: DashboardTabProps) {
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  // Compute file categories count and sizes
  const stats = useMemo(() => {
    let images = 0, videos = 0, audios = 0, docs = 0, dbs = 0, other = 0;
    let imageSize = 0, videoSize = 0, audioSize = 0, docSize = 0, dbSize = 0, otherSize = 0;

    evidenceFiles.forEach(file => {
      switch (file.category) {
        case 'picture':
          images++;
          imageSize += file.sizeBytes;
          break;
        case 'video':
          videos++;
          videoSize += file.sizeBytes;
          break;
        case 'audio':
          audios++;
          audioSize += file.sizeBytes;
          break;
        case 'document':
          docs++;
          docSize += file.sizeBytes;
          break;
        case 'database':
          dbs++;
          dbSize += file.sizeBytes;
          break;
        default:
          other++;
          otherSize += file.sizeBytes;
      }
    });

    const totalFiles = evidenceFiles.length;
    const totalSize = imageSize + videoSize + audioSize + docSize + dbSize + otherSize;

    return {
      images, videos, audios, docs, dbs, other, totalFiles,
      sizes: {
        image: imageSize,
        video: videoSize,
        audio: audioSize,
        doc: docSize,
        db: dbSize,
        other: otherSize,
        total: totalSize
      }
    };
  }, [evidenceFiles]);

  const formattedTotalSize = useMemo(() => {
    const bytes = stats.sizes.total;
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, [stats]);

  // SVG Chart Computations for artifact distribution
  const chartData = useMemo(() => {
    const data = [
      { label: 'Images', value: stats.images, color: '#3b82f6' },
      { label: 'Videos', value: stats.videos, color: '#ef4444' },
      { label: 'Audios', value: stats.audios, color: '#eab308' },
      { label: 'Documents', value: stats.docs, color: '#10b981' },
      { label: 'Databases', value: stats.dbs, color: '#8b5cf6' },
      { label: 'Downloads/APKs', value: stats.other, color: '#ec4899' },
    ];

    const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
    let currentAngle = 0;

    return data.map(item => {
      const percentage = (item.value / total) * 100;
      const angle = (item.value / total) * 360;
      const startAngle = currentAngle;
      currentAngle += angle;

      // Coordinate computations for SVG pie slice
      const x1 = Math.cos((startAngle - 90) * Math.PI / 180) * 80 + 100;
      const y1 = Math.sin((startAngle - 90) * Math.PI / 180) * 80 + 100;
      const x2 = Math.cos((currentAngle - 90) * Math.PI / 180) * 80 + 100;
      const y2 = Math.sin((currentAngle - 90) * Math.PI / 180) * 80 + 100;
      const largeArcFlag = angle > 180 ? 1 : 0;

      return {
        ...item,
        percentage,
        path: `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2} Z`
      };
    });
  }, [stats]);

  return (
    <div className="space-y-6">
      {/* Target Status Banner */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
        <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-4">
            <div className={`p-3.5 rounded-lg ${
              status === 'ACQUIRED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
              status === 'CONNECTED' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
              status === 'ACQUIRING' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 animate-pulse' :
              'bg-zinc-800 text-zinc-500 border border-zinc-700'
            }`}>
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold">ADB Status</div>
              <h2 className="text-xl font-bold font-sans tracking-tight text-zinc-100">
                {status === 'DISCONNECTED' && 'No Device Connected'}
                {status === 'CONNECTING' && 'Establishing ADB Handshake...'}
                {status === 'CONNECTED' && `${device?.brand} ${device?.model} (Ready)`}
                {status === 'ACQUIRING' && 'Extracting Logic Partitions...'}
                {status === 'ACQUIRED' && `${device?.brand} ${device?.model} (Analyzed)`}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {status === 'DISCONNECTED' && 'Connect an Android device via USB debugging to begin.'}
                {status === 'CONNECTED' && 'ADB authentication successful. Proceed to Logical Acquisition.'}
                {status === 'ACQUIRING' && 'Do not disconnect the target device during block hashing.'}
                {status === 'ACQUIRED' && 'Evidence files index compiled and verified. Local integrity verified.'}
              </p>
            </div>
          </div>
          <div>
            {status === 'DISCONNECTED' ? (
              <button 
                onClick={() => onNavigate('deviceInfo')} 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-sm transition-all shadow-[0_2px_10px_rgba(59,130,246,0.2)] hover:shadow-[0_2px_15px_rgba(59,130,246,0.3)] cursor-pointer"
              >
                Connect Device
              </button>
            ) : status === 'CONNECTED' ? (
              <button 
                onClick={() => onNavigate('logical')} 
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-slate-950 font-semibold rounded-lg text-sm transition-all cursor-pointer"
              >
                Acquire Data
              </button>
            ) : (
              <span className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-400 font-mono text-xs border border-zinc-700 uppercase">
                {status}
              </span>
            )}
          </div>
        </div>

        {/* Total stats card */}
        <div className="w-full lg:w-80 bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col justify-center shadow-lg">
          <div className="flex items-center space-x-3 text-zinc-500 mb-1">
            <HardDrive className="w-4 h-4 text-blue-500" />
            <span className="text-xs uppercase tracking-wider font-bold">Acquisition Size</span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-blue-400 leading-none">{formattedTotalSize}</div>
          <p className="text-[10px] text-zinc-500 mt-1 uppercase font-mono tracking-wider">
            {stats.totalFiles} verified cryptographic hashes
          </p>
        </div>
      </div>

      {/* Target Spec Highlights Grid */}
      {status !== 'DISCONNECTED' && device && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 flex items-center space-x-3">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Hardware Platform</div>
              <div className="text-sm font-semibold text-zinc-200 mt-0.5">{device.cpu}</div>
              <div className="text-xs font-mono text-zinc-400 mt-0.5">{device.ram} RAM</div>
            </div>
          </div>
          
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 flex items-center space-x-3">
            <Shield className="w-5 h-5 text-red-400" />
            <div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Root Status</div>
              <div className="text-sm font-semibold text-zinc-200 mt-0.5 flex items-center gap-1.5">
                {device.rootStatus.includes('Rooted') ? (
                  <span className="text-red-400 font-bold">ROOT DETECTED</span>
                ) : (
                  <span className="text-emerald-400 font-semibold">SECURED (STOCK)</span>
                )}
              </div>
              <div className="text-xs font-mono text-zinc-400 mt-0.5">SELinux: {device.selinuxStatus}</div>
            </div>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 flex items-center space-x-3">
            <Battery className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Power State</div>
              <div className="text-sm font-semibold text-zinc-200 mt-0.5">{device.battery}</div>
              <div className="text-xs font-mono text-zinc-400 mt-0.5">USB: {device.usbDebugging}</div>
            </div>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 flex items-center space-x-3">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Security Profiles</div>
              <div className="text-sm font-semibold text-zinc-200 mt-0.5 truncate max-w-[180px]" title={device.encryptionStatus}>
                {device.encryptionStatus.split(' - ')[0]}
              </div>
              <div className="text-xs font-mono text-zinc-400 mt-0.5">Patch: {device.securityPatch}</div>
            </div>
          </div>
        </div>
      )}

      {/* Artifact Statistics and Graphics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core numbers column */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500" />
            LOGICAL ACQUIRED METRICS
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-850 hover:border-blue-500/40 transition-colors">
              <span className="text-[10px] uppercase text-zinc-500 font-bold">Pictures</span>
              <div className="text-2xl font-bold font-mono text-blue-400 mt-1">{stats.images}</div>
            </div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-850 hover:border-red-500/40 transition-colors">
              <span className="text-[10px] uppercase text-zinc-500 font-bold">Videos</span>
              <div className="text-2xl font-bold font-mono text-red-400 mt-1">{stats.videos}</div>
            </div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-850 hover:border-emerald-500/40 transition-colors">
              <span className="text-[10px] uppercase text-zinc-500 font-bold">Documents</span>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{stats.docs}</div>
            </div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-850 hover:border-purple-500/40 transition-colors">
              <span className="text-[10px] uppercase text-zinc-500 font-bold">Databases</span>
              <div className="text-2xl font-bold font-mono text-purple-400 mt-1">{stats.dbs}</div>
            </div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-850 hover:border-yellow-500/40 transition-colors">
              <span className="text-[10px] uppercase text-zinc-500 font-bold">Audio Logs</span>
              <div className="text-2xl font-bold font-mono text-yellow-400 mt-1">{stats.audios}</div>
            </div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-850 hover:border-pink-500/40 transition-colors">
              <span className="text-[10px] uppercase text-zinc-500 font-bold">Apps & APKs</span>
              <div className="text-2xl font-bold font-mono text-pink-400 mt-1">{stats.other}</div>
            </div>
          </div>
        </div>

        {/* Visual Donuts SVG Chart */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              ARTIFACT DISTRIBUTION CHART
            </h3>
          </div>

          <div className="flex flex-row items-center justify-center gap-6 py-2">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full" viewBox="0 0 200 200">
                {stats.totalFiles === 0 ? (
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#27272a" strokeWidth="20" />
                ) : (
                  chartData.map((item, idx) => (
                    item.value > 0 && (
                      <path 
                        key={idx} 
                        d={item.path} 
                        fill={item.color} 
                        className="hover:opacity-85 transition-opacity cursor-pointer"
                      />
                    )
                  ))
                )}
                <circle cx="100" cy="100" r="50" fill="#18181b" />
                <text x="100" y="95" textAnchor="middle" className="text-[10px] font-bold fill-zinc-500 uppercase">Artifacts</text>
                <text x="100" y="115" textAnchor="middle" className="text-lg font-bold font-mono fill-blue-400 leading-none">{stats.totalFiles}</text>
              </svg>
            </div>

            <div className="flex-1 space-y-1.5 text-xs max-w-[140px]">
              {chartData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 truncate">
                    <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-zinc-400 truncate">{item.label}</span>
                  </div>
                  <span className="font-mono font-bold text-zinc-200 pl-1">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Audit Log column */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                ACTIVE INVESTIGATION AUDIT
              </span>
              <button 
                onClick={() => onNavigate('logs')}
                className="text-[10px] font-bold text-blue-500 hover:underline uppercase cursor-pointer"
              >
                Full Log
              </button>
            </h3>

            <div className="space-y-3 h-[210px] overflow-y-auto pr-1">
              {logs.slice().reverse().map((log) => (
                <div key={log.id} className="bg-zinc-950 p-2 rounded border border-zinc-850 text-[11px]">
                  <div className="flex items-center justify-between text-zinc-500 font-mono mb-1 text-[10px]">
                    <span>[{log.module.toUpperCase()}]</span>
                    <span>{isMounted ? new Date(log.timestamp).toLocaleTimeString() : ''}</span>
                  </div>
                  <p className="text-zinc-300 font-sans tracking-tight">{log.action}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
