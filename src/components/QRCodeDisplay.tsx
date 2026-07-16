import { Box, Paper } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  value: string;
}

export function QRCodeDisplay({ value }: QRCodeDisplayProps) {
  return (
    <Paper elevation={0} sx={{ p: 2, bgcolor: '#fff', borderRadius: 3, display: 'inline-flex' }}>
      <Box sx={{ display: 'flex' }}>
        <QRCodeSVG value={value} size={176} />
      </Box>
    </Paper>
  );
}
