import type { ClassifiedDevice, DeviceKind } from '../../utils/types';

// The Web platform does not expose a device "type" for MediaDeviceInfo — only a
// human-readable label (and only once mic permission has been granted). Android's
// Chrome/WebView labels are inconsistent across OEMs, so this is a best-effort
// heuristic based on common substrings, not a guaranteed classification.
const BLUETOOTH_HINTS = ['bluetooth', 'bt ', 'airpods', 'sco', 'hands-free', 'hfp'];
const WIRED_HINTS = ['wired', 'headset earpiece', 'headphones', '3.5mm', 'analog', 'usb-c headset', 'usb headset'];
const BUILTIN_HINTS = ['built-in', 'builtin', 'internal', 'default', 'speakerphone', 'earpiece', 'microphone (', 'phone'];

function classifyLabel(label: string): DeviceKind {
  const lower = label.toLowerCase();

  if (BLUETOOTH_HINTS.some((hint) => lower.includes(hint))) return 'bluetooth';
  if (WIRED_HINTS.some((hint) => lower.includes(hint))) return 'wired';
  if (BUILTIN_HINTS.some((hint) => lower.includes(hint))) return 'builtin';
  return 'unknown';
}

export function classifyDevices(devices: MediaDeviceInfo[]): ClassifiedDevice[] {
  return devices
    .filter((d) => d.kind === 'audioinput')
    .map((d) => ({
      deviceId: d.deviceId,
      label: d.label || 'Microphone',
      kind: classifyLabel(d.label),
      groupId: d.groupId,
    }));
}

export function friendlyDeviceName(device: ClassifiedDevice): string {
  switch (device.kind) {
    case 'bluetooth':
      return `Bluetooth Headset Microphone — ${device.label}`;
    case 'wired':
      return `Wired Headset Microphone — ${device.label}`;
    case 'builtin':
      return `Phone Microphone — ${device.label}`;
    default:
      return device.label;
  }
}
