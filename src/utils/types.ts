export type DeviceKind = 'builtin' | 'wired' | 'bluetooth' | 'unknown';

export interface ClassifiedDevice {
  deviceId: string;
  label: string;
  kind: DeviceKind;
  groupId: string;
}

export type CallState = 'idle' | 'waiting' | 'connecting' | 'connected' | 'ended' | 'error';

export type ConnectionQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';

export interface AudioProcessingSettings {
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
}

export interface CallStats {
  timestamp: number;
  codec: string;
  bitrateKbps: number;
  roundTripTimeMs: number;
  packetLossPercent: number;
  jitterMs: number;
  audioLevel: number;
}

export interface DeviceEventLogEntry {
  id: string;
  timestamp: number;
  message: string;
}
