import React from 'react';

interface CelestialLogoProps {
  size?: number;
  className?: string;
}

export const CelestialLogo: React.FC<CelestialLogoProps> = ({ size = 48, className = '' }) => {
  return (
    <div className={`inline-flex items-center justify-center relative ${className}`} style={{ width: size, height: size }}>
      {/* 32-bit Pixel SVG Sun and Moon Celestial Emblem based on Alchemical Crest */}
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 64 64" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_0_6px_rgba(201,151,62,0.5)]"
        style={{ imageRendering: 'pixelated' }}
      >
        {/* Background dark circle */}
        <circle cx="32" cy="32" r="30" fill="#0B1015" stroke="#070B0E" strokeWidth="2" />
        
        {/* Radiating Sun Rays (Spikes) */}
        {/* Main 4 Cardinal Rays */}
        <polygon points="32,2 35,16 32,22 29,16" fill="#C9973E" stroke="#070B0E" strokeWidth="1" />
        <polygon points="32,62 35,48 32,42 29,48" fill="#C9973E" stroke="#070B0E" strokeWidth="1" />
        <polygon points="2,32 16,35 22,32 16,29" fill="#C9973E" stroke="#070B0E" strokeWidth="1" />
        <polygon points="62,32 48,35 42,32 48,29" fill="#C9973E" stroke="#070B0E" strokeWidth="1" />

        {/* Diagonal Rays */}
        <polygon points="10,10 22,18 20,22 16,20" fill="#EBBF68" />
        <polygon points="54,10 42,18 44,22 48,20" fill="#EBBF68" />
        <polygon points="10,54 22,46 20,42 16,44" fill="#EBBF68" />
        <polygon points="54,54 42,46 44,42 48,44" fill="#EBBF68" />

        {/* Intermediate Short Pixel Rays */}
        <rect x="22" y="8" width="2" height="6" fill="#C9973E" />
        <rect x="40" y="8" width="2" height="6" fill="#C9973E" />
        <rect x="22" y="50" width="2" height="6" fill="#C9973E" />
        <rect x="40" y="50" width="2" height="6" fill="#C9973E" />
        <rect x="8" y="22" width="6" height="2" fill="#C9973E" />
        <rect x="8" y="40" width="6" height="2" fill="#C9973E" />
        <rect x="50" y="22" width="6" height="2" fill="#C9973E" />
        <rect x="50" y="40" width="6" height="2" fill="#C9973E" />

        {/* Outer Celestial Ring */}
        <circle cx="32" cy="32" r="18" stroke="#C9973E" strokeWidth="2" fill="#121A22" />
        <circle cx="32" cy="32" r="16" stroke="#38D9C4" strokeWidth="1" fill="none" strokeDasharray="2 2" />

        {/* Inner Sunburst Radial Rays in upper half */}
        <line x1="32" y1="20" x2="32" y2="28" stroke="#C9973E" strokeWidth="1" />
        <line x1="26" y1="22" x2="29" y2="28" stroke="#C9973E" strokeWidth="1" />
        <line x1="38" y1="22" x2="35" y2="28" stroke="#C9973E" strokeWidth="1" />
        <line x1="22" y1="26" x2="27" y2="29" stroke="#C9973E" strokeWidth="1" />
        <line x1="42" y1="26" x2="37" y2="29" stroke="#C9973E" strokeWidth="1" />

        {/* Crescent Moon in Bottom Half */}
        <path 
          d="M 20,32 A 12,12 0 0,0 44,32 A 10,10 0 0,1 20,32 Z" 
          fill="#38D9C4" 
          stroke="#070B0E" 
          strokeWidth="1"
        />

        {/* Central Alchemical Star */}
        <polygon points="32,20 33.5,23.5 37,25 33.5,26.5 32,30 30.5,26.5 27,25 30.5,23.5" fill="#EBBF68" />
        <circle cx="32" cy="25" r="1" fill="#FFFFFF" />
      </svg>
    </div>
  );
};
