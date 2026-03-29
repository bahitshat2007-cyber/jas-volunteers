import React, { useState, useEffect } from 'react';

const LoadingScreen = ({ fullScreen = true, message = "Загрузка духа Jas..." }) => {
  const [intensity, setIntensity] = useState(0);
  const [glitchText, setGlitchText] = useState("");

  const glitchWords = [
    "BOOTING_CORE", "BYPASSING_LOGIC", "RECURSIVE_DRIFT",
    "QUANTUM_STABILITY_0%", "MEMORY_LEAK_DETECTED",
    "SHANYRAK_SYNC_FAILED", "REBOOTING_REALITY"
  ];

  useEffect(() => {
    // Phase 1 (0-1s): clean loader. Phase 2 (1-3s): slight distortion. Phase 3 (3s+): full glitch chaos
    const timer = setInterval(() => {
      setIntensity(prev => Math.min(prev + 0.045, 1));
    }, 450);
    const textTimer = setInterval(() => {
      setGlitchText(Math.random() > 0.78 ? glitchWords[Math.floor(Math.random() * glitchWords.length)] : "");
    }, 130);
    return () => { clearInterval(timer); clearInterval(textTimer); };
  }, []);

  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-fadeIn relative overflow-hidden">
      {/* Glitch radial aura - grows with intensity */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ background: `radial-gradient(circle, rgba(79,70,229,${intensity * 0.18}) 0%, transparent 70%)` }}
      />

      {/* Random terminal crash text - appears at Phase 2+ */}
      {glitchText && intensity > 0.3 && (
        <div
          className="absolute font-mono text-[9px] font-black text-indigo-500 z-50 pointer-events-none uppercase tracking-tighter select-none"
          style={{
            left: `${5 + Math.random() * 65}%`,
            top: `${5 + Math.random() * 65}%`,
            textShadow: '1px 0 #ff00ff, -1px 0 #00ffff',
            opacity: intensity,
            transform: `rotate(${Math.random() * 12 - 6}deg)`
          }}
        >
          {glitchText}
        </div>
      )}

      {/* Shanyrak wrapper — distorts progressively */}
      <div
        className="relative w-32 h-32 mb-8"
        style={{
          transform: `scale(${1 + intensity * 0.12}) skewX(${Math.random() * intensity * 6}deg)`,
          filter: `blur(${intensity * 1.8}px)`,
          transition: 'transform 0.4s ease'
        }}
      >
        <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-[40px] animate-pulse"></div>
        <div className="absolute inset-0 bg-purple-500/10 rounded-full blur-[60px] animate-pulse delay-700"></div>

        <div className="relative w-full h-full flex items-center justify-center">
          <svg
            viewBox="0 0 100 100"
            className="w-24 h-24 text-indigo-600 drop-shadow-[0_0_15px_rgba(79,70,229,0.4)] rotate-center"
            style={{
              filter: intensity > 0.5 ? `hue-rotate(${intensity * 200}deg)` : 'none',
              opacity: 1 - intensity * 0.28
            }}
          >
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 3" className="opacity-30" />
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="100 200" strokeLinecap="round" className="animate-dash" />
            <path d="M50 8 L50 92" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-80" />
            <path d="M8 50 L92 50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-80" />
            <path d="M22 22 L78 78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="opacity-50" />
            <path d="M22 78 L78 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="opacity-50" />
            <circle cx="50" cy="50" r="12" fill="none" stroke="currentColor" strokeWidth="2" className="animate-pulse" />
            <circle cx="50" cy="50" r="4" fill="currentColor" className="animate-ping" />
          </svg>
          <div className="absolute inset-0 border-2 border-dashed border-indigo-200/50 rounded-full animate-orbit"></div>
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-indigo-500 rounded-full shadow-[0_0_10px_#6366f1] animate-pulse"></div>
        </div>
      </div>

      {/* Text — chromatic aberration in Phase 2+, letter-spacing grows in Phase 3 */}
      <div className="space-y-2 relative z-10">
        <h3
          className="text-xl font-brand text-indigo-950 tracking-tight animate-bounce-subtle"
          style={{
            textShadow: intensity > 0.38 ? `${intensity * 3.5}px 0 rgba(255,0,0,0.55), -${intensity * 3.5}px 0 rgba(0,255,255,0.55)` : 'none',
            letterSpacing: `${intensity * 2.5}px`,
            transition: 'letter-spacing 0.5s ease'
          }}
        >
          {message}
        </h3>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 opacity-60">
          Священная энергия волонтерства
        </p>
      </div>

      {/* Progress bar — speeds up as intensity rises */}
      <div className="w-48 h-1 bg-gray-100 rounded-full mt-8 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent w-full animate-progressLine"
          style={{ animationDuration: `${Math.max(0.4, 1.5 - intensity)}s` }}
        ></div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes dash { 0% { stroke-dashoffset: 350; } 50% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: -350; } }
        @keyframes loadingLine { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes bounce-subtle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        .animate-fadeIn { animation: fadeIn 0.8s ease-out forwards; }
        .animate-dash { animation: dash 2s ease-in-out infinite; }
        .animate-progressLine { animation: loadingLine 1.5s infinite linear; }
        .rotate-center { animation: spin 8s linear infinite; }
        .animate-orbit { animation: spin 6s linear infinite; }
        .animate-bounce-subtle { animation: bounce-subtle 2s infinite ease-in-out; }
      `}} />
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white z-[9999] fixed inset-0">
        {content}
      </div>
    );
  }
  return content;
};

export default LoadingScreen;
