import { Chip } from '@mui/material';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import type { ConnectionQuality } from '../utils/types';

const QUALITY_CONFIG: Record<ConnectionQuality, { label: string; color: 'success' | 'info' | 'warning' | 'error' | 'default' }> = {
  excellent: { label: 'Excellent', color: 'success' },
  good: { label: 'Good', color: 'info' },
  fair: { label: 'Fair', color: 'warning' },
  poor: { label: 'Poor', color: 'error' },
  unknown: { label: 'Measuring…', color: 'default' },
};

interface ConnectionQualityIndicatorProps {
  quality: ConnectionQuality;
}

export function ConnectionQualityIndicator({ quality }: ConnectionQualityIndicatorProps) {
  const config = QUALITY_CONFIG[quality];
  return <Chip icon={<SignalCellularAltIcon />} label={config.label} color={config.color} variant="filled" />;
}
