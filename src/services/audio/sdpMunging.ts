// PeerJS creates and manages its own RTCPeerConnection instances internally and
// does not expose a hook to intercept the SDP it generates before signaling it
// to the remote peer. The only reliable way to rewrite the SDP in this setup is
// to patch RTCPeerConnection.prototype.setLocalDescription globally, once, before
// any PeerJS Peer is constructed. This runs for every connection the page creates
// (there is only ever one call at a time in this POC).
//
// Target Opus parameters, applied to the m=audio line's fmtp attribute:
//   stereo=1                 — request stereo instead of Opus' default mono downmix
//   sprop-stereo=1           — advertise that we may send stereo
//   maxaveragebitrate=510000 — Opus' practical ceiling (~510kbps) instead of the ~32kbps default
//   maxplaybackrate=48000    — full-band 48kHz instead of Chrome's default narrower band
//   useinbandfec=1           — forward error correction for lossy WiFi/mobile links
//   usedtx=0                 — disable discontinuous transmission (DTX would drop bitrate in silence)
let patched = false;

export function installSdpMunging(): void {
  if (patched) return;
  patched = true;

  const proto = RTCPeerConnection.prototype;
  const originalSetLocalDescription = proto.setLocalDescription as (
    this: RTCPeerConnection,
    description?: RTCLocalSessionDescriptionInit,
  ) => Promise<void>;

  proto.setLocalDescription = function patchedSetLocalDescription(
    this: RTCPeerConnection,
    description?: RTCLocalSessionDescriptionInit,
  ) {
    if (description?.sdp) {
      const munged = { ...description, sdp: mungeOpusSdp(description.sdp) };
      return originalSetLocalDescription.call(this, munged);
    }
    return originalSetLocalDescription.call(this, description);
  };
}

export function mungeOpusSdp(sdp: string): string {
  const lines = sdp.split('\r\n');
  const opusPayloadType = findOpusPayloadType(lines);
  if (opusPayloadType === null) return sdp;

  let sawFmtpForOpus = false;
  const result: string[] = [];

  for (const line of lines) {
    if (line.startsWith(`a=fmtp:${opusPayloadType} `)) {
      sawFmtpForOpus = true;
      result.push(buildFmtpLine(opusPayloadType, line));
      continue;
    }

    // Remove any pre-existing bandwidth cap so our fmtp bitrate hint is the only limit.
    if (line.startsWith('b=AS:') || line.startsWith('b=TIAS:')) {
      continue;
    }

    result.push(line);
  }

  if (!sawFmtpForOpus) {
    // No existing fmtp line for Opus — insert one right after its rtpmap line.
    const rtpmapIndex = result.findIndex((l) => l.startsWith(`a=rtpmap:${opusPayloadType} opus/`));
    if (rtpmapIndex !== -1) {
      result.splice(rtpmapIndex + 1, 0, buildFmtpLine(opusPayloadType, null));
    }
  }

  return result.join('\r\n');
}

function findOpusPayloadType(lines: string[]): number | null {
  for (const line of lines) {
    const match = /^a=rtpmap:(\d+) opus\/48000/i.exec(line);
    if (match) return Number(match[1]);
  }
  return null;
}

const DESIRED_PARAMS: Record<string, string> = {
  stereo: '1',
  'sprop-stereo': '1',
  maxaveragebitrate: '510000',
  maxplaybackrate: '48000',
  useinbandfec: '1',
  usedtx: '0',
};

function buildFmtpLine(payloadType: number, existingLine: string | null): string {
  const params = new Map<string, string>();

  if (existingLine) {
    const value = existingLine.slice(existingLine.indexOf(' ') + 1);
    for (const pair of value.split(';')) {
      const [key, val] = pair.split('=');
      if (key) params.set(key.trim(), (val ?? '').trim());
    }
  }

  for (const [key, val] of Object.entries(DESIRED_PARAMS)) {
    params.set(key, val);
  }

  const serialized = Array.from(params.entries())
    .map(([key, val]) => (val ? `${key}=${val}` : key))
    .join(';');

  return `a=fmtp:${payloadType} ${serialized}`;
}
