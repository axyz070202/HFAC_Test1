import { Alert, MenuItem, Select, Stack, Typography } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import type { ClassifiedDevice } from '../utils/types';
import { friendlyDeviceName } from '../services/audio/deviceClassifier';

interface DeviceSelectorProps {
  devices: ClassifiedDevice[];
  selectedDeviceId: string | null;
  recommendedDeviceId: string | null;
  onSelect: (deviceId: string) => void;
}

export function DeviceSelector({ devices, selectedDeviceId, recommendedDeviceId, onSelect }: DeviceSelectorProps) {
  const handleChange = (event: SelectChangeEvent) => {
    onSelect(event.target.value);
  };

  const selectedDevice = devices.find((d) => d.deviceId === selectedDeviceId);
  const showBluetoothWarning = selectedDevice?.kind === 'bluetooth';

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2" color="text.secondary">
        Audio Input
      </Typography>

      <Select value={selectedDeviceId ?? ''} onChange={handleChange} displayEmpty size="small">
        {devices.length === 0 && (
          <MenuItem value="" disabled>
            No microphones found
          </MenuItem>
        )}
        {devices.map((device) => (
          <MenuItem key={device.deviceId} value={device.deviceId}>
            {friendlyDeviceName(device)}
            {device.deviceId === recommendedDeviceId ? ' (recommended)' : ''}
          </MenuItem>
        ))}
      </Select>

      {recommendedDeviceId && recommendedDeviceId !== selectedDeviceId && (
        <Alert severity="info">
          A wired headset is connected — switch to it for the cleanest capture with no Bluetooth codec in
          the path.
        </Alert>
      )}

      {showBluetoothWarning && (
        <Alert severity="warning">
          Bluetooth microphone may reduce playback quality because Android may switch Bluetooth into
          voice profile (HFP/SCO, ~16kHz mono) instead of the high-quality media profile (A2DP).
        </Alert>
      )}
    </Stack>
  );
}
