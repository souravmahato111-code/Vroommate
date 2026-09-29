import { Booking, Vehicle } from '../types';
import { BUSINESS_CONFIG } from '../data/fleetData';

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateWhatsAppBookingUrl(booking: Partial<Booking>, vehicle?: Vehicle): string {
  const number = BUSINESS_CONFIG.whatsappNumber;
  
  const isWeekly = booking.rentalType === 'daily' && booking.duration === 7;
  const durationLabel = booking.rentalType === 'hourly'
    ? `${booking.duration || 1} Hours`
    : isWeekly
    ? `7 Days (1 Week Package Deal 🔥)`
    : `${booking.duration || 1} Days`;

  const referralDiscountText = booking.referralDiscount
    ? `\n🎁 *20% Referral Discount (1-Time Use):* -${formatINR(booking.referralDiscount)} (Code: ${booking.referralCode || 'VROOM20'})`
    : '';

  const text = `*New Ride Rental Enquiry - VroomMate Rides*
----------------------------------------
🏍️ *Vehicle:* ${booking.vehicleName || vehicle?.name || 'Bike / Scooty'}
⏱️ *Rental Type:* ${booking.rentalType === 'hourly' ? 'Hourly Rental' : 'Daily Rental'}
📅 *Pickup:* ${booking.pickupDate || 'Today'} at ${booking.pickupTime || 'Morning'}
🔄 *Return:* ${booking.returnDate || 'Same day'} at ${booking.returnTime || 'Evening'}
⏳ *Duration:* ${durationLabel}
📍 *Pickup Mode:* ${booking.deliveryType === 'doorstep' ? `Doorstep Pickup (Inside 6km Range) (${booking.deliveryAddress || 'Address within 6km range'})` : 'Self-Pickup at Chota Gamharia Hub'}
🪖 *Helmets Required:* ${booking.helmetCount || 1} (${booking.helmetCount === 2 ? '1 Free + 1 Extra Pillion' : '1 Free Sanitized Helmet'})
----------------------------------------
👤 *Customer Name:* ${booking.customerName || 'Customer'}
📱 *WhatsApp Phone:* ${booking.customerPhone || 'Not specified'}
🪪 *Valid Driving License:* ${booking.hasDrivingLicense ? 'Yes, Available' : 'Needs Verification'}
📝 *Agreement:* Signed offline at vehicle handover
----------------------------------------${referralDiscountText}
💰 *Estimated Rental:* ${formatINR(booking.totalAmount || 0)}${isWeekly ? ' (Weekly Discount Applied)' : ''}
🛡️ *Security Deposit:* ${formatINR(booking.securityDeposit || 500)} (100% refunded upon return)
⚠️ *Late Return Policy:* ₹150 flat fine applies for unannounced delays past return time.
----------------------------------------
Hi VroomMate Rides team, please confirm availability for this slot. Sending my ID proof for quick booking!`;

  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export function generateDirectWhatsAppInquiry(vehicleName?: string): string {
  const number = BUSINESS_CONFIG.whatsappNumber;
  const message = vehicleName
    ? `Hi VroomMate Rides! I am interested in renting the *${vehicleName}*. Can you please share the current availability and booking procedure?`
    : `Hi VroomMate Rides! I want to enquire about bike & scooty rentals in Chota Gamharia. What rides are available today?`;

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

const STORAGE_KEY = 'ghoomify_rides_bookings_v1';
const REFERRAL_CODE_KEY = 'vroommate_user_ref_code_v1';
const REFERRAL_DISCOUNT_KEY = 'vroommate_referral_discount_state_v1';

export function getUserReferralCode(): string {
  try {
    let code = localStorage.getItem(REFERRAL_CODE_KEY);
    if (!code) {
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      code = `VROOM20-${randomSuffix}`;
      localStorage.setItem(REFERRAL_CODE_KEY, code);
    }
    return code;
  } catch {
    return 'VROOM20-OFFER';
  }
}

export interface ReferralDiscountState {
  unlocked: boolean;
  used: boolean;
  code: string;
  percent: number;
  unlockedAt?: string;
  usedAt?: string;
  usedBookingId?: string;
}

export function getReferralDiscountState(): ReferralDiscountState | null {
  try {
    const raw = localStorage.getItem(REFERRAL_DISCOUNT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      unlocked: Boolean(parsed.unlocked),
      used: Boolean(parsed.used),
      code: parsed.code || getUserReferralCode(),
      percent: parsed.percent || 20,
      unlockedAt: parsed.unlockedAt,
      usedAt: parsed.usedAt,
      usedBookingId: parsed.usedBookingId,
    };
  } catch {
    return null;
  }
}

export function isReferralDiscountApplicable(): boolean {
  const state = getReferralDiscountState();
  return Boolean(state && state.unlocked && !state.used);
}

export function isReferralDiscountUsed(): boolean {
  const state = getReferralDiscountState();
  return Boolean(state && state.used);
}

export function unlockReferralDiscount(customCode?: string): ReferralDiscountState {
  const existing = getReferralDiscountState();
  // Strictly applicable only once: if already used, do not re-unlock
  if (existing?.used) {
    return existing;
  }

  const code = customCode || existing?.code || getUserReferralCode();
  const state: ReferralDiscountState = {
    unlocked: true,
    used: false,
    code,
    percent: 20,
    unlockedAt: existing?.unlockedAt || new Date().toISOString(),
  };
  try {
    localStorage.setItem(REFERRAL_DISCOUNT_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event('referral_discount_state_changed'));
  } catch (e) {
    console.error('Failed to save referral discount', e);
  }
  return state;
}

export function markReferralDiscountUsed(bookingId: string): void {
  const current = getReferralDiscountState();
  const code = current?.code || getUserReferralCode();
  const updated: ReferralDiscountState = {
    unlocked: false,
    used: true,
    code,
    percent: 20,
    unlockedAt: current?.unlockedAt || new Date().toISOString(),
    usedAt: new Date().toISOString(),
    usedBookingId: bookingId,
  };
  try {
    localStorage.setItem(REFERRAL_DISCOUNT_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('referral_discount_state_changed'));
  } catch (e) {
    console.error('Failed to mark referral discount as used', e);
  }
}

export function subscribeReferralDiscountChange(callback: () => void): () => void {
  const handler = () => callback();
  window.addEventListener('referral_discount_state_changed', handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener('referral_discount_state_changed', handler);
    window.removeEventListener('storage', handler);
  };
}

export function generateReferralShareUrl(code: string): string {
  const shareText = `Hey! 🏍️ Need an affordable bike or scooty in Gamharia / Jamshedpur? 

Check out *VroomMate Rides* (Opp. Bharat Petroleum, Gamharia)! Self-drive rentals start at just ₹33/hour or ₹320/day with free sanitized helmets.

🎁 Use my invite code *${code}* to get *20% OFF* on your first ride!
👉 Book now: ${window.location.origin}`;

  return `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
}

export function generateOfficeClaimWhatsAppUrl(code: string): string {
  const number = BUSINESS_CONFIG.whatsappNumber;
  const message = `*🎁 VROOMMATE RIDES — 20% REFERRAL REWARD CARD*
======================================
🎟️ *Voucher Code:* ${code}
🏷️ *Offer:* FLAT 20% OFF (APPLICABLE ONLY ONCE)
✅ *Status:* UNLOCKED (ONE-TIME REDEMPTION)
📍 *Redeemable At:* VroomMate Rides Desk (Opp. Bharat Petroleum, Chota Gamharia, Jamshedpur)
📱 *Customer Device ID:* Ref-${code}
======================================
Hey VroomMate Team! I participated in your Referral Program and sent the invite message to my friend via WhatsApp. Presenting this verified card to claim my one-time 20% off on this booking!`;

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function getSavedBookings(): Booking[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse saved bookings', e);
    return [];
  }
}

export function saveBooking(booking: Booking): void {
  try {
    const existing = getSavedBookings();
    const updated = [booking, ...existing.filter((b) => b.id !== booking.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save booking', e);
  }
}
