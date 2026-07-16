# HFAC — High-Fidelity Audio Call POC

A throwaway proof-of-concept, not a product. It exists to answer one question:

> Can two Android phones on the same WiFi have a much higher quality voice conversation by
> intentionally avoiding Android's **communication audio path** and instead using the
> **media audio path**, capturing from either the phone mic or a wired headset mic?

It's a plain browser page (React + Vite + TypeScript + PeerJS + WebRTC + Web Audio API +
Material UI). No backend, no database, no auth — PeerJS's public cloud broker
(`0.peerjs.com`) is used only to exchange connection metadata (SDP/ICE candidates); once the
call connects, audio flows directly between the two phones over WiFi.

## Why this matters

Android's `AudioManager` has two very different audio routing behaviors:

- **Communication path** (`MODE_IN_COMMUNICATION`) — what regular VoIP/calling apps use.
  Optimized for low latency and duplex speech, but the OS forces narrowband processing,
  aggressive AGC/NS/AEC, and — critically — pushes Bluetooth into its **HFP/SCO voice
  profile** (~16kHz mono, noticeably worse than music quality).
- **Media path** (`MODE_NORMAL`) — what music/video apps use. Full 48kHz stereo capability,
  no forced DSP, and Bluetooth stays in **A2DP** (high-quality stereo streaming profile).

This app deliberately never touches telephony/communication APIs. It calls
`getUserMedia()` for capture and plays remote audio through a plain `<audio>` element — the
same as any music or video site would — to see whether that alone measurably improves
perceived call quality.

## Tech stack

- React + Vite + TypeScript
- PeerJS (WebRTC signaling via its free cloud broker — no server code in this repo)
- Web Audio API / WebRTC `getStats()` for live diagnostics
- Material UI

## Project structure

```
src/
  components/   UI: Home, Create/Join Room, Call Screen, Stats/Settings panels
  hooks/        usePeerConnection, useMediaDevices, useDeviceEvents, useAudioStats, useCallTimer
  services/
    peer/       PeerJS wrapper, sender bitrate/track helpers
    audio/      device classification, getUserMedia constraints, SDP munging for Opus
  utils/        shared types + formatters
```

## Installation

Requires Node 18+.

```bash
npm install
```

## Running locally

```bash
npm run dev -- --host
```

`--host` binds Vite to `0.0.0.0` instead of just `localhost`, which is what makes the next
step possible.

## Opening on another phone

1. Run `npm run dev -- --host` on your computer. Note the "Network" URL it prints, e.g.
   `http://192.168.1.23:5173`.
2. Make sure both phones and the computer are on the **same WiFi network** (not one on WiFi
   and one on mobile data — PeerJS signaling would still work, but you'd no longer be testing
   a local-network call).
3. On each phone's browser (Chrome recommended on Android), open that Network URL.
4. **Browsers require HTTPS for microphone access on any origin other than `localhost`.**
   Plain `http://192.168.x.x:5173` will load the page but `getUserMedia()` will be blocked.
   Two ways around this for a POC:
   - Easiest: on each Android phone, open `chrome://flags/#unsafely-treat-insecure-origin-as-secure`,
     add your computer's `http://192.168.x.x:5173` origin, enable the flag, and relaunch Chrome.
   - Alternative: put the dev server behind a tunnel that provides HTTPS (e.g. `npx localtunnel`
     or similar), or generate a local TLS cert and pass it to Vite's `server.https` option.
   - Or just use the deployed HTTPS URL from the section below — no flag needed.
5. On phone A, tap **Create Room** — it will show a room ID, a Copy button, and a QR code.
6. On phone B, tap **Join Room**, either type the room ID or scan the QR code manually (this POC
   doesn't include a camera QR scanner — the QR code is meant to be read by the other phone's
   camera app / a separate scanner, then the ID typed in), and tap **Join**.
7. Once connected you'll land on the Call Screen with a timer, connection quality chip, and
   controls for mute/end call/audio settings/stats.

## Testing across two different networks (not just local WiFi)

The LAN setup above is enough when both phones share the same WiFi, but if the other person
is elsewhere (different WiFi, mobile data, etc.) two extra things come into play:

1. **The page needs a public HTTPS URL** instead of your machine's local IP. This repo is set
   up to deploy a static build to GitHub Pages:

   ```bash
   npm run deploy
   ```

   This builds the app and publishes `dist/` to the `gh-pages` branch. The first time, enable
   Pages once in the repo's Settings → Pages → "Deploy from a branch" → branch `gh-pages`,
   folder `/ (root)`. After that it's live at `https://<your-github-username>.github.io/HFAC_Test1/`.
   Re-run `npm run deploy` any time you want to publish new changes — pushing to `main` does
   **not** auto-deploy.

   Anyone with that URL can create/join rooms — there's no auth, so don't treat room IDs as a
   security boundary, and don't deploy anything sensitive this way.

