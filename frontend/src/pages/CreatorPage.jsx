import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext.jsx'

export default function CreatorPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  const PERSONAS = [
    { id: 'politician', title: t('persona_politician_title'), desc: t('persona_politician_desc'), image: '/creator/politician.png', color: 'from-blue-600 to-indigo-900', border: 'border-blue-400', scale: 1.05, extraStyle: { translate: '0 -47px' } },
    { id: 'femboy', title: t('persona_femboy_title'), desc: t('persona_femboy_desc'), image: '/creator/femboy.png', color: 'from-pink-400 to-rose-600', border: 'border-pink-300' },
    { id: 'wrestler', title: t('persona_wrestler_title'), desc: t('persona_wrestler_desc'), image: '/creator/wrestler.png', color: 'from-red-600 to-orange-900', border: 'border-red-500' },
    { id: 'entrepreneur', title: t('persona_entrepreneur_title'), desc: t('persona_entrepreneur_desc'), image: '/creator/entrepreneur.png', color: 'from-green-500 to-emerald-800', border: 'border-green-400' },
    { id: 'scientist', title: t('persona_scientist_title'), desc: t('persona_scientist_desc'), image: '/creator/scientist.png', color: 'from-cyan-500 to-blue-800', border: 'border-cyan-400', scale: 1.3, extraStyle: { translate: '0 -20px' } },
    { id: 'mrrobot', title: t('persona_mrrobot_title'), desc: t('persona_mrrobot_desc'), image: '/creator/mrrobot.png', color: 'from-gray-800 to-gray-950', border: 'border-gray-500', scale: 1.1, extraStyle: { translate: '0 -50px' } },
  ]

  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState([])
  const [solved, setSolved] = useState([])
  const [moves, setMoves] = useState(0)

  // Glitch Effect & Terminal States
  const [glitchIntensity, setGlitchIntensity] = useState(0)
  const [isBroken, setIsBroken] = useState(false)
  const [terminalVisible, setTerminalVisible] = useState(false)
  const [terminalInput, setTerminalInput] = useState('')
  const terminalInputRef = useRef(null)
  const crashTimerRef = useRef(null)

  // Floating Binary Strings
  const [binaries] = useState(() => 
    Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      text: Math.random() > 0.5 ? '010100010111010100' : '11010100101010',
      top: Math.random() * 200 + '%',
      left: Math.random() * 95 + '%',
      speed: Math.random() * 10 + 5 + 's',
      delay: Math.random() * -10 + 's',
      opacity: Math.random() * 0.4 + 0.1,
      size: Math.random() * 14 + 10 + 'px'
    }))
  )

  // Initialize Memory Game
  useEffect(() => {
    const shuffleCards = () => {
      const pairedPersonas = [...PERSONAS, ...PERSONAS]
        .sort(() => Math.random() - 0.5)
        .map((persona, idx) => ({ ...persona, uuid: idx }))
      setCards(pairedPersonas)
    }
    shuffleCards()
  }, [])

  useEffect(() => {
    if (flipped.length === 2) {
      setTimeout(() => {
        const [first, second] = flipped
        if (cards[first].id === cards[second].id) {
          setSolved(prev => [...prev, first, second])
        }
        setFlipped([])
        setMoves(m => m + 1)
      }, 700)
    }
  }, [flipped, cards])

  const handleCardClick = (index) => {
    if (flipped.length < 2 && !flipped.includes(index) && !solved.includes(index)) {
      setFlipped([...flipped, index])
    }
  }

  // Handle Global CSS Injection & Scroll tracking
  useEffect(() => {
    document.body.classList.add('creator-horror-active')
    
    const handleScroll = () => {
      if (terminalVisible) return;

      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight
      const maxScroll = scrollHeight - window.innerHeight
      
      const ratio = maxScroll > 0 ? Math.min(Math.max(scrollTop / maxScroll, 0), 1) : 0
      
      // Visual glitch ONLY starts after 70% of the page
      let visualGlitch = 0;
      if (ratio > 0.7) {
          visualGlitch = (ratio - 0.7) / 0.3; // scales from 0 to 1
      }
      
      setGlitchIntensity(visualGlitch)
      document.documentElement.style.setProperty('--creator-glitch', visualGlitch.toFixed(3))

      if (ratio >= 0.90 && !isBroken) {
        if (!crashTimerRef.current) {
           crashTimerRef.current = setTimeout(() => {
             setIsBroken(true)
             setTimeout(() => {
                setTerminalVisible(true)
                document.body.classList.add('system-halted')
             }, 800)
           }, 3000)
        }
      } else if (ratio < 0.90) {
        if (crashTimerRef.current) {
            clearTimeout(crashTimerRef.current)
            crashTimerRef.current = null;
        }
      }
    }

    // Trigger handleScroll once on mount to handle initial state, then attach listener
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      document.body.classList.remove('creator-horror-active', 'system-halted')
      document.documentElement.style.setProperty('--creator-glitch', '0')
      window.removeEventListener('scroll', handleScroll)
      if (crashTimerRef.current) clearTimeout(crashTimerRef.current)
    }
  }, [isBroken, terminalVisible])

  useEffect(() => {
    if (terminalVisible && terminalInputRef.current) {
        terminalInputRef.current.focus()
    }
  }, [terminalVisible])

  const handleTerminalKey = (e) => {
    if (e.key === 'Enter') {
        const cmd = terminalInput.trim().toLowerCase()
        if (cmd === 'yes' || cmd === 'y' || cmd === '') {
            // Restore everything before routing
            document.body.classList.remove('creator-horror-active', 'system-halted')
            document.documentElement.style.setProperty('--creator-glitch', '0')
            navigate('/')
            window.location.reload()
        } else {
            setTerminalInput('')
        }
    }
  }

  // Generate creepy eyes
  const horrorEyes = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    top: Math.random() * 80 + 10 + '%',
    left: Math.random() * 90 + 5 + '%',
    delay: Math.random() * 2 + 's',
    scale: Math.random() * 1.5 + 0.5
  }))

  // Terminal Reboot UI
  if (terminalVisible) {
      return (
          <div className="fixed inset-0 bg-black z-[9999] text-green-500 font-mono p-6 flex flex-col justify-start items-start text-sm sm:text-lg overflow-hidden selection:bg-green-500 selection:text-black" onClick={() => terminalInputRef.current?.focus()}>
              <div className="animate-pulse opacity-50 absolute inset-0 pointer-events-none" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 0, 0.1) 2px, rgba(0, 255, 0, 0.1) 4px)' }}></div>
              <p className="mb-2">JAS_VOLUNTEERS OS v4.0.1 [KERNEL PANIC]</p>
              <p className="mb-2 text-red-500">FATAL ERROR: OVERLOAD IN CORTEX_FRONTAL_LOBE.</p>
              <p className="mb-2">DUMPING PHYSICAL MEMORY... COMPLETED.</p>
              <p className="mb-2">PURGING CORRUPTED ARTIFACTS... FAILED.</p>
              <br />
              <p className="mb-4 text-green-300 animate-pulse">CRITICAL FAULT. SYSTEM IN unstable STATE.</p>
              <div className="flex items-center gap-2">
                  <span>{t('terminal_prompt')}</span>
                  <input
                      ref={terminalInputRef}
                      type="text"
                      className="bg-transparent text-green-500 outline-none border-none w-20 uppercase caret-green-500"
                      value={terminalInput}
                      onChange={e => setTerminalInput(e.target.value)}
                      onKeyDown={handleTerminalKey}
                      autoFocus
                  />
              </div>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col font-sans overflow-x-hidden selection:bg-red-500 selection:text-white relative">
      <style>{`
        /* GLOBAL OVERRIDES FOR SCROLL HORROR */
        :root {
          --creator-glitch: 0;
        }

        /* Darken entire background of app & aggressively shift colors at the end */
        body.creator-horror-active #root {
           background-color: color-mix(in srgb, #0f172a, #200000 calc(var(--creator-glitch) * 100%)) !important;
           transition: background-color 0.1s;
           filter: hue-rotate(calc(var(--creator-glitch) * 180deg)) contrast(calc(1 + var(--creator-glitch) * 0.5));
        }

        /* Screen Shake targeting the root app container */
        body.creator-horror-active:not(.system-halted) #root {
           animation: horror-shake calc(3s - (var(--creator-glitch) * 2.8s)) infinite cubic-bezier(.36,.07,.19,.97);
           animation-play-state: var(--creator-glitch) > 0.01 ? running : paused;
        }
        
        @keyframes horror-shake {
          0%, 100% { transform: translate3d(0, 0, 0) skew(0deg); }
          10%, 90% { transform: translate3d(calc(var(--creator-glitch) * -2px), 0, 0) skew(calc(var(--creator-glitch) * -1deg)); }
          20%, 80% { transform: translate3d(calc(var(--creator-glitch) * 4px), calc(var(--creator-glitch) * 3px), 0) skew(calc(var(--creator-glitch) * 2deg)); }
          30%, 50%, 70% { transform: translate3d(calc(var(--creator-glitch) * -12px), calc(var(--creator-glitch) * -5px), 0) skew(calc(var(--creator-glitch) * -3deg)); }
          40%, 60% { transform: translate3d(calc(var(--creator-glitch) * 12px), calc(var(--creator-glitch) * 8px), 0) skew(calc(var(--creator-glitch) * 3deg)); }
        }

        /* Navbar Corruption */
        body.creator-horror-active header {
           background: rgba(0,0,0, calc(var(--creator-glitch) * 0.98)) !important;
           backdrop-filter: blur(calc(var(--creator-glitch) * 15px));
           border-bottom: calc(var(--creator-glitch) * 4px) solid #dc2626 !important;
           box-shadow: 0 10px 35px rgba(220, 38, 38, calc(var(--creator-glitch) * 0.6));
        }

        /* Nav links glitch */
        body.creator-horror-active header nav a {
           color: color-mix(in srgb, var(--color-text-body), #ff0000 calc(var(--creator-glitch) * 100%)) !important;
           text-shadow: calc(var(--creator-glitch) * 5px) 0 red, calc(var(--creator-glitch) * -5px) 0 blue;
           clip-path: polygon(0 0, 100% 0, 100% calc(100% - var(--creator-glitch)*30%), 0 100%);
        }

        /* JAS VOLUNTEERS Blood to Binary Transition */
        body.creator-horror-active .jas-brand-container {
           position: relative;
        }
        body.creator-horror-active .jas-logo-img {
           filter: brightness(calc(1 - var(--creator-glitch))) invert(calc(var(--creator-glitch) > 0.4 ? 1 : 0)) drop-shadow(0 0 calc(var(--creator-glitch) * 20px) red);
        }
        body.creator-horror-active .jas-brand-text {
           color: color-mix(in srgb, var(--color-text-heading), #bb0000 calc(var(--creator-glitch) * 100%)) !important;
        }
        body.creator-horror-active .jas-brand-text::after {
           content: '11010100101010 \\A 0010111_NULL';
           position: absolute;
           top: 100%;
           left: 0;
           font-family: 'Courier New', monospace;
           font-size: 12px;
           line-height: 1;
           white-space: pre;
           font-weight: 900;
           pointer-events: none;
           animation: blood-drip-matrix 3s infinite;
           opacity: calc(var(--creator-glitch) * 2 - 0.4); 
        }
        @keyframes blood-drip-matrix {
           0% { content: '🩸 | | \\ / |'; color: #990000; transform: translateY(0); filter: drop-shadow(0 2px 0 red); }
           30% { content: '▼ ▼ ▼ ▼ ▼ ▼ ▼'; color: #dc2626; transform: translateY(15px); filter: drop-shadow(0 5px 2px red) blur(1px); }
           70% { content: '11010100101010'; color: #22c55e; transform: translateY(25px); filter: drop-shadow(0 0 8px lime); letter-spacing: 2px; text-shadow: 2px 0 red; }
           100% { content: '0XDEADBEEF'; color: #00ff00; transform: translateY(30px); letter-spacing: 4px; opacity: 0; }
        }

        .glitch-wrapper { position: relative; display: inline-block; }
        .glitch-wrapper::before, .glitch-wrapper::after {
          content: attr(data-text); position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: transparent; opacity: 0.8;
        }
        .glitch-wrapper::before {
          left: 2px; text-shadow: -2px 0 red; clip: rect(44px, 450px, 56px, 0);
          animation: glitch-anim 5s infinite linear alternate-reverse;
        }
        .glitch-wrapper::after {
          left: -2px; text-shadow: -2px 0 blue; clip: rect(44px, 450px, 56px, 0);
          animation: glitch-anim2 5s infinite linear alternate-reverse;
        }
        @keyframes glitch-anim { 0% { clip: rect(3px, 9999px, 81px, 0); } 20% { clip: rect(62px, 9999px, 98px, 0); } 40% { clip: rect(9px, 9999px, 4px, 0); } 60% { clip: rect(81px, 9999px, 19px, 0); } 80% { clip: rect(13px, 9999px, 66px, 0); } 100% { clip: rect(49px, 9999px, 12px, 0); } }
        @keyframes glitch-anim2 { 0% { clip: rect(79px, 9999px, 20px, 0); } 20% { clip: rect(34px, 9999px, 57px, 0); } 40% { clip: rect(98px, 9999px, 98px, 0); } 60% { clip: rect(13px, 9999px, 43px, 0); } 80% { clip: rect(48px, 9999px, 72px, 0); } 100% { clip: rect(7px, 9999px, 2px, 0); } }
        
        .card-perspective { perspective: 1000px; }
        .card-inner { transition: transform 0.6s; transform-style: preserve-3d; border-radius: 16px; }
        .card-flipped .card-inner { transform: rotateY(180deg); }
        .card-face { backface-visibility: hidden; border-radius: 16px; }
        .card-back { transform: rotateY(180deg); }

        /* Cracked screen */
        .glass-crack {
           position: fixed; inset: 0; z-index: 9000; pointer-events: none;
           background: radial-gradient(circle at center, transparent, rgba(255,255,255,0.8));
           mix-blend-mode: overlay;
           animation: flash-crack 0.15s cubic-bezier(0.1, 0, 0.1, 1) forwards;
        }
        .crack-lines {
           position: absolute; width: 100%; height: 100%;
           border-top: 6px solid white; transform: rotate(18deg) translateY(45vh) scale(1.5);
           box-shadow: 0 0 30px rgba(255,255,255,0.9);
        }
        .crack-lines::after {
           content: ''; position: absolute; width: 100%; height: 5px; background: white;
           transform: rotate(-38deg) translateY(-25vh) translateX(15vw);
           box-shadow: 0 0 30px rgba(255,255,255,0.9);
        }
        @keyframes flash-crack { 0% { opacity: 0; } 50% { opacity: 1; filter: invert(1); background: white; } 100% { opacity: 0.9; } }

        /* Floating Falling Binary Code */
        @keyframes fall-matrix {
           0% { transform: translateY(-100%); opacity: 0; }
           10% { opacity: var(--op); }
           90% { opacity: var(--op); }
           100% { transform: translateY(100vh); opacity: 0; }
        }
      `}</style>


      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {glitchIntensity > 0.3 && binaries.map(bin => (
          <div 
            key={bin.id}
            className="absolute font-mono text-green-500 whitespace-nowrap"
            style={{
              left: bin.left,
              top: bin.top,
              fontSize: bin.size,
              '--op': (glitchIntensity - 0.2) * bin.opacity * 2,
              opacity: 0,
              animation: `fall-matrix ${bin.speed} linear ${bin.delay} infinite`,
              textShadow: '0 0 8px #22c55e'
            }}
          >
            {bin.text}
          </div>
        ))}
      </div>

      {/* Creepy Eyes that appear as you scroll */}
      {glitchIntensity > 0.4 && horrorEyes.map(eye => (
        <div 
          key={eye.id} 
          className="fixed z-0 pointer-events-none text-red-600 animate-pulse mix-blend-screen"
          style={{ 
            top: eye.top, left: eye.left, 
            transform: `scale(${eye.scale})`, 
            opacity: (glitchIntensity - 0.4) * 1.5,
            animationDelay: eye.delay,
            filter: 'drop-shadow(0 0 10px red)'
          }}>
          👁️
        </div>
      ))}

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-4 text-center z-10 transition-transform" style={{ filter: `blur(${glitchIntensity * 4}px)` }}>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 glitch-wrapper uppercase" data-text={t('creator_hero_title')}>
          {t('creator_hero_title')}
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto font-light mb-12">
          {t('creator_hero_desc')}
        </p>
      </div>

      {/* Gallery of Personas */}
      <div className="max-w-7xl mx-auto px-4 py-10 w-full z-10 transition-transform duration-200" style={{ transform: `scale(${1 + glitchIntensity * 0.05})`}}>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6">
          {PERSONAS.map((p) => (
            <div key={p.id} className={`bg-gradient-to-b ${p.color} p-1 rounded-3xl transform transition-transform hover:-translate-y-4 hover:shadow-2xl duration-300`}>
              <div className="bg-white rounded-[22px] overflow-hidden flex flex-col items-center justify-end card-h-standard relative w-full group">
                <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-black/20 to-transparent z-10 pointer-events-none" />
                <p className="absolute top-3 left-3 z-20 font-black text-sm xl:text-xl opacity-30 group-hover:opacity-100 transition-opacity">#{p.id}</p>
                <div className="w-full h-full flex justify-center items-end absolute bottom-0 overflow-hidden">
                  <img 
                    src={p.image} 
                    alt={p.title} 
                    className="w-full h-[95%] object-contain object-bottom transition-[scale,transform] duration-500 origin-bottom opacity-100 translate-y-[-13px] sm:translate-y-[-48px] group-hover:brightness-110" 
                    style={{ 
                      scale: p.scale || 1.3,
                      ...p.extraStyle 
                    }} 
                  />
                </div>
                <div className="w-full absolute bottom-0 left-0 bg-black/60 backdrop-blur-md p-3 xl:p-4 z-20 translate-y-2 group-hover:translate-y-0 transition-transform border-t border-white/10">
                  <h3 className="font-bold text-sm xl:text-lg leading-tight">{p.title}</h3>
                  <p className="text-[10px] xl:text-xs text-gray-300">{p.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Memory Game */}
      <div className="max-w-5xl mx-auto px-4 py-20 w-full z-10 relative">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            {t('creator_game_title')}
          </h2>
          <p className="text-gray-400 font-mono">{t('creator_game_desc')} <br/> {t('creator_moves')}: {moves}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 max-w-4xl mx-auto">
          {cards.map((card, idx) => {
            const isFlipped = flipped.includes(idx) || solved.includes(idx)
            return (
              <div 
                key={card.uuid} 
                className={`card-perspective w-full aspect-[3/4] cursor-pointer ${isFlipped ? 'card-flipped' : ''}`}
                onClick={() => handleCardClick(idx)}
              >
                <div className="card-inner w-full h-full relative shadow-lg border border-gray-700/50" style={{ boxShadow: isFlipped ? `0 0 20px ${glitchIntensity > 0.5 ? 'red' : 'purple'}` : '' }}>
                  {/* Front */}
                  <div className="card-face absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border border-gray-700 hover:border-pink-500 transition-colors">
                    <span className="text-4xl hover:animate-spin" style={{ filter: `hue-rotate(${glitchIntensity * 180}deg)` }}>👁️</span>
                  </div>
                  {/* Back */}
                  <div className={`card-face card-back absolute inset-0 bg-white overflow-hidden border-[3px] flex items-center justify-center ${card.border}`}>
   {card.image && (
      <img src={card.image} alt={card.title} className="absolute inset-0 w-full h-full object-contain scale-[1.25] object-center" style={{ filter: glitchIntensity > 0.6 ? 'invert(1)' : 'none' }} />
   )}
</div>
                </div>
              </div>
            )
          })}
        </div>
        
        {solved.length === cards.length && cards.length > 0 && (
           <div className="mt-12 text-center animate-bounce">
            <h3 className="text-2xl font-black text-green-400 uppercase tracking-widest">{t('creator_cycle_complete')}</h3>
          </div>
        )}
      </div>

      {/* The Danger Zone Footer */}
      <div className="w-full h-[60vh] mt-20 flex flex-col items-center justify-center p-4 relative group cursor-crosshair overflow-hidden" style={{ background: `rgba(150,0,0,${glitchIntensity * 0.4})` }}>
        <div className="text-center z-10">
          <h2 className="text-5xl md:text-7xl font-black text-white mix-blend-difference uppercase drop-shadow-[0_0_20px_red]" style={{ transform: `scale(${1 + glitchIntensity * 0.3})`, opacity: glitchIntensity * 1.5 }}>
            {t('creator_danger_title')}
          </h2>
          <p className="mt-6 text-red-400 font-mono text-lg max-w-lg mx-auto bg-black/50 p-4" style={{ opacity: glitchIntensity }}>
            {t('creator_danger_desc')}
          </p>
        </div>
      </div>

      {/* Screen Crack Override */}
      {isBroken && (
        <div className="glass-crack">
           <div className="crack-lines"></div>
        </div>
      )}

    </div>
  )
}
