import { useState, useEffect, useCallback, useRef } from 'react'

const PETAL_COLORS = ['#FFB7C5', '#FF69B4', '#FFC0CB', '#FFD1DC', '#FFAAB5']

function SakuraPetal({ delay, left, size, duration }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: `${left}%`,
        top: '-20px',
        width: `${size}px`,
        height: `${size * 0.7}px`,
        backgroundColor: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
        borderRadius: '50% 0 50% 50%',
        opacity: 0.8,
        animation: `sakura-fall ${duration}s ease-in-out ${delay}s forwards`,
        pointerEvents: 'none',
        filter: 'blur(0.5px)',
        boxShadow: '0 0 4px rgba(255, 183, 197, 0.5)',
      }}
    >
      <div style={{
        width: '100%',
        height: '100%',
        animation: `sakura-sway ${duration * 0.6}s ease-in-out ${delay}s infinite`,
      }} />
    </div>
  )
}

function CuteFemboyFox() {
  return (
    <svg viewBox="0 0 200 250" className="w-full h-full drop-shadow-2xl overflow-visible">
      {/* Tail wagging animation */}
      <g style={{ transformOrigin: '120px 150px', animation: 'tail-wag 0.8s ease-in-out infinite alternate' }}>
        <path d="M100 150 Q230 250 180 100 Q150 50 100 120" fill="white" stroke="#111" strokeWidth="4" strokeLinejoin="round"/>
        {/* Wag movement lines */}
        <path d="M190 120 Q200 140 190 160 M210 110 Q225 140 210 170" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" className="animate-pulse" />
      </g>
      
      {/* Body */}
      <path d="M70 110 L110 110 L130 180 L70 180 Z" fill="white" stroke="#111" strokeWidth="4" strokeLinejoin="round"/>
      
      {/* Left leg & Thigh high */}
      <g>
        <path d="M70 170 L40 230 A 15 15 0 0 0 65 240 L85 170 Z" fill="white" stroke="#111" strokeWidth="4" strokeLinejoin="round"/>
        {/* Pink stripes */}
        <path d="M63 180 L49 205 L63 212 L77 186 Z" fill="#FFB7C5"/>
        <path d="M56 220 L42 232 A 4 4 0 0 0 55 240 L69 225 Z" fill="#FFB7C5"/>
      </g>

      {/* Right leg & Thigh high */}
      <g>
        <path d="M105 170 L115 230 A 15 15 0 0 0 140 240 L125 170 Z" fill="white" stroke="#111" strokeWidth="4" strokeLinejoin="round"/>
        {/* Pink stripes */}
        <path d="M108 185 L115 210 L132 215 L124 190 Z" fill="#FFB7C5"/>
        <path d="M112 225 L116 235 A 4 4 0 0 0 135 240 L130 230 Z" fill="#FFB7C5"/>
      </g>

      {/* Head */}
      <g>
        {/* Base head shape */}
        <path d="M40 70 L30 10 L80 40 L130 10 L130 70 A 50 50 0 0 1 40 70 Z" fill="white" stroke="#111" strokeWidth="4" strokeLinejoin="round"/>
        {/* Cheek fluff left */}
        <path d="M35 60 L10 75 L30 85 L15 95 L40 95" fill="none" stroke="#111" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Cheek fluff right */}
        <path d="M135 60 L160 75 L140 85 L155 95 L130 95" fill="none" stroke="#111" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      </g>

      {/* Pink Collar & Bell */}
      <path d="M60 105 L115 105" stroke="#FF69B4" strokeWidth="10" strokeLinecap="round"/>
      <circle cx="85" cy="115" r="10" fill="#FFD700" stroke="#111" strokeWidth="2.5"/>
      <circle cx="85" cy="118" r="2" fill="#111"/>
      <line x1="85" y1="120" x2="85" y2="125" stroke="#111" strokeWidth="2"/>

      {/* Face (Eyes, Mouth, Blush) */}
      <g>
        {/* Eyes */}
        <ellipse cx="65" cy="65" rx="8" ry="14" fill="#111"/>
        <ellipse cx="105" cy="65" rx="8" ry="14" fill="#111"/>
        <circle cx="65" cy="58" r="3" fill="white"/>
        <circle cx="105" cy="58" r="3" fill="white"/>
        
        {/* Blush */}
        <ellipse cx="45" cy="80" rx="10" ry="5" fill="#FFB7C5" opacity="0.9"/>
        <ellipse cx="125" cy="80" rx="10" ry="5" fill="#FFB7C5" opacity="0.9"/>
        <path d="M40 78 L48 83 M44 76 L52 81" stroke="#de8989ff" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M120 78 L128 83 M124 76 L132 81" stroke="#ff4d4d" strokeWidth="1.5" strokeLinecap="round"/>

        {/* Mouth :3 */}
        <path d="M75 75 Q85 85 85 75 Q85 85 95 75" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M78 78 Q85 90 92 78 Z" fill="#FFB7C5" stroke="#111" strokeWidth="1.5"/>
      </g>

      {/* Arms resting cutely */}
      <path d="M75 110 L75 160 A 6 6 0 0 0 85 160 L85 110" fill="white" stroke="#111" strokeWidth="4" strokeLinejoin="round"/>
      <path d="M95 110 L95 160 A 6 6 0 0 0 105 160 L105 110" fill="white" stroke="#111" strokeWidth="4" strokeLinejoin="round"/>
      
      {/* Floating text "am i cute? :3" */}
      <text x="145" y="40" fontFamily="Comic Sans MS, Balsamiq Sans, cursive" fontSize="16" fill="#111" transform="rotate(10 145 40)"></text>
      <text x="165" y="60" fontFamily="Comic Sans MS, Balsamiq Sans, cursive" fontSize="18" fill="#111" transform="rotate(10 165 60)">(≧◡≦)</text>

      <style>
        {`
          @keyframes tail-wag {
            0% { transform: rotate(-5deg); }
            100% { transform: rotate(15deg); }
          }
        `}
      </style>
    </svg>
  )
}

