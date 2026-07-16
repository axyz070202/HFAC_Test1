import { useCallback, useEffect, useState } from 'react';
import { classifyDevices } from '../services/audio/deviceClassifier';
import type { ClassifiedDevice } from '../utils/types';

interface UseMediaDevicesResult {
  devices: ClassifiedDevice[];
  recommendedDeviceId: string | null;
  hasWiredHeadset: boolean;
  hasBluetooth: boolean;
  refresh: () => Promise<void>;
}

// Device labels are only populated by the browser once microphone permission has
// been granted at least once; until then enumerateDevices() returns opaque
// deviceIds with empty labels, which is why device selection needs to happen
// after the first getUserMedia call rather than on page load.
export function useMediaDevices(permissionGranted: boolean): UseMediaDevicesResult {
  const [devices, setDevices] = useState<ClassifiedDevice[]>([]);

  const refresh = useCallback(async () => {
    const list = await navigator.mediaDevices.enumerateDevices();
    setDevices(classifyDevices(list));
  }, []);

  useEffect(() => {
    if (permissionGranted) {
      void refresh();
    }
  }, [permissionGranted, refresh]);

  useEffect(() => {
    const handler = () => void refresh();
    navigator.mediaDevices.addEventListener('devicechange', handler);
    return () => navigator.mediaDevices.removeEventListener('devicechange', handler);
  }, [refresh]);

  const wired = devices.find((d) => d.kind === 'wired');
  const bluetooth = devices.find((d) => d.kind === 'bluetooth');

  return {
    devices,
    recommendedDeviceId: wired?.deviceId ?? null,
    hasWiredHeadset: Boolean(wired),
    hasBluetooth: Boolean(bluetooth),
    refresh,
  };
}
