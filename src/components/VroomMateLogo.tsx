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

// List of file paths to check for an uploaded image in /public
const DEFAULT_CANDIDATE_PATHS = [
  '/logo.png',
  '/vroommate-logo.png',
  '/logo.jpg',
  '/logo.jpeg',
  '/logo.webp',
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
  const neon = '#22f054';

  // Cropped SVG 'V' Emblem that eliminates excess margins
  const renderSvgVEmblem = (emblemClassName: string) => (
    <svg
      viewBox="40 15 435 290"
      className={emblemClassName}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={alt}
    >
      {/* Speed Lines */}
      <path d="M 50 85 L 160 85" stroke={neon} strokeWidth="22" strokeLinecap="round" />
      <path d="M 75 130 L 168 130" stroke={neon} strokeWidth="22" strokeLinecap="round" />
      <path d="M 120 175 L 200 175" stroke={neon} strokeWidth="22" strokeLinecap="round" />

      {/* Dynamic V-Cowl & Aerodynamic Frame */}
      <path
        d="M 120 20
           L 212 20
           C 218 20 224 23 228 29
           L 294 165
           L 365 20
           C 370 20 440 16 480 62
           C 522 112 510 180 465 220
           C 445 238 402 248 368 248
           C 338 248 328 225 345 205
           C 364 185 402 180 428 160
           C 452 140 448 105 428 85
           C 408 65 370 68 350 105
           L 264 285
           C 256 300 242 305 232 295
           L 212 260
           Z"
        fill={neon}
      />

      {/* Lower Swingarm / Fork Link */}
      <path
        d="M 268 245
           Q 308 245 328 220
           L 362 255
           C 332 285 288 275 258 255
           Z"
        fill={neon}
      />

      {/* Motorcycle Wheel */}
      <circle cx="405" cy="180" r="62" stroke="#FFFFFF" strokeWidth="22" fill="none" />
      <circle cx="405" cy="180" r="52" fill="#000000" />
      <circle cx="405" cy="180" r="22" fill="#FFFFFF" />
      <circle cx="405" cy="180" r="10" fill="#000000" />
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
    <div className={`inline-flex items-center gap-3.5 sm:gap-4.5 md:gap-5 select-none bg-transparent ${className}`}>
      {/* 1. 'V' Logo / Emblem on the left */}
      <div className="relative shrink-0 flex items-center justify-center">
        {activeImageUrl && !allCandidatesFailed ? (
          <img
            src={activeImageUrl}
            alt={alt}
            onError={handleImageError}
            className="h-16 sm:h-20 md:h-24 lg:h-26 w-auto max-w-[220px] sm:max-w-[280px] object-contain mix-blend-screen bg-transparent"
          />
        ) : (
          renderSvgVEmblem(
            'w-20 h-14 sm:w-24 sm:h-18 md:w-28 md:h-22 lg:w-32 lg:h-24 drop-shadow-[0_0_20px_rgba(34,240,84,0.5)]'
          )
        )}
      </div>

      {/* 2. Vroommate (with Rides under it) positioned just to the right of the 'V' logo */}
      <div className="flex flex-col justify-center">
        <div className="font-display font-black italic tracking-tight text-3xl sm:text-4xl md:text-5xl lg:text-[50px] text-white uppercase leading-none whitespace-nowrap">
          <span>VROOM</span>
          <span style={{ color: neon }}>MATE</span>
        </div>
        <div className="flex items-center justify-center gap-2 sm:gap-2.5 mt-1.5 sm:mt-2">
          <span className="w-6 sm:w-8 md:w-10 h-[2.5px] rounded-full" style={{ backgroundColor: neon }} />
          <span className="text-xs sm:text-sm font-bold tracking-[0.42em] text-slate-200 uppercase pl-[0.42em] leading-none">
            RIDES
          </span>
          <span className="w-6 sm:w-8 md:w-10 h-[2.5px] rounded-full" style={{ backgroundColor: neon }} />
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
