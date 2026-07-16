export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

export function formatBitrate(kbps: number): string {
  if (kbps <= 0) return '0 kbps';
  if (kbps >= 1000) return `${(kbps / 1000).toFixed(2)} Mbps`;
  return `${kbps.toFixed(0)} kbps`;
}

export function formatMs(ms: number): string {
  if (!Number.isFinite(ms)) return '—';
  return `${ms.toFixed(0)} ms`;
}

export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return `${value.toFixed(1)}%`;
}
