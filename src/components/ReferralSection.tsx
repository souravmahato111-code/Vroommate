import React, { useState, useEffect } from 'react';
import {
  Gift,
  Share2,
  Copy,
  Check,
  Sparkles,
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  MessageCircle,
  Flame,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import {
  getReferralProfile,
  generateWhatsAppReferralSelfUrl,
  validateReferralCodeInput,
  hasUserCompletedFirstBooking,
  UserReferralProfile,
  VROOMMATE_SITE_URL,
} from '../utils/referral';
import { fireCelebrationConfetti } from '../utils/confetti';
import { toast } from 'sonner';
import { FriendShareModal } from './FriendShareModal';

interface ReferralSectionProps {
  onOpenBookingModal: (prefilledCode?: string) => void;
  onOpenCelebrationModal?: (info: { title: string; subtitle: string }) => void;
}

export const ReferralSection: React.FC<ReferralSectionProps> = ({
  onOpenBookingModal,
  onOpenCelebrationModal,
}) => {
  const { ref, isVisible } = useScrollReveal<HTMLElement>({
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px',
  });

  const [profile, setProfile] = useState<UserReferralProfile>(() => getReferralProfile());
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [codeResult, setCodeResult] = useState<{
    status: 'idle' | 'valid' | 'invalid';
    message?: string;
  }>({ status: 'idle' });

  // Anti-loophole Share Modal state
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedSlotNumber, setSelectedSlotNumber] = useState<number>(1);

  const syncProfile = () => {
    setProfile(getReferralProfile());
  };

  useEffect(() => {
    syncProfile();
    const interval = setInterval(syncProfile, 2000);
    return () => clearInterval(interval);
  }, []);

  const hasFirstBooking = hasUserCompletedFirstBooking() || !!profile.myReferralCode;

  const handleCopyCode = () => {
    if (!profile.myReferralCode) return;
    navigator.clipboard.writeText(profile.myReferralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    toast.success('Referral code copied to clipboard!');
  };

  const shareTextPreview = profile.myReferralCode
    ? `Hey! 🏍️ Rent scooties & bikes in Chota Gamharia with Vroommate.\n\nUse my referral code *${profile.myReferralCode}* to get *20% FLAT DISCOUNT* on your booking!\n⚡ *Hurry or someone else will claim the offer!* 🔥\n\n👉 Book & Redeem: ${VROOMMATE_SITE_URL}\n📍 Hub: Opp. Bharat Petroleum, Gamharia\n✨ Free sanitized helmet included!`
    : '';

  const handleCopyShareMessage = () => {
    if (!shareTextPreview) return;
    navigator.clipboard.writeText(shareTextPreview);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
    toast.success('WhatsApp share message copied!');
  };

  const handleSendToMyWhatsApp = () => {
    if (!profile.myReferralCode) return;
    const url = generateWhatsAppReferralSelfUrl(profile.myReferralCode, '');
    window.open(url, '_blank');
    toast.success('Opened WhatsApp with your referral details!');
  };

  const handleOpenShareModal = (slot?: number) => {
    if (!profile.myReferralCode) {
      toast.info('First booking required', {
        description: 'Complete your first ride to generate your personal referral code!',
      });
      onOpenBookingModal();
      return;
    }

    const currentCount = profile.verifiedFriends?.length || 0;
    const targetSlot = slot || Math.min(3, currentCount + 1);
    setSelectedSlotNumber(targetSlot);
    setShareModalOpen(true);
  };

  const handleShareVerified = (newCount: number, justUnlocked: boolean) => {
    syncProfile();

    if (justUnlocked) {
      fireCelebrationConfetti();
      setTimeout(() => fireCelebrationConfetti(), 600);

      if (onOpenCelebrationModal) {
        onOpenCelebrationModal({
          title: '🎉 20% DISCOUNT UNLOCKED!',
          subtitle:
            'You sent your referral to 3 verified friends on WhatsApp! Your 20% discount is now active and will automatically apply on your next booking.',
        });
      } else {
        toast.success('🎉 20% DISCOUNT UNLOCKED!', {
          description: 'Your 20% discount will automatically apply on your next booking.',
          duration: 6000,
        });
      }
    } else if (newCount < 3) {
      toast.info(`Invite sent & verified with Friend ${newCount}!`, {
        description: `Invite ${3 - newCount} more friend${3 - newCount > 1 ? 's' : ''} to unlock your 20% discount.`,
      });
    }
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    const check = validateReferralCodeInput(codeInput);
    if (check.valid) {
      setCodeResult({
        status: 'valid',
        message: 'Valid code! 20% FLAT DISCOUNT will apply on your first booking.',
      });
      fireCelebrationConfetti();
    } else {
      setCodeResult({
        status: 'invalid',
        message: check.reason || 'Invalid referral code.',
      });
    }
  };

  const verifiedFriends = profile.verifiedFriends || [];
  const clampedCount = Math.min(3, verifiedFriends.length);
  const remaining = Math.max(0, 3 - clampedCount);
  const isUnlocked = profile.senderDiscountAvailable;
  const isSenderUsed = profile.senderDiscountUsed;

  return (
    <section
      ref={ref}
      id="referral"
      className={`py-12 sm:py-14 bg-gradient-to-b from-[#0d1117] via-[#121922] to-[#0d1117] border-b border-white/5 scroll-mt-20 transition-all duration-700 ease-out motion-reduce:transition-none ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Compact Section Header */}
        <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#39ff88]/15 border border-[#39ff88]/30 text-[#39ff88] text-xs font-bold uppercase tracking-wider mb-2">
            <Gift className="w-3.5 h-3.5" />
            <span>Referral Program</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            Invite 3 Friends, Get <span className="text-[#39ff88]">20% OFF</span>
          </h2>
          <p className="mt-1.5 text-slate-300 text-xs sm:text-sm">
            Share your personal referral code after your 1st booking. Share with three friends on WhatsApp to unlock 20% OFF your next ride!
          </p>
        </div>

        {/* 2-Card Layout */}
        <div className="grid md:grid-cols-12 gap-5 items-stretch">
          {/* Card 1: Share & Track (Sender) */}
          <div className="md:col-span-7 bg-[#161c26] border border-[#263041] rounded-3xl p-4 sm:p-5 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="space-y-3.5">
              {/* Header inside Card */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#39ff88]" />
                  <span>Your Referral Hub</span>
                </span>

                {isSenderUsed ? (
                  <span className="text-[11px] font-bold text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                    Discount Claimed
                  </span>
                ) : isUnlocked ? (
                  <span className="text-[11px] font-black text-[#0d1117] bg-[#39ff88] px-2.5 py-0.5 rounded-full shadow-[0_0_12px_rgba(57,255,136,0.5)] animate-pulse">
                    20% OFF UNLOCKED
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-[#ff7a1a] bg-[#ff7a1a]/15 px-2.5 py-0.5 rounded-full border border-[#ff7a1a]/30">
                    {clampedCount}/3 Friends
                  </span>
                )}
              </div>

              {/* Code Box or Locked First Booking Prompt */}
              {hasFirstBooking && profile.myReferralCode ? (
                <div className="space-y-3">
                  {/* Clean, Compact Code Strip */}
                  <div className="p-3 rounded-2xl bg-[#0d1117] border border-white/10 flex items-center justify-between gap-3 shadow-inner">
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                        Your Referral Code
                      </span>
                      <span className="font-mono text-lg sm:text-xl font-black text-[#39ff88] tracking-wider truncate block">
                        {profile.myReferralCode}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Copy Code"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-[#39ff88]" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCopyShareMessage}
                        className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Copy full invite message"
                      >
                        {copiedMessage ? <Check className="w-3.5 h-3.5 text-[#39ff88]" /> : <Copy className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">{copiedMessage ? 'Copied Text' : 'Copy Text'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSendToMyWhatsApp}
                        className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer border border-[#25D366]/40"
                        title="Save to your own WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Save</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Fun Locked State for New Users */
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#101722] to-[#0c1017] border-2 border-dashed border-white/15 text-center space-y-2.5 relative overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-[#39ff88] grid place-items-center mx-auto shadow-inner">
                    <Lock className="w-5 h-5 stroke-[2]" />
                  </div>

                  <div>
                    <h4 className="font-display font-bold text-white text-sm">
                      Referral Code Unlocks After 1st Booking
                    </h4>
                    <p className="text-xs text-slate-300 max-w-sm mx-auto mt-0.5 leading-relaxed">
                      Your referral code generates automatically upon booking. Complete your first ride to start inviting friends!
                    </p>
                  </div>

                  <div className="pt-0.5">
                    <button
                      type="button"
                      onClick={() => onOpenBookingModal()}
                      className="px-4 py-2 rounded-xl bg-[#39ff88] text-[#0d1117] text-xs font-black hover:bg-[#4dff93] shadow-md shadow-[#39ff88]/20 transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <span>Book Your 1st Ride to Unlock</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* COMPACT VERIFIED FRIENDS PROGRESS TRACKER (3 SLOTS) */}
              {/* ========================================================================= */}
              <div className="p-3 sm:p-3.5 rounded-2xl bg-[#0d1117] border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <span className="font-mono text-[#39ff88] font-bold text-sm">{clampedCount}/3</span>
                    <span>Friends Invited</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {clampedCount >= 3 ? (
                      <span className="text-[#39ff88] font-bold">Goal Reached! (20% OFF Unlocked)</span>
                    ) : (
                      <span>{remaining} more friend{remaining === 1 ? '' : 's'} needed</span>
                    )}
                  </span>
                </div>

                {/* 3 Interactive Friend Slots */}
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((slot) => {
                    const verifiedFriend = verifiedFriends[slot - 1];
                    const isDone = !!verifiedFriend;
                    const isNext = !isDone && clampedCount === slot - 1;

                    return (
                      <div
                        key={slot}
                        onClick={() => {
                          if (!isDone) {
                            handleOpenShareModal(slot);
                          }
                        }}
                        className={`p-2 sm:p-2.5 rounded-xl border transition-all text-center ${
                          isDone
                            ? 'bg-[#39ff88]/10 border-[#39ff88]/40 text-[#39ff88]'
                            : isNext
                            ? 'bg-[#25D366]/15 border-[#25D366]/50 text-white cursor-pointer hover:border-[#25D366] hover:bg-[#25D366]/25 shadow-sm'
                            : 'bg-white/5 border-white/10 text-slate-400 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider">
                            Friend {slot}
                          </span>
                          {isDone ? (
                            <span className="w-4 h-4 rounded-full bg-[#39ff88] text-black font-black text-[10px] grid place-items-center">
                              ✓
                            </span>
                          ) : (
                            <span className="w-4 h-4 rounded-full bg-white/10 text-slate-400 font-bold text-[9px] grid place-items-center">
                              0{slot}
                            </span>
                          )}
                        </div>

                        {isDone ? (
                          <div className="space-y-0.5 text-left">
                            <span className="text-[11px] font-bold text-white block truncate">
                              {verifiedFriend.name}
                            </span>
                            <span className="text-[9px] text-[#39ff88] font-mono block">
                              •••• {verifiedFriend.phone.slice(-4)} ✓
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-0.5 text-left">
                            <span className="text-[11px] font-bold text-slate-200 block truncate">
                              {isNext ? 'Invite' : 'Next'}
                            </span>
                            <span className="text-[9px] text-[#ff7a1a] block font-medium truncate">
                              {slot === 3 ? '20% OFF' : 'WhatsApp'}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Contextual status note */}
                <p className="text-[11px] text-slate-400 text-center">
                  {clampedCount === 0 && 'Share with three friends on WhatsApp to unlock 20% OFF on your next booking.'}
                  {clampedCount === 1 && '1 friend invited! Share with 2 more friends to unlock 20% OFF.'}
                  {clampedCount === 2 && 'Almost there! Share with 1 more friend.'}
                  {clampedCount >= 3 && `🎉 20% discount unlocked! Your code ${profile.myReferralCode ? `(${profile.myReferralCode})` : ''} will auto-apply on your next ride.`}
                </p>
              </div>

              {/* Status Notice if used or redeemed */}
              {profile.isFriendCodeRedeemed && (
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-300 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#39ff88] shrink-0" />
                  <span>A friend has claimed your referral code with 20% OFF!</span>
                </div>
              )}
            </div>

            {/* Primary Action Button */}
            {hasFirstBooking && profile.myReferralCode && (
              <div className="mt-3 pt-2.5 border-t border-white/10">
                {clampedCount >= 3 ? (
                  <button
                    type="button"
                    onClick={() => {
                      fireCelebrationConfetti();
                      onOpenBookingModal();
                    }}
                    className="w-full py-3 px-4 rounded-xl font-black text-xs sm:text-sm bg-[#39ff88] text-[#0d1117] hover:bg-[#4dff93] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md shadow-[#39ff88]/25 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 stroke-[2.5]" />
                    <span>20% OFF Unlocked! Book Ride Now (Auto-Applied)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenShareModal()}
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-[#25D366] to-[#1ebe57] text-[#0d1117] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md shadow-[#25D366]/20 cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 stroke-[2.5]" />
                    <span>
                      Invite Friend {clampedCount + 1} of 3 via WhatsApp ({clampedCount}/3 Shared)
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Card 2: Have a Code? (Receiver) */}
          <div className="md:col-span-5 bg-[#161c26] border border-[#263041] rounded-3xl p-4 sm:p-5 flex flex-col justify-between shadow-xl">
            <div className="space-y-3.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#ff7a1a]" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Have a Friend&apos;s Code?
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                First time riding? Enter your friend&apos;s referral code to get <strong>20% FLAT OFF</strong> your first booking.
              </p>

              {/* Urgency Callout */}
              <div className="p-2 rounded-xl bg-[#ff7a1a]/15 border border-[#ff7a1a]/30 text-xs text-[#ff9c54] font-medium flex items-center gap-2">
                <Flame className="w-3.5 h-3.5 text-[#ff7a1a] shrink-0" />
                <span>Hurry or someone else will claim the offer!</span>
              </div>

              {/* Redeem Form */}
              <form onSubmit={handleVerifyCode} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. VMR-REF-4821"
                    value={codeInput}
                    onChange={(e) => {
                      setCodeInput(e.target.value.toUpperCase());
                      setCodeResult({ status: 'idle' });
                    }}
                    className="flex-1 bg-[#0d1117] border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 uppercase font-mono tracking-wider focus:outline-none focus:border-[#39ff88]"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#ff7a1a] text-[#0d1117] hover:bg-[#ff8f3d] transition-colors shrink-0 cursor-pointer"
                  >
                    Apply
                  </button>
                </div>

                {/* Validation Feedback */}
                {codeResult.status === 'valid' && (
                  <div className="p-2.5 rounded-xl bg-[#39ff88]/15 border border-[#39ff88]/40 text-xs text-[#39ff88] space-y-2">
                    <p className="font-semibold flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>{codeResult.message}</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => onOpenBookingModal(codeInput.trim().toUpperCase())}
                      className="w-full py-1.5 rounded-lg font-bold text-xs bg-[#39ff88] text-[#0d1117] hover:bg-[#4dff93] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <span>Book with 20% OFF</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {codeResult.status === 'invalid' && (
                  <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-300 flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                    <span>{codeResult.message}</span>
                  </div>
                )}
              </form>
            </div>

            {/* Quick Rules Checklist with Urgency */}
            <div className="pt-3 border-t border-white/10 space-y-1.5 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-[#39ff88] shrink-0" />
                <span>Single-use code: Claim before offer expires</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-[#39ff88] shrink-0" />
                <span>Share with three friends on WhatsApp to unlock 20% OFF</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-[#39ff88] shrink-0" />
                <span>Both sender &amp; receiver get 20% discount</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Anti-Loophole Verified Friend Share Modal */}
      {profile.myReferralCode && (
        <FriendShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          slotNumber={selectedSlotNumber}
          myReferralCode={profile.myReferralCode}
          onVerified={handleShareVerified}
        />
      )}
    </section>
  );
};
