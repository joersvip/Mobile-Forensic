export interface ConnectedDevice {
  id: string;
  manufacturer: string;
  model: string;
  productName: string;
  androidVersion?: string;
  serialNumber?: string;
  usbMode: 'ADB' | 'MTP' | 'PTP' | 'Fastboot' | 'Mass Storage';
  connectionStatus: 'CONNECTED' | 'DISCONNECTED' | 'UNAUTHORIZED';
  usbDebugging: 'ENABLED' | 'DISABLED' | 'PENDING' | 'N/A';
  rootStatus: 'ROOTED' | 'NOT_ROOTED' | 'UNKNOWN';
  batteryLevel?: number;
  storageTotalGb?: number;
  storageUsedGb?: number;
  connectionType: string;
  lastSeen: string;
}

export interface DeviceEventLog {
  id: string;
  timestamp: string;
  deviceName: string;
  serialNumber: string;
  event: 'Device Connected' | 'Device Disconnected' | 'USB Mode Changed';
  details: string;
}
