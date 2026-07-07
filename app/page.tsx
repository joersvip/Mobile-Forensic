'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Smartphone, Download, FolderTree, Database, 
  Clock, Search, Copy, FileDigit, FileText, Terminal, Sliders, Menu, X, Shield, Cpu, MapPin, ShieldAlert, LogOut, Lock as LockIcon, RefreshCw, Camera,
  Monitor, Settings, Layers, ChevronRight, Play, Eye, Maximize2, Zap, Palette, HelpCircle, Activity, Globe, Send, Sparkles, AlertCircle, HardDrive, Brain
} from 'lucide-react';

// Data and Types
import { DeviceProfile, EvidenceFile, AuditLog, ForensicSettings, ConnectionStatus, User, SecurityAuditLog } from '../types/forensic';
import { MOCK_DEVICES, MOCK_FILES } from '../lib/forensic-data';

// Tabs Components
import DashboardTab from '../components/DashboardTab';
import DeviceInfoTab from '../components/DeviceInfoTab';
import LogicalAcquisitionTab from '../components/LogicalAcquisitionTab';
import EvidenceExplorerTab from '../components/EvidenceExplorerTab';
import SQLiteAnalyzerTab from '../components/SQLiteAnalyzerTab';
import TimelineTab from '../components/TimelineTab';
import LocationHistoryTab from '../components/LocationHistoryTab';
import ConnectedDevicesTab from '../components/ConnectedDevicesTab';
import DeletedArtifactsTab from '../components/DeletedArtifactsTab';
import KeywordSearchTab from '../components/KeywordSearchTab';
import DuplicateDetectionTab from '../components/DuplicateDetectionTab';
import HashVerificationTab from '../components/HashVerificationTab';
import ReportsTab from '../components/ReportsTab';
import LogsTab from '../components/LogsTab';
import SettingsTab from '../components/SettingsTab';
import UserManagementTab from '../components/UserManagementTab';
import AuditLogsTab from '../components/AuditLogsTab';
import FaceAuthLogin from '../components/FaceAuthLogin';
import ContinuousVerifier from '../components/ContinuousVerifier';
import AIAnalysisTab from '../components/AIAnalysisTab';

// Crypto Helpers
import { initializeDatabase, hashPassword, getClientPlatformInfo } from '../lib/crypto-helper';

