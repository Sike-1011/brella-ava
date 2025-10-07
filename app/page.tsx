'use client';

import { useState, useRef } from 'react';
// TypeScript declaration for window.voiceflow
declare global {
  interface Window {
    voiceflow: any;
  }
}
import type { MutableRefObject } from 'react';

function Spinner({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center" style={{ minHeight: 420 }}>
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-800 mb-4"></div>
      <span className="text-lg font-semibold text-blue-800 drop-shadow-lg animate-pulse">{text}</span>
    </div>
  );
}

// Simple toast component
function Toast({ message, type }: { message: string; type: 'success' | 'info' | 'error' }) {
  const bg = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-800';
  return (
    <div className={`fixed top-8 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg text-white shadow-lg z-50 transition-all duration-500 ${bg}`}>{message}</div>
  );
}

export default function Home() {
  const [vfLoaded, setVfLoaded] = useState<boolean>(false);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [closing, setClosing] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const chatRef = useRef<HTMLDivElement | null>(null);

  // Auto-start chat after widget loads
  const handleStart = () => {
    if (!vfLoaded) {
      // First time initialization
      setLoading(true);
      setShowChat(true);
      setToast({ message: 'Starting chat...', type: 'info' });
      const script = document.createElement('script');
      script.src = 'https://cdn.voiceflow.com/widget-next/bundle.mjs';
      script.type = 'text/javascript';
      script.async = true;
      script.onload = () => {
        window.voiceflow.chat.load({
          verify: { projectID: '68e53cb796177a553ca6e9a6' },
          url: 'https://general-runtime.voiceflow.com',
          versionID: 'production',
          voice: {
            url: "https://runtime-api.voiceflow.com"
          },
          render: {
            mode: 'embedded',
            target: chatRef.current
          }
        });
        setVfLoaded(true);
        setLoading(false);
        setToast({ message: 'Chat started!', type: 'success' });
        setTimeout(() => setToast(null), 2000);
      };
      document.body.appendChild(script);
    } else {
      // Reset existing chat
      setLoading(true);
      setToast({ message: 'Restarting chat...', type: 'info' });

      // Stop any ongoing interactions
      if (window.voiceflow?.chat?.stop) {
        window.voiceflow.chat.stop();
      }

      // Use Voiceflow's refresh method
      if (window.voiceflow?.chat?.refresh) {
        window.voiceflow.chat.refresh();
      }

      setLoading(false);
      setToast({ message: 'Chat restarted!', type: 'success' });
      setTimeout(() => setToast(null), 2000);
    }
  };

  const handleEnd = () => {
    setClosing(true);
    setToast({ message: 'Closing chat...', type: 'info' });
    
    // Immediately stop all voice and audio
    try {
      // Force stop all Voiceflow interactions
      if (window.voiceflow?.chat?.stop) {
        window.voiceflow.chat.stop();
      }
      if (window.voiceflow?.chat?.hide) {
        window.voiceflow.chat.hide();
      }
      
      // Force stop speech synthesis
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.pause(); // Additional stop
      }
      
      // Stop any audio elements
      document.querySelectorAll('audio').forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });

      // Force clear any ongoing speech recognition
      if (window.voiceflow?.chat?.transcript) {
        window.voiceflow.chat.transcript.stop();
      }
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
    setTimeout(() => {
      // Remove the Voiceflow script if present
      const scripts = document.querySelectorAll('script[src="https://cdn.voiceflow.com/widget-next/bundle.mjs"]');
      scripts.forEach(script => script.remove());
      // Unmount the chat container
      setShowChat(false);
      setVfLoaded(false);
      setClosing(false);
      setToast({ message: 'Chat closed!', type: 'success' });
      setTimeout(() => setToast(null), 2000);
    }, 1200);
  };

  return (
    <div className="relative min-h-screen bg-gray-50 p-4" style={{backgroundImage: 'url(/bg2.jpg)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
      <div className="flex flex-col items-center w-full">
        {/* Welcome text styled */}
        <h1
          className="text-4xl md:text-5xl font-extrabold mb-8 text-center w-full"
            style={{
              marginTop: '0',
              color: '#ffe0d6',
              textShadow: '1px 1px 1px #285376, 0 2px 3px #bce0ffdb',
            }}
          >
            Welcome to Astra AI Chatbot
          </h1>
          <div className="flex flex-row gap-6 mb-4">
            <button
              onClick={handleStart}
              className="bg-blue-800 text-white px-8 py-4 rounded-lg text-lg hover:bg-blue-600 transition shadow-lg"
              disabled={loading || closing}
            >
              {loading ? 'Loading...' : 'Start'}
            </button>
            <button
              onClick={handleEnd}
              className="bg-red-800 text-white px-8 py-4 rounded-lg text-lg hover:bg-red-600 transition shadow-lg"
              disabled={loading || closing}
            >
              {closing ? 'Closing...' : 'End'}
            </button>
          </div>
          {/* Welcome message or chatbox */}
          {!showChat && !loading && !closing && (
            <div className="flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg" 
                 style={{ width: '100%', maxWidth: 630, minHeight: 420 }}>
              <img src="/astra_logo.png" alt="Astra Logo" className="h-24 mb-6 opacity-50" />
              <h2 className="text-2xl font-semibold text-blue-800 mb-4 text-center">Click the start button</h2>
              <p className="text-gray-700 text-center mb-6">Chat with Avia and get to know Astra.</p>
            </div>
          )}
          {loading && (
            <Spinner text="Loading chat..." />
          )}
          {closing && (
            <Spinner text="Closing chat..." />
          )}
          {showChat && !closing && (
            <div
              ref={chatRef}
              style={{
                width: '100%',
                maxWidth: 630,
                minHeight: 420,
                height: 420,
                overflow: 'auto',
                marginTop: 32,
                borderRadius: 24,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                transition: 'all 0.5s cubic-bezier(.4,0,.2,1)',
                opacity: loading ? 0 : 1,
                transform: loading ? 'scale(0.95)' : 'scale(1)',
              }}
            />
          )}
          {toast && <Toast message={toast.message} type={toast.type} />}
        </div>
    </div>
  );
}
