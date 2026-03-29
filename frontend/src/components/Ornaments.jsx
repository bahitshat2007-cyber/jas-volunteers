import React from 'react'

const ORNAMENT_RED = '#9B111E'
const ORNAMENT_DARK_RED = '#5A0A11'
const ORNAMENT_BG = '#FFFFFF'

// Base wrapper for the ornament circle with the dark outer ring
function OrnamentWrapper({ children, className = '' }) {
  return (
    <svg viewBox="0 0 100 100" className={`w-8 h-8 md:w-10 md:h-10 ${className}`}>
      {/* Outer dark ring */}
      <circle cx="50" cy="50" r="48" fill="#1A1A2E" />
      {/* Inner dark red ring */}
      <circle cx="50" cy="50" r="44" fill={ORNAMENT_DARK_RED} />
      {/* Background circle */}
      <circle cx="50" cy="50" r="40" fill={ORNAMENT_BG} />
      {children}
    </svg>
  )
}

/** 1. Новичок (Тумар / Tumar) — Simple starter amulet */
export function RankNovice({ className }) {
  return (
    <OrnamentWrapper className={className}>
      {/* Basic minimal tumar shape */}
      <path d="M25 35 L75 35 L50 75 Z" fill="none" stroke={ORNAMENT_RED} strokeWidth="4" strokeLinejoin="round" />
      <circle cx="50" cy="52" r="4" fill={ORNAMENT_RED} />
    </OrnamentWrapper>
  )
}

/** 2. Доброволец (Сыңар мүйіз / Single Horn) */
export function RankVolunteer({ className }) {
  return (
    <OrnamentWrapper className={className}>
      {/* Curved single horn pattern */}
      <path 
        d="M50 80 C 50 80, 50 30, 50 30 C 50 15, 25 15, 25 35 C 25 50, 40 50, 40 40 C 40 35, 35 35, 35 35" 
        fill="none" stroke={ORNAMENT_RED} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" 
      />
      <circle cx="50" cy="25" r="4" fill={ORNAMENT_RED} />
    </OrnamentWrapper>
  )
}

/** 3. Активист (Қос мүйіз / Double Horns) */
export function RankActivist({ className }) {
  return (
    <OrnamentWrapper className={className}>
      {/* Symmetrical double horns */}
      <path 
        d="M50 80 L50 45 M50 45 C 50 20, 80 20, 80 40 C 80 55, 65 55, 65 45 C 65 40, 70 40, 70 40 M50 45 C 50 20, 20 20, 20 40 C 20 55, 35 55, 35 45 C 35 40, 30 40, 30 40" 
        fill="none" stroke={ORNAMENT_RED} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" 
      />
      <path d="M50 65 L35 80 M50 65 L65 80" stroke={ORNAMENT_RED} strokeWidth="4" strokeLinecap="round" />
    </OrnamentWrapper>
  )
}

/** 4. Ветеран (Төрт құлақ / Four Corners) */
export function RankVeteran({ className }) {
  return (
    <OrnamentWrapper className={className}>
      {/* Intricate cross/four-corner pattern */}
      <path 
        d="M50 20 C 65 20, 65 35, 80 35 C 80 50, 65 50, 65 65 C 65 80, 50 80, 50 65 C 35 65, 35 80, 20 80 C 20 65, 35 65, 35 50 C 35 35, 20 35, 20 20 C 35 20, 35 35, 50 35 C 65 35, 65 20, 50 20 Z" 
        fill={ORNAMENT_RED} stroke={ORNAMENT_BG} strokeWidth="2" strokeLinejoin="round"
      />
      <circle cx="50" cy="50" r="6" fill={ORNAMENT_BG} />
      <circle cx="50" cy="50" r="3" fill={ORNAMENT_RED} />
    </OrnamentWrapper>
  )
}

