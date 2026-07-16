import { useCallback, useState } from 'react';
import { usePeerConnection } from './hooks/usePeerConnection';
import { HomePage } from './components/HomePage';
import { CreateRoom } from './components/CreateRoom';
import { JoinRoom } from './components/JoinRoom';
import { CallScreen } from './components/CallScreen';

type Mode = 'home' | 'create' | 'join';

export default function App() {
  const [mode, setMode] = useState<Mode>('home');
  const peer = usePeerConnection();

  const handleBack = useCallback(() => {
    peer.endCall();
    setMode('home');
  }, [peer]);

  const handleEndCall = useCallback(() => {
    peer.endCall();
    setMode('home');
  }, [peer]);

  if (peer.callState === 'connected' || (mode !== 'home' && peer.callState === 'connecting')) {
    return (
      <CallScreen
        callState={peer.callState}
        remoteStream={peer.remoteStream}
        localStream={peer.localStream}
        peerConnection={peer.peerConnection}
        isMuted={peer.isMuted}
        processingSettings={peer.processingSettings}
        onToggleMute={peer.toggleMute}
        onEndCall={handleEndCall}
        onSelectDevice={peer.switchInputDevice}
        onChangeProcessing={peer.setProcessingSettings}
      />
    );
  }

  if (mode === 'create') {
    return (
      <CreateRoom
        selfId={peer.selfId}
        callState={peer.callState}
        errorMessage={peer.errorMessage}
        onCreate={() => void peer.createRoom()}
        onBack={handleBack}
      />
    );
  }

  if (mode === 'join') {
    return (
      <JoinRoom
        callState={peer.callState}
        errorMessage={peer.errorMessage}
        onJoin={(roomId) => void peer.joinRoom(roomId)}
        onBack={handleBack}
      />
    );
  }

  return <HomePage onCreateRoom={() => setMode('create')} onJoinRoom={() => setMode('join')} />;
}
