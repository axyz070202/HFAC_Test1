import { useEffect, useRef, useState } from 'react';
import { Box, Button, IconButton, Stack, Typography, Snackbar } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import TuneIcon from '@mui/icons-material/Tune';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import { AvatarPlaceholder } from './AvatarPlaceholder';
import { CallTimer } from './CallTimer';
import { ConnectionQualityIndicator } from './ConnectionQualityIndicator';
import { AudioSettingsPanel } from './AudioSettingsPanel';
import { StatsPanel } from './StatsPanel';
import { useAudioStats, classifyQuality } from '../hooks/useAudioStats';
import { useDeviceEvents } from '../hooks/useDeviceEvents';
import type { AudioProcessingSettings, CallState } from '../utils/types';

interface CallScreenProps {
  callState: CallState;
  remoteStream: MediaStream | null;
  localStream: MediaStream | null;
  peerConnection: RTCPeerConnection | null;
  isMuted: boolean;
  processingSettings: AudioProcessingSettings;
  onToggleMute: () => void;
  onEndCall: () => void;
  onSelectDevice: (deviceId: string) => void;
  onChangeProcessing: (settings: AudioProcessingSettings) => void;
}

export function CallScreen({
  callState,
  remoteStream,
  localStream,
  peerConnection,
  isMuted,
  processingSettings,
  onToggleMute,
  onEndCall,
  onSelectDevice,
  onChangeProcessing,
}: CallScreenProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);

  const stats = useAudioStats(peerConnection);
  const quality = classifyQuality(stats);
  const deviceEvents = useDeviceEvents(true);
  const [lastEventMessage, setLastEventMessage] = useState<string | null>(null);

  useEffect(() => {
    if (audioRef.current && remoteStream) {
      // Plain HTMLMediaElement playback — this is the "media" audio path.
      // No telephony/communications APIs (no HTMLAudioElement.setSinkId to a
      // communications device, no AudioManager MODE_IN_COMMUNICATION equivalent)
      // are used, by design, since that's the variable under test.
      audioRef.current.srcObject = remoteStream;
      void audioRef.current.play().catch(() => {
        // Autoplay may be blocked until a user gesture; the Join/Create button
        // click that led here should count as that gesture in most browsers.
      });
    }
  }, [remoteStream]);

  useEffect(() => {
    if (deviceEvents.length > 0) {
      setLastEventMessage(deviceEvents[0].message);
    }
  }, [deviceEvents]);

  const selectedDeviceId = localStream?.getAudioTracks()[0]?.getSettings().deviceId ?? null;
  const isConnected = callState === 'connected';

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 3,
        gap: 2,
      }}
    >
      <audio ref={audioRef} autoPlay playsInline />

      <Stack alignItems="center" spacing={2} sx={{ mt: 4 }}>
        <AvatarPlaceholder active={isConnected} />
        <Typography variant="h6" color="text.secondary">
          {isConnected ? 'Connected' : 'Connecting…'}
        </Typography>
        <CallTimer isActive={isConnected} />
        <ConnectionQualityIndicator quality={isConnected ? quality : 'unknown'} />
      </Stack>

      <Box sx={{ width: '100%', maxWidth: 420 }}>
        <AudioSettingsPanel
          open={settingsOpen}
          selectedDeviceId={selectedDeviceId}
          processingSettings={processingSettings}
          onSelectDevice={onSelectDevice}
          onChangeProcessing={onChangeProcessing}
        />
        <StatsPanel open={statsOpen} stats={stats} />
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      <Stack direction="row" spacing={2}>
        <IconButton
          onClick={() => setSettingsOpen((v) => !v)}
          color={settingsOpen ? 'primary' : 'default'}
          aria-label="Audio settings"
        >
          <TuneIcon />
        </IconButton>
        <IconButton
          onClick={() => setStatsOpen((v) => !v)}
          color={statsOpen ? 'primary' : 'default'}
          aria-label="Call stats"
        >
          <QueryStatsIcon />
        </IconButton>
      </Stack>

      <Stack direction="row" spacing={3} sx={{ mb: 2 }}>
        <IconButton
          onClick={onToggleMute}
          size="large"
          sx={{
            bgcolor: isMuted ? 'error.main' : 'action.selected',
            width: 64,
            height: 64,
            '&:hover': { bgcolor: isMuted ? 'error.dark' : 'action.hover' },
          }}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <MicOffIcon /> : <MicIcon />}
        </IconButton>

        <Button
          onClick={onEndCall}
          variant="contained"
          color="error"
          size="large"
          startIcon={<CallEndIcon />}
          sx={{ borderRadius: 8, px: 3 }}
        >
          End Call
        </Button>
      </Stack>

      <Snackbar
        open={Boolean(lastEventMessage)}
        autoHideDuration={3000}
        onClose={() => setLastEventMessage(null)}
        message={lastEventMessage}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </Box>
  );
}
