import Peer, { type MediaConnection } from 'peerjs';
import { installSdpMunging } from '../audio/sdpMunging';

// PeerJS's default cloud broker (0.peerjs.com) is used purely for signaling —
// exchanging SDP/ICE candidates. Once WebRTC negotiation completes, audio flows
// peer-to-peer directly between the two phones on the local WiFi network; no
// media ever touches the signaling server.
export function createPeer(customId?: string): Peer {
  installSdpMunging();
  return customId ? new Peer(customId) : new Peer();
}

export function generateReadableRoomId(): string {
  // Short, speakable/typeable room codes instead of PeerJS's default long uuid,
  // since a human may need to read this aloud or type it on the other phone.
  const words = ['sun', 'moon', 'star', 'lake', 'peak', 'reef', 'palm', 'wave', 'echo', 'fern'];
  const word = words[Math.floor(Math.random() * words.length)];
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `${word}-${digits}`;
}

const MAX_OPUS_BITRATE_BPS = 510_000;

// Opus fmtp maxaveragebitrate (set in sdpMunging) is a hint the encoder may not
// always honor; RTCRtpSender.setParameters gives a firmer per-encoding cap and is
// the modern, cross-browser-supported way to raise the ceiling above WebRTC's
// conservative default audio bitrate.
export async function applyHighBitrateToSender(call: MediaConnection): Promise<void> {
  const pc = call.peerConnection;
  if (!pc) return;

  const audioSender = pc.getSenders().find((s) => s.track?.kind === 'audio');
  if (!audioSender) return;

  const params = audioSender.getParameters();
  if (!params.encodings || params.encodings.length === 0) {
    params.encodings = [{}];
  }
  params.encodings[0].maxBitrate = MAX_OPUS_BITRATE_BPS;

  try {
    await audioSender.setParameters(params);
  } catch {
    // Some browsers reject setParameters before the first negotiation completes;
    // safe to ignore since the SDP-level fmtp bitrate hint still applies.
  }
}

export function replaceSenderTrack(call: MediaConnection, track: MediaStreamTrack): Promise<void> {
  const pc = call.peerConnection;
  const audioSender = pc?.getSenders().find((s) => s.track?.kind === 'audio');
  if (!audioSender) return Promise.resolve();
  return audioSender.replaceTrack(track);
}
