import { useState, useRef } from 'react';


export default function Home() {
  const [vfLoaded, setVfLoaded] = useState(false);
  const chatRef = useRef(null);


  const handleStart = () => {
    if (!vfLoaded) {
      const script = document.createElement('script');
      script.src = 'https://cdn.voiceflow.com/widget-next/bundle.mjs';
      script.type = 'text/javascript';
      script.async = true;
      script.onload = () => {
        window.voiceflow.chat.load({
          verify: { projectID: '68d181b089a0536a14318ff' }, // <-- replace with your actual project ID
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
      };
      document.body.appendChild(script);
      setVfLoaded(true);
    } else {
      window.voiceflow.chat.open();
    }
  };


  const handleEnd = () => {
    if (window.voiceflow?.chat?.hide) {
      window.voiceflow.chat.hide();
    }
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <img src="/logo.jpg" alt="Logo" className="h-16 md:h-24 mb-6" />
      <h1 className="text-2xl md:text-4xl font-bold mb-8">Welcome to Your Voiceflow Chat</h1>
      <button
        onClick={handleStart}
        className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg mb-4 hover:bg-blue-700 transition"
      >
        Start
      </button>
      <button
        onClick={handleEnd}
        className="bg-red-600 text-white px-8 py-4 rounded-lg text-lg hover:bg-red-700 transition"
      >
        End
      </button>
      {/* Embedded chat container */}
      <div ref={chatRef} style={{ width: '100%', maxWidth: 400, minHeight: 500, marginTop: 32 }} />
    </div>
  );
}