2. **NAT traversal needs more than STUN.** On a shared LAN, PeerJS's default STUN-only ICE
   config almost always finds a direct path. Across two arbitrary networks — especially if
   either side is on mobile data behind carrier-grade NAT, or a restrictive WiFi (school,
   corporate) — STUN alone frequently can't find a direct path at all, and the call fails to
   connect rather than just sounding worse. `src/services/peer/peerService.ts` adds a public
   TURN relay (the Open Relay Project's free demo servers) as a fallback for exactly this case.
   If a direct/STUN path isn't found, audio relays through that third-party server instead —
   fine for a POC, but worth knowing if you care about who's in the media path.

## How to test with wired headphones

1. Plug a wired headset (3.5mm or USB-C with an inline mic) into the phone before or during
   the call.
2. Open the **Audio Settings** panel (tune icon) on the Call Screen.
3. The app enumerates `mediaDevices` and heuristically labels devices as phone / wired /
   Bluetooth microphone based on their reported label. If a wired mic is detected, it's called
   out with a recommendation banner — select it from the dropdown.
4. Because processing (echo cancellation / noise suppression / AGC) defaults to **off**, wired
   headphones are the safest way to avoid feedback loops (speaker bleeding back into the mic).

## How to test with Bluetooth headphones

1. Pair the Bluetooth headset/earbuds to the phone normally, then select it from **Audio
   Settings** as the input device.
2. If the app detects the selected input is a Bluetooth device, it surfaces a warning:
   > "Bluetooth microphone may reduce playback quality because Android may switch Bluetooth
   > into voice profile."
   This is because as soon as the browser opens a Bluetooth microphone as an audio *input*,
   Android/the Bluetooth stack commonly renegotiates the connection into HFP/SCO for the
   duration of capture — which also degrades the *output* on the same device, even though
   this app never asked for that mode. This is an OS/Bluetooth-stack behavior outside the
   page's control; the warning exists purely to make the tradeoff visible during testing.
3. To isolate media-quality playback from this effect, one useful comparison is: phone mic or
   wired mic for capture (so Bluetooth stays in A2DP) with Bluetooth headphones used only for
   **output**.

## How to compare quality

Use the **Stats** panel (chart icon) on the Call Screen, refreshed every second from
`RTCPeerConnection.getStats()`:

- **Codec** — should read `opus`
- **Bitrate** — actual measured send bitrate (target: as close to the ~510kbps Opus ceiling as
  the network allows, far above typical VoIP's ~24-32kbps)
- **RTT** — round-trip time in ms
- **Packet loss** — percent of packets lost end-to-end
- **Jitter** — inter-packet arrival variance in ms
- **Audio level** — normalized (0–1) instantaneous level of the received audio track

Suggested comparison protocol:

1. Run the same short scripted phrase or audio clip test on each configuration:
   phone mic → phone speaker, wired mic → wired headphones, Bluetooth mic → Bluetooth output,
   phone/wired mic → Bluetooth output only.
2. Record the Stats panel values for each run (bitrate is the most direct proxy for
   "is Opus actually being allowed to run at high quality," RTT/loss/jitter are network-side
   and should be similar across runs on the same WiFi).
3. Judge perceived quality (bandwidth/brightness of the audio, presence of the "muffled"
   narrowband telephony sound) by ear, since that's the actual hypothesis under test —
   `getStats()` numbers alone won't capture the codec-profile switch on the Bluetooth side.

## What's deliberately NOT done, and why

- **No `setSinkId`, no communications-audio-specific APIs.** Remote audio plays through a
  plain `<audio>` element exactly as a music/video site would. That's the whole premise of
  "media path instead of communication path."
- **No forced audio routing.** The app does not attempt to force Bluetooth into A2DP or block
  Android's own routing decisions — that's an OS-level policy no web page can override. The UI
  only detects and warns.
- **SDP munging (`src/services/audio/sdpMunging.ts`).** PeerJS manages its own
  `RTCPeerConnection` instances internally without exposing pre-signaling hooks, so this app
  monkey-patches `RTCPeerConnection.prototype.setLocalDescription` once at startup to rewrite
  the Opus `fmtp` line (`stereo=1`, `maxaveragebitrate=510000`, `maxplaybackrate=48000`,
  `useinbandfec=1`, `usedtx=0`) and to strip any `b=AS`/`b=TIAS` bandwidth caps. Bitrate is
  additionally (and more reliably) enforced via `RTCRtpSender.setParameters({ encodings:
  [{ maxBitrate }] })` after connection.
- **Device classification is heuristic, not authoritative.** The Web platform doesn't expose a
  device "type" — only a label string once mic permission is granted — so "phone mic" /
  "wired" / "Bluetooth" labels here are keyword-matched against common OEM naming patterns and
  can be wrong on some devices/browsers.
- **No native "headphones connected/disconnected" event.** That's an Android-native broadcast,
  not exposed to web pages. The closest available signal is `navigator.mediaDevices`'s generic
  `devicechange` event, which this app diffs against a previous device snapshot to infer
  connect/disconnect — it fires reliably in Chrome for Android for USB/wired changes, less
  consistently for Bluetooth.
- **Two-word+digits room IDs instead of PeerJS's default UUID**, purely so a human can read one
  aloud or type it manually on the other phone during testing.
- **Public demo TURN server, not a private one.** Cross-network testing needs *some* TURN
  fallback or many NAT combinations simply can't connect; standing up a private TURN server is
  out of scope for a throwaway POC, so this uses the Open Relay Project's free public relay
  instead. Don't rely on this for anything beyond local experimentation.
