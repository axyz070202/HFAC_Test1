import { Collapse, Divider, Paper, Stack } from '@mui/material';
import { DeviceSelector } from './DeviceSelector';
import { ProcessingToggles } from './ProcessingToggles';
import { useMediaDevices } from '../hooks/useMediaDevices';
import type { AudioProcessingSettings } from '../utils/types';

interface AudioSettingsPanelProps {
  open: boolean;
  selectedDeviceId: string | null;
  processingSettings: AudioProcessingSettings;
  onSelectDevice: (deviceId: string) => void;
  onChangeProcessing: (settings: AudioProcessingSettings) => void;
}

export function AudioSettingsPanel({
  open,
  selectedDeviceId,
  processingSettings,
  onSelectDevice,
  onChangeProcessing,
}: AudioSettingsPanelProps) {
  const { devices, recommendedDeviceId } = useMediaDevices(true);

  return (
    <Collapse in={open} unmountOnExit>
      <Paper sx={{ p: 2.5, mt: 2 }} elevation={2}>
        <Stack spacing={2.5} divider={<Divider flexItem />}>
          <DeviceSelector
            devices={devices}
            selectedDeviceId={selectedDeviceId}
            recommendedDeviceId={recommendedDeviceId}
            onSelect={onSelectDevice}
          />
          <ProcessingToggles settings={processingSettings} onChange={onChangeProcessing} />
        </Stack>
      </Paper>
    </Collapse>
  );
}
