import React, { useState, useEffect } from 'react';
import { Vehicle, Booking } from '../types';
import { FLEET_VEHICLES, BUSINESS_CONFIG } from '../data/fleetData';
import {
  formatINR,
  generateWhatsAppBookingUrl,
  saveBooking,
} from '../utils/whatsapp';
import { toast } from 'sonner';
import {
  X,
  Check,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  MessageCircle,
  AlertCircle,
  Sparkles,
  Tag,
  Gift,
  Copy,
  Share2,
  Info,
} from 'lucide-react';
import {
  calculateRentalBaseFare,
  getVehicleSecurityDeposit,
  getSavingsOnWeeklyPackage,
  calculateExtraHelmetCost,
} from '../utils/pricing';
import {
  getReferralProfile,
  validateReferralCodeInput,
  recordReferralShare,
  generateReferralShareWhatsAppUrl,
  generateWhatsAppReferralSelfUrl,
  handleBookingConfirmationReferral,
} from '../utils/referral';
import { fireCelebrationConfetti } from '../utils/confetti';
import { FriendShareModal } from './FriendShareModal';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVehicle?: Vehicle | null;
  initialRentalType?: 'daily' | 'hourly';
  initialDuration?: number;
  initialExtraHelmet?: boolean;
  initialDoorstep?: boolean;
  initialReferralCode?: string;
  onBookingCreated: () => void;
  onOpenAgreement?: (booking?: Booking | null) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  initialVehicle,
  initialRentalType = 'daily',
  initialDuration = 1,
  initialExtraHelmet = false,
  initialDoorstep = false,
  initialReferralCode = '',
  onBookingCreated,
  onOpenAgreement,
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    initialVehicle?.id || FLEET_VEHICLES[0].id
  );
  const [rentalType, setRentalType] = useState<'daily' | 'hourly'>(initialRentalType);
  const [duration, setDuration] = useState<number>(initialDuration);
  const [pickupDate, setPickupDate] = useState<string>('');
  const [pickupTime, setPickupTime] = useState<string>('08:30 AM');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [hasLicense, setHasLicense] = useState<boolean>(true);
  const [extraHelmet, setExtraHelmet] = useState<boolean>(initialExtraHelmet);
  const [deliveryType, setDeliveryType] = useState<'hub_pickup' | 'doorstep'>(
    initialDoorstep ? 'doorstep' : 'hub_pickup'
  );
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Referral discount state
  const [referralProfile, setReferralProfile] = useState(() => getReferralProfile());
  const [referralCodeInput, setReferralCodeInput] = useState<string>(initialReferralCode);
  const [appliedReferralCode, setAppliedReferralCode] = useState<string | null>(null);
  const [referralError, setReferralError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [hasSharedInCurrentView, setHasSharedInCurrentView] = useState<boolean>(false);
  const [bookingShareModalOpen, setBookingShareModalOpen] = useState<boolean>(false);
  const [bookingShareSlot, setBookingShareSlot] = useState<number>(1);

  // Set default today's date formatted & re-sync profile
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setPickupDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const prof = getReferralProfile();
      setReferralProfile(prof);
      setReferralError(null);
      setHasSharedInCurrentView(false);

      if (prof.senderDiscountAvailable && !prof.senderDiscountUsed && prof.myReferralCode) {
        // Automatically apply the sender's own referral code on their next booking!
        setAppliedReferralCode(prof.myReferralCode);
        setReferralCodeInput(prof.myReferralCode);
      } else if (initialReferralCode && !prof.receiverDiscountUsed && !prof.senderDiscountUsed) {
        const check = validateReferralCodeInput(initialReferralCode);
        if (check.valid) {
          setAppliedReferralCode(initialReferralCode.trim().toUpperCase());
          setReferralCodeInput(initialReferralCode.trim().toUpperCase());
        }
      }
    }
  }, [isOpen, initialReferralCode]);

  // Update if initialVehicle changes
  useEffect(() => {
    if (initialVehicle) {
      setSelectedVehicleId(initialVehicle.id);
    }
  }, [initialVehicle]);

  useEffect(() => {
    setRentalType(initialRentalType);
    setDuration(initialDuration);
    setExtraHelmet(initialExtraHelmet);
    setDeliveryType(initialDoorstep ? 'doorstep' : 'hub_pickup');
  }, [initialRentalType, initialDuration, initialExtraHelmet, initialDoorstep]);

  if (!isOpen) return null;

  const currentVehicle =
    FLEET_VEHICLES.find((v) => v.id === selectedVehicleId) || FLEET_VEHICLES[0];

  // Price calculation
  const effectiveDuration = rentalType === 'daily' ? Math.min(7, Math.max(1, duration)) : duration;
  const baseFare = calculateRentalBaseFare(currentVehicle, rentalType, effectiveDuration);

  // Referral discount calculation: 20% off base rental
  const isSenderDiscountActive = referralProfile.senderDiscountAvailable && !referralProfile.senderDiscountUsed;
  const isOfferAlreadyUsed = referralProfile.receiverDiscountUsed || referralProfile.senderDiscountUsed;

  let referralDiscount = 0;
  let referralDiscountType: 'sender_reward' | 'receiver_code' | undefined = undefined;

  if (isSenderDiscountActive) {
    referralDiscount = Math.round(baseFare * 0.20);
    referralDiscountType = 'sender_reward';
  } else if (appliedReferralCode) {
    referralDiscount = Math.round(baseFare * 0.20);
    referralDiscountType = 'receiver_code';
  }

  const helmetCost = extraHelmet
    ? calculateExtraHelmetCost(rentalType, effectiveDuration)
    : 0;

  const deliveryCost = deliveryType === 'doorstep' ? 100 : 0;
  const totalAmount = Math.max(0, baseFare - referralDiscount) + helmetCost + deliveryCost;

  const securityDeposit = getVehicleSecurityDeposit(currentVehicle.id, rentalType, effectiveDuration);
  const weeklySavings = getSavingsOnWeeklyPackage(currentVehicle, rentalType, effectiveDuration);

  const handleApplyReferralCode = () => {
    setReferralError(null);
    const result = validateReferralCodeInput(referralCodeInput);
    if (!result.valid) {
      setReferralError(result.reason || 'Invalid referral code');
      toast.error('Invalid Referral Code', { description: result.reason });
      return;
    }
    const clean = referralCodeInput.trim().toUpperCase();
    setAppliedReferralCode(clean);
    fireCelebrationConfetti();
    toast.success('🎉 20% Referral Discount Applied!', {
      description: `Referral code ${clean} applied! You saved ${formatINR(Math.round(baseFare * 0.20))} on your ride.`,
      duration: 5000,
    });
  };

  const handleRemoveReferralCode = () => {
    setAppliedReferralCode(null);
    setReferralCodeInput('');
    setReferralError(null);
    toast.info('Referral discount removed');
  };

  const handleShareReferralWhatsApp = (_code: string) => {
    const currentCount = referralProfile.verifiedFriends?.length || 0;
    setBookingShareSlot(Math.min(3, currentCount + 1));
    setBookingShareModalOpen(true);
  };

  const handleBookingFriendVerified = (newCount: number, justUnlocked: boolean) => {
    const updatedProf = getReferralProfile();
    setReferralProfile(updatedProf);
    setHasSharedInCurrentView(true);

    if (justUnlocked) {
      fireCelebrationConfetti();
      toast.success('🎉 20% DISCOUNT UNLOCKED!', {
        description:
          'You sent your referral to 3 verified friends! Your 20% discount is now active and will automatically apply on your next booking.',
        duration: 7000,
      });
    } else if (newCount < 3) {
      toast.info(`Invite sent & verified with Friend ${newCount}!`, {
        description: `Invite ${3 - newCount} more friend${3 - newCount > 1 ? 's' : ''} to unlock your 20% discount!`,
      });
    }
  };

  // Calculate return date/time display
  const calculateReturn = () => {
    if (!pickupDate) return 'Same day';
    if (rentalType === 'daily') {
      const pDate = new Date(pickupDate);
      pDate.setDate(pDate.getDate() + effectiveDuration);
      return pDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
    } else {
      return `${pickupDate} (+${effectiveDuration} hours)`;
    }
  };

  const handleConfirmAndSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error('Missing Required Details', {
        description: 'Please enter your full name and WhatsApp phone number.',
      });
      return;
    }

    const bookingId = `VMR-${Math.floor(10000 + Math.random() * 90000)}`;

    // Generate user's referral code after first booking and mark discounts
    const refResult = handleBookingConfirmationReferral(
      bookingId,
      appliedReferralCode || undefined,
      isSenderDiscountActive
    );

    const appliedCodeForBooking = isSenderDiscountActive
      ? (referralProfile.myReferralCode || refResult.generatedCode)
      : (appliedReferralCode || refResult.generatedCode);

    const newBooking: Booking = {
      id: bookingId,
      vehicleId: currentVehicle.id,
      vehicleName: currentVehicle.name,
      rentalType,
      pickupDate,
      pickupTime,
      returnDate: calculateReturn(),
      returnTime: pickupTime,
      duration: effectiveDuration,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      hasDrivingLicense: hasLicense,
      helmetCount: extraHelmet ? 2 : 1,
      deliveryType,
      deliveryAddress: deliveryType === 'doorstep' ? deliveryAddress.trim() : undefined,
      baseFare,
      addonsCost: helmetCost + deliveryCost,
      referralDiscount: referralDiscount > 0 ? referralDiscount : undefined,
      referralCode: appliedCodeForBooking,
      referralDiscountType,
      totalAmount,
      securityDeposit,
      status: 'pending_whatsapp',
      createdAt: new Date().toISOString(),
    };

    saveBooking(newBooking);
    onBookingCreated();
    setConfirmedBooking(newBooking);
    setReferralProfile(getReferralProfile());

    // Toast notification
    toast.success('Booking Request Sent', {
      description: `Your ride reservation for ${currentVehicle.name} (${bookingId}) has been created successfully.`,
      duration: 5000,
    });

    // Open WhatsApp in new tab
    const waUrl = generateWhatsAppBookingUrl(newBooking, currentVehicle);
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden">
      <div className="relative w-full max-w-2xl bg-[#161c26] border-t sm:border border-[#263041] rounded-t-[28px] sm:rounded-3xl shadow-2xl flex flex-col h-[94vh] sm:h-auto sm:max-h-[90vh] overflow-hidden animate-in fade-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        {/* Mobile Pull-Down Indicator */}
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto my-2 sm:hidden shrink-0" aria-hidden="true" />

        {/* Modal Header (Pinned at top) */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 bg-[#0d1117]/95 backdrop-blur-md shrink-0">
          <div>
            <h2 className="font-display font-extrabold text-lg sm:text-xl text-white">
              {confirmedBooking ? 'Booking Initiated!' : 'Reserve Your Two-Wheeler'}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              {confirmedBooking
                ? 'Reference ID: ' + confirmedBooking.id
                : 'Instant booking via WhatsApp with VroomMate Rides'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl grid place-items-center bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmedBooking ? (
          /* Confirmation Success View */
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
              <div className="text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#00FF1F]/20 text-[#00FF1F] grid place-items-center mx-auto mb-3 sm:mb-4 border border-[#00FF1F]/40">
                  <Check className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3]" />
                </div>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-white">
                  Booking Request Sent!
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-md mx-auto leading-relaxed">
                  We’ve launched WhatsApp with your pre-formatted rental request. Please send the
                  message along with photos of your ID &amp; Driving License.
                </p>
              </div>

              {/* Summary card */}
              <div className="bg-[#10141d] rounded-2xl p-4 sm:p-5 border border-white/10 space-y-2.5 sm:space-y-3 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-white/10">
                  <span className="text-slate-400">Booking Reference</span>
                  <span className="font-mono font-bold text-[#00FF1F] text-sm">
                    {confirmedBooking.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Vehicle</span>
                  <span className="font-bold text-white">{confirmedBooking.vehicleName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pickup Date &amp; Time</span>
                  <span className="text-white">
                    {confirmedBooking.pickupDate} at {confirmedBooking.pickupTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pickup Mode</span>
                  <span className="text-white text-right">
                    {confirmedBooking.deliveryType === 'doorstep'
                      ? 'Doorstep Pickup (Inside 6km Range)'
                      : 'Chota Gamharia Hub (Self-Pickup)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Agreement Signing</span>
                  <span className="text-[#00FF1F] font-medium">Signed Offline at Handover</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Duration</span>
                  <span className="text-white">
                    {confirmedBooking.duration}{' '}
                    {confirmedBooking.rentalType === 'daily' ? 'Days' : 'Hours'}
                  </span>
                </div>
                {confirmedBooking.referralDiscount && confirmedBooking.referralDiscount > 0 && (
                  <div className="flex justify-between text-[#00FF1F] font-bold py-1 border-y border-white/5">
                    <span className="flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5" />
                      <span>
                        20% Referral Discount (
                        {confirmedBooking.referralDiscountType === 'sender_reward'
                          ? 'Sender Reward'
                          : `Code: ${confirmedBooking.referralCode}`}
                        )
                      </span>
                    </span>
                    <span className="font-mono">-{formatINR(confirmedBooking.referralDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Estimated Total</span>
                  <span className="font-display font-black text-sm text-[#ff7a1a]">
                    {formatINR(confirmedBooking.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300 pt-2 border-t border-white/10">
                  <span>Security Deposit (Due at Pickup)</span>
                  <span className="font-mono font-bold text-[#00FF1F]">
                    {formatINR(confirmedBooking.securityDeposit)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 pt-1 text-[11px]">
                  <span>Late Return Fine Policy</span>
                  <span className="text-[#ff7a1a] font-medium">₹150 flat fine for unnotified late returns</span>
                </div>
              </div>

              {/* Referral Invite & Reward Card */}
              {confirmedBooking.referralCode && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#111c17] to-[#161c26] border-2 border-[#00FF1F]/50 shadow-[0_0_30px_-10px_rgba(0,255,31,0.3)] space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#00FF1F]/20 text-[#00FF1F] grid place-items-center shrink-0">
                        <Gift className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-display font-extrabold text-white text-sm sm:text-base">
                          Refer Friends &amp; Get 20% OFF Next Ride!
                        </h4>
                        <p className="text-[11px] text-slate-300">
                          Share your code: Your friend gets 20% OFF their 1st ride, and you unlock 20% OFF your next ride!
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#0d1117] bg-[#00FF1F] px-2 py-0.5 rounded-full shrink-0">
                      20% OFF
                    </span>
                  </div>

                  {/* Personal Code Display with Copy */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#0d1117] border border-white/10">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Your Personal Referral Code</span>
                      <span className="text-base sm:text-lg font-black font-mono text-[#00FF1F] tracking-wider">
                        {confirmedBooking.referralCode}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(confirmedBooking.referralCode || '');
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 2500);
                        toast.success('Referral code copied to clipboard!');
                      }}
                      className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedCode ? <Check className="w-4 h-4 text-[#00FF1F]" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                    </button>
                  </div>

                  {/* 3-Person Progress Tracker */}
                  <div className="p-3.5 rounded-xl bg-[#0d1117] border border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">Send to 3 People to Unlock:</span>
                      <span className="text-[#00FF1F] font-bold font-mono">
                        {Math.min(3, referralProfile.shareCount || 0)} / 3 Sent
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#00FF1F] to-[#ff7a1a] rounded-full transition-all duration-500 shadow-[0_0_8px_#00FF1F]"
                        style={{ width: `${Math.min(100, ((referralProfile.shareCount || 0) / 3) * 100)}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                      <span className={`py-1 rounded-lg border ${
                        (referralProfile.shareCount || 0) >= 1
                          ? 'bg-[#00FF1F]/15 border-[#00FF1F]/40 text-[#00FF1F] font-bold'
                          : 'bg-white/5 border-white/5 text-slate-400'
                      }`}>
                        Friend 1 {(referralProfile.shareCount || 0) >= 1 ? '✓' : ''}
                      </span>
                      <span className={`py-1 rounded-lg border ${
                        (referralProfile.shareCount || 0) >= 2
                          ? 'bg-[#00FF1F]/15 border-[#00FF1F]/40 text-[#00FF1F] font-bold'
                          : 'bg-white/5 border-white/5 text-slate-400'
                      }`}>
                        Friend 2 {(referralProfile.shareCount || 0) >= 2 ? '✓' : ''}
                      </span>
                      <span className={`py-1 rounded-lg border ${
                        (referralProfile.shareCount || 0) >= 3
                          ? 'bg-[#00FF1F]/15 border-[#00FF1F]/40 text-[#00FF1F] font-bold'
                          : 'bg-white/5 border-white/5 text-slate-400'
                      }`}>
                        Friend 3 {(referralProfile.shareCount || 0) >= 3 ? '✓' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Unlock status info */}
                  {referralProfile.senderDiscountAvailable ? (
                    <div className="p-3 rounded-xl bg-[#00FF1F]/15 border border-[#00FF1F]/40 text-xs text-[#00FF1F] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 shrink-0 stroke-[3]" />
                        <span className="font-semibold">
                          Goal reached! 20% discount unlocked for your next booking.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={fireCelebrationConfetti}
                        className="px-2 py-0.5 rounded bg-[#00FF1F] text-[#0d1117] font-bold text-[10px] shrink-0"
                      >
                        🎉 Confetti
                      </button>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400">
                      💡 <strong>Rule:</strong> Send your code to 3 friends on WhatsApp to unlock 20% OFF on your next ride! Tell them: <span className="text-[#00FF1F] font-semibold">Hurry or someone else will claim the offer!</span>
                    </p>
                  )}

                  {/* Share Action Buttons */}
                  <div className="grid sm:grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleShareReferralWhatsApp(confirmedBooking.referralCode!)}
                      className="py-3 px-3.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#25D366] to-[#1ebe57] text-[#0d1117] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#25D366]/20 cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>
                        {(referralProfile.shareCount || 0) >= 3
                          ? 'Share with Friends'
                          : `Send to Friends (${Math.min(3, referralProfile.shareCount || 0)}/3)`}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const url = generateWhatsAppReferralSelfUrl(
                          confirmedBooking.referralCode!,
                          confirmedBooking.customerPhone || ''
                        );
                        window.open(url, '_blank');
                        toast.success('Opened WhatsApp with your referral code details!');
                      }}
                      className="py-3 px-3.5 rounded-xl font-bold text-xs bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>To My WhatsApp</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Pinned Bottom Actions */}
            <div className="p-3.5 sm:p-5 border-t border-white/10 bg-[#0d1117]/95 backdrop-blur-md shrink-0 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
              <a
                href={generateWhatsAppBookingUrl(confirmedBooking, currentVehicle)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:flex-1 py-3.5 px-5 rounded-xl font-bold text-sm bg-[#00FF1F] text-[#0d1117] hover:bg-[#26ff3f] transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Re-open WhatsApp Chat</span>
              </a>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto py-3 px-6 rounded-xl font-medium text-xs bg-white/10 hover:bg-white/15 text-white transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <form onSubmit={handleConfirmAndSendWhatsApp} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4 sm:space-y-5">
              {/* Vehicle Selection Strip */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  1. Selected Ride
                </label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full bg-[#10141d] border border-white/15 rounded-xl px-3.5 py-3 text-base sm:text-sm text-white focus:outline-none focus:border-[#00FF1F] transition-colors"
                >
                  {FLEET_VEHICLES.map((v) => {
                    const isAvail = v.isAvailable ?? v.available ?? true;
                    return (
                      <option key={v.id} value={v.id}>
                        {v.name} — {formatINR(v.pricePerDay)}/day ({v.mileage}) {isAvail ? '' : '— [Booked]'}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Rental Plan & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    2. Rental Plan
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRentalType('daily');
                        setDuration(1);
                      }}
                      className={`min-h-[44px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold border transition-colors ${
                        rentalType === 'daily'
                          ? 'bg-[#00FF1F] text-[#0d1117] border-[#00FF1F]'
                          : 'bg-[#10141d] text-slate-300 border-white/10 hover:text-white'
                      }`}
                    >
                      Daily (₹{currentVehicle.pricePerDay})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRentalType('hourly');
                        setDuration(4);
                      }}
                      className={`min-h-[44px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold border transition-colors ${
                        rentalType === 'hourly'
                          ? 'bg-[#00FF1F] text-[#0d1117] border-[#00FF1F]'
                          : 'bg-[#10141d] text-slate-300 border-white/10 hover:text-white'
                      }`}
                    >
                      Hourly (₹{currentVehicle.pricePerHour}/h)
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Duration ({rentalType === 'daily' ? 'Days (Max 7)' : 'Hours'})
                    </label>
                    {rentalType === 'daily' && effectiveDuration === 7 && (
                      <span className="text-[10px] font-bold text-[#00FF1F] bg-[#00FF1F]/15 px-2 py-0.5 rounded-full border border-[#00FF1F]/30">
                        Weekly Deal Active
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDuration(Math.max(rentalType === 'daily' ? 1 : 3, effectiveDuration - 1))}
                      className="w-11 h-11 rounded-xl bg-[#10141d] border border-white/10 text-white font-bold hover:bg-white/10 text-lg flex items-center justify-center shrink-0 active:bg-white/20 transition-colors"
                      aria-label="Decrease duration"
                    >
                      -
                    </button>
                    <div className="flex-1 min-h-[44px] flex items-center justify-center rounded-xl bg-[#10141d] border border-white/10 font-bold text-white text-sm sm:text-base">
                      {effectiveDuration} {rentalType === 'daily' ? (effectiveDuration === 1 ? 'Day' : 'Days') : 'Hours'}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setDuration(
                          rentalType === 'daily'
                            ? Math.min(7, effectiveDuration + 1)
                            : Math.min(24, effectiveDuration + 1)
                        )
                      }
                      className="w-11 h-11 rounded-xl bg-[#10141d] border border-white/10 text-white font-bold hover:bg-white/10 text-lg flex items-center justify-center shrink-0 active:bg-white/20 transition-colors"
                      aria-label="Increase duration"
                    >
                      +
                    </button>
                  </div>

                  {rentalType === 'daily' && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {[1, 2, 3, 5, 7].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDuration(d)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[34px] ${
                            effectiveDuration === d
                              ? 'bg-[#ff7a1a] text-[#0d1117] font-bold'
                              : 'bg-white/5 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          {d === 7 ? '7d (Week Deal 🔥)' : `${d}d`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Pickup Date
                  </label>
                  <input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    required
                    className="w-full bg-[#10141d] border border-white/15 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-white focus:outline-none focus:border-[#00FF1F] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Pickup Time
                  </label>
                  <select
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full bg-[#10141d] border border-white/15 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-white focus:outline-none focus:border-[#00FF1F] transition-colors"
                  >
                    <option value="08:30 AM">08:30 AM</option>
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                    <option value="05:00 PM">05:00 PM</option>
                    <option value="06:00 PM">06:00 PM</option>
                    <option value="07:30 PM">07:30 PM</option>
                  </select>
                </div>
              </div>

              {/* Pickup Mode & Addons */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Pickup Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('hub_pickup')}
                    className={`p-3.5 rounded-xl text-left border transition-colors ${
                      deliveryType === 'hub_pickup'
                        ? 'bg-[#00FF1F]/15 border-[#00FF1F] text-white shadow-sm'
                        : 'bg-[#10141d] border-white/10 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <div className="text-xs sm:text-sm font-bold flex items-center justify-between">
                      <span>Chota Gamharia Hub</span>
                      {deliveryType === 'hub_pickup' && (
                        <span className="text-[10px] font-bold text-[#00FF1F] bg-[#00FF1F]/20 px-2 py-0.5 rounded-full">
                          Selected
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">Opp. Bharat Petroleum (Free)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('doorstep')}
                    className={`p-3.5 rounded-xl text-left border transition-colors ${
                      deliveryType === 'doorstep'
                        ? 'bg-[#00FF1F]/15 border-[#00FF1F] text-white shadow-sm'
                        : 'bg-[#10141d] border-white/10 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <div className="text-xs sm:text-sm font-bold flex items-center justify-between">
                      <span>Doorstep Pickup</span>
                      {deliveryType === 'doorstep' ? (
                        <span className="text-[10px] font-bold text-[#00FF1F] bg-[#00FF1F]/20 px-2 py-0.5 rounded-full">
                          +₹100
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#ff7a1a] font-medium">+₹100</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">Inside 6km Range in Gamharia</div>
                  </button>
                </div>

                {deliveryType === 'doorstep' && (
                  <input
                    type="text"
                    placeholder="Enter pickup address / landmark (within 6km range)"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    required
                    className="w-full bg-[#10141d] border border-white/15 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-white focus:outline-none focus:border-[#00FF1F] transition-colors"
                  />
                )}

                <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#10141d] border border-white/10 cursor-pointer hover:border-white/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={extraHelmet}
                      onChange={(e) => setExtraHelmet(e.target.checked)}
                      className="w-5 h-5 accent-[#00FF1F] rounded shrink-0 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs sm:text-sm text-slate-200 block font-medium">
                        Include 2nd helmet for pillion (1st helmet is 100% free)
                      </span>
                      {rentalType === 'daily' && effectiveDuration >= 7 && (
                        <span className="text-[10px] text-[#00FF1F] font-bold block mt-0.5">
                          Weekly Deal: Only ₹200 for 7 full days!
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#ff7a1a] shrink-0 ml-2">
                    +{formatINR(calculateExtraHelmetCost(rentalType, effectiveDuration))}
                  </span>
                </label>
              </div>

              {/* Rider Information */}
              <div className="pt-2 border-t border-white/10 space-y-3 sm:space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Rider Contact Details
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Your Full Name *"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                      autoComplete="name"
                      className="w-full bg-[#10141d] border border-white/15 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00FF1F] transition-colors"
                    />
                  </div>

                  <div>
                    <input
                      type="tel"
                      inputMode="tel"
                      placeholder="WhatsApp Phone Number *"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      required
                      autoComplete="tel"
                      className="w-full bg-[#10141d] border border-white/15 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00FF1F] transition-colors"
                    />
                  </div>
                </div>

                <label className="flex items-start gap-3 p-3.5 rounded-xl bg-[#10141d] border border-white/10 cursor-pointer hover:border-white/20 transition-colors">
                  <input
                    type="checkbox"
                    checked={hasLicense}
                    onChange={(e) => setHasLicense(e.target.checked)}
                    className="w-5 h-5 accent-[#00FF1F] rounded shrink-0 mt-0.5 cursor-pointer"
                  />
                  <span className="text-xs text-slate-200 leading-relaxed">
                    I possess a valid Indian Driving License (Two-Wheeler) &amp; Aadhaar/Voter ID. (Rental agreement will be signed offline at vehicle handover).
                  </span>
                </label>
              </div>

              {/* Referral Discount Section */}
              <div className="pt-2 border-t border-white/10 space-y-2">
                {isSenderDiscountActive ? (
                  <div className="p-3.5 rounded-xl bg-[#00FF1F]/15 border border-[#00FF1F]/40 flex items-center justify-between gap-3 text-xs text-white">
                    <div className="flex items-center gap-2.5">
                      <Gift className="w-5 h-5 text-[#00FF1F] shrink-0" />
                      <div>
                        <span className="font-bold text-[#00FF1F] block text-xs sm:text-sm">
                          🎉 Your Referral Code ({referralProfile.myReferralCode}) Auto-Applied!
                        </span>
                        <span className="text-slate-300 text-[11px] block mt-0.5">
                          20% OFF unlocked by sharing with 3 friends! You save {formatINR(referralDiscount)}.
                        </span>
                      </div>
                    </div>
                    <span className="font-bold font-mono text-[#00FF1F] text-sm shrink-0">
                      -{formatINR(referralDiscount)}
                    </span>
                  </div>
                ) : appliedReferralCode ? (
                  <div className="p-3.5 rounded-xl bg-[#00FF1F]/15 border border-[#00FF1F]/40 flex items-center justify-between gap-3 text-xs text-white">
                    <div className="flex items-center gap-2.5">
                      <Gift className="w-5 h-5 text-[#00FF1F] shrink-0" />
                      <div>
                        <span className="font-bold text-[#00FF1F] block text-xs sm:text-sm">
                          20% Referral Code Applied ({appliedReferralCode})
                        </span>
                        <span className="text-slate-300 text-[11px] block mt-0.5">
                          First booking discount active. You saved {formatINR(referralDiscount)}!
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="font-bold font-mono text-[#00FF1F] text-sm">
                        -{formatINR(referralDiscount)}
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveReferralCode}
                        className="text-[11px] text-red-400 hover:text-red-300 font-semibold underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : isOfferAlreadyUsed ? (
                  <div className="p-3 rounded-xl bg-[#10141d] border border-white/5 text-[11px] text-slate-400 flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>You have claimed your one-time 20% referral offer. Standard rates apply.</span>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-[#10141d] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Gift className="w-3.5 h-3.5 text-[#ff7a1a]" />
                        <span>Have a Referral Code?</span>
                      </label>
                      <span className="text-[10px] text-[#00FF1F] font-semibold bg-[#00FF1F]/10 px-2 py-0.5 rounded-full border border-[#00FF1F]/20">
                        20% Off 1st Ride
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter friend's code (e.g. VMR-REF-1234)"
                        value={referralCodeInput}
                        onChange={(e) => {
                          setReferralCodeInput(e.target.value.toUpperCase());
                          if (referralError) setReferralError(null);
                        }}
                        className="flex-1 bg-[#161c26] border border-white/15 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 uppercase font-mono tracking-wider focus:outline-none focus:border-[#00FF1F] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={handleApplyReferralCode}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-[#ff7a1a] text-[#0d1117] hover:bg-[#ff8f3d] transition-colors shrink-0 cursor-pointer active:scale-95"
                      >
                        Apply Code
                      </button>
                    </div>

                    {referralError && (
                      <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1 font-medium">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{referralError}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Sticky Bottom Action Bar (Always Visible on Mobile & Desktop) */}
            <div className="p-3.5 sm:p-4 md:p-5 border-t border-white/10 bg-[#0d1117]/95 backdrop-blur-md shrink-0 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center justify-between sm:flex-col sm:items-start">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-400 font-medium">Total Rental</span>
                  {referralDiscount > 0 ? (
                    <span className="text-[10px] font-bold text-[#00FF1F] bg-[#00FF1F]/15 px-2 py-0.5 rounded-full border border-[#00FF1F]/30">
                      Saved {formatINR(referralDiscount)} (20% OFF)!
                    </span>
                  ) : weeklySavings > 0 ? (
                    <span className="text-[10px] font-bold text-[#00FF1F] bg-[#00FF1F]/15 px-2 py-0.5 rounded-full border border-[#00FF1F]/30">
                      Saved {formatINR(weeklySavings)}!
                    </span>
                  ) : null}
                </div>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <div className="font-display font-black text-2xl sm:text-3xl text-[#ff7a1a] leading-none">
                    {formatINR(totalAmount)}
                  </div>
                  {referralDiscount > 0 && (
                    <span className="text-xs text-slate-500 line-through">
                      {formatINR(baseFare + helmetCost + deliveryCost)}
                    </span>
                  )}
                  <div className="text-[11px] text-slate-400 hidden xs:inline-block">
                    + <span className="text-[#00FF1F] font-bold">{formatINR(securityDeposit)}</span> deposit (refundable)
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 xs:hidden text-right">
                  + {formatINR(securityDeposit)} dep. (ref.)
                </div>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3.5 rounded-full font-bold text-sm sm:text-base bg-[#00FF1F] text-[#0d1117] hover:bg-[#26ff3f] active:scale-[0.98] shadow-lg shadow-[#00FF1F]/25 transition-all cursor-pointer whitespace-nowrap"
              >
                <MessageCircle className="w-5 h-5 fill-current shrink-0" />
                <span>Confirm &amp; Book on WhatsApp</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {confirmedBooking?.referralCode && (
        <FriendShareModal
          isOpen={bookingShareModalOpen}
          onClose={() => setBookingShareModalOpen(false)}
          slotNumber={bookingShareSlot}
          myReferralCode={confirmedBooking.referralCode}
          onVerified={handleBookingFriendVerified}
        />
      )}
    </div>
  );
};
