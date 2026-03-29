import React from 'react';

export default function EntrepreneurSVG({ className }) {
  return (
    <svg viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="100" cy="100" r="90" fill="#fef08a" opacity="0.3" filter="blur(15px)"/>

      {/* Smart Casual Polo */}
      <path d="M 15 250 Q 15 160 100 150 Q 185 160 185 250 Z" fill="#171717" />
      
      {/* Hand holding dessert jar */}
      <rect x="75" y="170" width="50" height="50" rx="8" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="2" />
      <rect x="78" y="195" width="44" height="15" fill="#84cc16" /> {/* Kiwi */}
      <rect x="78" y="180" width="44" height="15" fill="#fff" /> {/* Cream */}
      <rect x="78" y="171" width="44" height="9" fill="#ef4444" /> {/* Berry */}
      <path d="M 75 170 Q 100 160 125 170" fill="none" stroke="#9ca3af" strokeWidth="2" />
      
      <path d="M 50 210 Q 90 190 120 195 Q 130 200 130 210" fill="#f4d1b6" />
      <path d="M 70 200 C 80 190 100 190 110 200" fill="none" stroke="#d9b69b" strokeWidth="2" />

      {/* Neck */}
      <rect x="80" y="120" width="40" height="40" fill="#f4d1b6" />
      <path d="M 80 145 C 90 155 110 155 120 145" fill="none" stroke="#d9b69b" strokeWidth="2" />

      {/* Head with Strong Jawline */}
      <path d="M 55 70 C 55 20 145 20 145 70 L 145 100 L 125 135 L 100 145 L 75 135 L 55 100 Z" fill="#f4d1b6" />
      <path d="M 55 100 L 75 135 L 100 145" fill="none" stroke="#d9b69b" strokeWidth="1.5" opacity="0.7" />
      <path d="M 145 100 L 125 135 L 100 145" fill="none" stroke="#d9b69b" strokeWidth="1.5" opacity="0.7" />

      {/* Ears */}
      <path d="M 55 85 Q 45 95 55 105 Z" fill="#e8bf9d" />
      <path d="M 145 85 Q 155 95 145 105 Z" fill="#e8bf9d" />

      {/* Hair */}
      <path d="M 45 75 Q 50 10 100 10 Q 150 10 155 75 Q 145 30 100 25 Q 55 30 45 75 Z" fill="#1a1a1a" />
      <polygon points="50,75 60,35 75,70 95,30 125,70 140,35 150,75 120,25 100,50 80,25" fill="#1a1a1a" />

      {/* Eyebrows (Warm, confident) */}
      <path d="M 60 72 Q 72.5 67 85 70" fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
      <path d="M 140 72 Q 127.5 67 115 70" fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />

      {/* Eyes (Happy, Double Eyelid) */}
      <path d="M 65 85 Q 75 78 85 85 Q 75 88 65 85 Z" fill="#fff" />
      <circle cx="75" cy="84" r="3.5" fill="#1a1a1a" />
      <path d="M 65 81 Q 75 76 85 81" fill="none" stroke="#d9b69b" strokeWidth="1.5" />

      <path d="M 135 85 Q 125 78 115 85 Q 125 88 135 85 Z" fill="#fff" />
      <circle cx="125" cy="84" r="3.5" fill="#1a1a1a" />
      <path d="M 135 81 Q 125 76 115 81" fill="none" stroke="#d9b69b" strokeWidth="1.5" />

      {/* Nose */}
      <path d="M 100 85 L 94 110 L 106 110 Z" fill="#e8bf9d" opacity="0.6" />
      <path d="M 94 110 L 100 114 L 106 110" fill="none" stroke="#d9b69b" strokeWidth="2" strokeLinecap="round" />

      {/* Big Warm Smile */}
      <path d="M 75 123 Q 100 140 125 123 Q 100 128 75 123 Z" fill="#fff" stroke="#a38a7c" strokeWidth="1" />
    </svg>
  );
}
