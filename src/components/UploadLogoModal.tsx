import React, { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, RotateCcw, Check, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { removeBlackBackground } from '../utils/imageUtils';
import { OFFICIAL_GITHUB_RAW_LOGO_URL } from './VroomMateLogo';

interface UploadLogoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = 'vroommate_custom_logo';
const EVENT_NAME = 'vroommate_logo_updated';

export const UploadLogoModal: React.FC<UploadLogoModalProps> = ({ isOpen, onClose }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [autoMergeBlack, setAutoMergeBlack] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const currentStoredLogo = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;

  const handleProcessFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file format', {
        description: 'Please select a valid image file (PNG, JPG, JPEG, SVG, or WebP).',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large', {
        description: 'Please upload an image smaller than 5MB.',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        if (autoMergeBlack) {
          const cleaned = await removeBlackBackground(dataUrl);
          setSelectedImage(cleaned);
        } else {
          setSelectedImage(dataUrl);
        }
        setFileName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleSaveLogo = () => {
    if (!selectedImage) {
      toast.error('Please select an image file first.');
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, selectedImage);
      window.dispatchEvent(new Event(EVENT_NAME));
      window.dispatchEvent(new Event('storage'));
      toast.success('Logo updated successfully!', {
        description: 'Your uploaded logo is now live across the entire website.',
        icon: '✨',
      });
      onClose();
    } catch {
      toast.error('Storage quota exceeded', {
        description: 'Image resolution is too high. Try compressing it to PNG/JPG under 2MB.',
      });
    }
  };

  const handleResetToDefault = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new Event(EVENT_NAME));
      window.dispatchEvent(new Event('storage'));
      setSelectedImage(null);
      setFileName(null);
      toast.success('Logo reset to default', {
        description: 'The official Vroommate vector logo has been restored.',
      });
      onClose();
    } catch {
      toast.error('Failed to reset logo.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-[#0d1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-slate-200 flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-logo-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#161b22]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#43f92f]/10 border border-[#43f92f]/30 grid place-items-center text-[#43f92f]">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 id="upload-logo-title" className="font-display font-bold text-white text-base">
                Upload Exact Logo
              </h3>
              <p className="text-xs text-slate-400">
                Directly replace the Vroommate brand logo across the entire site
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg grid place-items-center bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
              isDragging
                ? 'border-[#43f92f] bg-[#43f92f]/10 scale-[1.01]'
                : selectedImage
                ? 'border-[#43f92f]/60 bg-black/40'
                : 'border-white/15 bg-white/[0.02] hover:border-[#43f92f]/40 hover:bg-white/[0.04]'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
              className="hidden"
            />

            <div className="w-12 h-12 rounded-2xl bg-[#43f92f]/10 border border-[#43f92f]/30 grid place-items-center mx-auto mb-3 text-[#43f92f]">
              <ImageIcon className="w-6 h-6" />
            </div>

            <div className="text-sm font-semibold text-white mb-1">
              {fileName ? fileName : 'Click to browse or drag & drop your logo image'}
            </div>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Supports PNG, JPG, JPEG, SVG, or WebP. Transparent or black background recommended.
            </p>

            <button
              type="button"
              className="mt-3.5 px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-colors pointer-events-none inline-flex items-center gap-1.5"
            >
              <Upload className="w-3 h-3" />
              <span>Choose Image from Device</span>
            </button>
          </div>

          {/* Seamless Black Background Merge Option */}
          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#43f92f]/30 cursor-pointer transition-colors text-xs">
            <input
              type="checkbox"
              checked={autoMergeBlack}
              onChange={(e) => setAutoMergeBlack(e.target.checked)}
              className="w-4 h-4 rounded accent-[#43f92f] cursor-pointer"
            />
            <div>
              <span className="font-semibold text-white">Seamless Interface Merge</span>
              <span className="text-slate-400 block text-[11px]">
                Automatically cleans and matches the black background to blend into the interface
              </span>
            </div>
          </label>

          {/* Live Preview Area */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#43f92f]" />
                Live Navbar Header Preview:
              </span>
              {selectedImage && (
                <span className="text-[11px] text-[#43f92f] font-mono">New upload ready</span>
              )}
            </div>

            <div className="bg-[#000000] border border-white/15 rounded-xl p-3 flex flex-col items-center justify-center min-h-[76px] relative overflow-hidden">
              <div className="absolute top-1.5 left-2.5 text-[10px] uppercase tracking-wider text-slate-500 font-mono">
                Navbar Preview
              </div>

              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt="Uploaded Logo Preview"
                  className="h-12 sm:h-14 w-auto max-w-full object-contain bg-transparent drop-shadow-[0_0_14px_rgba(67,249,47,0.35)]"
                />
              ) : currentStoredLogo ? (
                <img
                  src={currentStoredLogo}
                  alt="Current Custom Logo"
                  className="h-12 sm:h-14 w-auto max-w-full object-contain bg-transparent drop-shadow-[0_0_14px_rgba(67,249,47,0.35)]"
                />
              ) : (
                <img
                  src={OFFICIAL_GITHUB_RAW_LOGO_URL}
                  alt="Official VM Logo"
                  className="h-12 sm:h-14 w-auto max-w-full object-contain bg-transparent drop-shadow-[0_0_14px_rgba(67,249,47,0.35)]"
                />
              )}
            </div>
          </div>

          {/* Instructions note */}
          <div className="bg-[#161b22] border border-white/10 rounded-xl p-3 flex items-start gap-2 text-xs text-slate-400">
            <AlertCircle className="w-4 h-4 text-[#ff7a1a] shrink-0 mt-0.5" />
            <div>
              <span className="text-white font-medium">Instant Sync:</span> Once saved, your uploaded logo will replace the logo across the navigation header, mobile menu, footer, and booking receipts on this device.
            </div>
          </div>
        </div>

        {/* Footer Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-[#161b22]">
          <div>
            {(selectedImage || currentStoredLogo) && (
              <button
                type="button"
                onClick={handleResetToDefault}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/30 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Default</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveLogo}
              disabled={!selectedImage}
              className={`px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                selectedImage
                  ? 'bg-[#43f92f] text-[#0d1117] hover:bg-[#5dfb4c] shadow-lg shadow-[#43f92f]/20 cursor-pointer'
                  : 'bg-white/10 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Set as Official Logo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
