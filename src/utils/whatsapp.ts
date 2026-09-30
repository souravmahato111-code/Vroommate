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

  const referralLine = booking.referralDiscount && booking.referralDiscount > 0
    ? `🎁 *20% Referral Discount:* -${formatINR(booking.referralDiscount)} (${
        booking.referralDiscountType === 'sender_reward'
          ? `Referral Code ${booking.referralCode} Auto-Applied (20% OFF Unlocked via 3 Friends)`
          : `Receiver Referral Code: ${booking.referralCode} (20% OFF Applied)`
      })\n`
    : '';

  const personalReferralSection = booking.referralCode
    ? `\n🎁 *My Referral Code for Friends:* ${booking.referralCode} (Share with 3 friends to unlock 20% OFF! Link: https://bit.ly/vroommate)`
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
----------------------------------------
${referralLine}💰 *Estimated Rental:* ${formatINR(booking.totalAmount || 0)}${isWeekly ? ' (Weekly Discount Applied)' : ''}
🛡️ *Security Deposit:* ${formatINR(booking.securityDeposit || 500)} (100% refunded upon return)
⚠️ *Late Return Policy:* ₹150 flat fine applies for unannounced delays past return time.${personalReferralSection}
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