/** 5. Чемпион (Жұлдыз / Star with horns) — Elaborate champion star */
export function RankChampion({ className }) {
  return (
    <OrnamentWrapper className={`overflow-visible ${className || ''}`}>
      {/* Animated Sparks (VFX) - Made larger and brighter */}
      {[
        { cx: 50, cy: -5, toX: 50, toY: -20, delay: '0s', scale: 1.5 },
        { cx: 88, cy: 12, toX: 104, toY: -4, delay: '0.4s', scale: 1.2 },
        { cx: 105, cy: 50, toX: 125, toY: 50, delay: '0.8s', scale: 1.5 },
        { cx: 88, cy: 88, toX: 104, toY: 104, delay: '1.2s', scale: 1.3 },
        { cx: 50, cy: 105, toX: 50, toY: 125, delay: '1.6s', scale: 1.5 },
        { cx: 12, cy: 88, toX: -4, toY: 104, delay: '0.2s', scale: 1.2 },
        { cx: -5, cy: 50, toX: -25, toY: 50, delay: '0.6s', scale: 1.5 },
        { cx: 12, cy: 12, toX: -4, toY: -4, delay: '1.0s', scale: 1.3 },
      ].map((spark, i) => (
        <g key={i} opacity="0">
          <circle cx={spark.cx} cy={spark.cy} r={2.5 * spark.scale} fill="#FFD700" filter="drop-shadow(0 0 3px #FFD700)" />
          <circle cx={spark.cx} cy={spark.cy} r={1.5 * spark.scale} fill="#FFFFFF" />
          <animate attributeName="opacity" values="0;1;1;0" dur="2s" repeatCount="indefinite" begin={spark.delay} />
          <animate attributeName="cx" values={`${spark.cx};${spark.toX}`} dur="2s" repeatCount="indefinite" begin={spark.delay} />
          <animate attributeName="cy" values={`${spark.cy};${spark.toY}`} dur="2s" repeatCount="indefinite" begin={spark.delay} />
        </g>
      ))}

      {/* 8-pointed star burst background */}
      <path
        d="M50 14 L55 38 L78 22 L62 42 L86 50 L62 58 L78 78 L55 62 L50 86 L45 62 L22 78 L38 58 L14 50 L38 42 L22 22 L45 38 Z"
        fill={ORNAMENT_RED} stroke={ORNAMENT_DARK_RED} strokeWidth="1" strokeLinejoin="round"
      />
      {/* Ornamental horn curls at diagonals */}
      <path d="M30 28 C 24 22, 20 28, 26 34" fill="none" stroke={ORNAMENT_DARK_RED} strokeWidth="2" strokeLinecap="round" />
      <path d="M70 28 C 76 22, 80 28, 74 34" fill="none" stroke={ORNAMENT_DARK_RED} strokeWidth="2" strokeLinecap="round" />
      <path d="M30 72 C 24 78, 20 72, 26 66" fill="none" stroke={ORNAMENT_DARK_RED} strokeWidth="2" strokeLinecap="round" />
      <path d="M70 72 C 76 78, 80 72, 74 66" fill="none" stroke={ORNAMENT_DARK_RED} strokeWidth="2" strokeLinecap="round" />
      {/* Inner detail ring */}
      <circle cx="50" cy="50" r="12" fill={ORNAMENT_BG} stroke={ORNAMENT_RED} strokeWidth="2" />
      {/* Gold accent ring */}
      <circle cx="50" cy="50" r="8" fill="none" stroke="#D4A017" strokeWidth="2" />
      {/* Center jewel */}
      <circle cx="50" cy="50" r="4" fill="#D4A017" />
    </OrnamentWrapper>
  )
}

