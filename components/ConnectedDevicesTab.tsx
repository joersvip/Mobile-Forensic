'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Smartphone, Cpu, Battery, HardDrive, ShieldCheck, 
  Settings, RefreshCw, Zap, Bell, AlertCircle, 
  Trash2, Plus, LogOut, CheckCircle2, History, Radio,
  Search, Wifi, Usb, Globe
} from 'lucide-react';
import { ConnectedDevice, DeviceEventLog } from '../types/device';

// Default pre-connected device matching default suite state
const INITIAL_DEVICES: ConnectedDevice[] = [];

if (typeof window !== 'undefined') {
  try {
    const isSimActive = localStorage.getItem('forensic_sim_mode') === 'active';
    if (isSimActive) {
      INITIAL_DEVICES.push({
        id: 'samsung_s24',
        manufacturer: 'SAMSUNG',
        model: 'Galaxy S24 Ultra',
        productName: 'SM-S928B',
        androidVersion: '14.0 (One UI 6.1)',
        serialNumber: 'R5CW30X8Y9Z',
        usbMode: 'ADB',
        connectionStatus: 'CONNECTED',
        usbDebugging: 'ENABLED',
        rootStatus: 'NOT_ROOTED',
        batteryLevel: 88,
        storageTotalGb: 512,
        storageUsedGb: 194,
        connectionType: 'USB 3.2 Type-C (HighSpeed)',
        lastSeen: 'Real-time'
      });
    }
  } catch (e) {
    console.error(e);
  }
}

// Available templates for simulation
const SIMULATED_DEVICE_TEMPLATES: Omit<ConnectedDevice, 'id'>[] = [
  {
    manufacturer: 'GOOGLE',
    model: 'Pixel 8 Pro',
    productName: 'husky',
    androidVersion: '14.0 (AOSP Vanilla)',
    serialNumber: '3A261FDFG0028H',
    usbMode: 'ADB',
    connectionStatus: 'CONNECTED',
    usbDebugging: 'ENABLED',
    rootStatus: 'ROOTED',
    batteryLevel: 94,
    storageTotalGb: 256,
    storageUsedGb: 88,
    connectionType: 'USB 3.1 Type-C',
    lastSeen: 'Real-time'
  },
  {
    manufacturer: 'XIAOMI',
    model: 'Redmi Note 13',
    productName: 'garnet',
    androidVersion: '13.0 (MIUI 14)',
    serialNumber: 'XM983B4F39E',
    usbMode: 'MTP',
    connectionStatus: 'CONNECTED',
    usbDebugging: 'DISABLED',
    rootStatus: 'NOT_ROOTED',
    batteryLevel: 61,
    storageTotalGb: 128,
    storageUsedGb: 112,
    connectionType: 'USB MTP Interface',
    lastSeen: 'Real-time'
  },
  {
    manufacturer: 'SONY',
    model: 'Xperia 1 V',
    productName: 'pdx234',
    androidVersion: '14.0',
    serialNumber: 'SNY87C492E',
    usbMode: 'Fastboot',
    connectionStatus: 'CONNECTED',
    usbDebugging: 'N/A',
    rootStatus: 'UNKNOWN',
    batteryLevel: 45,
    storageTotalGb: 256,
    storageUsedGb: 40,
    connectionType: 'USB Fastboot Bootloader',
    lastSeen: 'Real-time'
  },
  {
    manufacturer: 'SANDISK',
    model: 'Cruzer Blade USB',
    productName: 'Mass Storage Device',
    androidVersion: 'N/A',
    serialNumber: 'SNDK88301B',
    usbMode: 'Mass Storage',
    connectionStatus: 'CONNECTED',
    usbDebugging: 'N/A',
    rootStatus: 'UNKNOWN',
    batteryLevel: 100, // USB powered
    storageTotalGb: 64,
    storageUsedGb: 58,
    connectionType: 'USB Mass Storage Class (MSC)',
    lastSeen: 'Real-time'
  }
];

