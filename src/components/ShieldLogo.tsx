import React, { useState } from 'react';

interface ShieldLogoProps {
  className?: string;
  size?: number;
  src?: string;
}

export const ShieldLogo: React.FC<ShieldLogoProps> = ({ 
  className = '', 
  size = 44,
  src = '/logo.png' 
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    // Fallback vector shield if image is missing or loading fails
    return (
      <div
        className={`relative flex items-center justify-center shrink-0 ${className}`}
        style={{ width: size, height: size * 1.15 }}
      >
        <svg
          viewBox="0 0 100 115"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          <path
            d="M50 4 L88 18 C88 56 75 92 50 110 C25 92 12 56 12 18 Z"
            fill="#0D3B66"
            stroke="#4080bf"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <path
            d="M50 11 L81 23 C81 54 70 85 50 101 C30 85 19 54 19 23 Z"
            fill="#134B70"
            stroke="#70B0FF"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <circle cx="50" cy="54" r="23" stroke="#E0F2FE" strokeWidth="2.5" fill="#0D3B66" />
          <line x1="50" y1="31" x2="50" y2="77" stroke="#90CDF4" strokeWidth="2" strokeDasharray="3 2" />
          <line x1="27" y1="54" x2="73" y2="54" stroke="#90CDF4" strokeWidth="2" strokeDasharray="3 2" />
          <circle cx="50" cy="54" r="11" fill="#1E3A8A" stroke="#BAE6FD" strokeWidth="1.8" />
          <polygon
            points="50,45 52.8,51 59,51.5 54.2,55.5 55.8,61.8 50,58 44.2,61.8 45.8,55.5 41,51.5 47.2,51"
            fill="#FFFFFF"
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 overflow-hidden rounded-md ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={src}
        alt="Transport Service Official Emblem"
        onError={() => setHasError(true)}
        referrerPolicy="no-referrer"
        className="w-full h-full object-contain drop-shadow-sm select-none"
      />
    </div>
  );
};
