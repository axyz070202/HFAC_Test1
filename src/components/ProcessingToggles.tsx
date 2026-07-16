import { FormControlLabel, Stack, Switch, Typography, Alert } from '@mui/material';
import type { AudioProcessingSettings } from '../utils/types';

interface ProcessingTogglesProps {
  settings: AudioProcessingSettings;
  onChange: (settings: AudioProcessingSettings) => void;
}

export function ProcessingToggles({ settings, onChange }: ProcessingTogglesProps) {
  const update = (key: keyof AudioProcessingSettings) => (_: unknown, checked: boolean) => {
    onChange({ ...settings, [key]: checked });
  };

  return (
    <Stack spacing={0.5}>
      <Typography variant="subtitle2" color="text.secondary">
        Audio Processing
      </Typography>

      <FormControlLabel
        control={<Switch checked={settings.echoCancellation} onChange={update('echoCancellation')} />}
        label="Echo Cancellation"
      />
      <FormControlLabel
        control={<Switch checked={settings.noiseSuppression} onChange={update('noiseSuppression')} />}
        label="Noise Suppression"
      />
      <FormControlLabel
        control={<Switch checked={settings.autoGainControl} onChange={update('autoGainControl')} />}
        label="Auto Gain Control"
      />

      <Alert severity="info" sx={{ mt: 1 }}>
        All three default OFF for this experiment — Android's DSP chain is exactly what we're bypassing.
        Wired or Bluetooth headphones are strongly recommended without echo cancellation, otherwise the
        speaker output may feed back into the microphone.
      </Alert>
    </Stack>
  );
}
