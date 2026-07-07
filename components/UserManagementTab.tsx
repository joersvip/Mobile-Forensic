'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Search, Edit2, Shield, Eye, Trash2, Camera, Key, CheckCircle, 
  X, AlertTriangle, RefreshCw, Smartphone, Mail, Phone, Users, ShieldAlert, BadgeInfo
} from 'lucide-react';
import { User, SecurityAuditLog } from '../types/forensic';
import { hashPassword, encryptFaceTemplate, generateMockFaceTemplate, getClientPlatformInfo } from '../lib/crypto-helper';

// Impure helper functions defined outside of the React render tree
const generateUniqueId = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
};

export default function UserManagementTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [isFaceRegModalOpen, setIsFaceRegModalOpen] = useState(false);
  
  // Selected user for edits/resets/face registers
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form states - Add/Edit User
  const [fullname, setFullname] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Administrator' | 'Examiner' | 'Viewer'>('Examiner');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [formError, setFormError] = useState('');

  // Form states - Reset Password
  const [newPassword, setNewPassword] = useState('');
  const [resetConfirm, setResetConfirm] = useState('');

  // Biometric Face Registration states
  const [faceRegState, setFaceRegState] = useState<'idle' | 'scanning' | 'registering' | 'completed'>('idle');
  const [cameraActive, setCameraActive] = useState(false);
  const [extractedTemplate, setExtractedTemplate] = useState<number[] | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Load users from localStorage on mount
  const loadUsers = () => {
    const usersStr = localStorage.getItem('forensic_users');
    if (usersStr) {
      setUsers(JSON.parse(usersStr));
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Write audit log helper
  const logAudit = (action: string, result: 'SUCCESS' | 'FAILED' | 'BLOCKED' | 'WARNING' | 'SYSTEM') => {
    const activeSessionStr = localStorage.getItem('forensic_active_session');
    const activeUser: User | null = activeSessionStr ? JSON.parse(activeSessionStr) : null;
    const adminUser = activeUser?.username || 'admin';

    const platform = getClientPlatformInfo();
    const newLog: SecurityAuditLog = {
      id: generateUniqueId('aud'),
      timestamp: new Date().toISOString(),
      username: adminUser,
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

  // Open modal for adding user
  const handleOpenAddModal = () => {
    setSelectedUser(null);
    setFullname('');
    setUsername('');
    setPassword('');
    setRole('Examiner');
    setEmail('');
    setPhone('');
    setJabatan('');
    setEmployeeId('');
    setStatus('Active');
    setFormError('');
    setIsAddEditModalOpen(true);
  };

  // Open modal for editing user
  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    setFullname(user.fullname);
    setUsername(user.username);
    setPassword(''); // don't pre-fill password for editing
    setRole(user.role);
    setEmail(user.email);
    setPhone(user.phone || '');
    setJabatan(user.jabatan);
    setEmployeeId(user.employee_id || '');
    setStatus(user.status);
    setFormError('');
    setIsAddEditModalOpen(true);
  };

  // Submit Add/Edit user form
  const handleAddEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!fullname || !username || !email || !jabatan) {
      setFormError('Harap isi semua kolom wajib (Nama Lengkap, Username, Email, Jabatan)!');
      return;
    }

    if (!selectedUser && !password) {
      setFormError('Harap isi password untuk pengguna baru!');
      return;
    }

    const usersStr = localStorage.getItem('forensic_users');
    const currentUsers: User[] = usersStr ? JSON.parse(usersStr) : [];

    // Check username duplicates
    const usernameDuplicate = currentUsers.find(
      u => u.username.toLowerCase() === username.toLowerCase() && (!selectedUser || u.id !== selectedUser.id)
    );
    if (usernameDuplicate) {
      setFormError('Username sudah digunakan oleh akun lain!');
      return;
    }

    if (selectedUser) {
      // Edit mode
      const updatedUsers = currentUsers.map(u => {
        if (u.id === selectedUser.id) {
          return {
            ...u,
            fullname,
            username,
            role,
            email,
            phone,
            jabatan,
            employee_id: employeeId,
            status,
            account_status: status === 'Active' ? ('Active' as const) : ('Suspended' as const),
            updated_at: new Date().toISOString()
          };
        }
        return u;
      });
      localStorage.setItem('forensic_users', JSON.stringify(updatedUsers));
      logAudit(`Memperbarui data profil pengguna: "${username}" (${role})`, 'SUCCESS');
    } else {
      // Add mode
      const passHash = await hashPassword(password);
      // Generate standard mock face template for new user, which they can update later
      const faceEmbed = encryptFaceTemplate(generateMockFaceTemplate());

      const newUser: User = {
        id: generateUniqueId('user'),
        fullname,
        username,
        password_hash: passHash,
        role,
        email,
        phone,
        jabatan,
        employee_id: employeeId,
        face_template: faceEmbed,
        status,
        account_status: status === 'Active' ? 'Active' : 'Suspended',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      localStorage.setItem('forensic_users', JSON.stringify([...currentUsers, newUser]));
      logAudit(`Mendaftarkan pengguna baru: "${username}" dengan peran "${role}"`, 'SUCCESS');
    }

    setIsAddEditModalOpen(false);
    loadUsers();
  };

  // Toggle user status (Active/Inactive)
  const handleToggleStatus = (user: User) => {
    // Cannot deactivate oneself!
    const activeSessionStr = localStorage.getItem('forensic_active_session');
    const activeUser: User | null = activeSessionStr ? JSON.parse(activeSessionStr) : null;
    
    if (activeUser && activeUser.id === user.id) {
      alert("Anda tidak bisa menonaktifkan akun Anda sendiri yang sedang aktif!");
      return;
    }

    const updated = users.map(u => {
      if (u.id === user.id) {
        const nextStatus = u.status === 'Active' ? 'Inactive' : 'Active';
        return {
          ...u,
          status: nextStatus as 'Active' | 'Inactive',
          account_status: nextStatus === 'Active' ? ('Active' as const) : ('Suspended' as const),
          updated_at: new Date().toISOString()
        };
      }
      return u;
    });

    localStorage.setItem('forensic_users', JSON.stringify(updated));
    const actionDesc = user.status === 'Active' ? 'Menonaktifkan' : 'Mengaktifkan';
    logAudit(`${actionDesc} status akun pengguna: "${user.username}"`, 'SUCCESS');
    loadUsers();
  };

  // Reset Password Submit
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      alert("Masukkan password baru!");
      return;
    }
    if (newPassword !== resetConfirm) {
      alert("Konfirmasi password tidak cocok!");
      return;
    }

    if (!selectedUser) return;

    const passHash = await hashPassword(newPassword);
    const updated = users.map(u => {
      if (u.id === selectedUser.id) {
        return {
          ...u,
          password_hash: passHash,
          updated_at: new Date().toISOString()
        };
      }
      return u;
    });

    localStorage.setItem('forensic_users', JSON.stringify(updated));
    logAudit(`Reset password untuk pengguna: "${selectedUser.username}"`, 'SUCCESS');
    setIsResetPasswordModalOpen(false);
    setNewPassword('');
    setResetConfirm('');
    alert(`Password pengguna ${selectedUser.username} berhasil direset.`);
    loadUsers();
  };

  // Delete User Account
  const handleDeleteUser = (user: User) => {
    const activeSessionStr = localStorage.getItem('forensic_active_session');
    const activeUser: User | null = activeSessionStr ? JSON.parse(activeSessionStr) : null;
    
    if (activeUser && activeUser.id === user.id) {
      alert("Anda tidak bisa menghapus akun Anda sendiri!");
      return;
    }

    if (window.confirm(`Apakah Anda yakin ingin menghapus akun pengguna "${user.fullname}" secara permanen? Tindakan ini tidak dapat dibatalkan.`)) {
      const filtered = users.filter(u => u.id !== user.id);
      localStorage.setItem('forensic_users', JSON.stringify(filtered));
      logAudit(`Menghapus akun pengguna permanen: "${user.username}"`, 'WARNING');
      loadUsers();
    }
  };

  // BIOMETRIC FACE REGISTRATION DAEMON SCANNER SIMULATION
  const startCameraForFaceReg = async () => {
    setCameraActive(true);
    setFaceRegState('scanning');
    setExtractedTemplate(null);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }
    } catch (e) {
      console.warn("Kamera fisik tidak tersedia, menggunakan simulator biometrik visual.");
    }
  };

  const stopCameraForFaceReg = () => {
    setCameraActive(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  // Canvas visual face registration loop
  useEffect(() => {
    if (!cameraActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = canvas.width = 320;
    let h = canvas.height = 240;
    let frame = 0;

    const runScan = () => {
      ctx.clearRect(0, 0, w, h);
      frame++;

      // Scan radar
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 60 + Math.sin(frame * 0.05) * 5, 0, Math.PI * 2);
      ctx.stroke();

      // Horizontal scan line sweep
      const scanLineY = (Math.sin(frame * 0.04) * 0.5 + 0.5) * h;
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(30, scanLineY);
      ctx.lineTo(w - 30, scanLineY);
      ctx.stroke();

      // Facial grid dots
      ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
      const nodes = [
        { x: w / 2, y: h / 2 - 40 },
        { x: w / 2 - 30, y: h / 2 - 20 }, { x: w / 2 + 30, y: h / 2 - 20 },
        { x: w / 2 - 40, y: h / 2 + 10 }, { x: w / 2 + 40, y: h / 2 + 10 },
        { x: w / 2, y: h / 2 + 5 },
        { x: w / 2 - 20, y: h / 2 + 35 }, { x: w / 2 + 20, y: h / 2 + 35 },
        { x: w / 2, y: h / 2 + 55 }
      ];

      nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x + Math.sin(frame * 0.1 + node.y) * 1.5, node.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(runScan);
    };

    runScan();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [cameraActive]);

  const handleCaptureFace = async () => {
    setFaceRegState('registering');
    
    // Simulate biometric pattern extraction (1.5 seconds)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockVector = generateMockFaceTemplate();
    setExtractedTemplate(mockVector);
    setFaceRegState('completed');
  };

  const handleSaveFaceRegistration = () => {
    if (!selectedUser || !extractedTemplate) return;

    const encryptedEmbed = encryptFaceTemplate(extractedTemplate);
    const updated = users.map(u => {
      if (u.id === selectedUser.id) {
        return {
          ...u,
          face_template: encryptedEmbed,
          updated_at: new Date().toISOString()
        };
      }
      return u;
    });

    localStorage.setItem('forensic_users', JSON.stringify(updated));
    logAudit(`Registrasi template biometrik wajah baru bagi pengguna: "${selectedUser.username}"`, 'SUCCESS');
    
    stopCameraForFaceReg();
    setIsFaceRegModalOpen(false);
    alert(`Template wajah baru berhasil dienkripsi dan dipetakan ke akun "${selectedUser.username}".`);
    loadUsers();
  };

  // Filter list
  const filteredUsers = users.filter(u => {
    const q = searchQuery.toLowerCase();
    return (
      u.fullname.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.jabatan.toLowerCase().includes(q)
    );
  });

  // Calculate statistics
  const totalCount = users.length;
  const activeCount = users.filter(u => u.status === 'Active').length;
  const inactiveCount = users.filter(u => u.status === 'Inactive').length;
  const adminCount = users.filter(u => u.role === 'Administrator').length;

  return (
    <div className="space-y-6">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider font-mono">Total Pengguna</span>
            <p className="text-2xl font-black text-zinc-100">{totalCount}</p>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/10">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider font-mono">Pengguna Aktif</span>
            <p className="text-2xl font-black text-emerald-400">{activeCount}</p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/10">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider font-mono">Dinonaktifkan / Ditangguhkan</span>
            <p className="text-2xl font-black text-amber-500">{inactiveCount}</p>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/10">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider font-mono">Administrator</span>
            <p className="text-2xl font-black text-purple-400">{adminCount}</p>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/10">
            <Shield className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Main Table / Search Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        
        {/* Toolbar Header */}
        <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-950/40">
          
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama, username, email, jabatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 text-zinc-100 pl-9 pr-4 py-2 rounded-lg border border-zinc-800 text-xs focus:outline-none focus:border-blue-500 transition-all font-mono"
            />
          </div>

          <button
            onClick={handleOpenAddModal}
            className="py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-all shadow-md shadow-blue-950/10 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> TAMBAH PENGGUNA BARU
          </button>
        </div>

        {/* Table list */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 text-[10px] uppercase font-mono tracking-wider bg-zinc-950/20 select-none">
                <th className="py-3 px-4 font-bold">Investigator</th>
                <th className="py-3 px-4 font-bold">Username</th>
                <th className="py-3 px-4 font-bold">Jabatan / ID Pegawai</th>
                <th className="py-3 px-4 font-bold">Role</th>
                <th className="py-3 px-4 font-bold">Biometrics</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850/50 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-zinc-500 font-mono">
                    Tidak ada akun pengguna yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-850/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-mono text-zinc-200 font-bold select-none shrink-0">
                          {user.fullname.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-zinc-100">{user.fullname}</p>
                          <p className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-zinc-600" /> {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-300 font-semibold">{user.username}</td>
                    <td className="py-3.5 px-4">
                      <p className="text-zinc-200 font-medium">{user.jabatan}</p>
                      <p className="text-[9px] text-zinc-500 font-mono mt-0.5 uppercase">{user.employee_id || 'ID: N/A'}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                        user.role === 'Administrator' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                        user.role === 'Examiner' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1.5">
                        <Camera className={`w-3.5 h-3.5 ${user.face_template ? 'text-emerald-400' : 'text-zinc-600'}`} />
                        <span className={`font-mono text-[10px] ${user.face_template ? 'text-emerald-400 font-semibold' : 'text-zinc-500'}`}>
                          {user.face_template ? 'REGISTERED' : 'NOT SET'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors select-none cursor-pointer ${
                          user.status === 'Active' 
                            ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20' 
                            : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {user.status === 'Active' ? 'ACTIVE' : 'SUSPENDED'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => handleOpenEditModal(user)}
                        className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-blue-400 rounded transition-all border border-zinc-800 inline-block cursor-pointer"
                        title="Edit Profil"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setIsResetPasswordModalOpen(true);
                        }}
                        className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 rounded transition-all border border-zinc-800 inline-block cursor-pointer"
                        title="Reset Password"
                      >
                        <Key className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          startCameraForFaceReg();
                          setIsFaceRegModalOpen(true);
                        }}
                        className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-emerald-400 rounded transition-all border border-zinc-800 inline-block cursor-pointer"
                        title="Daftarkan Biometrik Wajah"
                      >
                        <Camera className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 rounded transition-all border border-zinc-800 inline-block cursor-pointer"
                        title="Hapus Akun"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* MODAL 1: ADD / EDIT USER */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/30">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-black tracking-widest text-zinc-200 uppercase font-mono">
                  {selectedUser ? 'PERBARUI DATA INVESTIGATOR' : 'DAFTARKAN INVESTIGATOR BARU'}
                </span>
              </div>
              <button 
                onClick={() => setIsAddEditModalOpen(false)} 
                className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddEditSubmit} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-2 text-rose-400 text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Nama Lengkap *</label>
                  <input
                    type="text"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                    placeholder="Contoh: Rian Adiputra"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Username *</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
                    placeholder="Contoh: rian_cyber"
                    disabled={!!selectedUser}
                  />
                </div>
              </div>

              {!selectedUser && (
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Password *</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                    placeholder="Masukkan sandi masuk yang kuat"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                    placeholder="rian@forensik.go.id"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Nomor Telepon</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
                    placeholder="+628123456789"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Jabatan / Pangkat *</label>
                  <input
                    type="text"
                    value={jabatan}
                    onChange={(e) => setJabatan(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                    placeholder="Senior Forensic Examiner"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">ID Pegawai / Badge</label>
                  <input
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
                    placeholder="EX-22941-KOP"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Hak Akses / Peran *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Administrator">Administrator (Akses Penuh)</option>
                    <option value="Examiner">Examiner (Analisis & Laporan)</option>
                    <option value="Viewer">Viewer (Hanya Melihat/Pemantau)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Status Akun</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Active">Active / Diizinkan Masuk</option>
                    <option value="Inactive">Inactive / Ditangguhkan</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="py-1.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-lg cursor-pointer"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="py-1.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg cursor-pointer shadow-md shadow-blue-950/10"
                >
                  SIMPAN INVESTIGATOR
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL 2: RESET PASSWORD */}
      {isResetPasswordModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/30">
              <div className="flex items-center space-x-2">
                <Key className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black tracking-widest text-zinc-200 uppercase font-mono">
                  RESET SANDI MASUK: {selectedUser.username.toUpperCase()}
                </span>
              </div>
              <button 
                onClick={() => setIsResetPasswordModalOpen(false)} 
                className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="p-5 space-y-4">
              
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Password Baru</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="Masukkan sandi masuk baru"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Konfirmasi Password</label>
                <input
                  type="password"
                  value={resetConfirm}
                  onChange={(e) => setResetConfirm(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="Ketik ulang sandi baru"
                  required
                />
              </div>

              <div className="pt-4 border-t border-zinc-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsResetPasswordModalOpen(false)}
                  className="py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-lg cursor-pointer"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="py-1.5 px-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg cursor-pointer"
                >
                  PERBAHARUI PASSWORD
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL 3: BIOMETRIC FACE REGISTRATION */}
      {isFaceRegModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/30">
              <div className="flex items-center space-x-2">
                <Camera className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-xs font-black tracking-widest text-zinc-200 uppercase font-mono">
                  REGISTRASI BIOMETRIK WAJAH: {selectedUser.username.toUpperCase()}
                </span>
              </div>
              <button 
                onClick={() => {
                  stopCameraForFaceReg();
                  setIsFaceRegModalOpen(false);
                }} 
                className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 flex flex-col items-center justify-center space-y-4">
              
              {/* Simulator Radar Scanning Grid Container */}
              <div className="w-80 aspect-[4/3] bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden relative flex items-center justify-center">
                
                {cameraActive && (
                  <video
                    ref={videoRef}
                    muted
                    playsInline
                    className="w-full h-full object-cover transform scale-x-[-1]"
                  />
                )}

                {/* Simulated Radar Overlay on top */}
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full pointer-events-none z-10"
                />

                {!cameraActive && (
                  <div className="text-zinc-600 flex flex-col items-center justify-center font-mono text-[10px] uppercase tracking-wider space-y-2 select-none">
                    <Camera className="w-8 h-8 text-zinc-800" />
                    <span>Lensa Kamera Tidak Aktif</span>
                  </div>
                )}

                {faceRegState === 'registering' && (
                  <div className="absolute inset-0 bg-zinc-950/80 flex flex-col items-center justify-center font-mono text-xs z-20">
                    <RefreshCw className="w-6 h-6 text-blue-500 animate-spin mb-2" />
                    <span className="text-[10px] text-zinc-400 uppercase tracking-widest">MENGEKSTRAK POLA VEKTOR BIOMETRIK...</span>
                  </div>
                )}

                {faceRegState === 'completed' && (
                  <div className="absolute inset-0 bg-zinc-950/90 flex flex-col items-center justify-center font-mono text-xs text-center p-4 z-20 space-y-2">
                    <CheckCircle className="w-7 h-7 text-emerald-400 mb-1" />
                    <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">EKSTRAKSI WAJAH SUKSES!</span>
                    <span className="text-[8px] text-zinc-500 leading-relaxed max-w-[220px]">
                      Pola 128-vektor biometrik berhasil dihasilkan dan dienkripsi dengan sandi XOR.
                    </span>
                    <div className="p-1.5 bg-zinc-900 border border-zinc-850 rounded text-[7px] text-zinc-500 w-full truncate max-w-[240px]">
                      ENCRYPTED_SHA: {"8f9c1b4d2e7a3f6b5c2d9a0e4f7c1b5a3d2e6f9c8b7a1d5e2c8a0f9b3e7a6f2c"}...
                    </div>
                  </div>
                )}
              </div>

              {/* Status information panel */}
              <div className="w-full p-3 bg-zinc-950 border border-zinc-850 rounded-lg text-xs flex items-start gap-2 text-zinc-400 font-mono">
                <BadgeInfo className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                <div className="text-[10px] space-y-1">
                  <p className="font-bold text-zinc-300 uppercase">Instruksi Perekaman:</p>
                  <p className="leading-relaxed">
                    Posisikan wajah tepat di tengah. Klik &quot;Mulai Scanning&quot;, lalu &quot;Rekam Wajah&quot;. Sistem akan menangkap node geometris wajah dan mengunci template secara lokal.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-zinc-800 w-full flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    stopCameraForFaceReg();
                    setIsFaceRegModalOpen(false);
                  }}
                  className="py-1.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-lg cursor-pointer"
                >
                  BATAL
                </button>

                {faceRegState === 'idle' && (
                  <button
                    type="button"
                    onClick={startCameraForFaceReg}
                    className="py-1.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg cursor-pointer"
                  >
                    MULAI SCANNING
                  </button>
                )}

                {faceRegState === 'scanning' && (
                  <button
                    type="button"
                    onClick={handleCaptureFace}
                    className="py-1.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg cursor-pointer animate-pulse"
                  >
                    REKAM & SIMPAN WAJAH
                  </button>
                )}

                {faceRegState === 'completed' && (
                  <button
                    type="button"
                    onClick={handleSaveFaceRegistration}
                    className="py-1.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg cursor-pointer"
                  >
                    KONFIRMASI TEMPLATE
                  </button>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
