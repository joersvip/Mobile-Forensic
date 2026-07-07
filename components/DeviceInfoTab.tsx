'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Smartphone, Terminal, Cpu, HardDrive, ShieldAlert, Check, RefreshCw, ChevronRight } from 'lucide-react';
import { DeviceProfile, ConnectionStatus } from '../types/forensic';

interface DeviceInfoTabProps {
  devices: DeviceProfile[];
  selectedDevice: DeviceProfile | null;
  status: ConnectionStatus;
  onSelectDevice: (device: DeviceProfile) => void;
  onConnect: () => void;
  onDisconnect: () => void;
  onLogActivity: (module: string, activity: string) => void;
}

export default function DeviceInfoTab({
  devices,
  selectedDevice,
  status,
  onSelectDevice,
  onConnect,
  onDisconnect,
  onLogActivity
}: DeviceInfoTabProps) {
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalLogs, setTerminalLogs] = useState<{ type: 'input' | 'output' | 'error'; text: string }[]>([
    { type: 'output', text: 'Android Debug Bridge (ADB) Daemon Active.' },
    { type: 'output', text: 'Type "help" to view a list of forensic extraction commands.' }
  ]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.trim();
    if (!cmd) return;

    const newLogs = [...terminalLogs, { type: 'input' as const, text: `$ ${cmd}` }];
    setTerminalInput('');

    // Pre-processing
    if (cmd.toLowerCase() === 'clear') {
      setTerminalLogs([]);
      return;
    }

    if (cmd.toLowerCase() === 'help') {
      setTerminalLogs([
        ...newLogs,
        { type: 'output', text: 'Available commands:' },
        { type: 'output', text: '  adb devices                       - Lists all connected mobile targets' },
        { type: 'output', text: '  adb shell getprop ro.product.model - Extracts device manufacturer model' },
        { type: 'output', text: '  adb shell pm list packages        - Lists installed application packages' },
        { type: 'output', text: '  adb shell getprop                 - Dumps all build configuration properties' },
        { type: 'output', text: '  adb shell pm list permissions     - Lists system-wide granted permissions' },
        { type: 'output', text: '  adb shell ls -la /sdcard/         - Traverses user storage blocks' },
        { type: 'output', text: '  clear                             - Clears forensic terminal history' }
      ]);
      return;
    }

    if (status === 'DISCONNECTED') {
      setTerminalLogs([
        ...newLogs,
        { type: 'error', text: 'Error: No active device connected via ADB daemon. Run "adb devices" or connect a profile.' }
      ]);
      return;
    }

    if (!selectedDevice) return;

    // Simulated terminal outputs
    setTimeout(() => {
      let responseText = '';
      let isError = false;

      if (cmd === 'adb devices') {
        responseText = `List of devices attached\n${selectedDevice.androidId}\tdevice usb:1-1 product:${selectedDevice.product} model:${selectedDevice.model.split(' ')[0]}`;
      } else if (cmd === 'adb shell getprop ro.product.model') {
        responseText = selectedDevice.model;
      } else if (cmd === 'adb shell getprop ro.build.version.release') {
        responseText = selectedDevice.androidVersion;
      } else if (cmd === 'adb shell pm list packages') {
        responseText = `package:com.whatsapp\npackage:org.telegram.messenger\npackage:org.thoughtcrime.securesms\npackage:com.lexa.fakegps\npackage:org.torproject.android\npackage:com.topjohnwu.magisk\npackage:com.android.settings\npackage:com.google.android.gms`;
      } else if (cmd === 'adb shell ls -la /sdcard/') {
        responseText = `drwxrwx--- root     everybody          2026-07-06 10:02 .
drwxrwx--- root     everybody          2026-07-06 10:02 ..
drwxrwx--- media_rw media_rw           2026-07-06 10:18 Documents
drwxrwx--- media_rw media_rw           2026-07-05 11:00 Download
drwxrwx--- media_rw media_rw           2026-07-05 14:10 DCIM
drwxrwx--- media_rw media_rw           2026-07-06 10:02 Pictures
drwxrwx--- media_rw media_rw           2026-07-04 15:35 VoiceRecorder`;
      } else if (cmd === 'adb shell getprop') {
        responseText = `[ro.product.brand]: [${selectedDevice.brand}]
[ro.product.model]: [${selectedDevice.model}]
[ro.product.device]: [${selectedDevice.product}]
[ro.build.version.sdk]: [34]
[ro.build.version.security_patch]: [${selectedDevice.securityPatch}]
[ro.hardware]: [qcom]
[ro.crypto.state]: [encrypted]
[ro.crypto.type]: [file]`;
      } else if (cmd === 'adb shell pm list permissions') {
        responseText = `permission:android.permission.CAMERA\npermission:android.permission.RECORD_AUDIO\npermission:android.permission.READ_CONTACTS\npermission:android.permission.ACCESS_FINE_LOCATION\npermission:android.permission.READ_SMS\npermission:android.permission.WRITE_EXTERNAL_STORAGE`;
      } else {
        responseText = `bash: ${cmd}: command not found. Type "help" for a list of forensic modules.`;
        isError = true;
      }

      setTerminalLogs(prev => [
        ...prev,
        { type: isError ? 'error' : 'output', text: responseText }
      ]);
      onLogActivity('ADB Shell', `Exited terminal command: "${cmd}"`);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Device Connection Setup */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device selection profile panel */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-blue-500" />
              TARGET PROFILES
            </h3>
            
            <p className="text-xs text-zinc-400 mb-4">
              Select a pre-configured Android USB target or load a local custom backup profile to begin live diagnostic verification.
            </p>
+
            <div className="space-y-3">
              {devices.map((dev) => (
                <button
                  key={dev.id}
                  onClick={() => status === 'DISCONNECTED' && onSelectDevice(dev)}
                  disabled={status !== 'DISCONNECTED'}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                    selectedDevice?.id === dev.id
                      ? 'bg-blue-500/10 border-blue-500 text-blue-400 font-semibold'
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                  } ${status !== 'DISCONNECTED' && 'opacity-60 cursor-not-allowed'}`}
                >
                  <div>
                    <div className="text-xs font-bold uppercase font-mono">{dev.brand}</div>
                    <div className="text-sm mt-0.5">{dev.model.split(' (')[0]}</div>
                  </div>
                  {selectedDevice?.id === dev.id && <Check className="w-4 h-4 text-blue-500" />}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-800/80 mt-6 flex gap-3">
            {status === 'DISCONNECTED' ? (
              <button
                onClick={onConnect}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_2px_10px_rgba(59,130,246,0.2)]"
              >
                <RefreshCw className="w-4 h-4" /> Connect via ADB
              </button>
            ) : (
              <button
                onClick={onDisconnect}
                disabled={status === 'ACQUIRING'}
                className="flex-1 py-2.5 bg-red-950 hover:bg-red-900 border border-red-500/20 text-red-200 font-semibold rounded-lg text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                Disconnect Daemon
              </button>
            )}
          </div>
        </div>

        {/* Detailed profile table column */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-500" />
            LIVE DEVICE PARAMETERS
          </h3>

          {selectedDevice ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-zinc-800/50">
                <span className="text-zinc-500">Brand / Manufacturer</span>
                <span className="text-zinc-200 font-semibold">{selectedDevice.brand}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-800/50">
                <span className="text-zinc-500">Model ID</span>
                <span className="text-zinc-200 font-mono font-semibold">{selectedDevice.model}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-800/50">
                <span className="text-zinc-500">Android Version</span>
                <span className="text-zinc-200 font-semibold">{selectedDevice.androidVersion}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-800/50">
                <span className="text-zinc-500">Build Signature</span>
                <span className="text-zinc-400 font-mono truncate max-w-[150px]" title={selectedDevice.buildNumber}>{selectedDevice.buildNumber}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-800/50">
                <span className="text-zinc-500">CPU Architecture</span>
                <span className="text-zinc-200 font-semibold">{selectedDevice.cpu}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-800/50">
                <span className="text-zinc-500">RAM Capability</span>
                <span className="text-zinc-200 font-semibold">{selectedDevice.ram}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-800/50">
                <span className="text-zinc-500">Android Unique ID</span>
                <span className="text-zinc-200 font-mono font-semibold">{selectedDevice.androidId}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-800/50">
                <span className="text-zinc-500">IMEI Checksum</span>
                <span className="text-zinc-200 font-mono font-semibold">{selectedDevice.imei}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-800/50">
                <span className="text-zinc-500">IMSI / SIM Card</span>
                <span className="text-zinc-200 font-mono font-semibold">{selectedDevice.imsi}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-800/50">
                <span className="text-zinc-500">Encryption Profile</span>
                <span className="text-zinc-200 font-semibold text-right max-w-[150px] truncate" title={selectedDevice.encryptionStatus}>{selectedDevice.encryptionStatus}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-800/50 md:border-none">
                <span className="text-zinc-500">Knox / Bootloader State</span>
                <span className={`font-semibold ${selectedDevice.bootloader === 'Locked' ? 'text-emerald-400' : 'text-red-400'}`}>{selectedDevice.bootloader}</span>
              </div>
              <div className="flex justify-between py-1.5 md:border-none">
                <span className="text-zinc-500">Root Permissions</span>
                <span className={`font-semibold ${selectedDevice.rootStatus.includes('Rooted') ? 'text-red-400 font-bold' : 'text-emerald-400'}`}>{selectedDevice.rootStatus.split(' (')[0]}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 border border-dashed border-zinc-800 rounded-lg p-5">
              <Smartphone className="w-10 h-10 text-zinc-700 mb-2 animate-bounce" />
              <p className="text-xs text-zinc-500 text-center uppercase font-semibold">ADB DAEMON STANDBY</p>
              <p className="text-[10px] text-zinc-600 text-center mt-1">Please select a target device profile and establish connection.</p>
            </div>
          )}
        </div>
      </div>

      {/* Terminal emulator */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden font-mono text-xs shadow-2xl">
        <div className="bg-zinc-900 px-4 py-2 border-b border-zinc-800 flex items-center justify-between text-zinc-400">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-blue-500" />
            <span className="text-xs uppercase font-semibold text-zinc-200 tracking-wide">ADB Interactive Console</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
          </div>
        </div>

        <div className="p-4 h-[240px] overflow-y-auto space-y-2 select-text antialiased leading-relaxed">
          {terminalLogs.map((log, idx) => (
            <div 
              key={idx} 
              className={`whitespace-pre-wrap ${
                log.type === 'input' ? 'text-blue-400 font-bold' : 
                log.type === 'error' ? 'text-red-400 font-semibold' : 'text-zinc-300'
              }`}
            >
              {log.text}
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>

        <form onSubmit={handleCommandSubmit} className="bg-zinc-900 border-t border-zinc-800 p-2 flex items-center space-x-2">
          <ChevronRight className="w-4 h-4 text-blue-500" />
          <input
            type="text"
            value={terminalInput}
            onChange={(e) => setTerminalInput(e.target.value)}
            placeholder="adb shell getprop ro.product.model"
            className="flex-1 bg-transparent border-none text-zinc-100 placeholder-zinc-600 outline-none focus:ring-0"
          />
        </form>
      </div>
    </div>
  );
}
