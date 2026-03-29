import { useState, useEffect, useRef, useCallback } from 'react'

const MASCOT_COLORS = {
  white:  { hair: '#F5F0E8', shadow: '#D4C9B6', skin: '#FFF0E5', eye: '#5C4A3A', blush: '#FFB7C5', highlight: '#ffffff' },
  orange: { hair: '#E8813A', shadow: '#C05F18', skin: '#FFF0E5', eye: '#5C2800', blush: '#FF9999', highlight: '#FFDAB9' },
  black:  { hair: '#2A2A2A', shadow: '#111111', skin: '#FFF0E5', eye: '#000000', blush: '#FF8888', highlight: '#4A4A4A' },
}

const CAPE_COLOR = '#9B111E'
const CAPE_SHADOW = '#6A0B14'

const phrases = [
  'Мяу! 🐾', 'Делай добро! 💖', 'Ты молодец! ⭐', 'Жас рухы! 🔥',
  'Вперёд, волонтёр! 🚀', 'Портфолио +1! 📈', 'Қайырлы күн! ☀️', 'Ня~! ✨',
  'Гамбаттэ! 💪', 'Кавайи~! 🌸',
]

function FemboyMascotSVG({ colors, isHappy }) {
  const { hair, shadow, skin, eye, blush, highlight } = colors
  const outline = '#2D2D2D'
  
  return (
    <svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* === TAIL === */}
      <path d="M140 160 Q180 140 170 190 Q160 220 130 200" fill="none" stroke={hair} strokeWidth="12" strokeLinecap="round"/>
      <path d="M140 160 Q180 140 170 190 Q160 220 130 200" fill="none" stroke={shadow} strokeWidth="12" strokeLinecap="round" opacity="0.4"/>

      {/* === CAPE BACK === */}
      <path d="M60 140 Q20 170 40 220 L160 220 Q180 170 140 140" fill={CAPE_COLOR} stroke={outline} strokeWidth="2"/>
      
      {/* === BODY === */}
      {/* Shirt */}
      <path d="M75 140 L125 140 L130 210 L70 210 Z" fill="white" stroke={outline} strokeWidth="1.5"/>
      {/* Legs */}
      <rect x="75" y="210" width="18" height="25" rx="9" fill={skin} stroke={outline} strokeWidth="1.5"/>
      <rect x="107" y="210" width="18" height="25" rx="9" fill={skin} stroke={outline} strokeWidth="1.5"/>
      {/* Stocking/Socks detail */}
      <rect x="75" y="225" width="18" height="10" fill="#333"/>
      <rect x="107" y="225" width="18" height="10" fill="#333"/>

      {/* === CAPE FRONT === */}
      <path d="M70 140 Q100 155 130 140 L135 160 Q100 175 65 160 Z" fill={CAPE_COLOR} stroke={outline} strokeWidth="1.5"/>
      {/* Emblem */}
      <circle cx="100" cy="155" r="8" fill="white" stroke={outline} strokeWidth="1"/>
      <text x="100" y="158" textAnchor="middle" fontSize="10" fill={CAPE_COLOR} fontWeight="bold" fontFamily="serif">J</text>

      {/* === HEAD === */}
      <path d="M55 100 Q55 50 100 50 Q145 50 145 100 Q145 135 100 135 Q55 135 55 100" fill={skin} stroke={outline} strokeWidth="2"/>

      {/* === HAIR BACK === */}
      <path d="M50 85 Q45 60 70 45 Q100 35 130 45 Q155 60 150 85" fill={hair} stroke={outline} strokeWidth="1.5"/>

      {/* === EARS === */}
      {/* Left Ear */}
      <path d="M60 55 L45 30 L75 45 Z" fill={hair} stroke={outline} strokeWidth="1.5"/>
      <path d="M63 52 L53 38 L70 47 Z" fill="#FFB7C5" opacity="0.3"/>
      {/* Right Ear */}
      <path d="M140 55 L155 30 L125 45 Z" fill={hair} stroke={outline} strokeWidth="1.5"/>
      <path d="M137 52 L147 38 L130 47 Z" fill="#FFB7C5" opacity="0.3"/>

      {/* === HAIR FRONT (Bangs) === */}
      <path d="M55 75 Q70 65 85 80 Q95 70 110 85 Q125 70 145 75 L145 95 Q100 85 55 95 Z" fill={hair} stroke={outline} strokeWidth="1.5"/>
      {/* Highlights */}
      <path d="M70 60 Q85 55 100 60" fill="none" stroke={highlight} strokeWidth="3" opacity="0.4" strokeLinecap="round"/>

      {/* === EYES (Stylish Anime) === */}
      <g opacity={isHappy ? 0 : 1}>
        {/* Eye Outlines */}
        <path d="M70 100 Q80 95 90 100" fill="none" stroke={outline} strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M110 100 Q120 95 130 100" fill="none" stroke={outline} strokeWidth="2.5" strokeLinecap="round"/>
        
        {/* Irises */}
        <ellipse cx="80" cy="110" rx="8" ry="11" fill={eye}/>
        <ellipse cx="120" cy="110" rx="8" ry="11" fill={eye}/>
        
        {/* Pupils & Shine */}
        <circle cx="82" cy="107" r="3" fill="white" opacity="0.8"/>
        <circle cx="122" cy="107" r="3" fill="white" opacity="0.8"/>
        <circle cx="78" cy="114" r="1.5" fill="white" opacity="0.4"/>
        <circle cx="118" cy="114" r="1.5" fill="white" opacity="0.4"/>
      </g>
      
      {/* Happy Eyes */}
      <g opacity={isHappy ? 1 : 0}>
        <path d="M70 110 Q80 100 90 110" fill="none" stroke={outline} strokeWidth="3" strokeLinecap="round"/>
        <path d="M110 110 Q120 100 130 110" fill="none" stroke={outline} strokeWidth="3" strokeLinecap="round"/>
      </g>

      {/* === FACE DETAILS === */}
      {/* Blush */}
      <ellipse cx="65" cy="118" rx="8" ry="4" fill={blush} opacity="0.5"/>
      <ellipse cx="135" cy="118" rx="8" ry="4" fill={blush} opacity="0.5"/>
      
      {/* Nose */}
      <path d="M98 115 L100 117 L102 115" fill="none" stroke={outline} strokeWidth="1" strokeLinecap="round"/>
      
      {/* Mouth */}
      {isHappy ? (
        <path d="M92 125 Q100 132 108 125" fill="none" stroke={outline} strokeWidth="2" strokeLinecap="round"/>
      ) : (
        <path d="M95 125 Q100 128 105 125" fill="none" stroke={outline} strokeWidth="1.5" strokeLinecap="round"/>
      )}

      {/* Small beauty mark/detail */}
      <circle cx="115" cy="128" r="1" fill={eye} opacity="0.3"/>
    </svg>
  )
}

