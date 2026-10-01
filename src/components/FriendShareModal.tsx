import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Flame,
  ShieldCheck,
  User,
  Phone,
  Sparkles,
} from 'lucide-react';
import {
  generateReferralShareWhatsAppUrl,
  verifyAndRecordFriendShare,
  getReferralProfile,
  getUserBookingPhone,
  VROOMMATE_SITE_URL,
} from '../utils/referral';
import { fireCelebrationConfetti } from '../utils/confetti';
import { toast } from 'sonner';

interface FriendShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  slotNumber: number; // 1, 2, or 3
  myReferralCode: string;
  onVerified: (newCount: number, justUnlocked: boolean) => void;
}

export const FriendShareModal: React.FC<FriendShareModalProps> = ({
  isOpen,
  onClose,
  slotNumber,
  myReferralCode,
  onVerified,
}) => {
  const [step, setStep] = useState<'input' | 'waiting'>('input');
  const [friendName, setFriendName] = useState('');
  const [friendPhone, setFriendPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (isOpen) {
      setStep('input');
      setFriendName('');
      setFriendPhone('');
      setErrorMsg(null);
      setStartTime(null);
      setCountdown(5);
    }
  }, [isOpen, slotNumber]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'waiting' && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  if (!isOpen) return null;

  const handleOpenWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const clean = friendPhone.replace(/[^0-9]/g, '').slice(-10);
    if (!clean || clean.length !== 10 || !/^[6-9]\d{9}$/.test(clean)) {
      setErrorMsg('Please enter a valid 10-digit Indian WhatsApp mobile number.');
      return;
    }

    const profile = getReferralProfile();
    const userPhone = getUserBookingPhone();
    if (userPhone && userPhone === clean) {
      setErrorMsg('You cannot share to your own mobile number. Please invite a friend.');
      return;
    }

    // STRICT CHECK: Must be 3 DIFFERENT people!
    const isDuplicate = profile.verifiedFriends.some((f) => f.phone === clean);
    if (isDuplicate) {
      setErrorMsg(
        '⚠️ You have already shared with this person! You must share with 3 DIFFERENT people. Sending to the same person multiple times will not be confirmed.'
      );
      return;
    }

    const shareUrl = generateReferralShareWhatsAppUrl(myReferralCode, clean);
    window.open(shareUrl, '_blank');

    setStartTime(Date.now());
    setCountdown(5);
    setStep('waiting');
  };

  const handleConfirmSent = () => {
    setErrorMsg(null);
    const duration = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;

    const res = verifyAndRecordFriendShare({
      name: friendName.trim() || `Friend ${slotNumber}`,
      phone: friendPhone,
      durationSeconds: duration,
    });

    if (!res.success) {
      setErrorMsg(res.reason || 'Verification failed. Please ensure the message was sent.');
      return;
    }

    fireCelebrationConfetti();
    toast.success(`Friend ${slotNumber} verified! (${res.newCount}/3 shared)`);

    onVerified(res.newCount, res.justUnlocked);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#161c26] border border-[#263041] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative text-white">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-9 h-9 rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] grid place-items-center shrink-0">
            <Share2 className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-display font-black text-lg text-white">
              Send Invite to Friend {slotNumber} of 3
            </h3>
            <p className="text-xs text-slate-400">
              Verified delivery check prevents fake clicks
            </p>
          </div>
        </div>

        {step === 'input' ? (
          <form onSubmit={handleOpenWhatsApp} className="mt-5 space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Friend&apos;s Name (Optional)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="e.g. Rahul, Priya"
                    value={friendName}
                    onChange={(e) => setFriendName(e.target.value)}
                    className="w-full bg-[#0d1117] border border-white/15 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00FF1F] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Friend&apos;s WhatsApp Number (10 Digits) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    value={friendPhone}
                    onChange={(e) => {
                      setFriendPhone(e.target.value.replace(/[^0-9]/g, ''));
                      setErrorMsg(null);
                    }}
                    className="w-full bg-[#0d1117] border border-white/15 rounded-xl pl-12 pr-3.5 py-2.5 text-sm font-mono tracking-wider text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00FF1F] transition-colors"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1 font-medium">
                  <span>Enter WhatsApp number to share your 20% discount link.</span>
                </p>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Message Preview */}
            <div className="p-3 rounded-xl bg-[#0d1117] border border-white/10 text-[11px] text-slate-300 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Message Preview
              </span>
              <p className="text-slate-200">
                &ldquo;Use my referral code <strong>{myReferralCode}</strong> for 20% OFF! ⚡ <em>Hurry or someone else will claim the offer!</em> 👉 {VROOMMATE_SITE_URL}&rdquo;
              </p>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#25D366] to-[#1ebe57] text-[#0d1117] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 cursor-pointer"
            >
              <span>Open WhatsApp &amp; Send Invite</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Step 2: Delivery Verification */
          <div className="mt-5 space-y-4">
            <div className="p-4 rounded-2xl bg-[#0e1e17] border border-[#25D366]/30 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#25D366]/20 text-[#25D366] grid place-items-center mx-auto">
                <ShieldCheck className="w-6 h-6 stroke-[2]" />
              </div>

              <div>
                <span className="text-xs font-bold text-white block">
                  Sending to {friendName.trim() || `Friend ${slotNumber}`} (+91 {friendPhone})
                </span>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  Please open the WhatsApp chat and send the invite message. Once sent, tap the button below to confirm.
                </p>
              </div>

              {countdown > 0 ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs text-slate-300 font-mono">
                  <Clock className="w-3.5 h-3.5 animate-spin text-[#00FF1F]" />
                  <span>Checking chat delivery... ({countdown}s)</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#00FF1F]/20 text-xs text-[#00FF1F] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Ready to confirm delivery</span>
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Confirm Button */}
            <div className="space-y-2">
              <button
                type="button"
                disabled={countdown > 0}
                onClick={handleConfirmSent}
                className={`w-full py-3 px-4 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
                  countdown > 0
                    ? 'bg-white/10 text-slate-400 cursor-not-allowed border border-white/10'
                    : 'bg-[#00FF1F] text-[#0d1117] hover:bg-[#26ff3f] shadow-lg shadow-[#00FF1F]/25 cursor-pointer animate-pulse'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                <span>
                  {countdown > 0
                    ? `Sending in WhatsApp... (${countdown}s)`
                    : `Yes, Message Sent into Chat — Verify (${slotNumber}/3)`}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const clean = friendPhone.replace(/[^0-9]/g, '').slice(-10);
                  const shareUrl = generateReferralShareWhatsAppUrl(myReferralCode, clean);
                  window.open(shareUrl, '_blank');
                  setCountdown(5);
                  setStartTime(Date.now());
                }}
                className="w-full py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer border border-white/10 flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Re-open WhatsApp Chat</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
