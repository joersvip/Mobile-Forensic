'use client';

export async function hashPassword(password: string): Promise<string> {
  if (typeof window === 'undefined') return password;
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function encryptFaceTemplate(template: number[]): string {
  const jsonStr = JSON.stringify(template);
  let result = '';
  for (let i = 0; i < jsonStr.length; i++) {
    const charCode = jsonStr.charCodeAt(i);
    const encryptedCharCode = charCode ^ 0xAF; // XOR encryption with constant byte key
    result += String.fromCharCode(encryptedCharCode);
  }
  if (typeof window !== 'undefined') {
    return window.btoa(unescape(encodeURIComponent(result)));
  }
  return result;
}

export function decryptFaceTemplate(encryptedStr: string): number[] {
  try {
    if (typeof window === 'undefined') return [];
    const decodedResult = decodeURIComponent(escape(window.atob(encryptedStr)));
    let decryptedStr = '';
    for (let i = 0; i < decodedResult.length; i++) {
      const charCode = decodedResult.charCodeAt(i);
      const decryptedCharCode = charCode ^ 0xAF;
      decryptedStr += String.fromCharCode(decryptedCharCode);
    }
    return JSON.parse(decryptedStr);
  } catch (e) {
    console.error("Gagal mendeskripsikan template wajah:", e);
    return [];
  }
}

// Helper to generate a random mock face template (vector of 128 elements)
export function generateMockFaceTemplate(): number[] {
  const template: number[] = [];
  for (let i = 0; i < 128; i++) {
    // Generate normalized values between -1 and 1
    template.push(parseFloat((Math.random() * 2 - 1).toFixed(4)));
  }
  return template;
}

// Calculate Euclidean distance between two face vectors (smaller distance = closer match)
export function calculateFaceMatchDistance(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) return 999;
  let sum = 0;
  for (let i = 0; i < vec1.length; i++) {
    const diff = vec1[i] - vec2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

// Determine browser and OS from user agent
export function getClientPlatformInfo() {
  if (typeof window === 'undefined') {
    return { ip: '127.0.0.1', browser: 'Unknown', os: 'Unknown' };
  }
  const ua = window.navigator.userAgent;
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';

  // Simple browser detection
  if (ua.indexOf('Firefox') > -1) browser = 'Mozilla Firefox';
  else if (ua.indexOf('Chrome') > -1) browser = 'Google Chrome';
  else if (ua.indexOf('Safari') > -1) browser = 'Apple Safari';
  else if (ua.indexOf('Edge') > -1) browser = 'Microsoft Edge';

  // Simple OS detection
  if (ua.indexOf('Windows') > -1) os = 'Windows';
  else if (ua.indexOf('Macintosh') > -1) os = 'macOS';
  else if (ua.indexOf('Linux') > -1) os = 'Linux';
  else if (ua.indexOf('Android') > -1) os = 'Android';
  else if (ua.indexOf('iPhone') > -1) os = 'iOS';

  // Return structure matching log needs
  return {
    ip: '192.168.12.44', // Simulated local intranet address for forensic workstation
    browser,
    os
  };
}

// Initialize local database with default credentials for Administrator, Examiner, and Viewer roles
export async function initializeDatabase(): Promise<void> {
  if (typeof window === 'undefined') return;

  // Check if forensic_users database is initialized
  const usersStr = localStorage.getItem('forensic_users');
  if (!usersStr) {
    // Generate default passwords hashes
    const adminPassHash = await hashPassword('admin123');
    const examinerPassHash = await hashPassword('examiner123');
    const viewerPassHash = await hashPassword('viewer123');

    const defaultUsers = [
      {
        id: 'user_admin',
        fullname: 'Rian Adiputra (Admin)',
        username: 'admin',
        password_hash: adminPassHash,
        role: 'Administrator',
        email: 'rian.adiputra@polda.go.id',
        phone: '+62-811-928-110',
        jabatan: 'Kepala Unit Siber',
        employee_id: 'POL-19881023',
        face_template: encryptFaceTemplate(generateMockFaceTemplate()),
        status: 'Active',
        account_status: 'Active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'user_examiner',
        fullname: 'Irvan Hakim (Examiner)',
        username: 'examiner',
        password_hash: examinerPassHash,
        role: 'Examiner',
        email: 'irvan.hakim@polda.go.id',
        phone: '+62-812-445-921',
        jabatan: 'Investigator Forensik Madya',
        employee_id: 'POL-19920412',
        face_template: encryptFaceTemplate(generateMockFaceTemplate()),
        status: 'Active',
        account_status: 'Active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'user_viewer',
        fullname: 'Budi Santoso (Viewer)',
        username: 'viewer',
        password_hash: viewerPassHash,
        role: 'Viewer',
        email: 'budi.santoso@polda.go.id',
        phone: '+62-856-112-998',
        jabatan: 'Analis Keamanan Junior',
        employee_id: 'POL-19980517',
        face_template: encryptFaceTemplate(generateMockFaceTemplate()),
        status: 'Active',
        account_status: 'Active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    localStorage.setItem('forensic_users', JSON.stringify(defaultUsers));
  }

  // Check if forensic_audit_logs database is initialized
  const logsStr = localStorage.getItem('forensic_audit_logs');
  if (!logsStr) {
    const platform = getClientPlatformInfo();
    const initialLog = {
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
      username: 'SYSTEM',
      action: 'Inisialisasi Database Keamanan: Berkas basis data pengguna dan log audit berhasil dipasang secara lokal.',
      ip_address: platform.ip,
      browser: platform.browser,
      operating_system: platform.os,
      result: 'SUCCESS'
    };
    localStorage.setItem('forensic_audit_logs', JSON.stringify([initialLog]));
  }
}