function SakuraEasterEgg() {
  const [active, setActive] = useState(false)
  const [clicks, setClicks] = useState(0)
  const lastClick = useRef(0)

  // Need useRef for the timer
  const timerRef = useRef(null)

  const handleTrigger = useCallback(() => {
    setActive(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setActive(false), 5000)
  }, [])

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  // Generate petals
  const petals = Array.from({ length: 45 }, (_, i) => ({
    id: i,
    delay: Math.random() * 2,
    left: Math.random() * 100,
    size: 8 + Math.random() * 14,
    duration: 3 + Math.random() * 3,
  }))

  return (
    <>
      {/* Trigger — BIG & VISIBLE Button */}
      <button
        onClick={handleTrigger}
        className="inline-flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300 select-none bg-pink-50 hover:bg-pink-100 text-pink-500 rounded-2xl px-5 py-3 shadow-md border-2 border-pink-200 mt-4 mx-auto"
        title="Секретик"
      >
        <span className="text-2xl animate-bounce">🐾</span>
        <span className="text-sm font-black uppercase tracking-widest hidden sm:inline">Секрет!</span>
      </button>

      {/* Overlay */}
      {active && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
        >
          {/* Sakura petals */}
          {petals.map(p => (
            <SakuraPetal key={p.id} {...p} />
          ))}

          {/* Mascot peeking from bottom-right */}
          <div
            style={{
              position: 'absolute',
              bottom: '-20px',
              right: '20px',
              width: '240px',
              animation: 'mascot-peek 5s ease-in-out forwards',
              pointerEvents: 'none',
              filter: 'drop-shadow(-5px 0 10px rgba(0,0,0,0.1))'
            }}
          >
            {/* Speech bubble */}
            <div
              style={{
                position: 'absolute',
                top: '-20px',
                left: '-80px',
                background: 'white',
                borderRadius: '16px',
                padding: '10px 18px',
                fontSize: '14px',
                fontWeight: 800,
                color: '#fbbabaff',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                whiteSpace: 'nowrap',
                border: '3px solid #FFB7C5',
                animation: 'fade-in-up 0.5s ease 1s both',
                transformOrigin: 'bottom right'
              }}
            >
              Am I cute, семпай? :3
            </div>
            <CuteFemboyFox />
          </div>
        </div>
      )}
    </>
  )
}

export default SakuraEasterEgg
