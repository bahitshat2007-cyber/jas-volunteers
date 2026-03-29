import React from 'react';

export default function ScientistSVG({ className }) {
  return (
    <svg viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg" className={className}>
      <text x="10" y="50" fill="#a1a1aa" fontSize="12" fontFamily="monospace" opacity="0.4">E = mc²</text>
      <text x="140" y="80" fill="#a1a1aa" fontSize="10" fontFamily="monospace" opacity="0.4">λ = h/p</text>
      <text x="20" y="210" fill="#a1a1aa" fontSize="14" fontFamily="monospace" opacity="0.4">∫f(x)dx</text>

      {/* Coat & Suit */}
      <path d="M 5 250 Q 5 160 100 150 Q 195 160 195 250 Z" fill="#e5e7eb" /> 
      <path d="M 40 250 L 60 160 L 100 210 L 140 160 L 160 250 Z" fill="#4b5563" /> 
      <polygon points="75,150 125,150 100,185" fill="#fff" /> 
      <polygon points="96,175 104,175 108,210 92,210" fill="#831843" /> 

      {/* Neck */}
      <rect x="80" y="120" width="40" height="40" fill="#f4d1b6" />

      {/* Head with Strong Jawline */}
      <path d="M 55 70 C 55 20 145 20 145 70 L 145 100 L 125 135 L 100 145 L 75 135 L 55 100 Z" fill="#f4d1b6" />
      <path d="M 55 100 L 75 135 L 100 145" fill="none" stroke="#d9b69b" strokeWidth="1.5" opacity="0.7" />
      <path d="M 145 100 L 125 135 L 100 145" fill="none" stroke="#d9b69b" strokeWidth="1.5" opacity="0.7" />

      {/* Ears */}
      <path d="M 55 85 Q 45 95 55 105 Z" fill="#e8bf9d" />
      <path d="M 145 85 Q 155 95 145 105 Z" fill="#e8bf9d" />

      {/* Hair (Slightly wild) */}
      <path d="M 45 75 Q 50 10 100 10 Q 150 10 155 75 Q 145 30 100 25 Q 55 30 45 75 Z" fill="#1a1a1a" />
      <polygon points="45,75 55,35 70,70 90,30 130,70 145,35 155,75 110,25 100,50 85,25" fill="#1a1a1a" />

      {/* Eyebrows (Philosophical) */}
      <path d="M 60 72 Q 75 66 85 70" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 140 72 Q 125 66 115 70" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />

      {/* Eyes (Almond, double eyelid) */}
      <path d="M 65 85 Q 75 78 85 85 Q 75 88 65 85 Z" fill="#fff" />
      <circle cx="75" cy="84" r="3" fill="#1a1a1a" />
      <path d="M 65 81 Q 75 76 85 81" fill="none" stroke="#d9b69b" strokeWidth="1.5" />

      <path d="M 135 85 Q 125 78 115 85 Q 125 88 135 85 Z" fill="#fff" />
      <circle cx="125" cy="84" r="3" fill="#1a1a1a" />
      <path d="M 135 81 Q 125 76 115 81" fill="none" stroke="#d9b69b" strokeWidth="1.5" />

      {/* Glasses */}
      <circle cx="75" cy="85" r="14" fill="none" stroke="#374151" strokeWidth="2.5" />
      <circle cx="125" cy="85" r="14" fill="none" stroke="#374151" strokeWidth="2.5" />
      <path d="M 89 85 L 111 85" fill="none" stroke="#374151" strokeWidth="2.5" />
      <path d="M 64 76 L 72 84" fill="none" stroke="#fff" strokeWidth="2.5" opacity="0.6" />
      <path d="M 114 76 L 122 84" fill="none" stroke="#fff" strokeWidth="2.5" opacity="0.6" />

      {/* Nose */}
      <path d="M 100 85 L 94 110 L 106 110 Z" fill="#e8bf9d" opacity="0.6" />
      <path d="M 94 110 L 100 114 L 106 110" fill="none" stroke="#d9b69b" strokeWidth="2" strokeLinecap="round" />

      {/* Mouth (Wise line) */}
      <path d="M 82 125 L 118 125" fill="none" stroke="#a38a7c" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
