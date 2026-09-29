import React, { useState, useEffect } from 'react';
import {
  Gift,
  Share2,
  Copy,
  Check,
  Sparkles,
  MessageCircle,
  ShieldCheck,
  ArrowRight,
  X,
  BadgePercent,
  PartyPopper,
} from 'lucide-react';
import {
  getUserReferralCode,
  getReferralDiscountState,
  unlockReferralDiscount,
  generateReferralShareUrl,
  generateOfficeClaimWhatsAppUrl,
  subscribeReferralDiscountChange,
  ReferralDiscountState,
} from '../utils/whatsapp';
import { toast } from 'sonner';

interface ReferralSectionProps {
  onOpenBookingModal?: () => void;
}

export const ReferralSection: React.FC<ReferralSectionProps> = ({ onOpenBookingModal }) => {
  const [referralCode, setReferralCode] = useState('');
  const [discountState, setDiscountState] = useState<ReferralDiscountState | null>(null);
  const [copied, setCopied] = useState(false);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [showConfirmSentModal, setShowConfirmSentModal] = useState(false);

  useEffect(() => {
    const code = getUserReferralCode();
    setReferralCode(code);
    const update = () => {
      setDiscountState(getReferralDiscountState());
    };
    update();
    return subscribeReferralDiscountChange(update);
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast.success('Referral Code Copied!', {
      description: `Share ${referralCode} with your friends to give them 20% off.`,
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleInitiateShare = () => {
    if (discountState?.used) {
      const shareUrl = generateReferralShareUrl(referralCode);
      window.open(shareUrl, '_blank');
      toast.info('Referral Code Shared', {
        description: 'You have already redeemed your one-time 20% discount, but friends can still enjoy 20% off!',
      });
      return;
    }

    // Open WhatsApp with the referral share message for friend
    const shareUrl = generateReferralShareUrl(referralCode);
    window.open(shareUrl, '_blank');

    if (discountState?.unlocked) {
      setShowCelebrationModal(true);
    } else {
      // Prompt user to confirm they sent the message to their friend
      setShowConfirmSentModal(true);
    }
  };

  const handleConfirmSentToFriend = () => {
    const updatedState = unlockReferralDiscount(referralCode);
    setDiscountState(updatedState);
    setShowConfirmSentModal(false);
    setShowCelebrationModal(true);
    toast.success('20% Discount Unlocked!', {
      description: 'Your one-time 20% referral reward has been unlocked for your next booking.',
      icon: '🎉',
    });
  };

  const handleSendCardToWhatsApp = () => {
    const claimUrl = generateOfficeClaimWhatsAppUrl(referralCode);
    window.open(claimUrl, '_blank');
    toast.success('Discount Card Sent to WhatsApp', {
      description: 'Show this official WhatsApp message at the desk while booking to claim your offer.',
    });
  };

  return (
    <section id="referral" className="py-16 md:py-24 bg-[#0d1117] border-b border-white/5 scroll-mt-20 relative overflow-hidden">
      {/* Background neon ambient glows */}
      <div className="absolute top-1/2 -left-40 w-96 h-96 bg-[#39ff88]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-[#ff7a1a]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-5 relative z-10">
        {/* Main Card Container */}
        <div className="rounded-3xl p-7 md:p-12 bg-gradient-to-br from-[#161c26] via-[#10141d] to-[#161c26] border border-[#39ff88]/30 shadow-2xl shadow-[#39ff88]/5">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Offer Details & Steps */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#39ff88]/15 border border-[#39ff88]/30 text-[#39ff88] text-xs font-bold uppercase tracking-wider">
                <Gift className="w-4 h-4" />
                <span>Referral Program · Flat 20% OFF</span>
              </div>

              <div>
                <h2 className="font-display font-black text-3xl sm:text-4xl text-white leading-tight">
                  Invite Friends &amp; Get{' '}
                  <span className="text-[#39ff88] underline decoration-[#ff7a1a] decoration-wavy decoration-2">
                    20% OFF
                  </span>{' '}
                  Your Next Ride!
                </h2>
                <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
                  Share the freedom of two-wheeler rides with friends, classmates, and colleagues in Gamharia &amp; Jamshedpur.
                  When you send the referral message to a friend via WhatsApp, you <strong className="text-white">unlock a flat 20% discount</strong> (applicable only once on your next booking)!
                </p>
              </div>

              {/* 3 Step Visual Progression */}
              <div className="grid sm:grid-cols-3 gap-4 pt-2">
                <div className="bg-[#10141d] p-4 rounded-2xl border border-white/5 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-[#39ff88]/20 text-[#39ff88] grid place-items-center text-sm font-bold font-mono">
                    1
                  </div>
                  <h4 className="text-white font-bold text-xs uppercase tracking-wider">
                    Send to Friend
                  </h4>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Send your referral invite message to a friend via WhatsApp.
                  </p>
                </div>

                <div className="bg-[#10141d] p-4 rounded-2xl border border-white/5 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-[#ff7a1a]/20 text-[#ff7a1a] grid place-items-center text-sm font-bold font-mono">
                    2
                  </div>
                  <h4 className="text-white font-bold text-xs uppercase tracking-wider">
                    Friend Saves 20%
                  </h4>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Your friend gets 20% off on their two-wheeler rental in Gamharia.
                  </p>
                </div>

                <div className="bg-[#10141d] p-4 rounded-2xl border border-[#39ff88]/40 space-y-2 bg-[#39ff88]/5">
                  <div className="w-8 h-8 rounded-xl bg-[#39ff88] text-[#0d1117] grid place-items-center text-sm font-bold font-mono">
                    3
                  </div>
                  <h4 className="text-[#39ff88] font-bold text-xs uppercase tracking-wider">
                    You Save 20% (1-Time)
                  </h4>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Once sent, you unlock 20% OFF applicable once on your next booking!
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Referral Action Box */}
            <div className="lg:col-span-5 flex flex-col items-stretch">
              <div className="p-6 md:p-8 rounded-2xl bg-[#0d1117] border border-white/10 space-y-6 relative overflow-hidden">
                {/* Active discount ribbon if unlocked */}
                {discountState?.used ? (
                  <div className="bg-slate-800 text-slate-300 border border-white/10 px-4 py-2 rounded-xl text-xs flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#39ff88]" />
                      <span className="font-semibold text-white">One-Time 20% Discount Redeemed</span>
                    </div>
                    {discountState.usedBookingId && (
                      <span className="font-mono text-[11px] text-[#39ff88]">#{discountState.usedBookingId}</span>
                    )}
                  </div>
                ) : discountState?.unlocked ? (
                  <div className="bg-gradient-to-r from-[#39ff88] to-[#22f054] text-[#0d1117] px-4 py-1.5 -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 mb-4 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md">
                    <Sparkles className="w-4 h-4 fill-current" />
                    <span>20% Discount Unlocked (Valid for 1 Booking)!</span>
                  </div>
                ) : null}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Your Unique Referral Code
                  </label>
                  <div className="flex items-center gap-2 p-2 bg-[#161c26] rounded-xl border border-white/15">
                    <span className="font-mono font-black text-xl text-[#39ff88] px-3 tracking-wider flex-1 select-all">
                      {referralCode || 'VROOM20'}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Copy referral code"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-[#39ff88]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Primary Share on WhatsApp CTA */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleInitiateShare}
                    className="w-full py-4 px-6 rounded-2xl font-bold text-sm bg-gradient-to-r from-[#39ff88] to-[#22f054] text-[#0d1117] hover:brightness-110 shadow-xl shadow-[#39ff88]/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5 cursor-pointer"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>
                      {discountState?.used
                        ? 'Share with Friends via WhatsApp'
                        : discountState?.unlocked
                        ? 'Share with Another Friend on WhatsApp'
                        : 'Send Referral on WhatsApp & Unlock 20%'}
                    </span>
                  </button>

                  {discountState?.unlocked && !discountState?.used && (
                    <button
                      type="button"
                      onClick={handleSendCardToWhatsApp}
                      className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/15 text-white border border-[#39ff88]/40 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 text-[#39ff88]" />
                      <span>Send Claim Card to WhatsApp (Show in Office)</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400 border-t border-white/10 pt-4">
                  <ShieldCheck className="w-4 h-4 text-[#39ff88] shrink-0" />
                  <span>
                    {discountState?.used
                      ? 'Referral discount is applicable once per user. Thank you for referring friends!'
                      : '20% discount unlocks when referral message is sent to a friend via WhatsApp. Applicable only once.'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Prompt: "Did you send the message to your friend on WhatsApp?" */}
      {showConfirmSentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#161c26] border-2 border-[#39ff88] rounded-3xl p-6 md:p-7 shadow-2xl shadow-[#39ff88]/25 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowConfirmSentModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white grid place-items-center transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#39ff88]/20 text-[#39ff88] mx-auto grid place-items-center border border-[#39ff88]/30">
                <MessageCircle className="w-7 h-7" />
              </div>

              <h3 className="font-display font-black text-xl text-white">
                Sent Message to Friend on WhatsApp?
              </h3>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                The 20% discount is unlocked once the referral invite has been sent to a friend via WhatsApp. This discount is <strong className="text-white">applicable only once</strong> on your next booking.
              </p>
            </div>

            <div className="mt-6 space-y-2.5">
              <button
                type="button"
                onClick={handleConfirmSentToFriend}
                className="w-full py-3.5 px-5 rounded-2xl font-bold text-sm bg-gradient-to-r from-[#39ff88] to-[#22f054] text-[#0d1117] hover:brightness-110 shadow-lg shadow-[#39ff88]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Yes, Message Sent! (Unlock 20% OFF)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const shareUrl = generateReferralShareUrl(referralCode);
                  window.open(shareUrl, '_blank');
                }}
                className="w-full py-2.5 px-4 rounded-xl font-medium text-xs bg-white/5 hover:bg-white/10 text-slate-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Reopen WhatsApp Share</span>
              </button>

              <button
                type="button"
                onClick={() => setShowConfirmSentModal(false)}
                className="w-full py-2 px-4 rounded-xl text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Not yet / Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animated Celebration Modal */}
      {showCelebrationModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg bg-[#161c26] border-2 border-[#39ff88] rounded-3xl p-6 md:p-8 shadow-2xl shadow-[#39ff88]/30 overflow-hidden transform scale-100 transition-all">
            {/* Top decorative confetti / glowing circle */}
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#39ff88]/30 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-[#ff7a1a]/30 rounded-full blur-2xl pointer-events-none" />

            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowCelebrationModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white grid place-items-center transition-colors cursor-pointer"
              aria-label="Close celebration modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Celebration Icon Header with pulse animation */}
            <div className="text-center space-y-3">
              <div className="relative inline-flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#39ff88] to-[#ff7a1a] p-1 shadow-lg shadow-[#39ff88]/40 animate-bounce">
                  <div className="w-full h-full rounded-full bg-[#10141d] grid place-items-center text-[#39ff88]">
                    <PartyPopper className="w-10 h-10 text-[#39ff88]" />
                  </div>
                </div>
              </div>

              <h3 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
                🎉 Congratulations!
              </h3>
              <div className="inline-block px-4 py-1.5 rounded-full bg-[#39ff88]/20 border border-[#39ff88]/40 text-[#39ff88] font-black text-lg sm:text-xl">
                You unlocked 20% in your next order!
              </div>

              <p className="text-slate-300 text-xs sm:text-sm max-w-sm mx-auto">
                Your 20% referral reward is unlocked on your device and is <strong className="text-white">applicable only once</strong> on your next booking. Send the card to WhatsApp or apply it now!
              </p>
            </div>

            {/* Digital Voucher Card */}
            <div className="mt-6 p-4.5 rounded-2xl bg-[#10141d] border border-white/15 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <BadgePercent className="w-5 h-5 text-[#39ff88]" />
                  <span className="font-display font-bold text-sm text-white">VroomMate Reward Card</span>
                </div>
                <span className="text-[11px] font-bold text-[#39ff88] bg-[#39ff88]/15 px-2.5 py-0.5 rounded-full border border-[#39ff88]/30">
                  ONE-TIME PASS
                </span>
              </div>

              <div className="py-3.5 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Discount Value:</span>
                  <span className="font-black text-base text-[#ff7a1a]">FLAT 20% OFF</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Voucher / Code:</span>
                  <span className="font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded border border-white/10">
                    {referralCode}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Redeem Location:</span>
                  <span className="text-slate-200">Opp. Bharat Petroleum, Gamharia</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Status:</span>
                  <span className="text-[#39ff88] font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#39ff88] animate-ping" />
                    Unlocked · Applicable Once
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 border-t border-white/10 pt-2 flex items-center justify-between">
                <span>Present this screen or WhatsApp card at booking</span>
                <span className="text-white font-mono">1-Time Use</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={handleSendCardToWhatsApp}
                className="w-full py-3.5 px-5 rounded-2xl font-bold text-sm bg-[#39ff88] text-[#0d1117] hover:bg-[#4dff93] shadow-lg shadow-[#39ff88]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>Send Message Card to My WhatsApp (Show in Office)</span>
              </button>

              <div className="flex gap-2">
                {onOpenBookingModal && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowCelebrationModal(false);
                      onOpenBookingModal();
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/15 text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Book Ride with 20% OFF</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowCelebrationModal(false)}
                  className="py-2.5 px-4 rounded-xl font-medium text-xs bg-transparent hover:bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