function MascotCat({ className = '' }) {
  const [colorKey, setColorKey] = useState('orange')
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState(0)
  const [scale, setScale] = useState(1)
  const [isHappy, setIsHappy] = useState(false)
  const [showBubble, setShowBubble] = useState(false)
  const [bubbleText, setBubbleText] = useState('')
  const lastShake = useRef(0)
  const lastAccel = useRef({ x: 0, y: 0, z: 0 })
  const containerRef = useRef(null)
  const animRef = useRef(null)
  const targetPos = useRef({ x: 0, y: 0 })
  const currentPos = useRef({ x: 0, y: 0 })

  const showBubbleMsg = useCallback(() => {
    const text = phrases[Math.floor(Math.random() * phrases.length)]
    setBubbleText(text)
    setShowBubble(true)
    setIsHappy(true)
    setTimeout(() => setShowBubble(false), 2500)
    setTimeout(() => setIsHappy(false), 1500)
  }, [])

  // Smooth physics loop
  useEffect(() => {
    function loop() {
      const dx = targetPos.current.x - currentPos.current.x
      const dy = targetPos.current.y - currentPos.current.y
      currentPos.current.x += dx * 0.08
      currentPos.current.y += dy * 0.08
      setPos({ x: currentPos.current.x, y: currentPos.current.y })
      setRotation(currentPos.current.x * 0.4)
      animRef.current = requestAnimationFrame(loop)
    }
    animRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  // Device orientation (gyroscope)
  useEffect(() => {
    function handleOrientation(e) {
      const gamma = Math.max(-40, Math.min(40, e.gamma || 0))
      const beta  = Math.max(-25, Math.min(25, (e.beta || 0) - 45))
      targetPos.current = { x: gamma * 1.8, y: beta * 1.2 }
    }
    if (window.DeviceOrientationEvent) {
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        // iOS 13+ — needs user gesture, handled on click
      } else {
        window.addEventListener('deviceorientation', handleOrientation, { passive: true })
      }
    }
    return () => window.removeEventListener('deviceorientation', handleOrientation)
  }, [])

  // Shake detector
  useEffect(() => {
    function handleMotion(e) {
      const acc = e.accelerationIncludingGravity || {}
      const x = acc.x || 0; const y = acc.y || 0; const z = acc.z || 0
      const force = Math.abs(x - lastAccel.current.x) + Math.abs(y - lastAccel.current.y) + Math.abs(z - lastAccel.current.z)
      lastAccel.current = { x, y, z }
      const now = Date.now()
      if (force > 25 && now - lastShake.current > 1200) {
        lastShake.current = now
        setScale(1.3)
        showBubbleMsg()
        setTimeout(() => setScale(1), 400)
      }
    }
    window.addEventListener('devicemotion', handleMotion, { passive: true })
    return () => window.removeEventListener('devicemotion', handleMotion)
  }, [showBubbleMsg])

  // Mouse tracking (desktop)
  function handleMouseMove(e) {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    targetPos.current = {
      x: ((e.clientX - cx) / rect.width) * 30,
      y: ((e.clientY - cy) / rect.height) * 20,
    }
  }

  function handleMouseLeave() { targetPos.current = { x: 0, y: 0 } }

  async function handleClick() {
    // Request iOS permission on first tap
    if (typeof DeviceOrientationEvent?.requestPermission === 'function') {
      try { await DeviceOrientationEvent.requestPermission() } catch {}
    }
    setScale(1.2)
    showBubbleMsg()
    setTimeout(() => setScale(1), 300)
  }

  const colors = MASCOT_COLORS[colorKey]

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* Mascot Container */}
      <div
        ref={containerRef}
        className="relative cursor-pointer select-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        style={{ width: 160, height: 200 }}
        title="Привет! ✨"
      >
        {/* Speech bubble */}
        {showBubble && (
          <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <div className="bg-white rounded-2xl shadow-lg px-4 py-2 text-sm font-semibold text-gray-800 whitespace-nowrap border border-pink-100 animate-bounce-subtle">
              {bubbleText}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0"
                style={{ borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: '8px solid white' }}/>
            </div>
          </div>
        )}

        {/* Mascot Wrapper */}
        <div
          style={{
            transform: `translate(${pos.x}px, ${pos.y}px) rotate(${rotation}deg) scale(${scale})`,
            transition: 'transform 0.05s linear',
            transformOrigin: 'center bottom',
          }}
        >
          <FemboyMascotSVG colors={colors} isHappy={isHappy} />
        </div>
      </div>

      {/* Color selector */}
      <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1.5 shadow-sm border border-gray-100 relative z-20">
        <span className="text-[10px] uppercase font-black text-gray-400 mr-1 tracking-widest">Цвет волос:</span>
        {Object.entries(MASCOT_COLORS).map(([key, c]) => (
          <button
            key={key}
            onClick={(e) => { e.stopPropagation(); setColorKey(key) }}
            className="w-5 h-5 rounded-full border-2 transition-all hover:scale-110 cursor-pointer"
            style={{
              backgroundColor: c.hair,
              borderColor: colorKey === key ? '#9B111E' : '#e5e7eb',
              boxShadow: colorKey === key ? '0 0 0 2px #9B111E40' : 'none',
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default MascotCat
