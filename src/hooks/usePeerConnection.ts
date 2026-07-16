import { useCallback, useRef, useState } from 'react';
import type { MediaConnection } from 'peerjs';
import {
  applyHighBitrateToSender,
  createPeer,
  generateReadableRoomId,
  replaceSenderTrack,
} from '../services/peer/peerService';
import { buildAudioConstraints, DEFAULT_PROCESSING_SETTINGS } from '../services/audio/audioConstraints';
import type { AudioProcessingSettings, CallState } from '../utils/types';

interface UsePeerConnectionResult {
  selfId: string | null;
  callState: CallState;
  remoteStream: MediaStream | null;
  localStream: MediaStream | null;
  errorMessage: string | null;
  isMuted: boolean;
  peerConnection: RTCPeerConnection | null;
  processingSettings: AudioProcessingSettings;
  createRoom: () => Promise<string>;
  joinRoom: (remoteId: string) => Promise<void>;
  endCall: () => void;
  toggleMute: () => void;
  switchInputDevice: (deviceId: string) => Promise<void>;
  setProcessingSettings: (settings: AudioProcessingSettings) => Promise<void>;
}

export function usePeerConnection(): UsePeerConnectionResult {
  const [selfId, setSelfId] = useState<string | null>(null);
  const [callState, setCallState] = useState<CallState>('idle');
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [processingSettings, setProcessingSettingsState] = useState<AudioProcessingSettings>(
    DEFAULT_PROCESSING_SETTINGS,
  );

  const peerRef = useRef<ReturnType<typeof createPeer> | null>(null);
  const callRef = useRef<MediaConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const deviceIdRef = useRef<string | undefined>(undefined);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);

  const acquireLocalStream = useCallback(async (): Promise<MediaStream> => {
    const constraints = buildAudioConstraints(deviceIdRef.current, processingSettings);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: constraints, video: false });
    if (isMuted) {
      stream.getAudioTracks().forEach((track) => (track.enabled = false));
    }
    localStreamRef.current = stream;
    setLocalStream(stream);
    return stream;
  }, [processingSettings, isMuted]);

  const wireUpCall = useCallback((call: MediaConnection) => {
    callRef.current = call;
    setCallState('connecting');

    call.on('stream', (remote) => {
      setRemoteStream(remote);
      setCallState('connected');
      setPeerConnection(call.peerConnection ?? null);
      void applyHighBitrateToSender(call);
    });

    call.on('close', () => {
      setCallState('ended');
      setRemoteStream(null);
    });

    call.on('error', (err) => {
      setErrorMessage(err.message);
      setCallState('error');
    });
  }, []);

  const createRoom = useCallback(async (): Promise<string> => {
    setErrorMessage(null);
    setCallState('waiting');
    const roomId = generateReadableRoomId();
    const peer = createPeer(roomId);
    peerRef.current = peer;

    return new Promise<string>((resolve, reject) => {
      peer.on('open', async (id) => {
        setSelfId(id);
        try {
          await acquireLocalStream();
        } catch (err) {
          setErrorMessage((err as Error).message);
          setCallState('error');
          reject(err as Error);
          return;
        }
        resolve(id);
      });

      peer.on('call', (call) => {
        call.answer(localStreamRef.current ?? undefined);
        wireUpCall(call);
      });

      peer.on('error', (err) => {
        setErrorMessage(err.message);
        setCallState('error');
        reject(err);
      });
    });
  }, [acquireLocalStream, wireUpCall]);

  const joinRoom = useCallback(
    async (remoteId: string): Promise<void> => {
      setErrorMessage(null);
      setCallState('connecting');
      const peer = createPeer();
      peerRef.current = peer;

      await new Promise<void>((resolve, reject) => {
        peer.on('open', async () => {
          setSelfId(peer.id);
          try {
            const stream = await acquireLocalStream();
            const call = peer.call(remoteId, stream);
            wireUpCall(call);
            resolve();
          } catch (err) {
            setErrorMessage((err as Error).message);
            setCallState('error');
            reject(err as Error);
          }
        });

        peer.on('error', (err) => {
          setErrorMessage(err.message);
          setCallState('error');
          reject(err);
        });
      });
    },
    [acquireLocalStream, wireUpCall],
  );

  const endCall = useCallback(() => {
    callRef.current?.close();
    peerRef.current?.destroy();
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    callRef.current = null;
    peerRef.current = null;
    localStreamRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    setPeerConnection(null);
    setCallState('ended');
    setSelfId(null);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      localStreamRef.current?.getAudioTracks().forEach((track) => (track.enabled = !next));
      return next;
    });
  }, []);

  const switchInputDevice = useCallback(
    async (deviceId: string): Promise<void> => {
      deviceIdRef.current = deviceId;
      const oldStream = localStreamRef.current;
      const constraints = buildAudioConstraints(deviceId, processingSettings);
      const newStream = await navigator.mediaDevices.getUserMedia({ audio: constraints, video: false });
      const newTrack = newStream.getAudioTracks()[0];
      newTrack.enabled = !isMuted;

      if (callRef.current) {
        await replaceSenderTrack(callRef.current, newTrack);
      }

      oldStream?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = newStream;
      setLocalStream(newStream);
    },
    [processingSettings, isMuted],
  );

  const setProcessingSettings = useCallback(
    async (settings: AudioProcessingSettings): Promise<void> => {
      setProcessingSettingsState(settings);
      const oldStream = localStreamRef.current;
      const constraints = buildAudioConstraints(deviceIdRef.current, settings);
      const newStream = await navigator.mediaDevices.getUserMedia({ audio: constraints, video: false });
      const newTrack = newStream.getAudioTracks()[0];
      newTrack.enabled = !isMuted;

      if (callRef.current) {
        await replaceSenderTrack(callRef.current, newTrack);
      }

      oldStream?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = newStream;
      setLocalStream(newStream);
    },
    [isMuted],
  );

  return {
    selfId,
    callState,
    remoteStream,
    localStream,
    errorMessage,
    isMuted,
    peerConnection,
    processingSettings,
    createRoom,
    joinRoom,
    endCall,
    toggleMute,
    switchInputDevice,
    setProcessingSettings,
  };
}