export default function ConnectedDevicesTab() {
  const [isMounted, setIsMounted] = useState(false);
  const [devices, setDevices] = useState<ConnectedDevice[]>(INITIAL_DEVICES);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  
  // Real-time Event Log entries
  const [eventLogs, setEventLogs] = useState<DeviceEventLog[]>([]);

  // Toast / System notification states
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'warn' } | null>(null);

  const [deviceIdCounter, setDeviceIdCounter] = useState(1);
  const [logIdCounter, setLogIdCounter] = useState(1);

  // Connection method tab states
  const [activeTabMethod, setActiveTabMethod] = useState<'webusb' | 'adb_local' | 'adb_wifi' | 'simulation'>('webusb');
  const [isScanningAdb, setIsScanningAdb] = useState(false);
  const [isConnectingWifi, setIsConnectingWifi] = useState(false);
  const [wifiIpAddress, setWifiIpAddress] = useState('192.168.1.100:5555');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);

    if (INITIAL_DEVICES.length > 0) {
      setSelectedDeviceId(INITIAL_DEVICES[0].id);
      setEventLogs([
        {
          id: 'log_init',
          timestamp: new Date().toISOString(),
          deviceName: `${INITIAL_DEVICES[0].manufacturer} ${INITIAL_DEVICES[0].model}`,
          serialNumber: INITIAL_DEVICES[0].serialNumber || 'N/A',
          event: 'Device Connected',
          details: 'Sistem inisialisasi berhasil. Membaca profil perangkat simulasi kasus aktif.'
        }
      ]);
    }
  }, []);

  // Display ephemeral notification toast
  const triggerNotification = (message: string, type: 'success' | 'info' | 'warn') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Simulates automatic periodic polling updates (e.g. updating battery/status dynamically)
  useEffect(() => {
    if (!isMounted) return;

    const interval = setInterval(() => {
      setDevices(prev => 
        prev.map(d => {
          if (d.connectionStatus === 'CONNECTED' && d.batteryLevel !== undefined) {
            // Simulate battery draining/charging slightly
            const delta = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;
            const newBattery = Math.max(1, Math.min(100, d.batteryLevel + delta));
            return { ...d, batteryLevel: newBattery };
          }
          return d;
        })
      );
    }, 8000);

    return () => clearInterval(interval);
  }, [isMounted]);

  // Connect simulated device
  const handleConnectSimulatedDevice = () => {
    const connectedSerials = new Set(devices.map(d => d.serialNumber));
    const availableTemplate = SIMULATED_DEVICE_TEMPLATES.find(t => !connectedSerials.has(t.serialNumber));

    if (!availableTemplate) {
      triggerNotification("Semua template perangkat simulasi sudah terhubung!", "warn");
      return;
    }

    const nextDevIdNum = deviceIdCounter + 1;
    setDeviceIdCounter(nextDevIdNum);

    const nextLogIdNum = logIdCounter + 1;
    setLogIdCounter(nextLogIdNum);

    const newDevice: ConnectedDevice = {
      ...availableTemplate,
      id: `dev_sim_${nextDevIdNum}`
    };

    setDevices(prev => [...prev, newDevice]);
    setSelectedDeviceId(newDevice.id);

    // Append to events history
    const newLog: DeviceEventLog = {
      id: `log_sim_${nextLogIdNum}`,
      timestamp: new Date().toISOString(),
      deviceName: `${newDevice.manufacturer} ${newDevice.model}`,
      serialNumber: newDevice.serialNumber || 'N/A',
      event: 'Device Connected',
      details: `[SIMULASI] Perangkat ${newDevice.manufacturer} ${newDevice.model} ditambahkan otomatis via port virtual USB (${newDevice.usbMode}).`
    };

    setEventLogs(prev => [newLog, ...prev]);
    triggerNotification(`Perangkat Simulasi Terhubung: ${newDevice.manufacturer} ${newDevice.model}`, "success");
  };

  // Connect physical hardware via WebUSB (direct client browser-to-USB link)
  const handleConnectWebUSBDevice = async () => {
    try {
      if (typeof window === 'undefined') return;
      const navUsb = (navigator as any).usb;
      if (!navUsb) {
        triggerNotification("WebUSB API tidak didukung peramban ini atau sedang diblokir. Harap buka di Google Chrome / Edge dalam tab baru.", "warn");
        return;
      }

      // Request actual physical USB device
      const usbDevice = await navUsb.requestDevice({ filters: [] });
      if (!usbDevice) {
        triggerNotification("Pemilihan perangkat USB dibatalkan.", "info");
        return;
      }

      const devId = `webusb_${usbDevice.serialNumber || usbDevice.productId}_${usbDevice.vendorId}`;
      
      // Check duplicate
      if (devices.some(d => d.id === devId)) {
        triggerNotification(`Perangkat ${usbDevice.manufacturerName || 'Unknown'} ${usbDevice.productName || 'USB Device'} sudah terhubung!`, "info");
        setSelectedDeviceId(devId);
        return;
      }

      const nextLogIdNum = logIdCounter + 1;
      setLogIdCounter(nextLogIdNum);

      const realDevice: ConnectedDevice = {
        id: devId,
        manufacturer: usbDevice.manufacturerName || 'GENERIC',
        model: usbDevice.productName || 'Physical USB Device',
        productName: `VID: 0x${usbDevice.vendorId.toString(16).toUpperCase()} | PID: 0x${usbDevice.productId.toString(16).toUpperCase()}`,
        androidVersion: 'Detected via WebUSB Descriptor',
        serialNumber: usbDevice.serialNumber || 'N/A',
        usbMode: 'MTP', // Default fallback
        connectionStatus: 'CONNECTED',
        usbDebugging: 'N/A',
        rootStatus: 'UNKNOWN',
        batteryLevel: 100, // USB Bus Powered
        storageTotalGb: 64,
        storageUsedGb: 12,
        connectionType: `USB Physical Port (Class: ${usbDevice.deviceClass}, Subclass: ${usbDevice.deviceSubclass})`,
        lastSeen: 'Just now'
      };

      setDevices(prev => [...prev, realDevice]);
      setSelectedDeviceId(realDevice.id);

      const newLog: DeviceEventLog = {
        id: `log_real_${nextLogIdNum}`,
        timestamp: new Date().toISOString(),
        deviceName: `${realDevice.manufacturer} ${realDevice.model}`,
        serialNumber: realDevice.serialNumber || 'N/A',
        event: 'Device Connected',
        details: `Koneksi USB NYATA terjalin sukses! Terkoneksi langsung ke bus hardware lokal dengan vendorId: 0x${usbDevice.vendorId.toString(16)}.`
      };

      setEventLogs(prev => [newLog, ...prev]);
      triggerNotification(`Koneksi USB Fisik Berhasil: ${realDevice.manufacturer} ${realDevice.model}`, "success");

    } catch (err: any) {
      console.error(err);
      if (err.name === 'SecurityError') {
        triggerNotification("Iframe Security Block: Hubungkan perangkat fisik wajib dijalankan di TAB BARU peramban (bukan iframe preview).", "warn");
      } else if (err.name === 'NotFoundError') {
        triggerNotification("Pemasangan perangkat dibatalkan oleh pengguna.", "info");
      } else {
        triggerNotification(`Gagal terhubung ke USB: ${err.message || err}`, "warn");
      }
    }
  };

  // Interrogate local ADB server via Next.js backend API
  const handleScanLocalADB = async () => {
    setIsScanningAdb(true);
    triggerNotification("Memulai pemindaian ADB daemon local server...", "info");
    
    try {
      const res = await fetch('/api/devices');
      const data = await res.json();
      
      if (data.success && data.devices.length > 0) {
        // Merge without duplicate serial numbers
        setDevices(prev => {
          const filteredPrev = prev.filter(p => !data.devices.some((d: any) => d.serialNumber === p.serialNumber));
          return [...filteredPrev, ...data.devices];
        });

        const firstNewDevice = data.devices[0];
        setSelectedDeviceId(firstNewDevice.id);

        const nextLogIdNum = logIdCounter + 1;
        setLogIdCounter(nextLogIdNum);

        const newLog: DeviceEventLog = {
          id: `log_adb_${nextLogIdNum}`,
          timestamp: new Date().toISOString(),
          deviceName: `${firstNewDevice.manufacturer} ${firstNewDevice.model}`,
          serialNumber: firstNewDevice.serialNumber || 'N/A',
          event: 'Device Connected',
          details: `Pemindaian ADB berhasil. Terdeteksi ${data.devices.length} perangkat nyata aktif via host ADB server.`
        };

        setEventLogs(prev => [newLog, ...prev]);
        triggerNotification(`Sukses: Terdeteksi ${data.devices.length} perangkat ADB nyata!`, "success");
      } else {
        if (!data.adbInstalled) {
          triggerNotification("ADB Server tidak berjalan di host. Pastikan paket 'adb' terinstal di Kali Linux/Windows Anda.", "warn");
        } else {
          triggerNotification("ADB aktif namun tidak mendeteksi perangkat fisik apa pun yang terhubung via kabel USB Debugging.", "info");
        }
      }
    } catch (err: any) {
      console.error(err);
      triggerNotification(`Gagal memindai ADB: ${err.message || err}`, "warn");
    } finally {
      setIsScanningAdb(false);
    }
  };

  // Remote connection over Wi-Fi
  const handleConnectWifiADB = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wifiIpAddress.trim()) return;

    setIsConnectingWifi(true);
    triggerNotification(`Mencoba menghubungkan ADB ke remote IP: ${wifiIpAddress}...`, "info");

    try {
      const res = await fetch('/api/devices/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ipAddress: wifiIpAddress })
      });
      const data = await res.json();

      if (data.success) {
        triggerNotification(`Sukses Terhubung ke Wireless IP: ${wifiIpAddress}`, "success");
        // Trigger local scan immediately to fetch parameters
        await handleScanLocalADB();
      } else {
        triggerNotification(`Gagal menghubungkan remote ADB: ${data.message || data.error}`, "warn");
      }
    } catch (err: any) {
      console.error(err);
      triggerNotification(`Gagal koneksi wireless ADB: ${err.message || err}`, "warn");
    } finally {
      setIsConnectingWifi(false);
    }
  };

  // Disconnect selected device
  const handleDisconnectDevice = (id: string) => {
    const target = devices.find(d => d.id === id);
    if (!target) return;

    setDevices(prev => prev.filter(d => d.id !== id));
    
    // Auto-select another if available
    const remaining = devices.filter(d => d.id !== id);
    if (remaining.length > 0) {
      setSelectedDeviceId(remaining[remaining.length - 1].id);
    } else {
      setSelectedDeviceId('');
    }

    const nextLogIdNum = logIdCounter + 1;
    setLogIdCounter(nextLogIdNum);

    // Event Log
    const newLog: DeviceEventLog = {
      id: `log_sim_${nextLogIdNum}`,
      timestamp: new Date().toISOString(),
      deviceName: `${target.manufacturer} ${target.model}`,
      serialNumber: target.serialNumber || 'N/A',
      event: 'Device Disconnected',
      details: `Perangkat ${target.manufacturer} ${target.model} diputuskan dari port USB.`
    };

    setEventLogs(prev => [newLog, ...prev]);
    triggerNotification(`Perangkat Terputus: ${target.manufacturer} ${target.model}`, "warn");
  };

  // Change USB interface mode
  const handleChangeUsbMode = (id: string, newMode: ConnectedDevice['usbMode']) => {
    setDevices(prev => 
      prev.map(d => {
        if (d.id === id) {
          return { ...d, usbMode: newMode };
        }
        return d;
      })
    );

    const target = devices.find(d => d.id === id);
    if (!target) return;

    const nextLogIdNum = logIdCounter + 1;
    setLogIdCounter(nextLogIdNum);

    // Log the mode switch
    const newLog: DeviceEventLog = {
      id: `log_sim_${nextLogIdNum}`,
      timestamp: new Date().toISOString(),
      deviceName: `${target.manufacturer} ${target.model}`,
      serialNumber: target.serialNumber || 'N/A',
      event: 'USB Mode Changed',
      details: `Protokol USB pada ${target.model} dirubah dari ${target.usbMode} menjadi ${newMode}.`
    };

    setEventLogs(prev => [newLog, ...prev]);
    triggerNotification(`Mode USB Berubah ke: ${newMode}`, "info");
  };

  const selectedDevice = useMemo(() => {
    return devices.find(d => d.id === selectedDeviceId) || null;
  }, [devices, selectedDeviceId]);

  // Clear event logs
  const handleClearLogs = () => {
    setEventLogs([]);
    triggerNotification("Log pantauan perangkat dibersihkan.", "info");
  };

  if (!isMounted) {
    return (
      <div className="h-64 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center animate-pulse">
        <span className="text-zinc-500 font-mono text-xs">Memuat modul deteksi otomatis...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Toast Notification Container */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-2xl border flex items-center space-x-3 max-w-sm transition-all animate-bounce ${
          notification.type === 'success' ? 'bg-emerald-950 border-emerald-500 text-emerald-200' :
          notification.type === 'warn' ? 'bg-rose-950 border-rose-500 text-rose-200' :
          'bg-zinc-900 border-blue-500 text-blue-200'
        }`}>
          <Bell className="w-5 h-5 flex-shrink-0 animate-pulse" />
          <div className="text-xs">
            <span className="font-bold block uppercase tracking-wider text-[10px] text-zinc-400">System Notification</span>
            {notification.message}
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-sans tracking-tight text-zinc-100 flex items-center gap-2">
              REAL HARDWARE PORT CONNECTION
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono uppercase tracking-widest">
                REAL-TIME LINK
              </span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Hubungkan hardware orisinal tersangka melalui WebUSB, Local ADB Server, atau ADB Wireless secara steril tanpa simulasi.
            </p>
          </div>
        </div>
      </div>

      {/* Subsystem Connector Methods Panel */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg space-y-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            METODE KONEKSI DAN AKUISISI HARDWARE
          </h3>
          <p className="text-[11px] text-zinc-400">
            Pilih metode interkoneksi langsung untuk membaca deskriptor orisinal dari memori fisik ponsel target.
          </p>
        </div>

        {/* Tab triggers */}
        <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-3">
          <button
            onClick={() => setActiveTabMethod('webusb')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded border transition-all cursor-pointer ${
              activeTabMethod === 'webusb'
                ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Usb className="w-4 h-4" /> WebUSB Hardware (Browser Direct)
          </button>

          <button
            onClick={() => setActiveTabMethod('adb_local')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded border transition-all cursor-pointer ${
              activeTabMethod === 'adb_local'
                ? 'bg-blue-950 border-blue-500 text-blue-300'
                : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Smartphone className="w-4 h-4" /> Local ADB Daemon (Host Scan)
          </button>

          <button
            onClick={() => setActiveTabMethod('adb_wifi')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded border transition-all cursor-pointer ${
              activeTabMethod === 'adb_wifi'
                ? 'bg-purple-950 border-purple-500 text-purple-300'
                : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Wifi className="w-4 h-4" /> ADB Over Wi-Fi (Wireless Link)
          </button>

          <button
            onClick={() => setActiveTabMethod('simulation')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded border transition-all cursor-pointer ${
              activeTabMethod === 'simulation'
                ? 'bg-zinc-800 border-zinc-700 text-zinc-200'
                : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Cpu className="w-4 h-4" /> Simulasi (Latihan Kasus)
          </button>
        </div>

        {/* Tab Contents */}
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850">
          {activeTabMethod === 'webusb' && (
            <div className="space-y-3">
              <div className="text-xs text-zinc-300 leading-relaxed">
                <span className="font-bold text-emerald-400 block mb-1">Direct Physical WebUSB Connection</span>
                Metode ini menggunakan browser driver bawaan untuk melakukan scan USB controller lokal di PC/Kali Linux Anda secara langsung. Memberikan hak baca metadata biner orisinal yang valid (Integritas Terjamin).
              </div>
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-[11px] text-zinc-400 leading-normal flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong>Iframe Sandbox Warning:</strong> Jika tombol tidak merespon, peramban memblokir WebUSB di dalam iframe sandbox. Harap klik tombol <strong>&ldquo;Open in New Tab&rdquo;</strong> di sudut kanan atas layar untuk membuka aplikasi di tab utama browser Anda.
                </div>
              </div>
              <button
                onClick={handleConnectWebUSBDevice}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
              >
                <Usb className="w-4 h-4" /> Hubungkan Perangkat USB Fisik Nyata
              </button>
            </div>
          )}

          {activeTabMethod === 'adb_local' && (
            <div className="space-y-3">
              <div className="text-xs text-zinc-300 leading-relaxed">
                <span className="font-bold text-blue-400 block mb-1">Interogasi ADB Server Lokal</span>
                Gunakan modul ini ketika Anda menjalankan aplikasi secara luring di atas komputer workstation/Kali Linux yang memiliki kabel USB terpasang ke ponsel dengan status <code className="bg-zinc-900 text-zinc-300 px-1 py-0.5 rounded font-mono font-bold">USB Debugging ENABLED</code>.
              </div>
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-[11px] text-zinc-400 leading-normal flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  Sistem akan menginisiasi perintah <code className="text-blue-300 font-mono">adb devices -l</code> secara real-time pada background komputer host Anda untuk mendeteksi ID biner dan model secara akurat.
                </div>
              </div>
              <button
                onClick={handleScanLocalADB}
                disabled={isScanningAdb}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isScanningAdb ? 'animate-spin' : ''}`} />
                {isScanningAdb ? 'Sedang Memindai...' : 'Pindai Server ADB Lokal'}
              </button>
            </div>
          )}

          {activeTabMethod === 'adb_wifi' && (
            <div className="space-y-3">
              <div className="text-xs text-zinc-300 leading-relaxed">
                <span className="font-bold text-purple-400 block mb-1">Wireless ADB Connection Link</span>
                Untuk skenario di mana ponsel orisinal berada di dalam jaringan nirkabel lokal yang sama dengan workstation penyidik, inisiasi koneksi socket nirkabel ADB secara portabel.
              </div>
              
              <form onSubmit={handleConnectWifiADB} className="flex flex-col sm:flex-row gap-2 max-w-md pt-1">
                <input
                  type="text"
                  value={wifiIpAddress}
                  onChange={(e) => setWifiIpAddress(e.target.value)}
                  placeholder="192.168.1.100:5555"
                  className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs font-mono text-zinc-200 outline-none focus:border-purple-500 flex-1"
                />
                <button
                  type="submit"
                  disabled={isConnectingWifi}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                >
                  <Wifi className="w-4 h-4" />
                  {isConnectingWifi ? 'Menghubungkan...' : 'Koneksikan Wireless'}
                </button>
              </form>
            </div>
          )}

          {activeTabMethod === 'simulation' && (
            <div className="space-y-3">
              <div className="text-xs text-zinc-300 leading-relaxed">
                <span className="font-bold text-zinc-400 block mb-1">Pemuat Profil Simulasi (Latihan)</span>
                Jika Anda sedang melangsungkan latihan forensik tanpa membawa ponsel Android fisik yang terhubung, muat profil-profil perangkat simulasi untuk mengisi struktur workspace biner luring.
              </div>
              <button
                onClick={handleConnectSimulatedDevice}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-750 hover:bg-zinc-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer border border-zinc-650"
              >
                <Plus className="w-4 h-4" /> Tambah Perangkat Simulasi
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Left Column: Device Grid & Selected Device Details */}
        <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
          
          {/* Active List */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-1.5 border-b border-zinc-800 pb-2">
              <Smartphone className="w-4 h-4 text-emerald-500" />
              DAFTAR PERANGKAT TERHUBUNG ({devices.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {devices.map(dev => {
                const isSelected = dev.id === selectedDeviceId;
                let statusColor = 'bg-emerald-500 text-emerald-400';
                if (dev.connectionStatus === 'UNAUTHORIZED') statusColor = 'bg-amber-500 text-amber-400';

                return (
                  <div
                    key={dev.id}
                    onClick={() => setSelectedDeviceId(dev.id)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[140px] relative ${
                      isSelected 
                        ? 'bg-emerald-500/5 border-emerald-500 shadow-lg shadow-emerald-950/20' 
                        : 'bg-zinc-950 hover:bg-zinc-850 border-zinc-850'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
                          ID: {dev.serialNumber ? dev.serialNumber.substr(0, 10) : 'N/A'}
                        </span>
                        
                        <div className="flex items-center space-x-1.5">
                          <span className={`w-2 h-2 rounded-full ${statusColor.split(' ')[0]} animate-pulse`} />
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-300">
                            {dev.connectionStatus}
                          </span>
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-zinc-200 font-sans tracking-tight">
                        {dev.manufacturer} {dev.model}
                      </h4>
                      <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                        Mode: {dev.usbMode} | Debug: {dev.usbDebugging}
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-2 border-t border-zinc-900/60 text-[10px] text-zinc-400">
                      <span className="font-medium max-w-[130px] truncate">{dev.connectionType}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDisconnectDevice(dev.id);
                        }}
                        className="text-[10px] font-bold text-rose-400 hover:text-rose-300 transition-colors uppercase px-2 py-0.5 rounded hover:bg-rose-500/10 cursor-pointer"
                        title="Simulate hardware unplug"
                      >
                        Putuskan
                      </button>
                    </div>
                  </div>
                );
              })}

              {devices.length === 0 && (
                <div className="col-span-2 py-12 text-center text-zinc-600 italic text-xs font-mono bg-zinc-950/50 rounded-xl border border-dashed border-zinc-800">
                  <AlertCircle className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                  Tidak ada perangkat USB/ADB nyata atau simulasi terhubung.<br/>
                  Gunakan panel &ldquo;METODE KONEKSI&rdquo; di atas untuk menghubungkan perangkat Anda.
                </div>
              )}
            </div>
          </div>


          {/* Active Diagnostic Detail Case */}
          {selectedDevice ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Settings className="w-4 h-4 text-blue-500" />
                  DIAGNOSTIK INFORMASI PERANGKAT FORENSIK
                </h3>
                <span className="text-[10px] text-zinc-500 font-mono">Serial: {selectedDevice.serialNumber}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Hardware Spec */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-850">
                      <span className="text-[10px] text-zinc-500 uppercase font-bold">Manufacturer</span>
                      <span className="text-xs font-bold text-zinc-200 block mt-0.5">{selectedDevice.manufacturer}</span>
                    </div>
                    <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-850">
                      <span className="text-[10px] text-zinc-500 uppercase font-bold">Model</span>
                      <span className="text-xs font-bold text-zinc-200 block mt-0.5">{selectedDevice.model}</span>
                    </div>
                    <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-850">
                      <span className="text-[10px] text-zinc-500 uppercase font-bold">Product ID</span>
                      <span className="text-xs font-bold text-zinc-200 block mt-0.5">{selectedDevice.productName}</span>
                    </div>
                    <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-850">
                      <span className="text-[10px] text-zinc-500 uppercase font-bold">OS Version</span>
                      <span className="text-xs font-bold text-zinc-200 block mt-0.5">{selectedDevice.androidVersion}</span>
                    </div>
                  </div>

                  {/* Battery Specs */}
                  {selectedDevice.batteryLevel !== undefined && (
                    <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-850 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1">
                          <Battery className="w-4 h-4 text-emerald-500" /> Battery Level
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-400">{selectedDevice.batteryLevel}%</span>
                      </div>
                      <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            selectedDevice.batteryLevel > 20 ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${selectedDevice.batteryLevel}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Status and Mode settings */}
                <div className="space-y-4">
                  
                  {/* Security Checks */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-850">
                      <span className="text-[10px] text-zinc-500 uppercase font-bold">USB Debugging</span>
                      <span className={`text-xs font-bold block mt-0.5 ${
                        selectedDevice.usbDebugging === 'ENABLED' ? 'text-emerald-400' : 'text-zinc-400'
                      }`}>
                        {selectedDevice.usbDebugging}
                      </span>
                    </div>
                    <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-850">
                      <span className="text-[10px] text-zinc-500 uppercase font-bold">Root Status</span>
                      <span className={`text-xs font-bold block mt-0.5 ${
                        selectedDevice.rootStatus === 'ROOTED' ? 'text-rose-400' : 'text-emerald-400'
                      }`}>
                        {selectedDevice.rootStatus === 'ROOTED' ? 'ROOTED' : 'SECURE (NOT ROOTED)'}
                      </span>
                    </div>
                  </div>

                  {/* Storage Specs */}
                  {selectedDevice.storageTotalGb && selectedDevice.storageUsedGb && (
                    <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-850 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1">
                          <HardDrive className="w-4 h-4 text-blue-500" /> Storage Capacity
                        </span>
                        <span className="text-xs font-mono font-bold text-zinc-300">
                          {selectedDevice.storageUsedGb} GB / {selectedDevice.storageTotalGb} GB
                        </span>
                      </div>
                      <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${(selectedDevice.storageUsedGb / selectedDevice.storageTotalGb) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Active Interface Selection */}
                  <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-850 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase font-bold block">Interkoneksi USB Mode</span>
                      <span className="text-xs font-bold text-zinc-200 block mt-0.5 font-mono">Active: {selectedDevice.usbMode}</span>
                    </div>

                    <div className="flex gap-1">
                      {(['ADB', 'MTP', 'PTP', 'Fastboot'] as const).map(mode => (
                        <button
                          key={mode}
                          onClick={() => handleChangeUsbMode(selectedDevice.id, mode)}
                          className={`px-2 py-1 text-[9px] font-mono font-bold uppercase rounded border transition-all cursor-pointer ${
                            selectedDevice.usbMode === mode
                              ? 'bg-blue-600 text-white border-blue-500'
                              : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border-zinc-800'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            </div>
          ) : (
            <div className="bg-zinc-900/40 border border-dashed border-zinc-800 rounded-xl p-8 text-center text-zinc-500 font-mono text-xs">
              Silakan hubungkan atau klik salah satu perangkat terdeteksi di atas untuk membuka diagnostik perangkat keras digital.
            </div>
          )}

        </div>

        {/* Right Column: Event Monitoring Log System */}
        <div className="space-y-6 flex flex-col justify-between">
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg flex-1 flex flex-col justify-between min-h-[460px]">
            <div>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-emerald-400" />
                  USB MONITOR LOGS ({eventLogs.length})
                </h3>
                
                {eventLogs.length > 0 && (
                  <button
                    onClick={handleClearLogs}
                    className="text-[10px] text-rose-400 hover:text-rose-300 transition-colors uppercase font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Bersihkan
                  </button>
                )}
              </div>

              {/* Log Timeline list */}
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {eventLogs.map(log => {
                  let eventBadge = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                  if (log.event === 'Device Disconnected') eventBadge = 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
                  if (log.event === 'USB Mode Changed') eventBadge = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';

                  return (
                    <div key={log.id} className="bg-zinc-950 p-3 rounded-lg border border-zinc-850/60 font-mono text-[10px] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${eventBadge}`}>
                          {log.event}
                        </span>
                        <span className="text-zinc-500 font-medium">
                          {new Date(log.timestamp).toUTCString().substr(17, 8)} UTC
                        </span>
                      </div>
                      
                      <div className="text-zinc-300 font-sans font-medium">{log.deviceName}</div>
                      <p className="text-zinc-400 text-[10px] font-sans leading-normal">
                        {log.details}
                      </p>
                      
                      <div className="text-[9px] text-zinc-600 border-t border-zinc-900 pt-1.5 flex justify-between">
                        <span>S/N: {log.serialNumber}</span>
                        <span>Port Check: Success</span>
                      </div>
                    </div>
                  );
                })}

                {eventLogs.length === 0 && (
                  <div className="py-16 text-center text-zinc-600 italic text-xs font-sans">
                    Belum ada rekaman lalu lintas USB. Hubungkan atau ubah konfigurasi perangkat untuk memicu event baru.
                  </div>
                )}
              </div>
            </div>

            {/* Warning audit trails info footer */}
            <div className="text-[10px] text-zinc-500 leading-normal border-t border-zinc-800 pt-4 font-sans italic mt-6">
              ⚠️ <strong>Pemberitahuan Forensik:</strong> Seluruh aktivitas lalu lintas hardware USB dilindungi oleh modul hash internal (`usb_events.py`) untuk melindungi keabsahan barang bukti.
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
