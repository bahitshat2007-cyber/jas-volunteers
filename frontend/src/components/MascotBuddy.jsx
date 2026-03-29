import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Interactive mascot that responds to:
 * - Device orientation (tilting phone → mascot rolls)
 * - Shake detection (shake phone → mascot bounces)
 * - Mouse hover on desktop (mascot follows cursor slightly)
 * - Click/tap (mascot does a happy bounce)
 */
function MascotBuddy({ className = '' }) {
  const containerRef = useRef(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState(0)
  const [isHappy, setIsHappy] = useState(false)
  const [isShaking, setIsShaking] = useState(false)
  const [showBubble, setShowBubble] = useState(false)
  const [bubbleText, setBubbleText] = useState('')
  const lastShake = useRef(0)
  const lastAccel = useRef({ x: 0, y: 0, z: 0 })

  const phrases = [
    'Привет! 👋',
    'Делай добро! 💖',
    'Ты молодец! ⭐',
    'Го волонтёрить! 🚀',
    'Жас рухы! 🔥',
    'Портфолио растёт! 📈',
    'Қайырлы күн! ☀️',
    'Записывайся! ✍️',
  ]

  // Show random bubble
  const showRandomBubble = useCallback(() => {
    const text = phrases[Math.floor(Math.random() * phrases.length)]
    setBubbleText(text)
    setShowBubble(true)
    setTimeout(() => setShowBubble(false), 2500)
  }, [])

  // Device orientation → tilt mascot
  useEffect(() => {
    function handleOrientation(e) {
      const gamma = e.gamma || 0 // left-right tilt (-90 to 90)
      const beta = e.beta || 0  // front-back tilt (-180 to 180)
      
      // Clamp and map to position
      const clampedX = Math.max(-30, Math.min(30, gamma))
      const clampedY = Math.max(-20, Math.min(20, beta - 45))
      
      setPos({ x: clampedX * 2, y: clampedY * 1.5 })
      setRotation(clampedX * 0.5)
    }

    if (window.DeviceOrientationEvent) {
      // Request permission on iOS 13+
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        // Will need user gesture to request
      } else {
        window.addEventListener('deviceorientation', handleOrientation)
      }
    }

    return () => window.removeEventListener('deviceorientation', handleOrientation)
  }, [])

  // Shake detection
  useEffect(() => {
    function handleMotion(e) {
      const acc = e.accelerationIncludingGravity || {}
      const x = acc.x || 0
      const y = acc.y || 0
      const z = acc.z || 0

      const deltaX = Math.abs(x - lastAccel.current.x)
      const deltaY = Math.abs(y - lastAccel.current.y)
      const deltaZ = Math.abs(z - lastAccel.current.z)

      lastAccel.current = { x, y, z }

      const shakeForce = deltaX + deltaY + deltaZ
      const now = Date.now()

      if (shakeForce > 25 && now - lastShake.current > 1500) {
        lastShake.current = now
        triggerShake()
      }
    }

    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', handleMotion)
    }

    return () => window.removeEventListener('devicemotion', handleMotion)
  }, [])

  function triggerShake() {
    setIsShaking(true)
    setIsHappy(true)
    showRandomBubble()
    setTimeout(() => {
      setIsShaking(false)
      setIsHappy(false)
    }, 800)
  }

  // Mouse hover effect (desktop)
  function handleMouseMove(e) {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const deltaX = (e.clientX - centerX) / rect.width
    const deltaY = (e.clientY - centerY) / rect.height
    setPos({ x: deltaX * 15, y: deltaY * 10 })
    setRotation(deltaX * 8)
  }

  function handleMouseLeave() {
    setPos({ x: 0, y: 0 })
    setRotation(0)
  }

  function handleClick() {
    setIsHappy(true)
    showRandomBubble()
    setTimeout(() => setIsHappy(false), 600)
  }

  return (
    <div
      ref={containerRef}
      className={`relative inline-block cursor-pointer select-none ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Speech Bubble */}
      {showBubble && (
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-white rounded-2xl card-shadow px-4 py-2 text-sm font-medium text-[var(--color-text-heading)] whitespace-nowrap z-10 animate-bounce-in">
          {bubbleText}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-white rotate-45 card-shadow" />
        </div>
      )}

      {/* Mascot Image */}
      <img
        src="/mascot.png"
        alt="Жас — маскот Jas Volunteers"
        draggable={false}
        className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-lg"
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px) rotate(${rotation}deg) scale(${isHappy ? 1.15 : 1})`,
          transition: isShaking ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          animation: isShaking ? 'shake 0.3s ease-in-out 2' : isHappy ? 'bounce-mascot 0.4s ease' : 'float 3s ease-in-out infinite',
        }}
      />
    </div>
  )
}

export default MascotBuddy