/** 6. Легенда (Шаңырақ + Пылающее пламя / Shanyrak + visible intense flame) */
export function RankLegend({ className }) {
  return (
    <svg viewBox="0 0 100 100" className={`w-8 h-8 md:w-10 md:h-10 overflow-visible ${className}`}>
      {/* ЗАМЕТНОЕ ПЛАМЯ (Real Flame paths instead of CSS glow) */}
      <g className="origin-center animate-pulse opacity-90">
        {/* Outer Orange Flame */}
        <path d="M50 -15 C 80 -10, 110 20, 100 50 C 110 80, 80 110, 50 115 C 20 110, -10 80, 0 50 C -10 20, 20 -10, 50 -15 Z" fill="#ffb703" />
        {/* Middle Red-Orange Flame (star-burst) */}
        <path d="M50 -5 L65 15 L90 5 L75 25 L105 40 L80 50 L105 60 L75 75 L90 95 L65 85 L50 105 L35 85 L10 95 L25 75 L-5 60 L20 50 L-5 40 L25 25 L10 5 L35 15 Z" fill="#fb8500" />
        {/* Inner Red intense heat */}
        <path d="M50 5 L60 20 L80 15 L70 30 L90 40 L70 50 L90 60 L70 70 L80 85 L60 80 L50 95 L40 80 L20 85 L30 70 L10 60 L30 50 L10 40 L30 30 L20 15 L40 20 Z" fill="#e63946" />
      </g>

      {/* Outer dark ring */}
      <circle cx="50" cy="50" r="48" fill="#1A1A2E" stroke="#ffb703" strokeWidth="2" />
      {/* Inner dark red ring */}
      <circle cx="50" cy="50" r="44" fill={ORNAMENT_DARK_RED} />
      {/* Background circle */}
      <circle cx="50" cy="50" r="40" fill={ORNAMENT_BG} />

      {/* Shanyrak / Mandala base */}
      <clipPath id="innerCircleLegend">
        <circle cx="50" cy="50" r="40" />
      </clipPath>
      <g clipPath="url(#innerCircleLegend)">
        <circle cx="50" cy="50" r="28" fill="none" stroke={ORNAMENT_RED} strokeWidth="5" />
        <path d="M50 10 L50 90 M10 50 L90 50 M22 22 L78 78 M22 78 L78 22" stroke={ORNAMENT_RED} strokeWidth="3.5" />
        <circle cx="50" cy="50" r="34" fill="none" stroke={ORNAMENT_DARK_RED} strokeWidth="1" strokeDasharray="4 4" />
      </g>
      
      {/* CENTER PIECE */}
      <circle cx="50" cy="50" r="14" fill={ORNAMENT_RED} />
      {/* Central Diamond/Rhombus */}
      <path d="M50 42 L58 50 L50 58 L42 50 Z" fill="#ffb703" />
      {/* Letter 'J' for Jas */}
      <path d="M51 45 L51 53 A 1.5 1.5 0 0 1 48 53 L48 52" fill="none" stroke={ORNAMENT_RED} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* VFX: FIRE SPARKS (CSS Keyframes approach) */}
      <style>
        {`
          @keyframes spark-1 { 0% { opacity: 0; transform: translate(50px, 15px) scale(0); } 10% { opacity: 1; transform: translate(45px, 0px) scale(1.5); } 100% { opacity: 0; transform: translate(20px, 80px) scale(0.5); } }
          @keyframes spark-2 { 0% { opacity: 0; transform: translate(50px, 10px) scale(0); } 10% { opacity: 1; transform: translate(60px, -5px) scale(1.8); } 100% { opacity: 0; transform: translate(85px, 85px) scale(0.5); } }
          @keyframes spark-3 { 0% { opacity: 0; transform: translate(50px, 5px) scale(0); } 15% { opacity: 1; transform: translate(50px, -15px) scale(2); } 100% { opacity: 0; transform: translate(40px, 90px) scale(0.5); } }
          @keyframes spark-4 { 0% { opacity: 0; transform: translate(50px, 20px) scale(0); } 15% { opacity: 1; transform: translate(35px, 5px) scale(1.2); } 100% { opacity: 0; transform: translate(5px, 75px) scale(0.5); } }
          @keyframes spark-5 { 0% { opacity: 0; transform: translate(50px, 20px) scale(0); } 10% { opacity: 1; transform: translate(65px, 0px) scale(1.4); } 100% { opacity: 0; transform: translate(95px, 75px) scale(0.5); } }
        `}
      </style>

      <g style={{ animation: 'spark-1 2.5s infinite 0s' }}>
        <circle cx="0" cy="0" r="2" fill="#ffb703" filter="drop-shadow(0 0 3px #ffb703)" />
        <circle cx="0" cy="0" r="1" fill="#ffffff" />
      </g>
      <g style={{ animation: 'spark-2 2.5s infinite 0.4s' }}>
        <circle cx="0" cy="0" r="2" fill="#ffb703" filter="drop-shadow(0 0 3px #ffb703)" />
        <circle cx="0" cy="0" r="1" fill="#ffffff" />
      </g>
      <g style={{ animation: 'spark-3 2.5s infinite 0.8s' }}>
        <circle cx="0" cy="0" r="2" fill="#ffb703" filter="drop-shadow(0 0 3px #ffb703)" />
        <circle cx="0" cy="0" r="1" fill="#ffffff" />
      </g>
      <g style={{ animation: 'spark-4 2.5s infinite 1.2s' }}>
        <circle cx="0" cy="0" r="2" fill="#ffb703" filter="drop-shadow(0 0 3px #ffb703)" />
        <circle cx="0" cy="0" r="1" fill="#ffffff" />
      </g>
      <g style={{ animation: 'spark-5 2.5s infinite 1.6s' }}>
        <circle cx="0" cy="0" r="2" fill="#ffb703" filter="drop-shadow(0 0 3px #ffb703)" />
        <circle cx="0" cy="0" r="1" fill="#ffffff" />
      </g>
    </svg>
  )
}

