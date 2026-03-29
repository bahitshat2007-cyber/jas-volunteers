import React from 'react';

export default function WrestlerSVG({ className }) {
  return (
    <svg viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Broad Shoulders & Muscular Neck */}
      <path d="M 10 250 L 15 150 Q 100 120 185 150 L 190 250 Z" fill="#f4d1b6" />
      <path d="M 40 250 L 50 145 C 70 160 130 160 150 145 L 160 250 Z" fill="#e8bf9d" opacity="0.6" />

      {/* Red Singlet */}
      <path d="M 40 250 L 55 160 Q 100 195 145 160 L 160 250 Z" fill="#dc2626" />
      <path d="M 40 250 L 55 160 L 62 160 L 48 250 Z" fill="#fff" />
      <path d="M 160 250 L 145 160 L 138 160 L 152 250 Z" fill="#fff" />

      {/* Neck Traps */}
      <path d="M 50 160 Q 75 120 85 130" fill="none" stroke="#d9b69b" strokeWidth="3" />
      <path d="M 150 160 Q 125 120 115 130" fill="none" stroke="#d9b69b" strokeWidth="3" />

      {/* Thick Neck */}
      <rect x="75" y="110" width="50" height="40" fill="#f4d1b6" />

      {/* Head with Strong Jawline (Chad) */}
      <path d="M 55 70 C 55 20 145 20 145 70 L 145 100 L 125 135 L 100 145 L 75 135 L 55 100 Z" fill="#f4d1b6" />
      <path d="M 55 100 L 75 135 L 100 145" fill="none" stroke="#d9b69b" strokeWidth="1.5" opacity="0.7" />
      <path d="M 145 100 L 125 135 L 100 145" fill="none" stroke="#d9b69b" strokeWidth="1.5" opacity="0.7" />

      {/* Slight Beard / Ruggedness */}
      <path d="M 65 110 Q 100 150 135 110 L 135 120 L 125 135 L 100 142 L 75 135 L 65 120 Z" fill="#2a2a2a" opacity="0.25" />
      
      {/* Ears */}
      <path d="M 55 85 Q 45 95 55 105 Z" fill="#e8bf9d" />
      <path d="M 145 85 Q 155 95 145 105 Z" fill="#e8bf9d" />

      {/* Hair Top & Bangs (Messy, sweaty) */}
      <path d="M 45 75 Q 50 10 100 10 Q 150 10 155 75 Q 145 30 100 25 Q 55 30 45 75 Z" fill="#1a1a1a" />
      <polygon points="50,75 60,35 75,70 95,30 125,70 140,35 150,75 120,25 100,50 80,25" fill="#1a1a1a" />

      {/* Eyebrows (Intense, furrowed) */}
      <path d="M 55 75 L 85 85 Q 90 85 95 83" fill="none" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round" />
      <path d="M 145 75 L 115 85 Q 110 85 105 83" fill="none" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round" />

      {/* Eyes (Narrow, Chad) */}
      <path d="M 65 90 Q 75 86 85 91 Q 75 92 65 90 Z" fill="#fff" />
      <circle cx="75" cy="89" r="2.5" fill="#1a1a1a" />
      <path d="M 65 87 Q 75 83 85 87" fill="none" stroke="#d9b69b" strokeWidth="1.5" />

      <path d="M 135 90 Q 125 86 115 91 Q 125 92 135 90 Z" fill="#fff" />
      <circle cx="125" cy="89" r="2.5" fill="#1a1a1a" />
      <path d="M 135 87 Q 125 83 115 87" fill="none" stroke="#d9b69b" strokeWidth="1.5" />

      {/* Nose */}
      <path d="M 100 85 L 94 110 L 106 110 Z" fill="#e8bf9d" opacity="0.6" />
      <path d="M 94 110 L 100 114 L 106 110" fill="none" stroke="#d9b69b" strokeWidth="2" strokeLinecap="round" />

      {/* Mouth (Determined grimace) */}
      <path d="M 75 125 Q 100 118 125 125" fill="none" stroke="#2a2a2a" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
