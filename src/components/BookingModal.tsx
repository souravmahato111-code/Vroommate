import React, { useState, useEffect } from 'react';
import { Vehicle, Booking } from '../types';
import { FLEET_VEHICLES, BUSINESS_CONFIG } from '../data/fleetData';
import {
  formatINR,
  generateWhatsAppBookingUrl,
  saveBooking,
  getReferralDiscountState,
  unlockReferralDiscount,
  markReferralDiscountUsed,
  getUserReferralCode,
  generateReferralShareUrl,
  subscribeReferralDiscountChange,
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
  BadgePercent,
  Share2,
} from 'lucide-react';
import {
  calculateRentalBaseFare,
  getVehicleSecurityDeposit,
  getSavingsOnWeeklyPackage,
  calculateExtraHelmetCost,
} from '../utils/pricing';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVehicle?: Vehicle | null;
  initialRentalType?: 'daily' | 'hourly';
  initialDuration?: number;
  initialExtraHelmet?: boolean;
  initialDoorstep?: boolean;
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
  const [referralDiscountApplied, setReferralDiscountApplied] = useState<boolean>(false);
  const [referralCode, setReferralCode] = useState<string>('');
  const [showShareConfirmPrompt, setShowShareConfirmPrompt] = useState<boolean>(false);

  // Check and sync for unlocked referral discount (applicable only if not used yet)
  useEffect(() => {
    const syncDiscountState = () => {
      const discountState = getReferralDiscountState();
      if (discountState && discountState.unlocked && !discountState.used) {
        setReferralDiscountApplied(true);
        setReferralCode(discountState.code);
      } else {
        setReferralDiscountApplied(false);
        setReferralCode('');
      }
    };

    if (isOpen) {
      syncDiscountState();
    }
    return subscribeReferralDiscountChange(syncDiscountState);
  }, [isOpen]);

  // Set default today's date formatted
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setPickupDate(`${yyyy}-${mm}-${dd}`);
  }, []);

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

  const helmetCost = extraHelmet
    ? calculateExtraHelmetCost(rentalType, effectiveDuration)
    : 0;

  const deliveryCost = deliveryType === 'doorstep' ? 100 : 0;
  const subtotal = baseFare + helmetCost + deliveryCost;
  const referralDiscountAmount = referralDiscountApplied ? Math.round(subtotal * 0.20) : 0;
  const totalAmount = Math.max(0, subtotal - referralDiscountAmount);

  const securityDeposit = getVehicleSecurityDeposit(currentVehicle.id, rentalType, effectiveDuration);
  const weeklySavings = getSavingsOnWeeklyPackage(currentVehicle, rentalType, effectiveDuration);

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

  const currentDiscountState = getReferralDiscountState();
  const isAlreadyUsed = Boolean(currentDiscountState?.used);

  const handleInitiateWhatsAppShareFromModal = () => {
    if (isAlreadyUsed) {
      toast.info('Already Redeemed', {
        description: 'The 20% referral discount is valid for one-time use only.',
      });
      return;
    }
    const code = referralCode || currentDiscountState?.code || getUserReferralCode();
    const shareUrl = generateReferralShareUrl(code);
    window.open(shareUrl, '_blank');
    setShowShareConfirmPrompt(true);
  };

  const handleConfirmSentFromModal = () => {
    const code = referralCode || currentDiscountState?.code || getUserReferralCode();
    const updated = unlockReferralDiscount(code);
    setReferralDiscountApplied(true);
    setReferralCode(updated.code);
    setShowShareConfirmPrompt(false);
    toast.success('20% Referral Discount Unlocked!', {
      description: 'Applied 20% referral discount to this booking (1-time use).',
      icon: '🎉',
    });
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
      referralDiscount: referralDiscountAmount > 0 ? referralDiscountAmount : undefined,
      referralCode: referralDiscountApplied ? (referralCode || 'VROOM20') : undefined,
      totalAmount,
      securityDeposit,
      status: 'pending_whatsapp',
      createdAt: new Date().toISOString(),
    };

    saveBooking(newBooking);
    if (referralDiscountApplied && referralDiscountAmount > 0) {
      markReferralDiscountUsed(bookingId);
    }
    onBookingCreated();
    setConfirmedBooking(newBooking);

    // Toast notification requested by user
    toast.success('Booking Request Sent', {
      description: `Your ride reservation for ${currentVehicle.name} (${bookingId}) has been created successfully.`,
      duration: 5000,
    });

    // Open WhatsApp in new tab
    const waUrl = generateWhatsAppBookingUrl(newBooking, currentVehicle);
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-[#161c26] border border-[#263041] rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#0d1117]/80">
          <div>
            <h2 className="font-display font-extrabold text-xl text-white">
              {confirmedBooking ? 'Booking Initiated!' : 'Reserve Your Two-Wheeler'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {confirmedBooking
                ? 'Reference ID: ' + confirmedBooking.id
                : 'Instant booking via WhatsApp with VroomMate Rides'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl grid place-items-center bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmedBooking ? (
          /* Confirmation Success View */
          <div className="p-6 md:p-8 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#39ff88]/20 text-[#39ff88] grid place-items-center mx-auto mb-4 border border-[#39ff88]/40">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h3 className="font-display font-bold text-2xl text-white">
                Booking Request Sent!
              </h3>
              <p className="text-slate-300 text-sm mt-2 max-w-md mx-auto">
                We’ve launched WhatsApp with your pre-formatted rental request. Please send the
                message along with photos of your ID &amp; Driving License.
              </p>
            </div>

            {/* Summary card */}
            <div className="bg-[#10141d] rounded-2xl p-5 border border-white/10 space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-white/10">
                <span className="text-slate-400">Booking Reference</span>
                <span className="font-mono font-bold text-[#39ff88] text-sm">
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
                <span className="text-[#39ff88] font-medium">Signed Offline at Handover</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Duration</span>
                <span className="text-white">
                  {confirmedBooking.duration}{' '}
                  {confirmedBooking.rentalType === 'daily' ? 'Days' : 'Hours'}
                </span>
              </div>
              {confirmedBooking.referralDiscount && (
                <div className="flex justify-between text-[#39ff88]">
                  <span>20% Referral Reward Applied (1-Time Use)</span>
                  <span className="font-mono font-bold">-{formatINR(confirmedBooking.referralDiscount)}</span>
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
                <span className="font-mono font-bold text-[#39ff88]">
                  {formatINR(confirmedBooking.securityDeposit)}
                </span>
              </div>
              <div className="flex justify-between text-slate-400 pt-1 text-[11px]">
                <span>Late Return Fine Policy</span>
                <span className="text-[#ff7a1a] font-medium">₹150 flat fine for unnotified late returns</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={generateWhatsAppBookingUrl(confirmedBooking, currentVehicle)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-5 rounded-xl font-bold text-sm bg-[#39ff88] text-[#0d1117] hover:bg-[#4dff93] transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Re-open WhatsApp Chat</span>
              </a>
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-6 rounded-xl font-medium text-xs bg-white/10 hover:bg-white/15 text-white transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <form onSubmit={handleConfirmAndSendWhatsApp} className="p-6 md:p-8 space-y-6">
            {/* Vehicle Selection Strip */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                1. Selected Ride
              </label>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full bg-[#10141d] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#39ff88]"
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
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  2. Rental Plan
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRentalType('daily');
                      setDuration(1);
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-colors ${
                      rentalType === 'daily'
                        ? 'bg-[#39ff88] text-[#0d1117] border-[#39ff88]'
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
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-colors ${
                      rentalType === 'hourly'
                        ? 'bg-[#39ff88] text-[#0d1117] border-[#39ff88]'
                        : 'bg-[#10141d] text-slate-300 border-white/10 hover:text-white'
                    }`}
                  >
                    Hourly (₹{currentVehicle.pricePerHour}/h)
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Duration ({rentalType === 'daily' ? 'Days (Max 7)' : 'Hours'})
                  </label>
                  {rentalType === 'daily' && effectiveDuration === 7 && (
                    <span className="text-[10px] font-bold text-[#39ff88] bg-[#39ff88]/15 px-2 py-0.5 rounded-full border border-[#39ff88]/30">
                      Weekly Deal Active
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDuration(Math.max(rentalType === 'daily' ? 1 : 3, effectiveDuration - 1))}
                    className="w-10 h-10 rounded-xl bg-[#10141d] border border-white/10 text-white font-bold hover:bg-white/10"
                  >
                    -
                  </button>
                  <div className="flex-1 py-2 rounded-xl bg-[#10141d] border border-white/10 text-center font-bold text-white text-sm">
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
                    className="w-10 h-10 rounded-xl bg-[#10141d] border border-white/10 text-white font-bold hover:bg-white/10"
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
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
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
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Pickup Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    required
                    className="w-full bg-[#10141d] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#39ff88]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Pickup Time
                </label>
                <select
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full bg-[#10141d] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#39ff88]"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryType('hub_pickup')}
                  className={`p-3 rounded-xl text-left border transition-colors ${
                    deliveryType === 'hub_pickup'
                      ? 'bg-[#39ff88]/10 border-[#39ff88] text-white'
                      : 'bg-[#10141d] border-white/10 text-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold">Chota Gamharia Hub</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Opp. Bharat Petroleum (Free)</div>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryType('doorstep')}
                  className={`p-3 rounded-xl text-left border transition-colors ${
                    deliveryType === 'doorstep'
                      ? 'bg-[#39ff88]/10 border-[#39ff88] text-white'
                      : 'bg-[#10141d] border-white/10 text-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold">Doorstep Pickup (Inside 6km Range)</div>
                  <div className="text-[11px] text-[#ff7a1a] mt-0.5">+₹100 flat fee</div>
                </button>
              </div>

              {deliveryType === 'doorstep' && (
                <input
                  type="text"
                  placeholder="Enter pickup address / landmark (within 6km range)"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  required
                  className="w-full bg-[#10141d] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#39ff88]"
                />
              )}

              <label className="flex items-center justify-between p-3 rounded-xl bg-[#10141d] border border-white/5 cursor-pointer hover:border-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={extraHelmet}
                    onChange={(e) => setExtraHelmet(e.target.checked)}
                    className="w-4 h-4 accent-[#39ff88] rounded"
                  />
                  <div>
                    <span className="text-xs text-slate-200 block">
                      Include 2nd helmet for pillion rider (1st helmet is 100% free)
                    </span>
                    {rentalType === 'daily' && effectiveDuration >= 7 && (
                      <span className="text-[10px] text-[#39ff88] font-bold">
                        Special Weekly Helmet Rate: ₹200 for 7 days
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-xs font-bold text-[#ff7a1a] shrink-0">
                  +{formatINR(calculateExtraHelmetCost(rentalType, effectiveDuration))}
                </span>
              </label>
            </div>

            {/* Rider Information */}
            <div className="pt-2 border-t border-white/10 space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Rider Contact Details
              </label>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Your Full Name *"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    className="w-full bg-[#10141d] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#39ff88]"
                  />
                </div>

                <div>
                  <input
                    type="tel"
                    placeholder="WhatsApp Phone Number *"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                    className="w-full bg-[#10141d] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#39ff88]"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 p-3 rounded-xl bg-[#10141d] border border-white/5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasLicense}
                  onChange={(e) => setHasLicense(e.target.checked)}
                  className="w-4 h-4 accent-[#39ff88] rounded"
                />
                <span className="text-xs text-slate-200">
                  I possess a valid Indian Driving License (Two-Wheeler) &amp; Aadhaar/Voter ID. (Rental agreement will be signed offline at vehicle handover).
                </span>
              </label>
            </div>

            {/* Referral Discount Promo / Applied Card */}
            {referralDiscountApplied ? (
              <div className="p-3.5 rounded-xl bg-[#39ff88]/10 border border-[#39ff88]/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-[#39ff88] shrink-0" />
                  <div>
                    <span className="font-bold text-[#39ff88]">20% Referral Discount Applied!</span>
                    <span className="block text-[11px] text-slate-300">
                      Voucher: {referralCode || 'VROOM20'} · Applicable Only Once
                    </span>
                  </div>
                </div>
                <span className="font-mono font-bold text-[#39ff88] text-sm">
                  -{formatINR(referralDiscountAmount)}
                </span>
              </div>
            ) : isAlreadyUsed ? (
              <div className="p-3 rounded-xl bg-[#10141d] border border-white/5 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>One-time 20% referral discount was already redeemed.</span>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded">
                  Used
                </span>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-[#10141d] border border-white/10 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Gift className="w-4 h-4 text-[#39ff88]" />
                    <span className="font-bold text-white">Want 20% OFF? Send referral to a friend</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#39ff88] bg-[#39ff88]/15 px-2 py-0.5 rounded-full border border-[#39ff88]/30">
                    1-Time Offer
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  20% discount is unlocked only when you send the referral message to a friend on WhatsApp. Applicable only once!
                </p>

                {showShareConfirmPrompt ? (
                  <div className="p-3 rounded-lg bg-[#16241b] border border-[#39ff88]/30 space-y-2.5">
                    <p className="text-[11px] text-slate-200 font-medium">
                      Did you successfully send the referral message to your friend on WhatsApp?
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={handleConfirmSentFromModal}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#39ff88] text-[#0d1117] hover:bg-[#4dff93] transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Yes, Sent! (Apply 20% OFF)</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleInitiateWhatsAppShareFromModal}
                        className="px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>Reopen WhatsApp</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowShareConfirmPrompt(false)}
                        className="px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleInitiateWhatsAppShareFromModal}
                    className="w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-[#39ff88]/15 hover:bg-[#39ff88]/25 text-[#39ff88] border border-[#39ff88]/40 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Send Invite to Friend on WhatsApp to Unlock 20%</span>
                  </button>
                )}
              </div>
            )}

            {/* Summary & Instant Submit */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#10141d] to-[#161c26] border border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-400">Total Rental Estimate</span>
                  {referralDiscountAmount > 0 && (
                    <span className="text-[10px] font-bold text-[#39ff88] bg-[#39ff88]/15 px-2 py-0.5 rounded-full border border-[#39ff88]/30">
                      20% Off (-{formatINR(referralDiscountAmount)})
                    </span>
                  )}
                  {weeklySavings > 0 && (
                    <span className="text-[10px] font-bold text-[#39ff88] bg-[#39ff88]/15 px-2 py-0.5 rounded-full border border-[#39ff88]/30">
                      Saved {formatINR(weeklySavings)}!
                    </span>
                  )}
                </div>
                <div className="font-display font-black text-2xl text-[#ff7a1a]">
                  {formatINR(totalAmount)}
                </div>
                <div className="text-[11px] text-slate-300">
                  + <span className="text-[#39ff88] font-bold">{formatINR(securityDeposit)}</span> Security Deposit (100% refunded upon return)
                </div>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm bg-[#39ff88] text-[#0d1117] hover:bg-[#4dff93] shadow-lg shadow-[#39ff88]/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Confirm &amp; Book on WhatsApp</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
