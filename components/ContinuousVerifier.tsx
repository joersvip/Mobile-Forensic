'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, ShieldCheck, AlertTriangle, Play, Pause, 
  HelpCircle, Eye, RefreshCw, Lock, ShieldAlert
} from 'lucide-react';
import { User, SecurityAuditLog } from '../types/forensic';
import { getClientPlatformInfo } from '../lib/crypto-helper';

interface ContinuousVerifierProps {
  currentUser: User;
  onLockTriggered: (reason: string) => void;
}

export default function ContinuousVerifier({ currentUser, onLockTriggered }: ContinuousVerifierProps) {
  const [status, setStatus] = useState<'VERIFIED' | 'WARNING' | 'THREAT' | 'MULTIFACE'>('VERIFIED');
  const [isActive, setIsActive] = useState(true);
  const [lastCheckTime, setLastCheckTime] = useState<string>('');
  const [checkIntervalSec, setCheckIntervalSec] = useState<number>(10);
  const [progress, setProgress] = useState(100);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sound effects simulation
  const triggerAlarm = () => {
    console.warn("ALARM: Keamanan biometrik mendeteksi anomali!");
  };

  // Handle logging to LocalStorage
  const logAuditToLocalStorage = (user: string, action: string, result: 'SUCCESS' | 'FAILED' | 'BLOCKED' | 'WARNING' | 'SYSTEM') => {
    const platform = getClientPlatformInfo();
    const newLog: SecurityAuditLog = {
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
      username: user || 'Anonymous',
      action,
      ip_address: platform.ip,
      browser: platform.browser,
      operating_system: platform.os,
      result
    };
    
    const logsStr = localStorage.getItem('forensic_audit_logs');
    const logsList: SecurityAuditLog[] = logsStr ? JSON.parse(logsStr) : [];
    localStorage.setItem('forensic_audit_logs', JSON.stringify([newLog, ...logsList]));
  };

  // Perform the biometrics check
  const performBiometricsCheck = () => {
    if (!isActive) return;
    setLastCheckTime(new Date().toLocaleTimeString());
    setProgress(100);

    // Dynamic checks
    // If it is regular, we remain VERIFIED
    console.log(`[Continuous Biometrics] Re-verifying user session: ${currentUser.fullname}`);
  };

  // Animate progress bar between ticks
  useEffect(() => {
    if (!isActive) {
      const timer = setTimeout(() => {
        setProgress(0);
      }, 0);
      return () => clearTimeout(timer);
    }

    const startTimer = setTimeout(() => {
      performBiometricsCheck();
    }, 0);

    // Trigger regular verification check every X seconds
    timerRef.current = setInterval(() => {
      performBiometricsCheck();
    }, checkIntervalSec * 1000);

    // Tick progress bar down
    const tickTimeMs = 100;
    const totalTicks = (checkIntervalSec * 1000) / tickTimeMs;
    let ticksElapsed = 0;

    progressIntervalRef.current = setInterval(() => {
      ticksElapsed++;
      const rem = Math.max(0, 100 - (ticksElapsed / totalTicks) * 100);
      setProgress(rem);
    }, tickTimeMs);

    return () => {
      clearTimeout(startTimer);
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isActive, checkIntervalSec, currentUser]);

  // Action Triggers for testing the locking behavior
  const handleSimulateThreat = (type: 'no_face' | 'mismatch' | 'multi_face') => {
    triggerAlarm();
    
    if (type === 'no_face') {
      setStatus('THREAT');
      logAuditToLocalStorage(currentUser.username, 'Autolock: Wajah tidak lagi terdeteksi di kamera.', 'BLOCKED');
      onLockTriggered('Wajah tidak terdeteksi di area pemantauan kamera.');
    } else if (type === 'mismatch') {
      setStatus('THREAT');
      logAuditToLocalStorage(currentUser.username, 'Autolock: Deviasi wajah dideteksi. Wajah tidak cocok dengan investigator aktif.', 'BLOCKED');
      onLockTriggered('Wajah terdeteksi tidak cocok dengan pengguna aktif.');
    } else if (type === 'multi_face') {
      setStatus('MULTIFACE');
      logAuditToLocalStorage(currentUser.username, 'Autolock: Terdeteksi ancaman visual sekunder (lebih dari satu wajah).', 'BLOCKED');
      onLockTriggered('Terdeteksi banyak wajah di kamera (Sistem anti-intrusif aktif).');
    }
  };

  return (
    <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-xl space-y-3 shadow-md">
      
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
        <div className="flex items-center space-x-1.5">
          <Camera className={`w-3.5 h-3.5 text-blue-400 ${isActive ? 'animate-pulse' : ''}`} />
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono">BIOMETRICS DAEMON</span>
        </div>
        
        <button
          onClick={() => setIsActive(!isActive)}
          className={`p-1 rounded cursor-pointer ${isActive ? 'text-zinc-500 hover:text-zinc-300' : 'text-emerald-400 hover:text-emerald-300 bg-emerald-500/10'}`}
          title={isActive ? "Pause Verification" : "Start Verification"}
        >
          {isActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
        </button>
      </div>

      {/* Camera mini visual simulation and status */}
      <div className="bg-zinc-900 rounded-lg p-2 flex items-center space-x-3 border border-zinc-850 relative overflow-hidden">
        
        {/* Dynamic green background overlay during scanner sweep */}
        {isActive && (
          <div 
            className="absolute left-0 right-0 h-[1.5px] bg-emerald-400/40 z-10"
            style={{
              top: `${(100 - progress)}%`,
              boxShadow: '0 0 8px rgba(52, 211, 153, 0.5)'
            }}
          />
        )}

        <div className="w-10 h-10 bg-zinc-950 border border-zinc-800 rounded-md flex items-center justify-center font-mono text-[9px] shrink-0 text-zinc-500 relative">
          <Camera className="w-5 h-5 text-zinc-700 absolute" />
          <div className="w-1 h-1 bg-red-500 rounded-full absolute top-1 right-1 animate-ping" />
          <span className="text-[8px] text-zinc-400 font-bold uppercase z-10">{status === 'VERIFIED' ? 'PASS' : 'WARN'}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1.5">
            <span className={`w-1.5 h-1.5 rounded-full inline-block ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`} />
            <span className="text-[10px] font-bold text-zinc-200">Active Scan</span>
          </div>
          <p className="text-[8px] text-zinc-400 font-mono mt-0.5 truncate uppercase">
            User: {currentUser.fullname.substring(0, 16)}...
          </p>
          <p className="text-[8px] text-zinc-500 font-mono">
            Check: {lastCheckTime || 'N/A'}
          </p>
        </div>
      </div>

      {/* Progress tick bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[8px] font-mono text-zinc-500">
          <span>Continuous Health Status</span>
          <span>Next check in {Math.ceil((progress / 100) * checkIntervalSec)}s</span>
        </div>
        <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Admin Quick Threat Simulator (For demonstration purposes as requested!) */}
      <div className="bg-zinc-900/60 p-2 rounded-lg space-y-1 border border-zinc-850">
        <span className="text-[8px] font-bold text-zinc-500 uppercase font-mono tracking-wider block">ANOMALY INTRUSION TESTING:</span>
        <div className="grid grid-cols-3 gap-1 text-[8px] font-mono">
          <button
            onClick={() => handleSimulateThreat('no_face')}
            className="py-1 px-1 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/30 text-rose-400 rounded text-center cursor-pointer font-bold"
          >
            ❌ No Face
          </button>
          <button
            onClick={() => handleSimulateThreat('mismatch')}
            className="py-1 px-1 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/30 text-rose-400 rounded text-center cursor-pointer font-bold"
          >
            ⚠️ Mismatch
          </button>
          <button
            onClick={() => handleSimulateThreat('multi_face')}
            className="py-1 px-1 bg-amber-950/20 hover:bg-amber-950/40 border border-amber-900/30 text-amber-400 rounded text-center cursor-pointer font-bold"
          >
            👥 Multi
          </button>
        </div>
      </div>

    </div>
  );
}
