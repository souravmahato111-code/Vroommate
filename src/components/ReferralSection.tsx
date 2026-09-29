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
} from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import {
  getReferralProfile,
  recordReferralShare,
  generateReferralShareWhatsAppUrl,
  validateReferralCodeInput,
  UserReferralProfile,
} from '../utils/referral';
import { fireCelebrationConfetti } from '../utils/confetti';
import { toast } from 'sonner';

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
  const [copied, setCopied] = useState(false);
  const [testCodeInput, setTestCodeInput] = useState('');
  const [testCodeResult, setTestCodeResult] = useState<{
    status: 'idle' | 'valid' | 'invalid';
    message?: string;
  }>({ status: 'idle' });

  const syncProfile = () => {
    setProfile(getReferralProfile());
  };

  useEffect(() => {
    syncProfile();
    const interval = setInterval(syncProfile, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyCode = () => {
    if (!profile.myReferralCode) return;
    navigator.clipboard.writeText(profile.myReferralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    toast.success('Referral code copied to clipboard!');
  };

  const handleShareToFriend = () => {
    const res = recordReferralShare();
    syncProfile();

    if (res.justUnlocked) {
      fireCelebrationConfetti();
      if (onOpenCelebrationModal) {
        onOpenCelebrationModal({
          title: '🎉 20% DISCOUNT UNLOCKED!',
          subtitle:
            'You have successfully shared your referral with 3 people! Your 20% discount is now ready and will automatically apply on your next booking.',
        });
      } else {
        toast.success('🎉 20% Discount Unlocked!', {
          description: 'You sent to 3 people! Your 20% discount is now active for your next booking.',
          duration: 6000,
        });
      }
    } else if (res.newCount < 3) {
      toast.info(`Sent to ${res.newCount}/3 friends!`, {
        description: `Send to ${3 - res.newCount} more friend${3 - res.newCount > 1 ? 's' : ''} to unlock your 20% discount!`,
      });
    }

    const shareUrl = generateReferralShareWhatsAppUrl(res.code);
    window.open(shareUrl, '_blank');
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    const check = validateReferralCodeInput(testCodeInput);
    if (check.valid) {
      setTestCodeResult({
        status: 'valid',
        message: 'Valid code! You are eligible for 20% FLAT DISCOUNT on your booking.',
      });
      fireCelebrationConfetti();
    } else {
      setTestCodeResult({
        status: 'invalid',
        message: check.reason || 'Invalid referral code.',
      });
    }
  };

  const shareCount = profile.shareCount || 0;
  const isUnlocked = profile.senderDiscountAvailable;
  const isUsed = profile.senderDiscountUsed;

  return (
    <section
      ref={ref}
      id="referral"
      className={`py-20 bg-gradient-to-b from-[#0d1117] via-[#121922] to-[#0d1117] border-b border-white/5 scroll-mt-20 transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="max-w-6xl mx-auto px-5">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#39ff88]/15 border border-[#39ff88]/30 text-[#39ff88] text-xs font-bold uppercase tracking-widest mb-3">
            <Gift className="w-3.5 h-3.5" />
            <span>Referral Program</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-white">
            Send to 3 People, Unlock <span className="text-[#39ff88]">20% OFF</span>
          </h2>
          <p className="mt-3 text-slate-300 text-sm md:text-base leading-relaxed">
            Share your unique referral code with 3 friends on WhatsApp. The first friend to use it gets <strong>20% OFF</strong> their first booking, and once you send to 3 people, your <strong>20% OFF</strong> reward automatically unlocks for your next ride!
          </p>
        </div>

        {/* 3 Steps Overview */}
        <div className="grid sm:grid-cols-3 gap-5 mt-10">
          <div className="bg-[#161c26] border border-white/10 rounded-2xl p-5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-2xl font-black text-[#39ff88]">01</span>
              <div className="w-9 h-9 rounded-xl bg-[#39ff88]/15 text-[#39ff88] grid place-items-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <h3 className="font-bold text-white text-base">Book 1st Ride</h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Your personal referral code is generated automatically right after your first completed booking request.
            </p>
          </div>

          <div className="bg-[#161c26] border border-white/10 rounded-2xl p-5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-2xl font-black text-[#ff7a1a]">02</span>
              <div className="w-9 h-9 rounded-xl bg-[#ff7a1a]/15 text-[#ff7a1a] grid place-items-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <h3 className="font-bold text-white text-base">Send to 3 People</h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Send your code on WhatsApp to 3 friends. The sender discount unlocks strictly when all 3 sends are done!
            </p>
          </div>

          <div className="bg-[#161c26] border border-white/10 rounded-2xl p-5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-2xl font-black text-[#39ff88]">03</span>
              <div className="w-9 h-9 rounded-xl bg-[#39ff88]/15 text-[#39ff88] grid place-items-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <h3 className="font-bold text-white text-base">20% Flat Discount</h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Whoever uses the code gets 20% off their booking. Your next booking also automatically applies 20% off. Offer is one-time only!
            </p>
          </div>
        </div>

        {/* Live Interactive Hub */}
        <div className="grid lg:grid-cols-12 gap-7 mt-10">
          {/* Card 1: Your Personal Referral Status */}
          <div className="lg:col-span-7 bg-[#161c26] border border-[#263041] rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#39ff88]/20 text-[#39ff88] grid place-items-center">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg sm:text-xl text-white">
                      Your Referral Dashboard
                    </h3>
                    <p className="text-xs text-slate-400">Share to 3 friends to unlock 20% OFF</p>
                  </div>
                </div>

                {isUsed ? (
                  <span className="text-xs font-bold text-slate-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                    Offer Completed
                  </span>
                ) : isUnlocked ? (
                  <span className="text-xs font-bold text-[#0d1117] bg-[#39ff88] px-3 py-1 rounded-full shadow-[0_0_15px_rgba(57,255,136,0.4)]">
                    🎉 20% Discount Unlocked
                  </span>
                ) : (
                  <span className="text-xs font-bold text-[#ff7a1a] bg-[#ff7a1a]/15 px-3 py-1 rounded-full border border-[#ff7a1a]/30">
                    {shareCount}/3 Friends Sent
                  </span>
                )}
              </div>

              {profile.myReferralCode ? (
                /* User Has a Code */
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1.5 font-medium">
                      Your Unique Referral Code
                    </label>
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-[#0d1117] border border-white/10">
                      <span className="font-mono text-xl sm:text-2xl font-black text-[#39ff88] tracking-wider">
                        {profile.myReferralCode}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copied ? <Check className="w-4 h-4 text-[#39ff88]" /> : <Copy className="w-4 h-4" />}
                        <span>{copied ? 'Copied' : 'Copy Code'}</span>
                      </button>
                    </div>
                  </div>

                  {/* 3-Person Progress Tracker */}
                  <div className="p-4 rounded-2xl bg-[#10141d] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-semibold">Requirement: Send to 3 People</span>
                      <span className="text-[#39ff88] font-bold font-mono">
                        {Math.min(3, shareCount)} / 3 Completed
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#39ff88] to-[#ff7a1a] rounded-full transition-all duration-500 shadow-[0_0_10px_#39ff88]"
                        style={{ width: `${Math.min(100, (shareCount / 3) * 100)}%` }}
                      />
                    </div>

                    {/* 3 Step Badges */}
                    <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                      <div
                        className={`p-2 rounded-xl border text-[11px] font-medium transition-colors ${
                          shareCount >= 1
                            ? 'bg-[#39ff88]/15 border-[#39ff88]/40 text-[#39ff88]'
                            : 'bg-white/5 border-white/5 text-slate-400'
                        }`}
                      >
                        Friend 1 {shareCount >= 1 ? '✓' : ''}
                      </div>
                      <div
                        className={`p-2 rounded-xl border text-[11px] font-medium transition-colors ${
                          shareCount >= 2
                            ? 'bg-[#39ff88]/15 border-[#39ff88]/40 text-[#39ff88]'
                            : 'bg-white/5 border-white/5 text-slate-400'
                        }`}
                      >
                        Friend 2 {shareCount >= 2 ? '✓' : ''}
                      </div>
                      <div
                        className={`p-2 rounded-xl border text-[11px] font-medium transition-colors ${
                          shareCount >= 3
                            ? 'bg-[#39ff88]/15 border-[#39ff88]/40 text-[#39ff88]'
                            : 'bg-white/5 border-white/5 text-slate-400'
                        }`}
                      >
                        Friend 3 {shareCount >= 3 ? '✓' : ''}
                      </div>
                    </div>
                  </div>

                  {isUnlocked && !isUsed && (
                    <div className="p-3.5 rounded-2xl bg-[#39ff88]/15 border border-[#39ff88]/40 flex items-center justify-between gap-3 text-xs text-[#39ff88]">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 shrink-0" />
                        <span className="font-semibold">
                          Goal reached! 20% discount will automatically apply on your next booking.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={fireCelebrationConfetti}
                        className="px-2.5 py-1 rounded-lg bg-[#39ff88] text-[#0d1117] font-bold text-[11px] shrink-0 hover:brightness-110 active:scale-95 cursor-pointer"
                      >
                        🎉 Celebrate
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* No Booking Yet */
                <div className="mt-6 p-6 rounded-2xl bg-[#10141d] border border-white/10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 grid place-items-center mx-auto text-slate-400">
                    <Gift className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-white text-base">Your Code Generates After First Ride</h4>
                  <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                    Book your first two-wheeler rental with us. As soon as you confirm, your personalized referral code will appear right here!
                  </p>
                  <button
                    type="button"
                    onClick={() => onOpenBookingModal()}
                    className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-[#39ff88] text-[#0d1117] hover:bg-[#4dff93] transition-colors cursor-pointer"
                  >
                    <span>Book Your First Ride</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {profile.myReferralCode && !isUsed && (
              <div className="mt-6 pt-5 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleShareToFriend}
                  className="w-full py-3.5 px-5 rounded-2xl font-bold text-sm bg-gradient-to-r from-[#25D366] to-[#1ebe57] text-[#0d1117] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 cursor-pointer"
                >
                  <Share2 className="w-4 h-4 stroke-[2.5]" />
                  <span>
                    {shareCount >= 3
                      ? 'Share Referral Again on WhatsApp'
                      : `Share on WhatsApp (${Math.min(3, shareCount)}/3 Sent)`}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Card 2: Have a Referral Code? Verify & Redeem */}
          <div className="lg:col-span-5 bg-[#161c26] border border-[#263041] rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[#ff7a1a]/20 text-[#ff7a1a] grid place-items-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-white">Have a Referral Code?</h3>
                  <p className="text-xs text-slate-400">Claim 20% OFF on your first booking</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                Got a code from a friend? Enter it below to check validity and lock in your flat <strong>20% discount</strong>. Remember: each referral code is strictly single-use—the first person to book gets the discount!
              </p>

              <form onSubmit={handleVerifyCode} className="mt-5 space-y-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-medium">
                    Enter Referral Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. VMR-REF-4821"
                      value={testCodeInput}
                      onChange={(e) => {
                        setTestCodeInput(e.target.value.toUpperCase());
                        setTestCodeResult({ status: 'idle' });
                      }}
                      className="flex-1 bg-[#10141d] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 uppercase font-mono tracking-wider focus:outline-none focus:border-[#39ff88] transition-colors"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#ff7a1a] text-[#0d1117] hover:bg-[#ff8f3d] transition-colors shrink-0 cursor-pointer"
                    >
                      Verify
                    </button>
                  </div>
                </div>

                {/* Test results */}
                {testCodeResult.status === 'valid' && (
                  <div className="p-3 rounded-xl bg-[#39ff88]/15 border border-[#39ff88]/40 text-xs text-[#39ff88] space-y-2">
                    <div className="flex items-center gap-2 font-bold">
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>{testCodeResult.message}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenBookingModal(testCodeInput.trim().toUpperCase())}
                      className="w-full py-2.5 rounded-xl font-bold text-xs bg-[#39ff88] text-[#0d1117] hover:bg-[#4dff93] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <span>Book Now with 20% OFF</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {testCodeResult.status === 'invalid' && (
                  <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{testCodeResult.message}</span>
                  </div>
                )}
              </form>
            </div>

            {/* Referral Policy Guarantee */}
            <div className="mt-6 pt-4 border-t border-white/10 space-y-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#39ff88] shrink-0" />
                <span>Single-use guarantee: Each referral code can be redeemed only once.</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#39ff88] shrink-0" />
                <span>Sender unlocks 20% on next ride upon sending to 3 people.</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#39ff88] shrink-0" />
                <span>Once claimed, the offer is completed then and there.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
