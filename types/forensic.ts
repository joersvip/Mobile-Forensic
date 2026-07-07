export type ConnectionStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ACQUIRING' | 'ACQUIRED';

export interface DeviceProfile {
  id: string;
  brand: string;
  model: string;
  product: string;
  androidVersion: string;
  buildNumber: string;
  kernel: string;
  abi: string;
  cpu: string;
  ram: string;
  internalStorage: string;
  externalStorage: string;
  battery: string;
  androidId: string;
  imei: string;
  imsi: string;
  iccid: string;
  securityPatch: string;
  selinuxStatus: string;
  encryptionStatus: string;
  bootloader: string;
  usbDebugging: string;
  rootStatus: string;
}

export interface CaseInfo {
  caseNumber: string;
  examinerName: string;
  targetDevice: string;
  department: string;
  dateCreated: string;
}

export interface SmsRecord {
  id: number;
  sender: string;
  body: string;
  timestamp: string;
  status: 'RECEIVED' | 'SENT';
  isDeleted: boolean;
  type: string;
}

export interface ContactRecord {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  starred: boolean;
  notes: string;
}

export interface CallRecord {
  id: number;
  name: string;
  phone: string;
  type: 'INCOMING' | 'OUTGOING' | 'MISSED';
  duration: number; // in seconds
  timestamp: string;
}

export interface ApkRecord {
  id: number;
  name: string;
  packageName: string;
  version: string;
  size: string;
  isSystem: boolean;
  dangerLevel: 'SAFE' | 'WARNING' | 'CRITICAL';
  permissions: string[];
}

export interface EvidenceFile {
  id: string;
  name: string;
  path: string;
  size: string;
  sizeBytes: number;
  category: 'picture' | 'video' | 'audio' | 'document' | 'database' | 'download' | 'other';
  md5: string;
  sha1: string;
  sha256: string;
  sha512: string;
  mimeType: string;
  createdTime: string;
  modifiedTime: string;
  accessTime: string;
  content?: string; // Text content if any
  exif?: {
    camera?: string;
    lens?: string;
    dateTaken?: string;
    gps?: string; // e.g., "48.8584, 2.2945" or "-6.2088, 106.8456"
    orientation?: string;
    resolution?: string;
  };
}

export interface AuditLog {
  id: string;
  timestamp: string;
  module: string;
  action: string;
}

export interface User {
  id: string;
  fullname: string;
  username: string;
  password_hash: string;
  role: 'Administrator' | 'Examiner' | 'Viewer';
  email: string;
  phone?: string;
  jabatan: string;
  employee_id?: string;
  profile_photo?: string;
  face_template: string; // encrypted template vector
  status: 'Active' | 'Inactive';
  account_status: 'Active' | 'Locked' | 'Suspended';
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  username: string;
  action: string;
  ip_address: string;
  browser: string;
  operating_system: string;
  result: 'SUCCESS' | 'FAILED' | 'BLOCKED' | 'WARNING' | 'SYSTEM';
}

export interface ForensicSettings {
  examinerName: string;
  organization: string;
  caseId: string;
  outputPath: string;
}

export interface SearchMatch {
  fileId: string;
  filePath: string;
  fileName: string;
  type: 'metadata' | 'content' | 'database';
  matchedField: string;
  snippet: string;
}

export interface Settings {
  outputPath: string;
  theme: 'dark-blue' | 'dark-slate' | 'cyberpunk';
  language: 'id' | 'en';
  serverPort: number;
  databaseLocation: string;
  hashAlgorithm: 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-512';
  reportFormat: 'HTML' | 'PDF' | 'DOCX';
}
