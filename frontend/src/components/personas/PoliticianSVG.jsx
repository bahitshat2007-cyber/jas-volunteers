import React from 'react';

export default function PoliticianSVG({ className }) {
  return (
    <svg viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="suitGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>
      
      {/* Shoulders & Suit */}
      <path d="M 15 250 Q 15 160 100 150 Q 185 160 185 250 Z" fill="url(#suitGrad)" />
      {/* White Shirt */}
      <polygon points="75,150 125,150 100,195" fill="#fff" />
      {/* Red Tie */}
      <polygon points="95,175 105,175 110,250 100,250 90,250" fill="#dc2626" />
      {/* Suit Lapels */}
      <polygon points="55,170 75,150 100,210" fill="#1e3a8a" stroke="#0f172a" strokeWidth="2" />
      <polygon points="145,170 125,150 100,210" fill="#1e3a8a" stroke="#0f172a" strokeWidth="2" />
      
      {/* Neck */}
      <rect x="80" y="120" width="40" height="40" fill="#f4d1b6" />
      <path d="M 80 145 C 90 155 110 155 120 145" fill="#d9b69b" opacity="0.5" />

      {/* Head with Strong Jawline (Chad) */}
      <path d="M 55 70 C 55 20 145 20 145 70 L 145 100 L 125 135 L 100 145 L 75 135 L 55 100 Z" fill="#f4d1b6" />
      {/* Jawline/Cheekbone definition */}
      <path d="M 55 100 L 75 135 L 100 145" fill="none" stroke="#d9b69b" strokeWidth="1.5" opacity="0.7" />
      <path d="M 145 100 L 125 135 L 100 145" fill="none" stroke="#d9b69b" strokeWidth="1.5" opacity="0.7" />
      
      {/* Stubble */}
      <path d="M 65 110 Q 100 150 135 110 L 135 120 L 125 135 L 100 142 L 75 135 L 65 120 Z" fill="#2a2a2a" opacity="0.15" />
      
      {/* Ears */}
      <path d="M 55 85 Q 45 95 55 105 Z" fill="#e8bf9d" />
      <path d="M 145 85 Q 155 95 145 105 Z" fill="#e8bf9d" />

      {/* Hair (Asian messy dark) */}
      <path d="M 45 75 Q 50 10 100 10 Q 150 10 155 75 Q 145 30 100 25 Q 55 30 45 75 Z" fill="#1a1a1a" />
      <polygon points="50,75 60,35 75,70 95,30 125,70 140,35 150,75 120,25 100,50 80,25" fill="#1a1a1a" />

      {/* Eyebrows (Strong, masculine) */}
      <path d="M 60 72 L 85 75" fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
      <path d="M 140 72 L 115 75" fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />

      {/* Eyes (Almond, double eyelid - handsome) */}
      <path d="M 65 85 Q 75 78 85 85 Q 75 88 65 85 Z" fill="#fff" />
      <circle cx="75" cy="84" r="3.5" fill="#2a2a2a" />
      <path d="M 65 81 Q 75 76 85 81" fill="none" stroke="#d9b69b" strokeWidth="1.5" />
      <path d="M 135 85 Q 125 78 115 85 Q 125 88 135 85 Z" fill="#fff" />
      <circle cx="125" cy="84" r="3.5" fill="#2a2a2a" />
      <path d="M 135 81 Q 125 76 115 81" fill="none" stroke="#d9b69b" strokeWidth="1.5" />

      {/* Nose (Strong straight bridge) */}
      <path d="M 100 85 L 94 110 L 106 110 Z" fill="#e8bf9d" opacity="0.6" />
      <path d="M 94 110 L 100 114 L 106 110" fill="none" stroke="#d9b69b" strokeWidth="2" strokeLinecap="round" />

      {/* Mouth (Confident smirk) */}
      <path d="M 82 125 Q 100 132 118 125" fill="none" stroke="#a38a7c" strokeWidth="2" strokeLinecap="round" />
      {/* Dimple */}
      <path d="M 123 120 Q 124 125 120 128" fill="none" stroke="#d9b69b" strokeWidth="2" />
    </svg>
  );
}
