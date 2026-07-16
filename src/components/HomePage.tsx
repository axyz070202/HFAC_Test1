import { Box, Button, Stack, Typography, Paper } from '@mui/material';
import CallMadeIcon from '@mui/icons-material/CallMade';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';

interface HomePageProps {
  onCreateRoom: () => void;
  onJoinRoom: () => void;
}

export function HomePage({ onCreateRoom, onJoinRoom }: HomePageProps) {
  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: 3,
        gap: 4,
      }}
    >
      <Stack spacing={1} alignItems="center" textAlign="center">
        <Typography variant="h4" fontWeight={700}>
          HFAC
        </Typography>
        <Typography variant="body1" color="text.secondary" maxWidth={360}>
          High-fidelity audio call proof of concept — media-path audio instead of Android's
          communication path.
        </Typography>
      </Stack>

      <Paper sx={{ p: 3, width: '100%', maxWidth: 360 }} elevation={3}>
        <Stack spacing={2}>
          <Button
            variant="contained"
            size="large"
            startIcon={<MeetingRoomIcon />}
            onClick={onCreateRoom}
            fullWidth
          >
            Create Room
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<CallMadeIcon />}
            onClick={onJoinRoom}
            fullWidth
          >
            Join Room
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
