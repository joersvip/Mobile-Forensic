'use client';

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Smartphone, Download, FolderTree, Database, 
  Clock, Search, Copy, FileDigit, FileText, Terminal, Sliders, Menu, X, Shield, Cpu, MapPin, ShieldAlert, LogOut, Lock as LockIcon, RefreshCw, Camera
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

// Crypto Helpers
import { initializeDatabase, hashPassword, getClientPlatformInfo } from '../lib/crypto-helper';

export default function ForensicPage() {
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
      const timer = setTimeout(() => {
        setSettings(prev => ({
          ...prev,
          examinerName: sessionUser.fullname,
          organization: sessionUser.role === 'Administrator' 
            ? 'Polda Metro Jaya - Admin Unit' 
            : sessionUser.role === 'Examiner' 
              ? 'Polda Metro Jaya - Cyber Crime Unit' 
              : 'Polda Metro Jaya - Case Reviewer'
        }));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [sessionUser]);

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
        itemId === 'hash'
      );
    }
    return false;
  };

  // Enforce RBAC redirects
  useEffect(() => {
    if (sessionUser && !hasRoleAccess(activeTab, sessionUser.role)) {
      const timer = setTimeout(() => {
        setActiveTab('dashboard');
      }, 0);
      return () => clearTimeout(timer);
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
    handleLogActivity('ADB Handshake', `Established daemon link with: ${selectedDevice?.model}`);
  };

  const handleDisconnect = () => {
    setStatus('DISCONNECTED');
    handleLogActivity('ADB Handshake', 'ADB link terminated by investigator.');
  };

  const handleStartAcquisition = () => {
    setStatus('ACQUIRED');
    handleLogActivity('Acquisition Engine', 'Saved completed logical file block targets to filesystem case folder.');
  };

  // Navigations between modules
  const handleAnalyzeDatabase = (dbName: string) => {
    setInitialSelectedDb(dbName);
    setActiveTab('sqlite');
    handleLogActivity('Database Router', `Routed investigator from file manager to SQL sandbox with loaded target: "${dbName}"`);
  };

  const handleNavigateToFile = (file: EvidenceFile) => {
    setActiveTab('explorer');
    handleLogActivity('Search Router', `Routed investigator from index match logs directly to file explorer preview of: "${file.name}"`);
  };

  const handleClearLogs = () => {
    setLogs([]);
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
  };

  // Sidebar sections configuration - 11 specific menu options requested by user
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
        { id: 'location', label: 'Location History', icon: MapPin },
        { id: 'deleted_artifacts', label: 'Deleted Artifact Analysis', icon: ShieldAlert },
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
    <div className="flex h-screen overflow-hidden text-zinc-100 font-sans selection:bg-blue-500/30 select-none bg-zinc-950 relative">
      {/* Sidebar Layout */}
      <aside 
        className={`${
          sidebarOpen ? 'w-[250px]' : 'w-0 lg:w-16'
        } shrink-0 bg-zinc-900 border-r border-zinc-800 flex flex-col justify-between transition-all duration-300 z-30 h-full overflow-hidden`}
      >
        <div className="flex-1 flex flex-col min-h-0">
          {/* Sidebar Top Banner */}
          <div className="h-16 border-b border-zinc-800 px-4 flex items-center gap-2.5 bg-zinc-950/80 shrink-0">
            <div className="p-1.5 bg-blue-600 rounded-lg text-white font-black shadow-[0_0_10px_rgba(59,130,246,0.3)] shrink-0">
              <Shield className="w-5 h-5 text-zinc-50" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-xs font-black tracking-widest text-zinc-50 uppercase leading-none font-mono">FORENSIC SUITE</h1>
                <span className="text-[9px] text-blue-400 font-bold uppercase tracking-widest font-mono">v1.2.0 Sandbox</span>
              </div>
            )}
          </div>

          {/* Sidebar Menu Iterations */}
          <div className="p-3 space-y-4 overflow-y-auto flex-1 pr-1">
            {sidebarMenu.map((sec, idx) => {
              const accessibleItems = sec.items.filter(item => hasRoleAccess(item.id, sessionUser.role));
              if (accessibleItems.length === 0) return null;

              return (
                <div key={idx} className="space-y-1">
                  {sidebarOpen && (
                    <span className="text-[9px] font-black tracking-widest text-zinc-500 uppercase px-2 block select-none">
                      {sec.section}
                    </span>
                  )}
                  <div className="space-y-0.5">
                    {accessibleItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id);
                            handleLogActivity('Navigation', `Investigator navigated to module: "${item.label}"`);
                          }}
                          className={`w-full flex items-center gap-3 py-2 px-2.5 rounded-lg text-xs font-semibold transition-all group ${
                            isActive
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-md shadow-blue-950/10'
                              : 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                          }`}
                          title={item.label}
                        >
                          <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-blue-400' : 'text-zinc-500 group-hover:text-blue-500'}`} />
                          {sidebarOpen && <span className="truncate">{item.label}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Continuous Biometric Verifier Daemon */}
        {sidebarOpen && sessionUser && (
          <div className="px-3 pb-3 shrink-0">
            <ContinuousVerifier
              currentUser={sessionUser}
              onLockTriggered={(reason) => {
                setIsAppLocked(true);
                setLockReason(reason);
              }}
            />
          </div>
        )}

        {/* Sidebar Bottom Investigator Profile */}
        {sidebarOpen && (
          <div className="p-3 border-t border-zinc-800 bg-zinc-950/40 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-8 h-8 rounded-full bg-blue-600/10 border border-blue-500/30 flex items-center justify-center font-mono text-xs font-bold text-blue-400 shrink-0 uppercase">
                {sessionUser.username.substring(0, 2)}
              </div>
              <div className="truncate">
                <div className="text-[11px] font-bold text-zinc-200 truncate">{sessionUser.fullname}</div>
                <div className="text-[9px] text-zinc-500 font-mono tracking-wide uppercase font-bold text-blue-400">{sessionUser.role}</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-500/20"
              title="Logout Sesi"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </aside>

      {/* Main Panel Content Wrap */}
      <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950">
        
        {/* Top Header Controls bar */}
        <header className="h-16 border-b border-zinc-800 px-5 flex items-center justify-between bg-zinc-900 shadow-sm shrink-0">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors border border-zinc-800 lg:flex items-center justify-center shrink-0 cursor-pointer"
              title="Toggle Sidebar Menu"
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Investigative Suite</span>
              <h2 className="text-sm font-black font-sans tracking-tight text-zinc-100 flex items-center gap-1.5 uppercase leading-none">
                {sidebarMenu.flatMap(s => s.items).find(i => i.id === activeTab)?.label || 'Dashboard'}
              </h2>
            </div>
          </div>

          {/* Header Action Badges and stats */}
          <div className="flex items-center space-x-3.5 text-xs">
            {/* Encryption badge */}
            {status !== 'DISCONNECTED' && selectedDevice && (
              <span className="px-2 py-1 rounded bg-purple-950/30 text-purple-400 border border-purple-500/10 font-bold font-mono text-[9px] uppercase tracking-wider hidden sm:inline-block">
                KNOX/STATE: SECURE
              </span>
            )}

            {/* Connection Banner */}
            <div className={`px-2.5 py-1 rounded-full text-[9px] uppercase font-bold tracking-wider border flex items-center gap-1.5 select-none ${
              status === 'DISCONNECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
              status === 'CONNECTED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
              status === 'ACQUIRING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
              'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full inline-block ${
                status === 'DISCONNECTED' ? 'bg-red-500' :
                status === 'CONNECTED' ? 'bg-blue-500 animate-pulse' :
                status === 'ACQUIRING' ? 'bg-amber-500 animate-spin' :
                'bg-emerald-500'
              }`} />
              {status}
            </div>
          </div>
        </header>

        {/* Core Screen Space with tab injection router */}
        <main className="flex-1 p-5 overflow-y-auto">
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

      {/* Security App Lock Screen Overlay */}
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
