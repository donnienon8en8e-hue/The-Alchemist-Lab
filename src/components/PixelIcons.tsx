import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export const PixelFlaskIcon: React.FC<IconProps> = ({ size = 20, color = '#38D9C4', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ imageRendering: 'pixelated' }}>
    <path d="M10 2h4v4h-1v2l5 8v4H6v-4l5-8V6h-1V2z" fill="#070B0E" />
    <path d="M11 3h2v3h-2V3z" fill="#E0E8F0" />
    <path d="M12 8l4 6v3H8v-3l4-6z" fill={color} />
    <rect x="9" y="14" width="3" height="2" fill="#FFFFFF" opacity="0.6" />
    <rect x="13" y="15" width="2" height="2" fill="#FFFFFF" opacity="0.6" />
  </svg>
);

export const PixelVialIcon: React.FC<IconProps> = ({ size = 20, color = '#C9973E', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ imageRendering: 'pixelated' }}>
    <rect x="9" y="2" width="6" height="3" fill="#825D1D" stroke="#070B0E" strokeWidth="1" />
    <rect x="8" y="5" width="8" height="15" fill="#121A22" stroke="#070B0E" strokeWidth="1" />
    <rect x="9" y="10" width="6" height="9" fill={color} />
    <rect x="10" y="12" width="2" height="2" fill="#FFFFFF" opacity="0.7" />
  </svg>
);

export const PixelScrollIcon: React.FC<IconProps> = ({ size = 20, color = '#EBBF68', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ imageRendering: 'pixelated' }}>
    <path d="M4 4h14v12H4V4z" fill={color} stroke="#070B0E" strokeWidth="1" />
    <rect x="6" y="7" width="10" height="2" fill="#121A22" />
    <rect x="6" y="10" width="8" height="2" fill="#121A22" />
    <rect x="6" y="13" width="6" height="2" fill="#121A22" />
    <path d="M18 4c1 0 2 1 2 3v11c0 1-1 2-2 2H6c-1 0-2-1-2-2" stroke="#070B0E" strokeWidth="2" />
  </svg>
);

export const PixelHourglassIcon: React.FC<IconProps> = ({ size = 20, color = '#38D9C4', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ imageRendering: 'pixelated' }}>
    <rect x="5" y="2" width="14" height="3" fill="#C9973E" stroke="#070B0E" strokeWidth="1" />
    <rect x="5" y="19" width="14" height="3" fill="#C9973E" stroke="#070B0E" strokeWidth="1" />
    <path d="M7 5l5 6-5 8h10l-5-8 5-6H7z" fill="#16222F" stroke="#070B0E" strokeWidth="1" />
    <polygon points="9,7 15,7 12,11" fill={color} />
    <polygon points="10,18 14,18 12,14" fill={color} />
  </svg>
);

export const PixelCompassIcon: React.FC<IconProps> = ({ size = 20, color = '#38D9C4', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ imageRendering: 'pixelated' }}>
    <circle cx="12" cy="12" r="9" fill="#121A22" stroke="#070B0E" strokeWidth="2" />
    <circle cx="12" cy="12" r="7" stroke="#2A3E52" strokeWidth="1" />
    <polygon points="12,5 15,12 12,10 9,12" fill="#E2654B" />
    <polygon points="12,19 15,12 12,14 9,12" fill={color} />
    <circle cx="12" cy="12" r="1.5" fill="#EBBF68" />
  </svg>
);

export const PixelBarChartIcon: React.FC<IconProps> = ({ size = 20, color = '#38D9C4', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ imageRendering: 'pixelated' }}>
    <rect x="2" y="20" width="20" height="2" fill="#070B0E" />
    <rect x="4" y="14" width="3" height="6" fill="#3A536B" stroke="#070B0E" strokeWidth="1" />
    <rect x="9" y="8" width="3" height="12" fill="#C9973E" stroke="#070B0E" strokeWidth="1" />
    <rect x="14" y="4" width="3" height="16" fill={color} stroke="#070B0E" strokeWidth="1" />
    <rect x="19" y="11" width="3" height="9" fill="#E2654B" stroke="#070B0E" strokeWidth="1" />
  </svg>
);

export const PixelFlameIcon: React.FC<IconProps> = ({ size = 20, color = '#E2654B', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ imageRendering: 'pixelated' }}>
    <path d="M12 2c0 4-3 6-3 10 0 3.3 2.7 6 6 6s6-2.7 6-6c0-6-5-7-5-10z" fill={color} stroke="#070B0E" strokeWidth="1" />
    <path d="M12 9c0 2-2 3-2 5 0 1.7 1.3 3 3 3s3-1.3 3-3c0-3-2.5-3.5-2.5-5z" fill="#EBBF68" />
  </svg>
);

export const PixelHeartIcon: React.FC<IconProps> = ({ size = 20, color = '#E2654B', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ imageRendering: 'pixelated' }}>
    <path d="M4 4h5v3H4V4zm11 0h5v3h-5V4zM2 7h9v3H2V7zm11 0h9v3h-9V7zM2 10h20v3H2v-3zm2 3h16v3H4v-3zm3 3h10v3H7v-3zm3 3h4v3h-4v-3z" fill={color} stroke="#070B0E" strokeWidth="1" />
  </svg>
);

export const PixelShieldIcon: React.FC<IconProps> = ({ size = 20, color = '#38D9C4', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ imageRendering: 'pixelated' }}>
    <path d="M12 2L4 5v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V5l-8-3z" fill={color} stroke="#070B0E" strokeWidth="2" />
    <path d="M12 4l-6 2.2v4.8c0 4.2 2.7 8.2 6 9.2 3.3-1 6-5 6-9.2V6.2L12 4z" fill="#121A22" />
    <rect x="11" y="7" width="2" height="8" fill={color} />
    <rect x="8" y="10" width="8" height="2" fill={color} />
  </svg>
);

export const PixelWizardIcon: React.FC<IconProps> = ({ size = 20, color = '#C9973E', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ imageRendering: 'pixelated' }}>
    <polygon points="12,2 17,11 7,11" fill={color} stroke="#070B0E" strokeWidth="1" />
    <rect x="5" y="11" width="14" height="2" fill="#EBBF68" stroke="#070B0E" strokeWidth="1" />
    <rect x="8" y="13" width="8" height="6" fill="#F0C896" stroke="#070B0E" strokeWidth="1" />
    <rect x="9" y="15" width="2" height="2" fill="#070B0E" />
    <rect x="13" y="15" width="2" height="2" fill="#070B0E" />
    <polygon points="8,19 16,19 12,23" fill="#E0E8F0" />
  </svg>
);

export const PixelPlusIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ imageRendering: 'pixelated' }}>
    <rect x="10" y="4" width="4" height="16" fill={color} stroke="#070B0E" strokeWidth="1" />
    <rect x="4" y="10" width="16" height="4" fill={color} stroke="#070B0E" strokeWidth="1" />
  </svg>
);

export const PixelTrashIcon: React.FC<IconProps> = ({ size = 20, color = '#E2654B', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ imageRendering: 'pixelated' }}>
    <rect x="5" y="4" width="14" height="3" fill={color} stroke="#070B0E" strokeWidth="1" />
    <rect x="7" y="7" width="10" height="13" fill="#121A22" stroke="#070B0E" strokeWidth="1" />
    <rect x="9" y="10" width="2" height="7" fill={color} />
    <rect x="13" y="10" width="2" height="7" fill={color} />
  </svg>
);
