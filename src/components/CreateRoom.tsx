import { useEffect, useState } from 'react';
import { Box, Button, CircularProgress, IconButton, Paper, Stack, Typography, Alert } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';
import { QRCodeDisplay } from './QRCodeDisplay';
import type { CallState } from '../utils/types';

interface CreateRoomProps {
  selfId: string | null;
  callState: CallState;
  errorMessage: string | null;
  onCreate: () => void;
  onBack: () => void;
}

export function CreateRoom({ selfId, callState, errorMessage, onCreate, onBack }: CreateRoomProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    onCreate();
    // Runs once when this screen mounts to kick off room creation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopy = async () => {
    if (!selfId) return;
    await navigator.clipboard.writeText(selfId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        gap: 3,
      }}
    >
      <IconButton onClick={onBack} sx={{ position: 'absolute', top: 16, left: 16 }} aria-label="Back">
        <ArrowBackIcon />
      </IconButton>

      <Typography variant="h5" fontWeight={600}>
        Room Created
      </Typography>

      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      {!selfId && !errorMessage && (
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography color="text.secondary">Connecting to signaling server…</Typography>
        </Stack>
      )}

      {selfId && (
        <Paper sx={{ p: 3, width: '100%', maxWidth: 360 }} elevation={3}>
          <Stack spacing={3} alignItems="center">
            <Stack alignItems="center" spacing={1}>
              <Typography variant="caption" color="text.secondary">
                ROOM ID
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h5" fontWeight={700} letterSpacing={1}>
                  {selfId}
                </Typography>
                <IconButton onClick={handleCopy} size="small" aria-label="Copy room ID">
                  {copied ? <CheckIcon fontSize="small" color="success" /> : <ContentCopyIcon fontSize="small" />}
                </IconButton>
              </Stack>
            </Stack>

            <QRCodeDisplay value={selfId} />

            <Stack alignItems="center" spacing={1}>
              <CircularProgress size={22} />
              <Typography color="text.secondary" variant="body2">
                Waiting for the other phone to join…
              </Typography>
            </Stack>
          </Stack>
        </Paper>
      )}

      {callState === 'error' && (
        <Button variant="outlined" onClick={onBack}>
          Back to home
        </Button>
      )}
    </Box>
  );
}
