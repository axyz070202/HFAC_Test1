import { useEffect, useRef, useState } from 'react';
import type { CallStats, ConnectionQuality } from '../utils/types';

const EMPTY_STATS: CallStats = {
  timestamp: 0,
  codec: '—',
  bitrateKbps: 0,
  roundTripTimeMs: NaN,
  packetLossPercent: 0,
  jitterMs: 0,
  audioLevel: 0,
};

interface PreviousSample {
  bytesSent: number;
  timestamp: number;
}

export function useAudioStats(peerConnection: RTCPeerConnection | null): CallStats {
  const [stats, setStats] = useState<CallStats>(EMPTY_STATS);
  const previous = useRef<PreviousSample | null>(null);

  useEffect(() => {
    if (!peerConnection) {
      previous.current = null;
      setStats(EMPTY_STATS);
      return undefined;
    }

    const interval = setInterval(async () => {
      try {
        const report = await peerConnection.getStats();
        const parsed = parseStatsReport(report, previous.current);
        previous.current = parsed.sample;
        setStats(parsed.stats);
      } catch {
        // getStats can throw transiently around connection teardown; skip this tick.
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [peerConnection]);

  return stats;
}

function parseStatsReport(
  report: RTCStatsReport,
  previousSample: PreviousSample | null,
): { stats: CallStats; sample: PreviousSample } {
  let outboundRtp: RTCOutboundRtpStreamStats | undefined;
  let inboundRtp: RTCInboundRtpStreamStats | undefined;
  // Not yet in TypeScript's lib.dom.d.ts RTCStatsReport typings on all versions;
  // shaped manually to match the WebRTC stats spec fields we read from it.
  let remoteInboundRtp: { roundTripTime?: number; fractionLost?: number } | undefined;
  let selectedCandidatePair: RTCIceCandidatePairStats | undefined;
  let codecEntry: { mimeType?: string } | undefined;

  report.forEach((entry) => {
    if (entry.type === 'outbound-rtp' && entry.kind === 'audio') {
      outboundRtp = entry;
    } else if (entry.type === 'inbound-rtp' && entry.kind === 'audio') {
      inboundRtp = entry;
    } else if (entry.type === 'remote-inbound-rtp' && entry.kind === 'audio') {
      remoteInboundRtp = entry;
    } else if (entry.type === 'candidate-pair' && (entry.state === 'succeeded' || entry.nominated)) {
      selectedCandidatePair = entry;
    }
  });

  if (outboundRtp?.codecId) {
    codecEntry = report.get(outboundRtp.codecId);
  } else if (inboundRtp?.codecId) {
    codecEntry = report.get(inboundRtp.codecId);
  }

  const now = performance.now();
  let bitrateKbps = 0;

  if (outboundRtp && previousSample) {
    const bytesDelta = (outboundRtp.bytesSent ?? 0) - previousSample.bytesSent;
    const timeDeltaSeconds = (now - previousSample.timestamp) / 1000;
    if (timeDeltaSeconds > 0 && bytesDelta >= 0) {
      bitrateKbps = (bytesDelta * 8) / 1000 / timeDeltaSeconds;
    }
  }

  const roundTripTimeMs = remoteInboundRtp?.roundTripTime
    ? remoteInboundRtp.roundTripTime * 1000
    : selectedCandidatePair?.currentRoundTripTime
      ? selectedCandidatePair.currentRoundTripTime * 1000
      : NaN;

  let packetLossPercent = 0;
  if (remoteInboundRtp?.fractionLost !== undefined) {
    packetLossPercent = remoteInboundRtp.fractionLost * 100;
  } else if (inboundRtp && inboundRtp.packetsLost !== undefined && inboundRtp.packetsReceived) {
    const total = inboundRtp.packetsLost + inboundRtp.packetsReceived;
    packetLossPercent = total > 0 ? (inboundRtp.packetsLost / total) * 100 : 0;
  }

  const stats: CallStats = {
    timestamp: Date.now(),
    codec: codecEntry?.mimeType?.replace('audio/', '') ?? '—',
    bitrateKbps,
    roundTripTimeMs,
    packetLossPercent,
    jitterMs: inboundRtp?.jitter ? inboundRtp.jitter * 1000 : 0,
    audioLevel: inboundRtp?.audioLevel ?? 0,
  };

  return {
    stats,
    sample: { bytesSent: outboundRtp?.bytesSent ?? previousSample?.bytesSent ?? 0, timestamp: now },
  };
}

export function classifyQuality(stats: CallStats): ConnectionQuality {
  if (!Number.isFinite(stats.roundTripTimeMs) && stats.timestamp === 0) return 'unknown';

  const rtt = Number.isFinite(stats.roundTripTimeMs) ? stats.roundTripTimeMs : 0;

  if (rtt < 150 && stats.packetLossPercent < 1 && stats.jitterMs < 30) return 'excellent';
  if (rtt < 300 && stats.packetLossPercent < 3 && stats.jitterMs < 50) return 'good';
  if (rtt < 500 && stats.packetLossPercent < 8) return 'fair';
  return 'poor';
}
