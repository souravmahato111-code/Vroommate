import React, { useState, useEffect, useRef } from 'react';
import { Camera, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { removeBlackBackground } from '../utils/imageUtils';

interface VroomMateLogoProps {
  src?: string;
  className?: string;
  alt?: string;
  variant?: 'full' | 'icon' | 'horizontal';
  showTagline?: boolean;
  allowUpload?: boolean;
  onOpenUploadModal?: () => void;
}

const STORAGE_KEY = 'vroommate_custom_logo';
const EVENT_NAME = 'vroommate_logo_updated';

// Permanent GitHub raw image URL for the official brand logo
export const OFFICIAL_GITHUB_RAW_LOGO_URL =
  'https://raw.githubusercontent.com/souravmahato111-code/Vroommate/383dc3773cbbaa4ea6c80933c6beebe9fbd66ad3/VMlogo.png';

// List of file paths to check for the official brand logo (Permanent GitHub raw URL is primary)
const DEFAULT_CANDIDATE_PATHS = [
  OFFICIAL_GITHUB_RAW_LOGO_URL,
  '/VMlogo.png',
  '/vmlogo.png',
  '/vroommate-logo-horizontal.svg',
  '/vroommate-logo-horizontal.png',
  '/vroommate-logo.svg',
  '/logo.svg',
];

export const VroomMateLogo: React.FC<VroomMateLogoProps> = ({
  src,
  className = '',
  alt = 'Vroommate Logo',
  variant = 'horizontal',
  showTagline = false,
  allowUpload = false,
  onOpenUploadModal,
}) => {
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);
  const [candidateIndex, setCandidateIndex] = useState<number>(0);
  const [allCandidatesFailed, setAllCandidatesFailed] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync custom logo from localStorage and ensure black background is cleaned
  const loadStoredLogo = async () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        if (stored.startsWith('data:image/jpeg') || stored.startsWith('data:image/jpg')) {
          const cleaned = await removeBlackBackground(stored);
          setCustomLogoUrl(cleaned);
        } else {
          setCustomLogoUrl(stored);
        }
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
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        try {
          const transparentDataUrl = await removeBlackBackground(dataUrl);
          localStorage.setItem(STORAGE_KEY, transparentDataUrl);
          setCustomLogoUrl(transparentDataUrl);
          setAllCandidatesFailed(false);
          window.dispatchEvent(new Event(EVENT_NAME));
          window.dispatchEvent(new Event('storage'));
          toast.success('Logo updated successfully!', {
            description: 'Your uploaded logo is now seamlessly merged with the interface.',
            icon: '✨',
          });
        } catch {
          toast.error('Image is too large. Please use an image under 3MB.');
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
      window.dispatchEvent(new Event('storage'));
      toast.success('Reset to official logo');
    } catch (err) {
      console.error(err);
    }
  };

  // Exact Brand Palette
  const neon = '#39ff88';

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

  // Exact full vector logo matching user image 20261001022633892.jpeg
  const renderSvgFullLogo = (fullLogoClassName: string) => (
    <svg
      viewBox="0 46 1120 172"
      className={fullLogoClassName}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={alt}
    >
      <defs>
        <filter id="svg-neon-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Speed Lines on Left */}
      <g stroke={neon} strokeLinecap="round" filter="url(#svg-neon-glow)">
        <line x1="42" y1="122" x2="148" y2="122" strokeWidth="14" />
        <line x1="14" y1="154" x2="172" y2="154" strokeWidth="15" />
        <line x1="60" y1="186" x2="188" y2="186" strokeWidth="14" />
      </g>

      {/* Letter V */}
      <path
        d="M 88 80 L 152 80 L 194 176 L 302 80 L 364 80 L 224 206 C 217 212 206 216 195 216 C 183 216 173 210 167 200 Z"
        fill={neon}
        filter="url(#svg-neon-glow)"
      />

      {/* Letter R */}
      <path
        d="M 268 80 L 344 80 C 378 80 398 94 391 122 C 385 144 367 156 342 160 L 388 212 L 338 212 L 302 164 L 288 164 L 276 212 L 230 212 Z M 288 132 L 332 132 C 347 132 355 126 358 116 C 361 106 356 102 342 102 L 300 102 Z"
        fill={neon}
        filter="url(#svg-neon-glow)"
      />

      {/* MOTORCYCLE SILHOUETTE (Resting atop the two wheels) */}
      <g filter="url(#svg-neon-glow)">
        <path
          d="M 330 98 C 345 88 375 80 405 80 C 435 80 452 86 468 92 C 488 98 506 96 525 82 C 538 72 554 50 566 44 C 574 40 582 38 594 38 C 600 38 608 40 612 44 L 640 44 C 636 50 630 54 622 56 L 608 58 C 622 62 640 70 654 84 C 666 96 670 108 666 116 C 644 118 622 114 606 102 C 588 90 572 86 554 90 C 536 94 520 108 502 114 C 480 120 445 116 420 108 C 395 100 365 104 346 112 Z"
          fill={neon}
        />
        <path d="M 540 50 L 604 50 L 596 60 L 546 60 Z" fill={neon} />
        {/* Headlight Visor Slit (White) */}
        <polygon points="612,86 638,80 634,90 608,96" fill="#FFFFFF" />
      </g>

      {/* REAR WHEEL (Wheel 1) */}
      <g transform="translate(436, 156)">
        <circle cx="0" cy="0" r="50" fill="none" stroke={neon} strokeWidth="13" filter="url(#svg-neon-glow)" />
        <circle cx="0" cy="0" r="43.5" fill="#000000" />
        <circle cx="0" cy="0" r="36" fill="none" stroke="#FFFFFF" strokeWidth="4" />
        <g fill="#FFFFFF">
          <polygon points="-3,-10 3,-10 5,-36 -5,-36" />
          <g transform="rotate(72)"><polygon points="-3,-10 3,-10 5,-36 -5,-36" /></g>
          <g transform="rotate(144)"><polygon points="-3,-10 3,-10 5,-36 -5,-36" /></g>
          <g transform="rotate(216)"><polygon points="-3,-10 3,-10 5,-36 -5,-36" /></g>
          <g transform="rotate(288)"><polygon points="-3,-10 3,-10 5,-36 -5,-36" /></g>
        </g>
        <circle cx="0" cy="0" r="13" fill="#FFFFFF" />
        <circle cx="0" cy="0" r="5" fill="#000000" />
      </g>

      {/* FRONT WHEEL (Wheel 2) */}
      <g transform="translate(556, 156)">
        <circle cx="0" cy="0" r="50" fill="none" stroke={neon} strokeWidth="13" filter="url(#svg-neon-glow)" />
        <circle cx="0" cy="0" r="43.5" fill="#000000" />
        <circle cx="0" cy="0" r="36" fill="none" stroke="#FFFFFF" strokeWidth="4" />
        <g fill="#FFFFFF">
          <polygon points="-3,-10 3,-10 5,-36 -5,-36" />
          <g transform="rotate(72)"><polygon points="-3,-10 3,-10 5,-36 -5,-36" /></g>
          <g transform="rotate(144)"><polygon points="-3,-10 3,-10 5,-36 -5,-36" /></g>
          <g transform="rotate(216)"><polygon points="-3,-10 3,-10 5,-36 -5,-36" /></g>
          <g transform="rotate(288)"><polygon points="-3,-10 3,-10 5,-36 -5,-36" /></g>
        </g>
        <circle cx="0" cy="0" r="13" fill="#FFFFFF" />
        <circle cx="0" cy="0" r="5" fill="#000000" />
      </g>

      {/* Letter M (First M) in Neon Green */}
      <path
        d="M 632 80 L 678 80 L 686 156 L 720 80 L 756 80 L 728 212 L 692 212 L 708 134 L 672 212 L 644 212 L 628 134 L 610 212 L 570 212 Z"
        fill={neon}
        filter="url(#svg-neon-glow)"
      />

      {/* Letter M (Second M) in Neon Green */}
      <path
        d="M 736 80 L 782 80 L 790 156 L 824 80 L 860 80 L 832 212 L 796 212 L 812 134 L 776 212 L 748 212 L 732 134 L 714 212 L 674 212 Z"
        fill={neon}
        filter="url(#svg-neon-glow)"
      />

      {/* Letter A in Pure White */}
      <path
        d="M 838 80 L 892 80 L 916 212 L 872 212 L 864 176 L 826 176 L 810 212 L 770 212 Z M 836 142 L 860 142 L 850 106 Z"
        fill="#FFFFFF"
      />

      {/* Letter T in Pure White */}
      <path
        d="M 888 80 L 984 80 L 976 112 L 948 112 L 924 212 L 882 212 L 906 112 L 880 112 Z"
        fill="#FFFFFF"
      />

      {/* Letter E in Pure White */}
      <path
        d="M 974 80 L 1058 80 L 1050 112 L 1010 112 L 1004 134 L 1042 134 L 1034 164 L 996 164 L 988 182 L 1034 182 L 1026 212 L 942 212 Z"
        fill="#FFFFFF"
      />
    </svg>
  );

  const activeLogoSrc = customLogoUrl || src;

  // Icon only variant
  if (variant === 'icon') {
    return (
      <div className={`relative flex items-center justify-center bg-transparent ${className}`}>
        {activeLogoSrc ? (
          <img
            src={activeLogoSrc}
            alt={alt}
            onError={handleImageError}
            className="w-full h-full object-contain mix-blend-screen bg-transparent"
          />
        ) : (
          renderSvgVEmblem('w-full h-full object-contain drop-shadow-[0_0_12px_rgba(57,255,136,0.4)]')
        )}
      </div>
    );
  }

  // Full stacked variant
  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center select-none bg-transparent p-2 ${className}`}>
        <div className="w-full max-w-[560px] flex items-center justify-center">
          {activeLogoSrc ? (
            <img
              src={activeLogoSrc}
              alt={alt}
              onError={handleImageError}
              className="h-24 sm:h-32 w-auto object-contain bg-transparent drop-shadow-[0_0_20px_rgba(57,255,136,0.4)]"
            />
          ) : (
            renderSvgFullLogo('w-full h-auto drop-shadow-[0_0_20px_rgba(57,255,136,0.4)]')
          )}
        </div>
      </div>
    );
  }

  // Default 'horizontal' lockup for Navbar and Footer:
  // Directly renders the custom uploaded logo or the exact official picture with speed lines, V, R, motorcycle body over wheels, MM, and white ATE.
  // Seamlessly merges with the interface background with no dark rectangular edges!
  const content = (
    <div className={`inline-flex items-center select-none bg-transparent ${className}`}>
      {activeLogoSrc ? (
        <img
          src={activeLogoSrc}
          alt={alt}
          onError={handleImageError}
          className="h-[48px] sm:h-[56px] md:h-[62px] lg:h-[68px] w-auto max-w-[280px] sm:max-w-[340px] md:max-w-[420px] lg:max-w-[460px] object-contain bg-transparent drop-shadow-[0_0_14px_rgba(57,255,136,0.35)]"
        />
      ) : (
        renderSvgFullLogo(
          'h-[48px] sm:h-[56px] md:h-[62px] lg:h-[68px] w-auto max-w-[280px] sm:max-w-[340px] md:max-w-[420px] lg:max-w-[460px] object-contain drop-shadow-[0_0_14px_rgba(57,255,136,0.35)]'
        )
      )}
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
        accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
        className="hidden"
      />

      {/* Floating Upload / Reset Controls */}
      <div
        className={`absolute -bottom-1 -right-2 flex items-center gap-1 transition-opacity duration-200 z-20 ${
          isHovered ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (onOpenUploadModal) {
              onOpenUploadModal();
            } else {
              fileInputRef.current?.click();
            }
          }}
          className="p-1 rounded-full bg-black/90 border border-[#39ff88] text-[#39ff88] hover:bg-[#39ff88] hover:text-black shadow-lg transition-colors cursor-pointer"
          title="Upload / Change Logo Image"
          aria-label="Upload custom logo"
        >
          <Camera className="w-3 h-3" />
        </button>

        {customLogoUrl && (
          <button
            type="button"
            onClick={handleResetLogo}
            className="p-1 rounded-full bg-black/90 border border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white shadow-lg transition-colors cursor-pointer"
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
