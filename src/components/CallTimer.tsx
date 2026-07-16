import { Typography } from '@mui/material';
import { useCallTimer } from '../hooks/useCallTimer';
import { formatDuration } from '../utils/formatters';

interface CallTimerProps {
  isActive: boolean;
}

export function CallTimer({ isActive }: CallTimerProps) {
  const elapsedSeconds = useCallTimer(isActive);

  return (
    <Typography variant="h5" sx={{ fontVariantNumeric: 'tabular-nums', letterSpacing: 1 }}>
      {formatDuration(elapsedSeconds)}
    </Typography>
  );
}
