import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, X } from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Lazy-load simple-peer to avoid SSR/Vite issues
let SimplePeer;
const getPeer = async () => {
  if (!SimplePeer) {
    const mod = await import('simple-peer');
    SimplePeer = mod.default;
  }
  return SimplePeer;
};

export default function LiveRoom() {
  const { roomId }   = useParams();
  const { user }     = useAuth();
  const navigate     = useNavigate();

  const [peers,         setPeers]         = useState({});       // { socketId: {stream, userName} }
  const [audioEnabled,  setAudioEnabled]  = useState(true);
  const [videoEnabled,  setVideoEnabled]  = useState(true);
  const [chatMessages,  setChatMessages]  = useState([]);
  const [chatInput,     setChatInput]     = useState('');
  const [showChat,      setShowChat]      = useState(true);
  const [error,         setError]         = useState('');

  const localVideoRef = useRef(null);
  const localStreamRef= useRef(null);
  const socketRef     = useRef(null);
  const peersRef      = useRef({});
  const chatEndRef    = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const Peer   = await getPeer();
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }

        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        const socket = io(SOCKET_URL, { transports: ['websocket'] });
        socketRef.current = socket;

        socket.emit('join-room', { roomId, userId: user._id, userName: user.name });

        socket.on('room-participants', ({ participants }) => {
          participants.forEach(({ socketId, userName }) => createPeer(Peer, socket, socketId, userName, true, stream));
        });

        socket.on('user-joined', ({ socketId, userName }) => {
          createPeer(Peer, socket, socketId, userName, false, stream);
        });

        socket.on('offer', ({ from, offer }) => {
          peersRef.current[from]?.signal(offer);
        });

        socket.on('answer', ({ from, answer }) => {
          peersRef.current[from]?.signal(answer);
        });

        socket.on('ice-candidate', ({ from, candidate }) => {
          peersRef.current[from]?.signal(candidate);
        });

        socket.on('user-left', ({ socketId }) => {
          peersRef.current[socketId]?.destroy();
          delete peersRef.current[socketId];
          setPeers((prev) => { const next = { ...prev }; delete next[socketId]; return next; });
        });

        socket.on('chat-message', (msg) => {
          setChatMessages((prev) => [...prev, msg]);
        });
      } catch (err) {
        console.error(err);
        setError(err.message.includes('Permission')
          ? 'Camera/microphone access denied. Please allow access and refresh.'
          : `Could not start call: ${err.message}`
        );
      }
    };

    init();
    return () => {
      cancelled = true;
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      Object.values(peersRef.current).forEach((p) => p.destroy());
      socketRef.current?.disconnect();
    };
  }, [roomId, user]);

  // Auto-scroll chat
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  const createPeer = (Peer, socket, targetSocketId, userName, initiator, stream) => {
    const peer = new Peer({ initiator, trickle: true, stream });

    peer.on('signal', (data) => {
      const evt = data.type === 'offer' ? 'offer' : data.type === 'answer' ? 'answer' : 'ice-candidate';
      socket.emit(evt, { targetSocketId, [data.type ?? 'candidate']: data });
    });

    peer.on('stream', (remoteStream) => {
      setPeers((prev) => ({ ...prev, [targetSocketId]: { stream: remoteStream, userName } }));
    });

    peer.on('error', (err) => console.error('Peer error:', err));

    peersRef.current[targetSocketId] = peer;
  };

  const toggleAudio = () => {
    const next = !audioEnabled;
    localStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = next));
    setAudioEnabled(next);
  };

  const toggleVideo = () => {
    const next = !videoEnabled;
    localStreamRef.current?.getVideoTracks().forEach((t) => (t.enabled = next));
    setVideoEnabled(next);
  };

  const sendMessage = () => {
    const msg = chatInput.trim();
    if (!msg || !socketRef.current) return;
    socketRef.current.emit('chat-message', { roomId, message: msg, userName: user.name });
    setChatInput('');
  };

  const hangUp = () => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    Object.values(peersRef.current).forEach((p) => p.destroy());
    socketRef.current?.disconnect();
    navigate('/dashboard');
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-center max-w-md px-4">
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button onClick={() => navigate('/dashboard')} className="bg-brand-600 px-6 py-2 rounded-lg">
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* ── Video grid ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 auto-rows-fr overflow-auto">
          {/* Local */}
          <div className="relative bg-gray-800 rounded-xl overflow-hidden min-h-[180px]">
            <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            <span className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-xs">
              You ({user.name})
            </span>
            {!videoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <VideoOff className="w-10 h-10 text-gray-600" />
              </div>
            )}
          </div>

          {/* Remotes */}
          {Object.entries(peers).map(([socketId, { stream, userName }]) => (
            <RemoteVideo key={socketId} stream={stream} userName={userName} />
          ))}
        </div>

        {/* Controls bar */}
        <div className="flex-shrink-0 h-20 border-t border-gray-800 flex items-center justify-center gap-4 px-4">
          <ControlBtn active={audioEnabled} onClick={toggleAudio} label="Mic">
            {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </ControlBtn>
          <ControlBtn active={videoEnabled} onClick={toggleVideo} label="Camera">
            {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </ControlBtn>
          <ControlBtn active={showChat} onClick={() => setShowChat((s) => !s)} label="Chat">
            <MessageSquare className="w-5 h-5" />
          </ControlBtn>
          <button
            onClick={hangUp}
            className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors"
            title="Leave call"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Chat sidebar ── */}
      {showChat && (
        <div className="w-72 flex-shrink-0 border-l border-gray-800 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <span className="font-semibold text-sm">Live Chat</span>
            <button onClick={() => setShowChat(false)} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {chatMessages.length === 0 && (
              <p className="text-gray-500 text-xs text-center mt-4">No messages yet</p>
            )}
            {chatMessages.map((msg, i) => (
              <div key={i} className="text-sm">
                <span className="text-brand-400 font-semibold">{msg.userName}: </span>
                <span className="text-gray-300">{msg.message}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="p-3 border-t border-gray-800 flex gap-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message…"
              className="flex-1 bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ring-brand-500"
            />
            <button
              onClick={sendMessage}
              className="bg-brand-600 px-3 py-2 rounded-lg text-sm hover:bg-brand-700 transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ControlBtn({ active, onClick, children, label }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
        active ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
      }`}
    >
      {children}
    </button>
  );
}

function RemoteVideo({ stream, userName }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.srcObject = stream; }, [stream]);
  return (
    <div className="relative bg-gray-800 rounded-xl overflow-hidden min-h-[180px]">
      <video ref={ref} autoPlay playsInline className="w-full h-full object-cover" />
      <span className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-xs">{userName}</span>
    </div>
  );
}
