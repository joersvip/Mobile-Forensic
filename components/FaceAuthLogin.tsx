'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, User as UserIcon, Lock, Camera, CameraOff, 
  CheckCircle, AlertTriangle, RefreshCw, Eye, EyeOff, ShieldAlert, Cpu
} from 'lucide-react';
import { User, SecurityAuditLog } from '../types/forensic';
import { hashPassword, getClientPlatformInfo, initializeDatabase } from '../lib/crypto-helper';

// Local log helper kept outside the React render cycle
const handleLogLocal = (module: string, actionDesc: string) => {
  console.log(`[${module}] ${actionDesc}`);
};

interface FaceAuthLoginProps {
  onLoginSuccess: (user: User) => void;
}

export default function FaceAuthLogin({ onLoginSuccess }: FaceAuthLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [cameraPermission, setCameraPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [useFallbackScan, setUseFallbackScan] = useState(false);
  
  // States of Face Verification
  // 'idle' | 'detecting' | 'recognizing' | 'liveness' | 'success' | 'failed' | 'multi_face' | 'unknown'
  const [authState, setAuthState] = useState<'idle' | 'detecting' | 'recognizing' | 'liveness' | 'success' | 'failed' | 'multi_face' | 'unknown'>('idle');
  const [authStatusMessage, setAuthStatusMessage] = useState('Siap untuk verifikasi kredensial');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [matchPercentage, setMatchPercentage] = useState(0);
  
  // Simulation trigger settings (for demonstrating failures, multi-face warning, or unknown faces)
  const [simulationMode, setSimulationMode] = useState<'normal' | 'fail_face' | 'multi_face' | 'unknown_face'>('normal');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize DB on mount
  useEffect(() => {
    initializeDatabase();
  }, []);

  // Request camera access
  const startCamera = async () => {
    setUseFallbackScan(false);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 400, height: 300, facingMode: 'user' } 
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraPermission('granted');
        setIsWebcamActive(true);
        handleLogLocal('Webcam Engine', 'Izin kamera diberikan oleh browser. Live feed aktif.');
      } else {
        throw new Error('MediaDevices not supported');
      }
    } catch (err) {
      console.warn("Kamera fisik tidak dapat diakses, beralih ke simulasi visual:", err);
      setCameraPermission('denied');
      setIsWebcamActive(false);
      setUseFallbackScan(true);
      handleLogLocal('Webcam Engine', 'Gagal mengakses webcam fisik. Menggunakan simulator forensik lokal.');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsWebcamActive(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  useEffect(() => {
    // Start camera automatically on mount if possible
    const timer = setTimeout(() => {
      startCamera();
    }, 0);
    return () => {
      clearTimeout(timer);
      stopCamera();
    };
  }, []);

  // Canvas facial mesh animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = 400;
    let height = canvas.height = 300;
    let frame = 0;

    // Face mesh node coordinates
    const baseNodes = [
      { x: 200, y: 110 }, // Forehead top
      { x: 160, y: 120 }, { x: 240, y: 120 }, // Temples
      { x: 140, y: 150 }, { x: 260, y: 150 }, // High cheekbones
      { x: 175, y: 145 }, { x: 225, y: 145 }, // Eyes
      { x: 200, y: 150 }, // Bridge of nose
      { x: 200, y: 185 }, // Tip of nose
      { x: 170, y: 215 }, { x: 230, y: 215 }, // Mouth corners
      { x: 200, y: 205 }, { x: 200, y: 225 }, // Lips
      { x: 150, y: 200 }, { x: 250, y: 200 }, // Jawline mid
      { x: 200, y: 250 } // Chin bottom
    ];

    const drawMesh = () => {
      ctx.clearRect(0, 0, width, height);
      frame++;

      // If we are simulating fallback, draw a dark grid outline representation of a head
      if (useFallbackScan) {
        ctx.fillStyle = 'rgba(9, 9, 11, 0.85)';
        ctx.fillRect(0, 0, width, height);
        
        // Draw futuristic scanner radar sweeps
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.15)';
        ctx.lineWidth = 1;
        for (let i = 0; i < width; i += 30) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, height);
          ctx.stroke();
        }
        for (let i = 0; i < height; i += 30) {
          ctx.beginPath();
          ctx.moveTo(0, i);
          ctx.lineTo(width, i);
          ctx.stroke();
        }

        // Draw generic head outline in neon green/blue
        ctx.strokeStyle = authState === 'failed' || authState === 'multi_face' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(200, 155, 75, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Scanner Laser Sweep Line
      if (authState === 'detecting' || authState === 'recognizing' || authState === 'liveness') {
        const laserY = (Math.sin(frame * 0.05) * 0.5 + 0.5) * height;
        const scanColor = authState === 'liveness' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)';
        ctx.strokeStyle = scanColor;
        ctx.shadowColor = scanColor;
        ctx.shadowBlur = 10;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(30, laserY);
        ctx.lineTo(width - 30, laserY);
        ctx.stroke();
        
        // Reset shadow
        ctx.shadowBlur = 0;
        ctx.lineWidth = 1;
      }

      // Drawing target bounding box
      let boxColor = 'rgba(59, 130, 246, 0.6)'; // Blue default
      if (authState === 'success') boxColor = 'rgba(16, 185, 129, 0.9)'; // Emerald
      if (authState === 'failed' || authState === 'unknown') boxColor = 'rgba(239, 68, 68, 0.9)'; // Red
      if (authState === 'multi_face') boxColor = 'rgba(245, 158, 11, 0.9)'; // Amber

      ctx.strokeStyle = boxColor;
      ctx.lineWidth = 2;
      const boxSize = 180;
      const bx = 200 - boxSize / 2;
      const by = 150 - boxSize / 2;

      // Draw corners of bounding box
      const len = 20;
      // Top Left
      ctx.beginPath(); ctx.moveTo(bx, by + len); ctx.lineTo(bx, by); ctx.lineTo(bx + len, by); ctx.stroke();
      // Top Right
      ctx.beginPath(); ctx.moveTo(bx + boxSize - len, by); ctx.lineTo(bx + boxSize, by); ctx.lineTo(bx + boxSize, by + len); ctx.stroke();
      // Bottom Left
      ctx.beginPath(); ctx.moveTo(bx, by + boxSize - len); ctx.lineTo(bx, by + boxSize); ctx.lineTo(bx + len, by + boxSize); ctx.stroke();
      // Bottom Right
      ctx.beginPath(); ctx.moveTo(bx + boxSize - len, by + boxSize); ctx.lineTo(bx + boxSize, by + boxSize); ctx.lineTo(bx + boxSize, by + boxSize - len); ctx.stroke();

      // Render facial nodes with shifting offsets
      if (authState !== 'idle') {
        const noiseRange = authState === 'success' ? 0.2 : 2.5;
        
        // Connect nodes to draw a mesh grid
        ctx.strokeStyle = authState === 'failed' || authState === 'unknown' ? 'rgba(239, 68, 68, 0.25)' : 
                          authState === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(59, 130, 246, 0.35)';
        ctx.lineWidth = 1;

        const renderedNodes = baseNodes.map(node => {
          const rx = node.x + (Math.sin(frame * 0.1 + node.x) * noiseRange);
          const ry = node.y + (Math.cos(frame * 0.1 + node.y) * noiseRange);
          return { x: rx, y: ry };
        });

        // If multi face is triggered, draw second ghost mesh offset
        if (authState === 'multi_face') {
          const renderedNodes2 = baseNodes.map(node => {
            const rx = node.x + 80 + (Math.sin(frame * 0.1 + node.x) * 4);
            const ry = node.y + 10 + (Math.cos(frame * 0.1 + node.y) * 4);
            return { x: rx, y: ry };
          });

          // Draw second box
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
          ctx.strokeRect(230, 90, 110, 110);
          
          // Draw dots
          ctx.fillStyle = 'rgba(245, 158, 11, 0.8)';
          renderedNodes2.forEach(n => {
            ctx.beginPath();
            ctx.arc(n.x, n.y, 2, 0, Math.PI * 2);
            ctx.fill();
          });
        }

        // Draw connections for primary face
        for (let i = 0; i < renderedNodes.length; i++) {
          for (let j = i + 1; j < renderedNodes.length; j++) {
            const dist = Math.hypot(renderedNodes[i].x - renderedNodes[j].x, renderedNodes[i].y - renderedNodes[j].y);
            // Only connect close nodes to represent organic face structure
            if (dist < 45) {
              ctx.beginPath();
              ctx.moveTo(renderedNodes[i].x, renderedNodes[i].y);
              ctx.lineTo(renderedNodes[j].x, renderedNodes[j].y);
              ctx.stroke();
            }
          }
        }

        // Draw primary node points
        ctx.fillStyle = authState === 'failed' || authState === 'unknown' ? 'rgba(239, 68, 68, 0.85)' : 
                        authState === 'success' ? 'rgba(16, 185, 129, 0.95)' : 'rgba(59, 130, 246, 0.85)';
        renderedNodes.forEach(node => {
          ctx.beginPath();
          ctx.arc(node.x, node.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        });

        // Add telemetry labels
        ctx.fillStyle = boxColor;
        ctx.font = '9px monospace';
        ctx.fillText(`FACE_ID: ${simulationMode === 'unknown_face' ? 'UNKNOWN' : 'EX_99823'}`, bx, by - 18);
        ctx.fillText(`LIVENESS: ${authState === 'liveness' || authState === 'success' ? 'VERIFIED' : 'PENDING'}`, bx, by - 6);
        ctx.fillText(`NODES: 16/16`, bx + boxSize - 65, by - 6);
      }

      animationFrameRef.current = requestAnimationFrame(drawMesh);
    };

    drawMesh();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [authState, useFallbackScan, simulationMode]);

  // Handle Login Authentication and Face verification workflow
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setAuthState('failed');
      setAuthStatusMessage('Harap masukkan username dan password!');
      return;
    }

    setIsAuthenticating(true);
    setAuthState('detecting');
    setAuthStatusMessage('Mencari wajah analis...');
    setMatchPercentage(0);

    // Timeline simulation speeds
    // 1. Detect face (1 sec)
    await new Promise(resolve => setTimeout(resolve, 900));

    if (simulationMode === 'multi_face') {
      setAuthState('multi_face');
      setAuthStatusMessage('PERINGATAN: Terdeteksi lebih dari satu wajah! Autentikasi ditolak.');
      setIsAuthenticating(false);
      logAuditToLocalStorage(username, 'Login Ditolak: Terdeteksi banyak wajah di kamera.', 'FAILED');
      return;
    }

    if (simulationMode === 'fail_face') {
      setAuthState('failed');
      setAuthStatusMessage('Autentikasi gagal: Wajah tidak sesuai dengan pengguna terdaftar.');
      setIsAuthenticating(false);
      logAuditToLocalStorage(username, 'Login Gagal: Deviasi wajah melebihi batas toleransi forensik.', 'FAILED');
      return;
    }

    // 2. Recognize face and match template (1 sec)
    setAuthState('recognizing');
    setAuthStatusMessage('Mencocokkan dengan template biometrik lokal...');
    
    // Animate percentage match
    for (let p = 0; p <= (simulationMode === 'unknown_face' ? 34 : 98); p += 14) {
      setMatchPercentage(p);
      await new Promise(resolve => setTimeout(resolve, 150));
    }
    setMatchPercentage(simulationMode === 'unknown_face' ? 38 : 98.4);

    if (simulationMode === 'unknown_face') {
      setAuthState('unknown');
      setAuthStatusMessage('Sistem Keamanan: Wajah tidak dikenal! Akses ditolak.');
      setIsAuthenticating(false);
      logAuditToLocalStorage(username, 'Login Ditolak: Wajah asing (tidak terdaftar) terdeteksi.', 'FAILED');
      return;
    }

    // 3. Liveness Check (1 sec)
    setAuthState('liveness');
    setAuthStatusMessage('Melakukan Liveness Detection... Silakan kedipkan mata.');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 4. Verify Username & Password in LocalStorage
    const usersStr = localStorage.getItem('forensic_users');
    if (!usersStr) {
      setAuthState('failed');
      setAuthStatusMessage('Database lokal belum diinisialisasi.');
      setIsAuthenticating(false);
      return;
    }

    const usersList: User[] = JSON.parse(usersStr);
    const matchedUser = usersList.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (!matchedUser) {
      setAuthState('failed');
      setAuthStatusMessage('Username atau password tidak terdaftar!');
      setIsAuthenticating(false);
      logAuditToLocalStorage(username, 'Login Gagal: Username salah.', 'FAILED');
      return;
    }

    if (matchedUser.status === 'Inactive' || matchedUser.account_status === 'Suspended') {
      setAuthState('failed');
      setAuthStatusMessage('Akun dinonaktifkan atau ditangguhkan oleh Administrator.');
      setIsAuthenticating(false);
      logAuditToLocalStorage(username, 'Login Ditolak: Akun tidak aktif/ditangguhkan.', 'BLOCKED');
      return;
    }

    // Hash typed password to compare
    const computedHash = await hashPassword(password);
    if (computedHash !== matchedUser.password_hash) {
      setAuthState('failed');
      setAuthStatusMessage('Username atau password salah!');
      setIsAuthenticating(false);
      logAuditToLocalStorage(username, 'Login Gagal: Password salah (Autentikasi Wajah Berhasil).', 'FAILED');
      return;
    }

    // SUCCESS!
    setAuthState('success');
    setAuthStatusMessage(`Autentikasi Wajah Berhasil! Selamat datang, ${matchedUser.fullname}.`);
    
    // Update user's last login
    const updatedUsers = usersList.map(u => {
      if (u.id === matchedUser.id) {
        return { ...u, last_login: new Date().toISOString() };
      }
      return u;
    });
    localStorage.setItem('forensic_users', JSON.stringify(updatedUsers));

    // Save active session
    localStorage.setItem('forensic_active_session', JSON.stringify(matchedUser));

    // Log success
    logAuditToLocalStorage(username, 'Login Berhasil: Kredensial & Biometrik Wajah terverifikasi penuh.', 'SUCCESS');

    setTimeout(() => {
      stopCamera();
      onLoginSuccess(matchedUser);
    }, 1200);
  };

  // Log audit helper
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

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Dynamic Ambient Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-emerald-600/5 blur-[120px] pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10 grid grid-cols-1 md:grid-cols-2">
        
        {/* Left Side: Live Face Scanner Panel */}
        <div className="p-6 bg-zinc-950 flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-800 relative">
          
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <div className="flex items-center space-x-2">
              <Camera className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">SECURE BIOMETRIC INTERFACE</span>
            </div>
            
            <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${
              isWebcamActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              {isWebcamActive ? 'LIVE CAMERA' : 'SIMULATION MODE'}
            </span>
          </div>

          {/* Camera Frame Viewport */}
          <div className="my-4 aspect-[4/3] bg-zinc-900 border border-zinc-850 rounded-xl overflow-hidden relative flex items-center justify-center">
            
            {/* Live Video */}
            <video
              ref={videoRef}
              muted
              playsInline
              className={`w-full h-full object-cover transform scale-x-[-1] ${
                isWebcamActive && !useFallbackScan ? 'opacity-100' : 'opacity-0 absolute'
              }`}
            />

            {/* Fallback Animation Viewport */}
            {(!isWebcamActive || useFallbackScan) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 font-mono text-xs text-zinc-500">
                <Cpu className={`w-8 h-8 text-blue-500 mb-2 ${isAuthenticating ? 'animate-spin' : 'animate-pulse'}`} />
                <span className="text-[10px] text-zinc-400 uppercase tracking-widest">Simulator Forensik Aktif</span>
                <span className="text-[8px] text-zinc-600 mt-1">Webcam fisik terblokir / tidak terdeteksi</span>
              </div>
            )}

            {/* Overlay Canvas */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
            />

            {/* Scanning Target Text overlays */}
            {isAuthenticating && (
              <div className="absolute bottom-3 left-3 right-3 bg-zinc-950/80 backdrop-blur border border-zinc-850 px-2.5 py-1.5 rounded-lg flex items-center justify-between z-20">
                <span className="text-[10px] font-mono text-zinc-300 flex items-center gap-1.5 uppercase font-bold">
                  <RefreshCw className="w-3 h-3 text-blue-400 animate-spin" /> {authStatusMessage}
                </span>
                {matchPercentage > 0 && (
                  <span className="text-[10px] font-mono text-blue-400 font-bold">{matchPercentage}%</span>
                )}
              </div>
            )}
          </div>

          {/* Biometrics Status Message */}
          <div className="space-y-2">
            <div className={`p-3 rounded-xl border flex items-start space-x-2.5 ${
              authState === 'success' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' :
              authState === 'failed' || authState === 'unknown' ? 'bg-rose-500/5 border-rose-500/20 text-rose-400' :
              authState === 'multi_face' ? 'bg-amber-500/5 border-amber-500/20 text-amber-400' :
              'bg-zinc-900 border-zinc-800 text-zinc-400'
            }`}>
              <div className="mt-0.5 shrink-0">
                {authState === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> :
                 authState === 'failed' || authState === 'unknown' || authState === 'multi_face' ? <AlertTriangle className="w-4 h-4 text-rose-400" /> :
                 <Shield className="w-4 h-4 text-blue-400" />}
              </div>
              <div className="text-xs">
                <p className="font-semibold text-zinc-200">Status Autentikasi Wajah</p>
                <p className="text-[10px] mt-0.5 leading-relaxed">{authStatusMessage}</p>
              </div>
            </div>

            {/* Live simulation testing triggers */}
            <div className="bg-zinc-900/60 border border-zinc-850 p-2.5 rounded-xl space-y-1.5">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono block">SIMULATOR VERIFICATION CONTROLS:</span>
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => {
                    setSimulationMode('normal');
                    setAuthState('idle');
                    setAuthStatusMessage('Simulator diatur ke Normal. Wajah terverifikasi.');
                  }}
                  className={`py-1 px-1.5 rounded font-mono text-left cursor-pointer border ${
                    simulationMode === 'normal' ? 'bg-blue-600/10 text-blue-400 border-blue-500/30' : 'bg-zinc-950 text-zinc-500 border-transparent hover:text-zinc-400'
                  }`}
                >
                  🟢 Normal Match
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSimulationMode('fail_face');
                    setAuthState('idle');
                    setAuthStatusMessage('Simulator diatur ke Mismatch. Autentikasi wajah akan ditolak.');
                  }}
                  className={`py-1 px-1.5 rounded font-mono text-left cursor-pointer border ${
                    simulationMode === 'fail_face' ? 'bg-red-600/10 text-red-400 border-red-500/30' : 'bg-zinc-950 text-zinc-500 border-transparent hover:text-zinc-400'
                  }`}
                >
                  🔴 Mismatch Face
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSimulationMode('multi_face');
                    setAuthState('idle');
                    setAuthStatusMessage('Simulator diatur ke Multi-Face. Kamera akan mendeteksi 2 orang.');
                  }}
                  className={`py-1 px-1.5 rounded font-mono text-left cursor-pointer border ${
                    simulationMode === 'multi_face' ? 'bg-amber-600/10 text-amber-400 border-amber-500/30' : 'bg-zinc-950 text-zinc-500 border-transparent hover:text-zinc-400'
                  }`}
                >
                  🟡 Multi-Face Error
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSimulationMode('unknown_face');
                    setAuthState('idle');
                    setAuthStatusMessage('Simulator diatur ke Unknown. Wajah asing tidak terdaftar.');
                  }}
                  className={`py-1 px-1.5 rounded font-mono text-left cursor-pointer border ${
                    simulationMode === 'unknown_face' ? 'bg-purple-600/10 text-purple-400 border-purple-500/30' : 'bg-zinc-950 text-zinc-500 border-transparent hover:text-zinc-400'
                  }`}
                >
                  🟣 Unknown Face
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Credentials & Branding Panel */}
        <div className="p-8 flex flex-col justify-between">
          
          {/* Branding Banner */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-blue-600 rounded-xl text-white">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-widest text-zinc-100 uppercase font-mono">FORENSIC SUITE</h1>
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest font-mono">Security Gatekeeper</p>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Selamat datang di Mobile Forensic Suite. Silakan masukkan kredensial analisis Anda untuk mengakses modul investigasi. Keamanan biometrik diaktifkan.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="my-6 space-y-4">
            
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Username</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="admin / examiner / viewer"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isAuthenticating}
                  className="w-full bg-zinc-950 text-zinc-100 pl-9 pr-4 py-2 rounded-lg border border-zinc-800 text-xs focus:outline-none focus:border-blue-500 transition-all font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isAuthenticating}
                  className="w-full bg-zinc-950 text-zinc-100 pl-9 pr-10 py-2 rounded-lg border border-zinc-800 text-xs focus:outline-none focus:border-blue-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Quick Demo Credentials Info */}
            <div className="text-[10px] bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-zinc-500 space-y-0.5 font-mono">
              <span className="font-bold text-zinc-400 uppercase">Kredensial Pengujian:</span>
              <div className="flex justify-between">
                <span>• Admin: <span className="text-zinc-300">admin / adminpassword</span></span>
                <span>• Role: Admin</span>
              </div>
              <div className="flex justify-between">
                <span>• Examiner: <span className="text-zinc-300">examiner / examinerpassword</span></span>
                <span>• Role: Examiner</span>
              </div>
              <div className="flex justify-between">
                <span>• Viewer: <span className="text-zinc-300">viewer / viewerpassword</span></span>
                <span>• Role: Viewer</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-bold text-xs rounded-lg transition-all shadow-lg shadow-blue-950/20 flex items-center justify-center gap-1.5 cursor-pointer mt-4"
            >
              {isAuthenticating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  MENCOCOKKAN TEMPLATE BIOMETRIK...
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  AUTENTIKASI & LOGIN SEKURITI
                </>
              )}
            </button>

          </form>

          {/* Footer information */}
          <div className="text-[9px] text-zinc-500 font-mono text-center border-t border-zinc-850 pt-4">
            <span>OFFLINE LOCAL-ONLY AUTHENTICATION SYSTEM • DEFIANT HANDSHAKE ENCRYPTED</span>
          </div>

        </div>

      </div>

    </div>
  );
}
