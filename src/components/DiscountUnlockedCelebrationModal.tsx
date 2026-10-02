import React, { useEffect } from 'react';
import { X, Sparkles, Check, Gift, ArrowRight } from 'lucide-react';
import { fireCelebrationConfetti } from '../utils/confetti';

interface DiscountUnlockedCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  badgeText?: string;
  actionText?: string;
  onActionClick?: () => void;
}

export const DiscountUnlockedCelebrationModal: React.FC<DiscountUnlockedCelebrationModalProps> = ({
  isOpen,
  onClose,
  title = '20% DISCOUNT UNLOCKED!',
  subtitle = 'You have shared your referral with 3 people! Your flat 20% discount has been unlocked and will be automatically applied to your next booking.',
  badgeText = 'FLAT 20% OFF',
  actionText = 'Got It, Awesome!',
  onActionClick,
}) => {
  useEffect(() => {
    if (isOpen) {
      fireCelebrationConfetti();
      const timer = setTimeout(() => {
        fireCelebrationConfetti();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-[#161c26] border-2 border-[#2bff8e] rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_-15px_rgba(43, 255, 142,0.5)] text-center overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Glow background effect */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-[#2bff8e]/20 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        {/* Close icon */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white grid place-items-center transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Celebration Trophy Icon / Graphic */}
        <div className="relative mx-auto w-20 h-20 mb-5">
          <div className="absolute inset-0 rounded-full bg-[#2bff8e]/20 animate-ping duration-1000" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#2bff8e] to-[#2bff8e] text-[#0d1117] grid place-items-center shadow-lg shadow-[#2bff8e]/30">
            <Gift className="w-10 h-10 stroke-[2.5]" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#ff7a1a] text-[#0d1117] grid place-items-center font-black text-xs border-2 border-[#161c26]">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#2bff8e]/15 border border-[#2bff8e]/40 text-[#2bff8e] text-xs font-black tracking-widest uppercase mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{badgeText}</span>
        </div>

        <h3 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight leading-tight">
          {title}
        </h3>

        <p className="mt-3 text-slate-300 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
          {subtitle}
        </p>

        {/* 3/3 Sent Progress Indicator */}
        <div className="mt-5 p-3 rounded-2xl bg-[#0d1117] border border-white/10">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400 font-medium">Referral Goal Reached</span>
            <span className="text-[#2bff8e] font-bold font-mono">3 / 3 People Sent</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden flex">
            <div className="h-full bg-gradient-to-r from-[#2bff8e] to-[#ff7a1a] w-full rounded-full transition-all duration-500 shadow-[0_0_12px_#2bff8e]" />
          </div>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#2bff8e] mt-2 font-medium">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>Automatically applied on your next booking!</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => {
            if (onActionClick) {
              onActionClick();
            } else {
              onClose();
            }
          }}
          className="mt-6 w-full py-3.5 px-6 rounded-2xl font-bold text-sm bg-[#2bff8e] text-[#0d1117] hover:bg-[#4dff9f] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#2bff8e]/25 cursor-pointer"
        >
          <span>{actionText}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
