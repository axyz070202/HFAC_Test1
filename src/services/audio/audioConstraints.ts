import type { AudioProcessingSettings } from '../../utils/types';

// Media-path audio quality target: 48kHz sample rate, stereo where the hardware
// supports it, and processing disabled by default so the hypothesis under test
// (raw mic capture over the media path) isn't muddied by Android's own DSP chain.
export function buildAudioConstraints(
  deviceId: string | undefined,
  processing: AudioProcessingSettings,
): MediaTrackConstraints {
  return {
    deviceId: deviceId ? { exact: deviceId } : undefined,
    echoCancellation: processing.echoCancellation,
    noiseSuppression: processing.noiseSuppression,
    autoGainControl: processing.autoGainControl,
    sampleRate: 48000,
    channelCount: { ideal: 2 },
  };
}

export const DEFAULT_PROCESSING_SETTINGS: AudioProcessingSettings = {
  echoCancellation: false,
  noiseSuppression: false,
  autoGainControl: false,
};