/** Category Icons */
export function CategoryEcology({ className }) {
  return (
    <OrnamentWrapper className={className}>
      <path d="M50 75 L50 40 M50 40 Q30 30 25 50 Q35 55 50 40 M50 50 Q75 40 80 60 Q65 70 50 50" stroke={ORNAMENT_RED} strokeWidth="4" strokeLinecap="round" fill="none" />
      <circle cx="50" cy="30" r="4" fill={ORNAMENT_RED} />
    </OrnamentWrapper>
  )
}

export function CategoryAnimals({ className }) {
  return (
    <OrnamentWrapper className={className}>
      <ellipse cx="50" cy="65" rx="15" ry="10" fill={ORNAMENT_RED} />
      <circle cx="30" cy="45" r="8" fill={ORNAMENT_RED} />
      <circle cx="70" cy="45" r="8" fill={ORNAMENT_RED} />
      <circle cx="50" cy="35" r="10" fill={ORNAMENT_RED} />
    </OrnamentWrapper>
  )
}

export function CategoryEducation({ className }) {
  return (
    <OrnamentWrapper className={className}>
      <path d="M25 45 L50 30 L75 45 L50 60 Z" fill={ORNAMENT_RED} />
      <path d="M30 50 L30 65 Q50 75 70 65 L70 50" stroke={ORNAMENT_RED} strokeWidth="4" fill="none" />
      <path d="M75 45 L75 70" stroke={ORNAMENT_RED} strokeWidth="3" />
    </OrnamentWrapper>
  )
}

export function CategoryCharity({ className }) {
  return (
    <OrnamentWrapper className={className}>
      <path d="M50 25 A15 15 0 0 0 25 45 Q25 65 50 80 Q75 65 75 45 A15 15 0 0 0 50 25" fill={ORNAMENT_RED} />
      <path d="M35 45 Q50 60 65 45" stroke={ORNAMENT_BG} strokeWidth="3" strokeLinecap="round" fill="none" />
    </OrnamentWrapper>
  )
}
