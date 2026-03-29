import React from 'react';

export default function FemboySVG({ className }) {
  return (
    <svg viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id="blushGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fca5a5" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#fca5a5" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Huge Back Braid Hair (Astolfo style) */}
      <path d="M 130 110 Q 180 160 160 210 Q 150 240 180 250 Q 130 250 140 200 Q 160 150 130 110 Z" fill="#fbcfe8" />
      <path d="M 130 110 Q 180 160 160 210" fill="none" stroke="#f472b6" strokeWidth="4" strokeDasharray="10 5" opacity="0.5" />

      {/* Pink Pleated Skirt */}
      <path d="M 30 200 Q 100 180 170 200 L 190 250 L 10 250 Z" fill="#f472b6" />
      {/* Skirt Pleats */}
      <path d="M 50 195 L 40 250" fill="none" stroke="#ec4899" strokeWidth="2" />
      <path d="M 80 185 L 75 250" fill="none" stroke="#ec4899" strokeWidth="2" />
      <path d="M 120 185 L 125 250" fill="none" stroke="#ec4899" strokeWidth="2" />
      <path d="M 150 195 L 160 250" fill="none" stroke="#ec4899" strokeWidth="2" />
      {/* White Stripes on Skirt bottom */}
      <path d="M 20 230 Q 100 215 180 230" fill="none" stroke="#fff" strokeWidth="4" />
      <path d="M 15 240 Q 100 225 185 240" fill="none" stroke="#fff" strokeWidth="2" />

      {/* Exposed Midriff */}
      <path d="M 60 150 L 140 150 L 130 200 L 70 200 Z" fill="#f4d1b6" />
      <path d="M 100 180 Q 102 180 100 183" fill="none" stroke="#d9b69b" strokeWidth="2" strokeLinecap="round" /> {/* Belly button */}

      {/* Sailor Top (Crop top) */}
      <path d="M 30 150 L 60 150 L 80 110 L 120 110 L 140 150 L 170 150 L 160 100 L 40 100 Z" fill="#ffffff" />
      {/* Pink Sailor Collar */}
      <path d="M 65 110 L 35 140 L 60 145 L 100 120 L 140 145 L 165 140 L 135 110 Z" fill="#f472b6" />
      <path d="M 45 135 L 100 115 L 155 135" fill="none" stroke="#fff" strokeWidth="2" />
      
      {/* Big Red Bow Tie */}
      <path d="M 100 125 L 80 150 Q 100 150 100 140 Z" fill="#ef4444" />
      <path d="M 100 125 L 120 150 Q 100 150 100 140 Z" fill="#ef4444" />
      <circle cx="100" cy="125" r="5" fill="#dc2626" />
      
      {/* Long Black Sleeves / Gloves */}
      <path d="M 0 200 L 30 150 L 50 150 L 20 200 Z" fill="#1a1a1a" />
      <path d="M 200 200 L 170 150 L 150 150 L 180 200 Z" fill="#1a1a1a" />

      {/* Neck */}
      <rect x="85" y="100" width="30" height="20" fill="#f4d1b6" />
      <rect x="85" y="110" width="30" height="5" fill="#1a1a1a" /> {/* Black choker */}

      {/* Beautiful Chad-proportioned Anime Head */}
      <path d="M 55 60 C 55 10 145 10 145 60 L 145 90 L 125 125 L 100 135 L 75 125 L 55 90 Z" fill="#f4d1b6" />
      <path d="M 55 90 L 75 125 L 100 135" fill="none" stroke="#d9b69b" strokeWidth="1" opacity="0.6" />
      <path d="M 145 90 L 125 125 L 100 135" fill="none" stroke="#d9b69b" strokeWidth="1" opacity="0.6" />

      {/* Big Messy Pink Hair (Astolfo Fluff) */}
      <path d="M 40 65 Q 50 -10 100 -5 Q 150 -10 160 65 Q 140 20 100 15 Q 60 20 40 65 Z" fill="#fbcfe8" />
      {/* Bangs overlapping face */}
      <polygon points="45,60 55,25 75,70 100,25 125,70 145,25 155,60 120,10 100,40 80,10" fill="#fbcfe8" />
      <polygon points="55,60 65,40 80,75 100,35" fill="#fbcfe8" />
      <polygon points="145,60 135,40 120,75 100,35" fill="#fbcfe8" />

      {/* Big Black Bows on sides of hair */}
      <path d="M 50 40 L 20 30 L 30 70 Z" fill="#1a1a1a" />
      <path d="M 50 40 L 25 50 L 40 80 Z" fill="#1a1a1a" />
      
      <path d="M 150 40 L 180 30 L 170 70 Z" fill="#1a1a1a" />
      <path d="M 150 40 L 175 50 L 160 80 Z" fill="#1a1a1a" />

      {/* Blush */}
      <circle cx="65" cy="100" r="15" fill="url(#blushGrad)" />
      <circle cx="135" cy="100" r="15" fill="url(#blushGrad)" />

      {/* Eyebrows (Innocent / slightly lifted) */}
      <path d="M 65 65 Q 75 60 85 64" fill="none" stroke="#f472b6" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 135 65 Q 125 60 115 64" fill="none" stroke="#f472b6" strokeWidth="2.5" strokeLinecap="round" />

      {/* Eyes (Huge Anime Pink/Red Eyes) */}
      <path d="M 65 78 Q 75 70 85 78 Q 75 85 65 78 Z" fill="#fff" />
      <ellipse cx="75" cy="77" rx="5" ry="7" fill="#be185d" />
      <circle cx="73" cy="74" r="2" fill="#fff" />
      <path d="M 62 76 Q 75 68 88 76" fill="none" stroke="#d9b69b" strokeWidth="2" strokeLinecap="round" />

      <path d="M 135 78 Q 125 70 115 78 Q 125 85 135 78 Z" fill="#fff" />
      <ellipse cx="125" cy="77" rx="5" ry="7" fill="#be185d" />
      <circle cx="123" cy="74" r="2" fill="#fff" />
      <path d="M 138 76 Q 125 68 112 76" fill="none" stroke="#d9b69b" strokeWidth="2" strokeLinecap="round" />

      {/* Nose */}
      <path d="M 100 85 L 98 90 L 102 90 Z" fill="#e8bf9d" opacity="0.6" />

      {/* Mouth (Happy open mouth with cute little fang) */}
      <path d="M 90 102 Q 100 115 110 102 Z" fill="#ef4444" />
      <path d="M 90 102 Q 100 98 110 102 Z" fill="#fff" /> {/* Teeth */}
      <polygon points="90,102 96,102 93,108" fill="#fff" /> {/* Cute Fang */}
    </svg>
  );
}
