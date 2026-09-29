import React, { useState, useEffect, useRef } from 'react';
import { Camera, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface VroomMateLogoProps {
  src?: string;
  className?: string;
  alt?: string;
  variant?: 'full' | 'icon' | 'horizontal';
  showTagline?: boolean;
  allowUpload?: boolean;
}

const STORAGE_KEY = 'vroommate_custom_logo';
const EVENT_NAME = 'vroommate_logo_updated';

// List of file paths to check for the official brand logo in /public
const DEFAULT_CANDIDATE_PATHS = [
  '/vroommate-logo-horizontal.png',
  '/vroommate-logo.png',
  '/logo.png',
  '/vroommate-logo.svg',
  '/vroommate-logo-horizontal.svg',
  '/logo.svg',
];

export const VroomMateLogo: React.FC<VroomMateLogoProps> = ({
  src,
  className = '',
  alt = 'Vroommate Logo',
  variant = 'horizontal',
  showTagline = false,
  allowUpload = false,
}) => {
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);
  const [candidateIndex, setCandidateIndex] = useState<number>(0);
  const [allCandidatesFailed, setAllCandidatesFailed] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync custom logo from localStorage
  const loadStoredLogo = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCustomLogoUrl(stored);
        setAllCandidatesFailed(false);
      } else {
        setCustomLogoUrl(null);
      }
    } catch {
      setCustomLogoUrl(null);
    }
  };

  useEffect(() => {
    loadStoredLogo();

    const handleLogoUpdate = () => {
      loadStoredLogo();
    };

    window.addEventListener(EVENT_NAME, handleLogoUpdate);
    window.addEventListener('storage', handleLogoUpdate);
    return () => {
      window.removeEventListener(EVENT_NAME, handleLogoUpdate);
      window.removeEventListener('storage', handleLogoUpdate);
    };
  }, []);

  // Determine current active image URL to attempt loading
  const getActiveImageUrl = (): string | null => {
    if (customLogoUrl) return customLogoUrl;
    if (src) return src;
    if (candidateIndex < DEFAULT_CANDIDATE_PATHS.length) {
      return DEFAULT_CANDIDATE_PATHS[candidateIndex];
    }
    return null;
  };

  const activeImageUrl = getActiveImageUrl();

  const handleImageError = () => {
    if (customLogoUrl) {
      setCustomLogoUrl(null);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        console.error(e);
      }
      return;
    }

    if (src) {
      setAllCandidatesFailed(true);
      return;
    }

    if (candidateIndex + 1 < DEFAULT_CANDIDATE_PATHS.length) {
      setCandidateIndex((prev) => prev + 1);
    } else {
      setAllCandidatesFailed(true);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        try {
          localStorage.setItem(STORAGE_KEY, dataUrl);
          setCustomLogoUrl(dataUrl);
          setAllCandidatesFailed(false);
          window.dispatchEvent(new Event(EVENT_NAME));
          toast.success('Logo updated successfully!', {
            description: 'Your uploaded logo is now active across the entire app.',
            icon: '✨',
          });
        } catch {
          toast.error('Image is too large. Please use an image under 2MB.');
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleResetLogo = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      localStorage.removeItem(STORAGE_KEY);
      setCustomLogoUrl(null);
      setCandidateIndex(0);
      setAllCandidatesFailed(false);
      window.dispatchEvent(new Event(EVENT_NAME));
      toast.info('Logo reset to default.');
    } catch (err) {
      console.error(err);
    }
  };

  // Exact Brand Palette
  const neon = '#00FF1F';

  // Vector 'V' Emblem identical to official brand logo
  const renderSvgVEmblem = (emblemClassName: string) => (
    <svg
      viewBox="0 0 1000 560"
      className={emblemClassName}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={alt}
    >
      {/* Speed Lines */}
      <g stroke={neon} strokeWidth="28" strokeLinecap="round">
        <line x1="45" y1="205" x2="315" y2="205" />
        <line x1="100" y1="280" x2="370" y2="280" />
        <line x1="195" y1="355" x2="430" y2="355" />
      </g>

      {/* Main Neon Green Stylized V & Aerodynamic Cowl */}
      <path
        d="M 190 85 L 345 85 C 355 85 365 92 372 102 L 522 360 L 685 85 C 692 85 790 78 880 120 C 960 158 985 220 990 280 C 965 315 910 325 870 300 C 845 285 855 245 875 225 C 890 210 885 190 870 178 C 840 155 780 150 730 205 L 550 485 C 538 505 515 510 495 490 L 465 445 Z"
        fill={neon}
      />

      {/* Lower Connecting Arm / Wheel Swingarm */}
      <path
        d="M 580 475 C 630 475 665 440 685 390 C 700 350 720 320 760 305 C 805 288 855 310 875 350 C 895 390 885 445 850 480 C 805 525 730 525 675 495 L 615 480 Z"
        fill={neon}
      />

      {/* Wheel Outer Cutout (Black Tire) */}
      <circle cx="795" cy="395" r="92" fill="#000000" />

      {/* Outer White Crescent Accent on Tire */}
      <path
        d="M 865 330 C 895 365 895 425 860 465 C 825 505 770 515 725 495 C 760 510 820 500 855 455 C 885 415 880 365 855 330 Z"
        fill="#FFFFFF"
      />

      {/* Inner Green Rim Loop */}
      <path
        d="M 750 340 C 785 320 830 335 845 370 C 860 405 840 445 805 455 C 768 465 730 445 720 408 C 712 375 730 350 750 340 Z"
        fill={neon}
      />

      {/* Center Hub Black Ring */}
      <circle cx="788" cy="395" r="50" fill="#000000" />

      {/* Center Hub White Disc */}
      <circle cx="788" cy="395" r="34" fill="#FFFFFF" />

      {/* Center Axle Hole */}
      <circle cx="788" cy="395" r="14" fill="#000000" />
    </svg>
  );

  // Icon only variant
  if (variant === 'icon') {
    return (
      <div className={`relative flex items-center justify-center bg-transparent ${className}`}>
        {activeImageUrl && !allCandidatesFailed ? (
          <img
            src={activeImageUrl}
            alt={alt}
            onError={handleImageError}
            className="w-full h-full object-contain mix-blend-screen bg-transparent"
          />
        ) : (
          renderSvgVEmblem('w-full h-full object-contain drop-shadow-[0_0_10px_rgba(34,240,84,0.35)]')
        )}
      </div>
    );
  }

  // Full stacked variant
  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center select-none bg-transparent p-2 ${className}`}>
        <div className="w-full max-w-[260px] flex items-center justify-center">
          {activeImageUrl && !allCandidatesFailed ? (
            <img
              src={activeImageUrl}
              alt={alt}
              onError={handleImageError}
              className="h-20 w-auto object-contain mix-blend-screen bg-transparent drop-shadow-[0_0_16px_rgba(34,240,84,0.35)]"
            />
          ) : (
            renderSvgVEmblem('w-full h-auto drop-shadow-[0_0_16px_rgba(34,240,84,0.35)]')
          )}
        </div>

        {/* Wordmark */}
        <div className="mt-3 text-center">
          <div className="font-display font-black italic tracking-tighter text-3xl sm:text-4xl text-white uppercase leading-none">
            <span>VROOM</span>
            <span style={{ color: neon }}>MATE</span>
          </div>

          <div className="mt-2 flex items-center justify-center gap-2.5">
            <span className="w-7 h-[2px] rounded-full" style={{ backgroundColor: neon }} />
            <span className="text-[11px] font-bold tracking-[0.4em] text-white uppercase pl-[0.4em]">
              RIDES
            </span>
            <span className="w-7 h-[2px] rounded-full" style={{ backgroundColor: neon }} />
          </div>
        </div>
      </div>
    );
  }

  // Default 'horizontal' lockup for Navbar and Header:
  // Features slightly larger 'V' logo on the left, with Vroommate (and Rides under it) directly to its right,
  // completely merged with the page background.
  const content = (
    <div className={`inline-flex items-center gap-1.5 sm:gap-2 select-none bg-transparent ${className}`}>
      {/* 1. 'V' Logo / Emblem on the left - slightly increased */}
      <div className="relative shrink-0 flex items-center justify-center">
        {activeImageUrl && !allCandidatesFailed ? (
          <img
            src={activeImageUrl}
            alt={alt}
            onError={handleImageError}
            className="h-[48px] sm:h-[58px] md:h-[68px] w-auto max-w-[155px] sm:max-w-[190px] object-contain mix-blend-screen bg-transparent"
          />
        ) : (
          renderSvgVEmblem(
            'w-15 h-11 sm:w-18 sm:h-13.5 md:w-22 md:h-16.5 drop-shadow-[0_0_15px_rgba(34,240,84,0.42)]'
          )
        )}
      </div>

      {/* 2. Vroommate (with Rides under it) positioned just to the right of the 'V' logo, shifted slightly to the left - slightly increased */}
      <div className="flex flex-col justify-center -ml-1 sm:-ml-1.5">
        <div className="font-display font-black italic tracking-tight text-[22px] sm:text-[28px] md:text-[34px] lg:text-[38px] text-white uppercase leading-none whitespace-nowrap">
          <span>VROOM</span>
          <span style={{ color: neon }}>MATE</span>
        </div>
        <div className="flex items-center justify-center gap-1.5 mt-1 sm:mt-1.5">
          <span className="w-4.5 sm:w-6 h-[2px] rounded-full" style={{ backgroundColor: neon }} />
          <span className="text-[10.5px] sm:text-xs font-bold tracking-[0.36em] text-slate-200 uppercase pl-[0.36em] leading-none">
            RIDES
          </span>
          <span className="w-4.5 sm:w-6 h-[2px] rounded-full" style={{ backgroundColor: neon }} />
        </div>
      </div>
    </div>
  );

  if (!allowUpload) {
    return content;
  }

  return (
    <div
      className="relative inline-flex items-center group/logo"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {content}

      {/* Hidden file input for uploading custom logo */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Floating Upload / Reset Controls */}
      <div
        className={`absolute -bottom-2 -right-2 flex items-center gap-1 transition-opacity duration-200 z-20 ${
          isHovered ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            fileInputRef.current?.click();
          }}
          className="p-1 rounded-full bg-black border border-[#39ff88] text-[#39ff88] hover:bg-[#39ff88] hover:text-black shadow-lg transition-colors"
          title="Upload / Change Logo Image (PNG, JPG, SVG)"
          aria-label="Upload custom logo"
        >
          <Camera className="w-3 h-3" />
        </button>

        {customLogoUrl && (
          <button
            type="button"
            onClick={handleResetLogo}
            className="p-1 rounded-full bg-black border border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white shadow-lg transition-colors"
            title="Reset to default brand logo"
            aria-label="Reset to default logo"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
