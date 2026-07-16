import { useEffect, useRef, useState } from 'react';
import type { DeviceEventLogEntry } from '../utils/types';

let logCounter = 0;

// The Web platform has no dedicated "headphones connected/disconnected" event
// (that's an Android-native broadcast, not exposed to browsers). The best signal
// available is the generic `devicechange` event on mediaDevices, which fires
// when the OS's audio device list changes — we diff enumerateDevices() snapshots
// across firings to infer what actually changed.
export function useDeviceEvents(permissionGranted: boolean): DeviceEventLogEntry[] {
  const [log, setLog] = useState<DeviceEventLogEntry[]>([]);
  const previousLabels = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (!permissionGranted) return undefined;

    const snapshot = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const labels = new Set(devices.map((d) => `${d.kind}:${d.label}`));

      if (previousLabels.current) {
        const added = [...labels].filter((l) => !previousLabels.current!.has(l));
        const removed = [...previousLabels.current].filter((l) => !labels.has(l));

        const entries: DeviceEventLogEntry[] = [];
        for (const item of added) {
          entries.push(makeEntry(`Connected: ${item.split(':')[1] || item}`));
        }
        for (const item of removed) {
          entries.push(makeEntry(`Disconnected: ${item.split(':')[1] || item}`));
        }
        if (entries.length > 0) {
          setLog((prev) => [...entries, ...prev].slice(0, 20));
        }
      }

      previousLabels.current = labels;
    };

    void snapshot();
    navigator.mediaDevices.addEventListener('devicechange', snapshot);
    return () => navigator.mediaDevices.removeEventListener('devicechange', snapshot);
  }, [permissionGranted]);

  return log;
}

function makeEntry(message: string): DeviceEventLogEntry {
  logCounter += 1;
  return { id: `evt-${logCounter}`, timestamp: Date.now(), message };
}
