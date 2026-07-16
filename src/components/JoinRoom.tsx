import { useState } from 'react';
import { Alert, Box, Button, CircularProgress, IconButton, Paper, Stack, TextField, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import type { CallState } from '../utils/types';

interface JoinRoomProps {
  callState: CallState;
  errorMessage: string | null;
  onJoin: (roomId: string) => void;
  onBack: () => void;
}

export function JoinRoom({ callState, errorMessage, onJoin, onBack }: JoinRoomProps) {
  const [roomId, setRoomId] = useState('');
  const isConnecting = callState === 'connecting';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim()) {
      onJoin(roomId.trim());
    }
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
        Join Room
      </Typography>

      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3, width: '100%', maxWidth: 360 }} elevation={3}>
        <Stack spacing={2}>
          <TextField
            label="Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="e.g. sun-4821"
            autoFocus
            fullWidth
            disabled={isConnecting}
          />
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={!roomId.trim() || isConnecting}
            startIcon={isConnecting ? <CircularProgress size={18} color="inherit" /> : undefined}
          >
            {isConnecting ? 'Connecting…' : 'Join'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