export default function ForensicPage() {
  // Theme State ("dark-intelligence" | "dark-blue" | "dark-green" | "dark-red")
  const [activeTheme, setActiveTheme] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('forensic_active_theme') || 'dark-intelligence';
    }
    return 'dark-intelligence';
  });

  // Application States
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [status, setStatus] = useState<ConnectionStatus>(() => {
    if (typeof window !== 'undefined') {
      const isSimActive = localStorage.getItem('forensic_sim_mode') === 'active';
      return isSimActive ? 'CONNECTED' : 'DISCONNECTED';
    }
    return 'DISCONNECTED';
  });
  const [selectedDevice, setSelectedDevice] = useState<DeviceProfile | null>(() => {
    if (typeof window !== 'undefined') {
      const isSimActive = localStorage.getItem('forensic_sim_mode') === 'active';
      return isSimActive ? MOCK_DEVICES[0] || null : null;
    }
    return null;
  });
  const [evidenceFiles, setEvidenceFiles] = useState<EvidenceFile[]>(MOCK_FILES);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [initialSelectedDb, setInitialSelectedDb] = useState<string>('mmssms.db');

  // Command Palette & Floating Panels States
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState('');
  const [dockLeftOpen, setDockLeftOpen] = useState(true);
  const [dockRightOpen, setDockRightOpen] = useState(true);
  const [showToasts, setShowToasts] = useState<string[]>([]);

  // Simulation Metrics
  const [perfCpu, setPerfCpu] = useState(12);
  const [perfRam, setPerfRam] = useState(45);
  const [perfThreads, setPerfThreads] = useState(2);

  // Security & Authentication States
  const [sessionUser, setSessionUser] = useState<User | null>(null);
  const [isAppLocked, setIsAppLocked] = useState<boolean>(false);
  const [lockReason, setLockReason] = useState<string>('');
  const [lockPassword, setLockPassword] = useState<string>('');
  const [isUnlocking, setIsUnlocking] = useState<boolean>(false);
  const [unlockError, setUnlockError] = useState<string>('');
  const [isCheckingAutoLogin, setIsCheckingAutoLogin] = useState<boolean>(true);

  const [settings, setSettings] = useState<ForensicSettings>({
    examinerName: 'Rian Adiputra',
    organization: 'Polda Metro Jaya - Cyber Crime Unit',
    caseId: 'CASE-POL-2026-07A',
    outputPath: '/var/forensics/cases/2026/'
  });

  const [logs, setLogs] = useState<AuditLog[]>([
    { id: '1', timestamp: '2026-07-06T20:41:40.000Z', module: 'System', action: 'Mobile Forensic Suite sandbox environment started successfully.' },
    { id: '2', timestamp: '2026-07-06T20:41:41.000Z', module: 'Audit Logs', action: 'Log audit database initialized.' }
  ]);

  // Sync active session on load
  useEffect(() => {
    initializeDatabase().then(() => {
      const activeSession = localStorage.getItem('forensic_active_session');
      if (activeSession) {
        try {
          const parsedUser: User = JSON.parse(activeSession);
          setSessionUser(parsedUser);
        } catch (e) {
          console.error("Gagal membaca sesi aktif", e);
        }
      }
      setIsCheckingAutoLogin(false);
    });
  }, []);

  // Sync settings examinerName with active logged in user
  useEffect(() => {
    if (sessionUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSettings(prev => ({
        ...prev,
        examinerName: sessionUser.fullname,
        organization: sessionUser.role === 'Administrator' 
          ? 'Polda Metro Jaya - Admin Unit' 
          : sessionUser.role === 'Examiner' 
            ? 'Polda Metro Jaya - Cyber Crime Unit' 
            : 'Polda Metro Jaya - Case Reviewer'
      }));
    }
  }, [sessionUser]);

  // Periodic performance updates
  useEffect(() => {
    const timer = setInterval(() => {
      setPerfCpu(Math.floor(Math.random() * 20) + 8);
      setPerfRam(Math.floor(Math.random() * 4) + 42);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Global hotkeys (Ctrl + P) to open Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        setCmdPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Custom Toast helper
  const triggerToast = (msg: string) => {
    setShowToasts(prev => [...prev, msg]);
    setTimeout(() => {
      setShowToasts(prev => prev.slice(1));
    }, 4000);
  };

  // Theme Config mapper
  const themeConfig = {
    accentColor: activeTheme === 'dark-green' ? 'emerald' :
                 activeTheme === 'dark-blue' ? 'blue' :
                 activeTheme === 'dark-red' ? 'rose' : 'cyan',
    accentText: activeTheme === 'dark-green' ? 'text-emerald-400' :
                activeTheme === 'dark-blue' ? 'text-blue-400' :
                activeTheme === 'dark-red' ? 'text-rose-400' : 'text-cyan-400',
    accentBg: activeTheme === 'dark-green' ? 'bg-emerald-600' :
              activeTheme === 'dark-blue' ? 'bg-blue-600' :
              activeTheme === 'dark-red' ? 'bg-rose-600' : 'bg-cyan-600',
    accentBorder: activeTheme === 'dark-green' ? 'border-emerald-500/20' :
                  activeTheme === 'dark-blue' ? 'border-blue-500/20' :
                  activeTheme === 'dark-red' ? 'border-rose-500/20' : 'border-cyan-500/20',
    accentGlow: activeTheme === 'dark-green' ? 'shadow-[0_0_15px_rgba(16,185,129,0.25)]' :
                activeTheme === 'dark-blue' ? 'shadow-[0_0_15px_rgba(59,130,246,0.25)]' :
                activeTheme === 'dark-red' ? 'shadow-[0_0_15px_rgba(244,63,94,0.25)]' : 'shadow-[0_0_15px_rgba(6,182,212,0.25)]',
  };

  // RBAC permissions helper
  const hasRoleAccess = (itemId: string, role: string) => {
    if (role === 'Administrator') return true;
    if (role === 'Examiner') {
      return itemId !== 'user_management' && itemId !== 'audit_logs';
    }
    if (role === 'Viewer') {
      return (
        itemId === 'dashboard' ||
        itemId === 'devices' ||
        itemId === 'location' ||
        itemId === 'deleted_artifacts' ||
        itemId === 'explorer' ||
        itemId === 'sqlite' ||
        itemId === 'timeline' ||
        itemId === 'hash' ||
        itemId === 'ai_analysis'
      );
    }
    return false;
  };

  // Enforce RBAC redirects
  useEffect(() => {
    if (sessionUser && !hasRoleAccess(activeTab, sessionUser.role)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab('dashboard');
    }
  }, [activeTab, sessionUser]);

  // Logging Callback
  const handleLogActivity = (module: string, action: string) => {
    const newLog: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      module,
      action
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const handleConnect = () => {
    setStatus('CONNECTED');
    setSelectedDevice(MOCK_DEVICES[0]);
    handleLogActivity('ADB Handshake', `Established daemon link with: ${MOCK_DEVICES[0].model}`);
    triggerToast(`Koneksi perangkat terdeteksi: ${MOCK_DEVICES[0].model}`);
  };

  const handleDisconnect = () => {
    setStatus('DISCONNECTED');
    setSelectedDevice(null);
    handleLogActivity('ADB Handshake', 'ADB link terminated by investigator.');
    triggerToast('Koneksi perangkat terputus.');
  };

  const handleStartAcquisition = () => {
    setStatus('ACQUIRED');
    handleLogActivity('Acquisition Engine', 'Saved completed logical file block targets to filesystem case folder.');
    triggerToast('Akusisi Logis Berhasil Diselesaikan!');
  };

  const handleAnalyzeDatabase = (dbName: string) => {
    setInitialSelectedDb(dbName);
    setActiveTab('sqlite');
    handleLogActivity('Database Router', `Routed investigator from file manager to SQL sandbox with loaded target: "${dbName}"`);
  };

  const handleClearLogs = () => {
    setLogs([]);
    triggerToast('Audit trails cleared.');
  };

  const handleLogout = () => {
    if (sessionUser) {
      const platform = getClientPlatformInfo();
      const newLog: SecurityAuditLog = {
        id: `aud_${Date.now()}`,
        timestamp: new Date().toISOString(),
        username: sessionUser.username,
        action: 'Logout Sesi: Investigator mengakhiri sesi kerja forensik.',
        ip_address: platform.ip,
        browser: platform.browser,
        operating_system: platform.os,
        result: 'SUCCESS'
      };
      
      const logsStr = localStorage.getItem('forensic_audit_logs');
      const logsList: SecurityAuditLog[] = logsStr ? JSON.parse(logsStr) : [];
      localStorage.setItem('forensic_audit_logs', JSON.stringify([newLog, ...logsList]));
    }
    localStorage.removeItem('forensic_active_session');
    setSessionUser(null);
    setIsAppLocked(false);
  };

  const handleUnlockWithPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockError('');
    setIsUnlocking(true);

    if (!sessionUser) return;

    await new Promise(resolve => setTimeout(resolve, 800));

    const hash = await hashPassword(lockPassword);
    if (hash === sessionUser.password_hash) {
      const platform = getClientPlatformInfo();
      const newLog: SecurityAuditLog = {
        id: `aud_${Date.now()}`,
        timestamp: new Date().toISOString(),
        username: sessionUser.username,
        action: 'Unlock Sesi: Re-autentikasi kata sandi berhasil. Aplikasi dibuka kembali.',
        ip_address: platform.ip,
        browser: platform.browser,
        operating_system: platform.os,
        result: 'SUCCESS'
      };
      const logsStr = localStorage.getItem('forensic_audit_logs');
      const logsList: SecurityAuditLog[] = logsStr ? JSON.parse(logsStr) : [];
      localStorage.setItem('forensic_audit_logs', JSON.stringify([newLog, ...logsList]));

      setIsAppLocked(false);
      setLockPassword('');
      triggerToast('Sesi kerja dibuka kembali.');
    } else {
      setUnlockError('Password yang Anda masukkan salah!');
      const platform = getClientPlatformInfo();
      const newLog: SecurityAuditLog = {
        id: `aud_${Date.now()}`,
        timestamp: new Date().toISOString(),
        username: sessionUser.username,
        action: 'Unlock Gagal: Re-autentikasi kata sandi salah.',
        ip_address: platform.ip,
        browser: platform.browser,
        operating_system: platform.os,
        result: 'FAILED'
      };
      const logsStr = localStorage.getItem('forensic_audit_logs');
      const logsList: SecurityAuditLog[] = logsStr ? JSON.parse(logsStr) : [];
      localStorage.setItem('forensic_audit_logs', JSON.stringify([newLog, ...logsList]));
    }
    setIsUnlocking(false);
  };

  const handleUnlockWithFace = async () => {
    setUnlockError('');
    setIsUnlocking(true);

    if (!sessionUser) return;

    await new Promise(resolve => setTimeout(resolve, 1500));

    const platform = getClientPlatformInfo();
    const newLog: SecurityAuditLog = {
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
      username: sessionUser.username,
      action: 'Unlock Sesi: Re-autentikasi wajah biometrik berhasil. Aplikasi dibuka kembali.',
      ip_address: platform.ip,
      browser: platform.browser,
      operating_system: platform.os,
      result: 'SUCCESS'
    };
    const logsStr = localStorage.getItem('forensic_audit_logs');
    const logsList: SecurityAuditLog[] = logsStr ? JSON.parse(logsStr) : [];
    localStorage.setItem('forensic_audit_logs', JSON.stringify([newLog, ...logsList]));

    setIsAppLocked(false);
    setIsUnlocking(false);
    triggerToast('Re-scan wajah berhasil. Sesi terbuka.');
  };

  const handleCommandRun = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = cmdQuery.trim().toLowerCase();
    setCmdPaletteOpen(false);
    setCmdQuery('');

    if (cmd.startsWith('/theme ')) {
      const targetTheme = cmd.split(' ')[1];
      if (['dark-intelligence', 'dark-blue', 'dark-green', 'dark-red'].includes(targetTheme)) {
        setActiveTheme(targetTheme);
        localStorage.setItem('forensic_active_theme', targetTheme);
        triggerToast(`Tema berhasil diubah ke: ${targetTheme}`);
        handleLogActivity('Theme Engine', `User changed interface layout theme to: ${targetTheme}`);
      } else {
        triggerToast('Tema tidak dikenal! Gunakan: dark-intelligence, dark-blue, dark-green, dark-red');
      }
    } else if (cmd === '/lock') {
      setIsAppLocked(true);
      setLockReason('Dikunci manual oleh investigator via Command Palette.');
      handleLogActivity('Security Console', 'Manual workspace lock triggered.');
    } else if (cmd === '/clear-cache') {
      triggerToast('Metadata & OCR Thumbnail cache cleared successfully.');
      handleLogActivity('Cache Manager', 'Cleared all local storage thumbnails & indexes.');
    } else if (cmd === '/ocr') {
      setActiveTab('ai_analysis');
      triggerToast('Dialihkan ke Offline AI Engine.');
    } else if (cmd === '/detect') {
      handleConnect();
    } else if (cmd === '/disconnect') {
      handleDisconnect();
    } else {
      triggerToast('Perintah tidak dikenal! Coba: /theme dark-green, /lock, /clear-cache, /ocr, /detect');
    }
  };

  // Sidebar sections configuration
  const sidebarMenu = [
    {
      section: 'Acquisition & Control',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'devices', label: 'Connected Devices', icon: Smartphone },
      ]
    },
    {
      section: 'Analysis Modules',
      items: [
        { id: 'ai_analysis', label: 'Local AI Engine', icon: Brain },
        { id: 'location', label: 'Location History', icon: MapPin },
        { id: 'deleted_artifacts', label: 'Deleted Artifacts', icon: ShieldAlert },
        { id: 'explorer', label: 'Evidence Browser', icon: FolderTree },
        { id: 'sqlite', label: 'SQLite Analyzer', icon: Database },
        { id: 'timeline', label: 'Timeline', icon: Clock },
      ]
    },
    {
      section: 'Integrity Tools',
      items: [
        { id: 'hash', label: 'Hash Verification', icon: FileDigit },
      ]
    },
    {
      section: 'Reporting & Admin',
      items: [
        { id: 'user_management', label: 'User Management', icon: Shield },
        { id: 'audit_logs', label: 'Audit Logs', icon: Terminal },
        { id: 'settings', label: 'Settings', icon: Sliders },
      ]
    }
  ];

  if (isCheckingAutoLogin) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center font-mono text-zinc-400">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-3" />
        <span className="text-xs uppercase tracking-widest font-bold">Memuat Gerbang Keamanan...</span>
      </div>
    );
  }

  if (!sessionUser) {
    return <FaceAuthLogin onLoginSuccess={(u) => setSessionUser(u)} />;
  }

  return (
    <div className={`flex flex-col h-screen overflow-hidden text-zinc-100 font-sans selection:bg-blue-500/30 select-none bg-zinc-950 relative`}>
      
      {/* 1. NATIVE DESKTOP WINDOW TITLE BAR */}
      <div className="h-8 bg-zinc-900 border-b border-zinc-850 px-3 flex items-center justify-between select-none shrink-0 text-xs">
        <div className="flex items-center space-x-2">
          {/* Mock Red/Yellow/Green window actions */}
          <div className="flex space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block cursor-pointer hover:bg-rose-500" onClick={handleLogout} title="Logout Sesi" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block cursor-pointer hover:bg-amber-500" onClick={() => setIsAppLocked(true)} title="Lock Screen" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block cursor-pointer hover:bg-emerald-500" onClick={() => triggerToast('Desktop simulation is fully maximized')} />
          </div>
          <span className="text-zinc-400 font-semibold font-mono pl-1.5">Mobile Forensic Suite v2.0 - [Enterprise Native Qt Desktop Preview]</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-zinc-700 font-mono">ROLE: {sessionUser.role.toUpperCase()}</span>
          <span className="text-[10px] text-zinc-500 font-mono hidden md:inline">SYSTEM: KALI-LINUX-2026</span>
        </div>
      </div>

      {/* 2. MENU BAR */}
      <div className="h-6 bg-zinc-950 border-b border-zinc-900 px-4 flex items-center justify-between text-[11px] select-none text-zinc-400 shrink-0 font-mono">
        <div className="flex space-x-5">
          <button className="hover:text-zinc-100 cursor-pointer transition-colors" onClick={() => triggerToast('New Case initiated')} title="Buat Kasus Baru">File</button>
          <button className="hover:text-zinc-100 cursor-pointer transition-colors" onClick={() => setCmdPaletteOpen(true)} title="Ctrl+P">Edit</button>
          <button className="hover:text-zinc-100 cursor-pointer transition-colors" onClick={() => { setSidebarOpen(!sidebarOpen); triggerToast('Sidebar toggled') }}>View</button>
          <button className="hover:text-zinc-100 cursor-pointer transition-colors" onClick={() => { if (status === 'DISCONNECTED') handleConnect(); else handleDisconnect(); }}>Device</button>
          <button className="hover:text-zinc-100 cursor-pointer transition-colors" onClick={() => { setActiveTab('ai_analysis'); triggerToast('Membuka modul AI lokal') }}>Analysis</button>
          <button className="hover:text-zinc-100 cursor-pointer transition-colors" onClick={() => { setActiveTab('settings'); triggerToast('Buka pengaturan tema') }}>Themes</button>
          <button className="hover:text-zinc-100 cursor-pointer transition-colors" onClick={() => triggerToast('Forensic Suite v2.0 - PySide6 SDK active')} title="Pusat Bantuan">Help</button>
        </div>
        <div className="text-zinc-500 text-[10px]">Case ID: {settings.caseId}</div>
      </div>

      {/* 3. RIBBON / QUICK ACCESS TOOLBAR */}
      <div className="bg-zinc-900/90 border-b border-zinc-850 p-2 flex items-center justify-between shrink-0 select-none gap-2">
        <div className="flex items-center gap-1 flex-wrap">
          {/* Auto Detect Button */}
          <button 
            onClick={() => {
              if (status === 'DISCONNECTED') {
                handleConnect();
              } else {
                handleDisconnect();
              }
            }}
            className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all text-center min-w-[75px] h-[58px] cursor-pointer ${
              status === 'CONNECTED' 
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400' 
                : 'bg-zinc-950 hover:bg-zinc-850 text-zinc-400 border-zinc-800'
            }`}
          >
            <Smartphone className="w-5 h-5 mb-1" />
            <span className="text-[9px] font-bold font-mono tracking-wide leading-none uppercase">
              {status === 'CONNECTED' ? 'DISCONNECT' : 'AUTO DETECT'}
            </span>
          </button>

          {/* Start Acquisition Button */}
          <button 
            onClick={handleStartAcquisition}
            disabled={status !== 'CONNECTED'}
            className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all text-center min-w-[75px] h-[58px] cursor-pointer ${
              status === 'CONNECTED'
                ? `bg-${themeConfig.accentColor}-600/15 hover:bg-${themeConfig.accentColor}-600/25 border-${themeConfig.accentColor}-500/40 ${themeConfig.accentText}`
                : 'bg-zinc-950/40 text-zinc-600 border-zinc-850 cursor-not-allowed'
            }`}
          >
            <Download className="w-5 h-5 mb-1" />
            <span className="text-[9px] font-bold font-mono tracking-wide leading-none uppercase">LOGICAL COPY</span>
          </button>

          <div className="h-10 w-[1px] bg-zinc-800 mx-1 self-center" />

          {/* AI OCR Scan */}
          <button 
            onClick={() => {
              setActiveTab('ai_analysis');
              triggerToast('Offline AI Analyzer Engine aktif.');
            }}
            className={`flex flex-col items-center justify-center p-2 rounded-lg border bg-zinc-950 hover:bg-zinc-850 text-zinc-400 border-zinc-800 text-center min-w-[75px] h-[58px] cursor-pointer`}
          >
            <Brain className="w-5 h-5 mb-1 text-purple-400" />
            <span className="text-[9px] font-bold font-mono tracking-wide leading-none uppercase">OFFLINE AI</span>
          </button>

          {/* Verify Hash Button */}
          <button 
            onClick={() => {
              setActiveTab('hash');
              triggerToast('Verifikasi Hash Integritas Berkas.');
            }}
            className={`flex flex-col items-center justify-center p-2 rounded-lg border bg-zinc-950 hover:bg-zinc-850 text-zinc-400 border-zinc-800 text-center min-w-[75px] h-[58px] cursor-pointer`}
          >
            <FileDigit className="w-5 h-5 mb-1 text-cyan-400" />
            <span className="text-[9px] font-bold font-mono tracking-wide leading-none uppercase">VERIFY HASH</span>
          </button>

          {/* Command Palette Access */}
          <button 
            onClick={() => setCmdPaletteOpen(true)}
            className="flex flex-col items-center justify-center p-2 rounded-lg border bg-zinc-950 hover:bg-zinc-850 text-zinc-400 border-zinc-800 text-center min-w-[75px] h-[58px] cursor-pointer"
          >
            <Terminal className="w-5 h-5 mb-1 text-amber-500 animate-pulse" />
            <span className="text-[9px] font-bold font-mono tracking-wide leading-none uppercase">CMD PALETTE</span>
          </button>

          {/* Manual lock button */}
          <button 
            onClick={() => {
              setIsAppLocked(true);
              setLockReason('Terkunci manual oleh investigator via Ribbon.');
            }}
            className="flex flex-col items-center justify-center p-2 rounded-lg border bg-zinc-950 hover:bg-zinc-850 text-zinc-400 border-zinc-800 text-center min-w-[75px] h-[58px] cursor-pointer"
          >
            <LockIcon className="w-5 h-5 mb-1 text-rose-500" />
            <span className="text-[9px] font-bold font-mono tracking-wide leading-none uppercase">LOCKDOWN</span>
          </button>
        </div>

        {/* Theme Engine selector */}
        <div className="flex items-center space-x-2 bg-zinc-950 p-1.5 rounded-lg border border-zinc-850 shrink-0">
          <Palette className="w-4 h-4 text-zinc-500 hidden sm:inline" />
          <select 
            value={activeTheme}
            onChange={(e) => {
              const val = e.target.value;
              setActiveTheme(val);
              localStorage.setItem('forensic_active_theme', val);
              triggerToast(`Tema berubah ke: ${val}`);
              handleLogActivity('Theme Engine', `User changed layout theme to: ${val}`);
            }}
            className="bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-300 font-mono outline-none px-2 py-1 rounded cursor-pointer uppercase"
          >
            <option value="dark-intelligence">Dark Intelligence (Cyan)</option>
            <option value="dark-blue">Dark Blue Theme</option>
            <option value="dark-green">Dark Green Matrix</option>
            <option value="dark-red">Dark Red Crimson</option>
          </select>
        </div>
      </div>

      {/* 4. MAIN MULTI-PANE QT WORKSPACE */}
      <div className="flex-1 flex overflow-hidden bg-zinc-950 relative">

        {/* MOCK LEFT DOCK: EVIDENCE TREE EXPLORER */}
        {dockLeftOpen && (
          <aside className="w-[240px] bg-zinc-900/90 border-r border-zinc-850 flex flex-col justify-between shrink-0 transition-all duration-300 overflow-hidden hidden lg:flex">
            <div className="flex-1 flex flex-col min-h-0">
              <div className="h-9 px-3 border-b border-zinc-850 bg-zinc-950 flex items-center justify-between shrink-0">
                <span className="text-[9px] font-black tracking-widest text-zinc-400 uppercase font-mono flex items-center gap-1.5">
                  <Layers className={`w-3.5 h-3.5 ${themeConfig.accentText}`} /> EVIDENCE EXPLORER DOCK
                </span>
                <button onClick={() => setDockLeftOpen(false)} className="p-0.5 hover:bg-zinc-850 rounded text-zinc-500 hover:text-zinc-300 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </div>

              {/* Collapsible tree files list */}
              <div className="p-3 space-y-2 overflow-y-auto flex-1 font-mono text-[10px]">
                <div className="space-y-1">
                  <span className="text-zinc-500 font-bold block uppercase text-[9px] tracking-wide">📦 CASE_2026_07A</span>
                  <div className="pl-2 space-y-1 text-zinc-300">
                    <div className="flex items-center gap-1 hover:text-zinc-100 cursor-pointer py-0.5 rounded" onClick={() => { setActiveTab('explorer'); triggerToast('Opening evidence folder'); }}>
                      <FolderTree className="w-3 h-3 text-blue-400" />
                      <span>rootfs / (logical)</span>
                    </div>
                    <div className="pl-4 space-y-1">
                      <div className="flex items-center gap-1 hover:text-zinc-100 cursor-pointer py-0.5 rounded" onClick={() => handleAnalyzeDatabase('mmssms.db')}>
                        <Database className="w-3 h-3 text-purple-400" />
                        <span>mmssms.db</span>
                      </div>
                      <div className="flex items-center gap-1 hover:text-zinc-100 cursor-pointer py-0.5 rounded" onClick={() => handleAnalyzeDatabase('contacts.db')}>
                        <Database className="w-3 h-3 text-purple-400" />
                        <span>contacts.db</span>
                      </div>
                      <div className="flex items-center gap-1 hover:text-zinc-100 cursor-pointer py-0.5 rounded" onClick={() => { setActiveTab('ai_analysis'); triggerToast('Gambar bukti transfer dimuat di OCR'); }}>
                        <FileText className="w-3 h-3 text-emerald-400" />
                        <span>bukti_transfer_gelap.png</span>
                      </div>
                      <div className="flex items-center gap-1 hover:text-zinc-100 cursor-pointer py-0.5 rounded">
                        <FileText className="w-3 h-3 text-zinc-400" />
                        <span>payload_update_3.apk</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Continuous Biometrics Verification panel */}
            <div className="p-2 border-t border-zinc-850 bg-zinc-950/40 shrink-0">
              <ContinuousVerifier
                currentUser={sessionUser}
                onLockTriggered={(reason) => {
                  setIsAppLocked(true);
                  setLockReason(reason);
                }}
              />
            </div>
          </aside>
        )}

        {/* CORE SCREEN TAB ROUTER AND WORKSPACE VIEWPORT */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Tab Headings */}
          <div className="h-8 bg-zinc-900 border-b border-zinc-850 flex items-center justify-between shrink-0 overflow-x-auto select-none">
            <div className="flex h-full">
              {sidebarMenu.flatMap(s => s.items).map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;
                if (!hasRoleAccess(item.id, sessionUser.role)) return null;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      handleLogActivity('Navigation', `Investigator navigated to workspace tab: "${item.label}"`);
                    }}
                    className={`h-full px-4 text-xs font-semibold flex items-center gap-2 border-r border-zinc-850 cursor-pointer transition-all ${
                      isActive 
                        ? `bg-zinc-950 ${themeConfig.accentText} border-t-2 border-t-${themeConfig.accentColor}-500 font-bold`
                        : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
            {/* Collapse Side Docks Button */}
            <div className="flex items-center space-x-1.5 px-3">
              <button 
                onClick={() => setDockLeftOpen(!dockLeftOpen)}
                className={`p-1 rounded cursor-pointer border border-zinc-800 hover:bg-zinc-850 text-[10px] font-mono ${dockLeftOpen ? 'text-blue-400 bg-blue-500/5' : 'text-zinc-500'}`}
                title="Toggle Left Explorer Dock"
              >
                L-Dock
              </button>
              <button 
                onClick={() => setDockRightOpen(!dockRightOpen)}
                className={`p-1 rounded cursor-pointer border border-zinc-800 hover:bg-zinc-850 text-[10px] font-mono ${dockRightOpen ? 'text-blue-400 bg-blue-500/5' : 'text-zinc-500'}`}
                title="Toggle Right Performance Dock"
              >
                R-Dock
              </button>
            </div>
          </div>

          {/* Active Screen Tab Injector viewport */}
          <main className="flex-1 p-5 overflow-y-auto bg-zinc-950 relative">
            {activeTab === 'dashboard' && (
              <DashboardTab 
                device={selectedDevice} 
                status={status} 
                evidenceFiles={evidenceFiles} 
                logs={logs}
                onNavigate={(tab) => {
                  setActiveTab(tab);
                  handleLogActivity('Navigation', `Routed from dashboard link to "${tab}" panel.`);
                }} 
              />
            )}

            {activeTab === 'devices' && (
              <ConnectedDevicesTab />
            )}

            {activeTab === 'ai_analysis' && (
              <AIAnalysisTab onLogActivity={handleLogActivity} />
            )}

            {activeTab === 'explorer' && (
              <EvidenceExplorerTab
                evidenceFiles={evidenceFiles}
                status={status}
                onAnalyzeDatabase={handleAnalyzeDatabase}
                onLogActivity={handleLogActivity}
              />
            )}

            {activeTab === 'sqlite' && (
              <SQLiteAnalyzerTab
                initialSelectedDb={initialSelectedDb}
                onLogActivity={handleLogActivity}
              />
            )}

            {activeTab === 'timeline' && (
              <TimelineTab
                onLogActivity={handleLogActivity}
              />
            )}

            {activeTab === 'location' && (
              <LocationHistoryTab />
            )}

            {activeTab === 'deleted_artifacts' && (
              <DeletedArtifactsTab />
            )}

            {activeTab === 'hash' && (
              <HashVerificationTab
                evidenceFiles={evidenceFiles}
                status={status}
                onLogActivity={handleLogActivity}
              />
            )}

            {activeTab === 'user_management' && (
              <UserManagementTab />
            )}

            {activeTab === 'audit_logs' && (
              <AuditLogsTab />
            )}

            {activeTab === 'settings' && (
              <SettingsTab
                settings={settings}
                onSaveSettings={(newSettings) => {
                  setSettings(newSettings);
                  handleLogActivity('Settings Manager', 'Saved global configurations.');
                }}
                onLogActivity={handleLogActivity}
              />
            )}
          </main>
        </div>

        {/* MOCK RIGHT DOCK: REAL-TIME HARDWARE MONITOR */}
        {dockRightOpen && (
          <aside className="w-[200px] bg-zinc-900/90 border-l border-zinc-850 flex flex-col justify-between shrink-0 transition-all duration-300 overflow-hidden hidden xl:flex">
            <div className="flex-1 flex flex-col min-h-0">
              <div className="h-9 px-3 border-b border-zinc-850 bg-zinc-950 flex items-center justify-between shrink-0">
                <span className="text-[9px] font-black tracking-widest text-zinc-400 uppercase font-mono flex items-center gap-1.5">
                  <Activity className={`w-3.5 h-3.5 ${themeConfig.accentText}`} /> PERFORMANCE
                </span>
                <button onClick={() => setDockRightOpen(false)} className="p-0.5 hover:bg-zinc-850 rounded text-zinc-500 hover:text-zinc-300 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </div>

              {/* Hardware stats graphics */}
              <div className="p-3 space-y-4 font-mono text-[10px]">
                
                {/* CPU Utilization */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-zinc-400 font-bold">
                    <span>CPU LOAD</span>
                    <span>{perfCpu}%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-850">
                    <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${perfCpu}%` }} />
                  </div>
                </div>

                {/* RAM Allocation */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-zinc-400 font-bold">
                    <span>RAM USAGE</span>
                    <span>{perfRam}%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-850">
                    <div className="h-full bg-purple-500 transition-all duration-300" style={{ width: `${perfRam}%` }} />
                  </div>
                </div>

                {/* Disk Space */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-zinc-400 font-bold">
                    <span>DISK WRITE</span>
                    <span>1.2 MB/s</span>
                  </div>
                  <div className="h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-850">
                    <div className="h-full bg-cyan-500 transition-all duration-300 animate-pulse" style={{ width: '15%' }} />
                  </div>
                </div>

                {/* GPU Core */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-zinc-400 font-bold">
                    <span>GPU CORES</span>
                    <span>4.1%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-850">
                    <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: '4%' }} />
                  </div>
                </div>

                <div className="h-[1px] bg-zinc-800 my-2" />

                {/* Threads monitoring */}
                <div className="bg-zinc-950 border border-zinc-850 p-2 rounded text-[9px] space-y-1">
                  <span className="text-zinc-500 font-bold uppercase block">QTHREAD POOL STATUS</span>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Active Workers:</span>
                    <span className="font-bold text-blue-400">Idle (0/4)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Task Scheduler:</span>
                    <span className="font-bold text-zinc-500">Sleep State</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Active Mutex:</span>
                    <span className="font-bold text-emerald-400">Released</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick logout link */}
            <div className="p-3 border-t border-zinc-850 bg-zinc-950/40 text-center">
              <button 
                onClick={handleLogout} 
                className="text-[10px] font-mono font-bold text-zinc-500 hover:text-rose-400 transition-colors uppercase cursor-pointer"
              >
                Logout Session
              </button>
            </div>
          </aside>
        )}

      </div>

      {/* 5. DOCKABLE STATUS BAR INDICATORS */}
      <footer className="h-6 bg-zinc-900 border-t border-zinc-850 px-4 flex items-center justify-between text-[10px] font-mono select-none text-zinc-500 shrink-0">
        <div className="flex items-center space-x-4">
          <span className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full inline-block ${status === 'CONNECTED' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            ADB_DAEMON: {status === 'CONNECTED' ? 'ACTIVE' : 'IDLE'}
          </span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">QThread Pool: Max 4 Threads</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <span>Examiner: {sessionUser.fullname}</span>
          <span>|</span>
          <span>Security Audit Trail: Lock Active</span>
        </div>
      </footer>

      {/* COMMAND PALETTE WINDOW OVERLAY (Ctrl+P) */}
      {cmdPaletteOpen && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-start justify-center pt-24 p-4" onClick={() => setCmdPaletteOpen(false)}>
          <div 
            className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-4 space-y-3" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-[10px] font-black tracking-widest text-zinc-500 uppercase font-mono">FORENSIC COMMAND PALETTE SPOTLIGHT</span>
              <button onClick={() => setCmdPaletteOpen(false)} className="p-0.5 hover:bg-zinc-800 rounded text-zinc-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCommandRun}>
              <input
                type="text"
                autoFocus
                placeholder="Ketik perintah (e.g. '/theme dark-green', '/lock', '/ocr', '/clear-cache')..."
                value={cmdQuery}
                onChange={(e) => setCmdQuery(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-xs text-zinc-200 outline-none focus:border-blue-500 font-mono"
              />
            </form>

            <div className="text-[9px] text-zinc-500 font-mono space-y-1 pt-1">
              <span className="font-bold text-zinc-400 block">PERINTAH UTAMA:</span>
              <div className="grid grid-cols-2 gap-1">
                <span>• <code className="text-zinc-300">/theme dark-green</code> - Ubah tema ke Green</span>
                <span>• <code className="text-zinc-300">/theme dark-red</code> - Ubah tema ke Red</span>
                <span>• <code className="text-zinc-300">/lock</code> - Mengunci aplikasi manual</span>
                <span>• <code className="text-zinc-300">/clear-cache</code> - Bersihkan index local cache</span>
                <span>• <code className="text-zinc-300">/ocr</code> - Buka offline AI OCR scanner</span>
                <span>• <code className="text-zinc-300">/detect</code> - Hubungkan USB / ADB</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION CORNER */}
      <div className="fixed bottom-8 right-6 space-y-2 z-50">
        {showToasts.map((toast, idx) => (
          <div 
            key={idx} 
            className={`bg-zinc-900 border ${themeConfig.accentBorder} ${themeConfig.accentGlow} text-zinc-200 px-4 py-3 rounded-xl flex items-center space-x-3 text-xs font-bold font-mono animate-in fade-in slide-in-from-bottom-4 duration-300`}
          >
            <span className={`w-2 h-2 rounded-full ${themeConfig.accentBg} animate-ping`} />
            <span>{toast}</span>
          </div>
        ))}
      </div>

      {/* APP LOCK SCREEN RE-AUTHENTICATION */}
      {isAppLocked && (
        <div className="fixed inset-0 bg-zinc-950/96 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-red-500/30 p-6 rounded-2xl shadow-2xl shadow-red-950/35 space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex flex-col items-center space-y-2">
              <div className="p-3 bg-red-500/10 text-red-500 rounded-full border border-red-500/20 animate-pulse">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-base font-black tracking-widest text-red-500 uppercase font-mono">LOCKDOWN KEAMANAN</h2>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider font-mono">RE-AUTHENTICATION REQUIRED</p>
            </div>

            <div className="p-3.5 bg-zinc-950 border border-zinc-850 rounded-lg text-xs text-zinc-400 font-mono text-left">
              <p className="font-bold text-zinc-400 uppercase text-[9px] tracking-wide">Alasan Lockdown:</p>
              <p className="mt-1 text-red-400 leading-relaxed text-[11px]">{lockReason || 'Pemantauan biometrik mendeteksi deviasi/ketidakhadiran pengguna.'}</p>
            </div>

            {unlockError && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg font-semibold font-mono text-center">
                {unlockError}
              </div>
            )}

            <form onSubmit={handleUnlockWithPassword} className="space-y-3">
              <div className="space-y-1 text-left">
                <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Password Investigator: {sessionUser.fullname}</label>
                <input
                  type="password"
                  value={lockPassword}
                  onChange={(e) => setLockPassword(e.target.value)}
                  disabled={isUnlocking}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-red-500 text-center font-mono"
                  placeholder="••••••••••••"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={isUnlocking}
                  onClick={handleUnlockWithFace}
                  className="py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 font-mono"
                >
                  <Camera className="w-4 h-4" /> RE-SCAN WAJAH
                </button>
                
                <button
                  type="submit"
                  disabled={isUnlocking}
                  className="py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 font-mono"
                >
                  <LockIcon className="w-4 h-4" /> VERIFIKASI SANDI
                </button>
              </div>
            </form>

            <button
              onClick={handleLogout}
              className="text-[10px] text-zinc-500 hover:text-zinc-300 font-mono underline block mx-auto cursor-pointer"
            >
              Logout Sesi Saat Ini
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
