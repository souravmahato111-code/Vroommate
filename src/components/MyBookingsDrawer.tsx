import React, { useState } from 'react';
import { Booking } from '../types';
import { formatINR, generateWhatsAppBookingUrl } from '../utils/whatsapp';
import {
  X,
  Calendar,
  Clock,
  MessageCircle,
  Bike,
  CheckCircle2,
  Trash2,
  FileSignature,
  Gift,
  Copy,
  Check,
  Share2,
} from 'lucide-react';
import {
  getReferralProfile,
  recordReferralShare,
  generateReferralShareWhatsAppUrl,
} from '../utils/referral';
import { fireCelebrationConfetti } from '../utils/confetti';
import { toast } from 'sonner';

interface MyBookingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
  onClearBooking?: (id: string) => void;
  onOpenAgreement?: (booking: Booking) => void;
}

export const MyBookingsDrawer: React.FC<MyBookingsDrawerProps> = ({
  isOpen,
  onClose,
  bookings,
  onClearBooking,
  onOpenAgreement,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [profile, setProfile] = useState(() => getReferralProfile());

  if (!isOpen) return null;

  const handleShareReferral = (_code: string) => {
    onClose();
    const referralEl = document.getElementById('referral');
    if (referralEl) {
      referralEl.scrollIntoView({ behavior: 'smooth' });
    }
    toast.info('Referral Hub Opened', {
      description: 'Invite 3 friends with verified WhatsApp delivery to unlock your 20% discount!',
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-[#161c26] border-l border-[#263041] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#0d1117]/80">
          <div>
            <h2 className="font-display font-black text-xl text-white">My Ride Reservations</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {bookings.length} {bookings.length === 1 ? 'reservation' : 'reservations'} on this device
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl grid place-items-center bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Referral Card (Visible once user has completed at least one booking) */}
          {bookings.length > 0 && profile.myReferralCode && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1c1813] to-[#161c26] border border-[#ff7a1a]/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#ff7a1a]/20 text-[#ff7a1a] grid place-items-center">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-xs sm:text-sm">Refer &amp; Earn 20% OFF</h3>
                    <p className="text-[11px] text-slate-300">Invite friends · Both get 20% discount</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-white bg-[#ff7a1a] px-2 py-0.5 rounded-full">
                  20% OFF
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0d1117] border border-white/10">
                <span className="font-mono font-black text-[#ff7a1a] text-sm">
                  {profile.myReferralCode}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(profile.myReferralCode || '');
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                    toast.success('Referral code copied!');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/10 text-xs text-white hover:bg-white/15 flex items-center gap-1 cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-[#ff7a1a]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* 3-people share progress */}
              <div className="p-3 rounded-xl bg-[#0d1117] border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Send to 3 People:</span>
                  <span className="text-[#ff7a1a] font-bold font-mono">
                    {Math.min(3, profile.shareCount || 0)} / 3 Sent
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#ff7a1a] to-[#ff9c54] rounded-full transition-all duration-300 shadow-[0_0_8px_#ff7a1a]"
                    style={{ width: `${Math.min(100, ((profile.shareCount || 0) / 3) * 100)}%` }}
                  />
                </div>
              </div>

              {profile.senderDiscountAvailable && !profile.senderDiscountUsed ? (
                <p className="text-[11px] text-[#ff7a1a] font-medium flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>20% reward unlocked! It will automatically apply on your next booking.</span>
                </p>
              ) : profile.senderDiscountUsed ? (
                <p className="text-[11px] text-slate-400">
                  You have already used your 20% referral reward. Thanks for sharing!
                </p>
              ) : (
                <p className="text-[11px] text-slate-400">
                  Send to 3 friends on WhatsApp to unlock 20% OFF your next ride!
                </p>
              )}

              {!profile.senderDiscountUsed && (
                <button
                  type="button"
                  onClick={() => handleShareReferral(profile.myReferralCode!)}
                  className="w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-gradient-to-r from-[#25D366] to-[#1ebe57] text-[#0d1117] hover:brightness-110 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Share2 className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>
                    {(profile.shareCount || 0) >= 3
                      ? 'Share Referral Again on WhatsApp'
                      : `Share on WhatsApp (${Math.min(3, profile.shareCount || 0)}/3 Sent)`}
                  </span>
                </button>
              )}
            </div>
          )}
          {bookings.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-white/5 grid place-items-center text-slate-500 mx-auto mb-3">
                <Bike className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-white text-base">No active reservations yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Pick an Automatic Scooty, Yamaha FZ, or Centuro to book your ride with instant WhatsApp confirmation.
              </p>
            </div>
          ) : (
            bookings.map((b) => (
              <div
                key={b.id}
                className="bg-[#10141d] rounded-2xl p-5 border border-white/10 space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-[#ff7a1a] bg-[#ff7a1a]/10 px-2 py-0.5 rounded">
                    {b.id}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-[#ff7a1a] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>WhatsApp Verification Pending</span>
                    </span>
                    {onClearBooking && (
                      <button
                        type="button"
                        onClick={() => onClearBooking(b.id)}
                        className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-display font-extrabold text-base text-white">{b.vehicleName}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span>
                      {b.pickupDate} ({b.pickupTime})
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {b.duration} {b.rentalType === 'daily' ? 'Days' : 'Hours'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-slate-400">Total Rental</span>
                    <div className="font-display font-bold text-[#ff7a1a] text-sm">
                      {formatINR(b.totalAmount)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400">Security Deposit</span>
                    <div className="font-mono text-slate-200">{formatINR(b.securityDeposit)}</div>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <a
                    href={generateWhatsAppBookingUrl(b)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-[#ff7a1a] text-white hover:bg-[#ff8f3d] transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-current" />
                    <span>Chat on WhatsApp for {b.id}</span>
                  </a>
                  {onOpenAgreement && (
                    <button
                      type="button"
                      onClick={() => onOpenAgreement(b)}
                      className="w-full py-2 px-4 rounded-xl font-semibold text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center justify-center gap-2"
                    >
                      <FileSignature className="w-3.5 h-3.5 text-[#ff7a1a]" />
                      <span>View / Sign Agreement</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/10 bg-[#0d1117]/80 text-center space-y-2">
          <p className="text-[11px] text-slate-400">
            Reminder: Return vehicles on time. Unnotified late return fine is <span className="text-[#ff7a1a] font-semibold">₹150</span>.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
