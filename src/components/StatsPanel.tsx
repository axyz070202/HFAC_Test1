import { Box, Collapse, Paper, Stack, Typography } from '@mui/material';
import type { CallStats } from '../utils/types';
import { formatBitrate, formatMs, formatPercent } from '../utils/formatters';

interface StatsPanelProps {
  open: boolean;
  stats: CallStats;
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ width: '50%', boxSizing: 'border-box', pr: 1, pb: 1.5 }}>
      <Stack spacing={0.25}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body1" fontWeight={600} sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </Typography>
      </Stack>
    </Box>
  );
}

export function StatsPanel({ open, stats }: StatsPanelProps) {
  return (
    <Collapse in={open} unmountOnExit>
      <Paper sx={{ p: 2.5, mt: 2 }} elevation={2}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Live Stats (getStats, 1s interval)
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
          <StatRow label="Codec" value={stats.codec} />
          <StatRow label="Bitrate" value={formatBitrate(stats.bitrateKbps)} />
          <StatRow label="Round-trip time" value={formatMs(stats.roundTripTimeMs)} />
          <StatRow label="Packet loss" value={formatPercent(stats.packetLossPercent)} />
          <StatRow label="Jitter" value={formatMs(stats.jitterMs)} />
          <StatRow label="Audio level" value={stats.audioLevel.toFixed(3)} />
        </Box>
      </Paper>
    </Collapse>
  );
}
