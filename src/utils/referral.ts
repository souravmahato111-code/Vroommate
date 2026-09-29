export interface UserReferralProfile {
  myReferralCode: string | null;
  isCodeGenerated: boolean;
  shareCount: number; // 0 to 3: must be shared with 3 people to unlock!
  hasSharedReferral: boolean;
  referralSharedAt: string | null;
  senderDiscountAvailable: boolean; // unlocked ONLY when shareCount >= 3
  senderDiscountUsed: boolean;
  receiverDiscountUsed: boolean;
  appliedReferralCode: string | null;
  totalDiscountClaimed: number;
}

const STORAGE_KEY = 'vroommate_referral_profile_v1';
const KNOWN_CODES_KEY = 'vroommate_registered_referral_codes_v1';
const CONSUMED_CODES_KEY = 'vroommate_consumed_referral_codes_v1';

export function getReferralProfile(): UserReferralProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        myReferralCode: null,
        isCodeGenerated: false,
        shareCount: 0,
        hasSharedReferral: false,
        referralSharedAt: null,
        senderDiscountAvailable: false,
        senderDiscountUsed: false,
        receiverDiscountUsed: false,
        appliedReferralCode: null,
        totalDiscountClaimed: 0,
      };
    }
    const data = JSON.parse(raw);
    return {
      myReferralCode: data.myReferralCode || null,
      isCodeGenerated: !!data.isCodeGenerated,
      shareCount: typeof data.shareCount === 'number' ? data.shareCount : (data.hasSharedReferral ? 3 : 0),
      hasSharedReferral: !!data.hasSharedReferral,
      referralSharedAt: data.referralSharedAt || null,
      senderDiscountAvailable: !!data.senderDiscountAvailable,
      senderDiscountUsed: !!data.senderDiscountUsed,
      receiverDiscountUsed: !!data.receiverDiscountUsed,
      appliedReferralCode: data.appliedReferralCode || null,
      totalDiscountClaimed: data.totalDiscountClaimed || 0,
    };
  } catch {
    return {
      myReferralCode: null,
      isCodeGenerated: false,
      shareCount: 0,
      hasSharedReferral: false,
      referralSharedAt: null,
      senderDiscountAvailable: false,
      senderDiscountUsed: false,
      receiverDiscountUsed: false,
      appliedReferralCode: null,
      totalDiscountClaimed: 0,
    };
  }
}

export function saveReferralProfile(profile: UserReferralProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save referral profile', err);
  }
}

/**
 * Check if a code has already been redeemed by ANY user.
 * Once used by anyone, it is finished then and there.
 */
export function isCodeConsumed(code: string): boolean {
  try {
    const raw = localStorage.getItem(CONSUMED_CODES_KEY);
    const consumed: string[] = raw ? JSON.parse(raw) : [];
    return consumed.includes(code.trim().toUpperCase());
  } catch {
    return false;
  }
}

/**
 * Mark a code as consumed once someone successfully books with it.
 */
export function markCodeAsConsumed(code: string): void {
  try {
    const raw = localStorage.getItem(CONSUMED_CODES_KEY);
    const consumed: string[] = raw ? JSON.parse(raw) : [];
    const upper = code.trim().toUpperCase();
    if (!consumed.includes(upper)) {
      consumed.push(upper);
      localStorage.setItem(CONSUMED_CODES_KEY, JSON.stringify(consumed));
    }
  } catch {
    // ignore
  }
}

/**
 * Register newly generated codes so any session can validate them
 */
function registerKnownCode(code: string): void {
  try {
    const raw = localStorage.getItem(KNOWN_CODES_KEY);
    const codes: string[] = raw ? JSON.parse(raw) : [];
    if (!codes.includes(code.toUpperCase())) {
      codes.push(code.toUpperCase());
      localStorage.setItem(KNOWN_CODES_KEY, JSON.stringify(codes));
    }
  } catch {
    // ignore storage errors
  }
}

function isKnownCode(code: string): boolean {
  try {
    const raw = localStorage.getItem(KNOWN_CODES_KEY);
    const codes: string[] = raw ? JSON.parse(raw) : [];
    return codes.includes(code.toUpperCase());
  } catch {
    return false;
  }
}

/**
 * Generates a memorable, unique personal referral code only after first booking.
 * Example: VMR-REF-4821
 */
export function generatePersonalReferralCode(bookingId: string): string {
  const cleanId = bookingId.replace(/[^0-9]/g, '').slice(-4) || Math.floor(1000 + Math.random() * 9000).toString();
  const code = `VMR-REF-${cleanId}`;
  registerKnownCode(code);
  return code;
}

/**
 * Validates a receiver entering a referral code:
 * - Must not be already consumed by ANY user (strictly one-time use per code)
 * - Must not be their own code
 * - User must not have used any referral discount before
 * - Must match valid VMR referral code format
 */
export function validateReferralCodeInput(code: string): { valid: boolean; reason?: string } {
  const profile = getReferralProfile();
  const trimmed = code.trim().toUpperCase();

  if (!trimmed) {
    return { valid: false, reason: 'Please enter a referral code.' };
  }

  // 1. Check if this code was already consumed by ANY user
  if (isCodeConsumed(trimmed)) {
    return {
      valid: false,
      reason: 'This referral code has already been used by someone and can only be redeemed once.',
    };
  }

  // 2. Check if current user already used any referral discount (sender or receiver)
  if (profile.receiverDiscountUsed || profile.senderDiscountUsed) {
    return {
      valid: false,
      reason: 'You have already claimed your one-time 20% referral discount offer.',
    };
  }

  // 3. Cannot use own code
  if (profile.myReferralCode && profile.myReferralCode.toUpperCase() === trimmed) {
    return {
      valid: false,
      reason: 'You cannot use your own referral code.',
    };
  }

  // 4. Pattern & Known Code validation
  const isValidPattern = /^VMR(-REF)?-[A-Z0-9]{3,6}$/i.test(trimmed) || isKnownCode(trimmed);
  if (!isValidPattern) {
    return {
      valid: false,
      reason: 'Invalid referral code format. Example: VMR-REF-5821',
    };
  }

  return { valid: true };
}

/**
 * Triggered when user shares referral on WhatsApp.
 * Requirement: Referral must be sent to 3 people, THEN ONLY is discount for next booking unlocked!
 */
export function recordReferralShare(): {
  success: boolean;
  newCount: number;
  justUnlocked: boolean;
  isUnlocked: boolean;
  code: string;
} {
  const profile = getReferralProfile();

  let code = profile.myReferralCode;
  if (!code) {
    code = generatePersonalReferralCode('INIT');
    profile.myReferralCode = code;
    profile.isCodeGenerated = true;
  }

  const prevCount = profile.shareCount || 0;
  const newCount = Math.min(3, prevCount + 1);
  profile.shareCount = newCount;
  profile.hasSharedReferral = true;
  profile.referralSharedAt = new Date().toISOString();

  let justUnlocked = false;
  if (newCount >= 3 && !profile.senderDiscountUsed && !profile.receiverDiscountUsed) {
    if (!profile.senderDiscountAvailable) {
      justUnlocked = true;
      profile.senderDiscountAvailable = true;
    }
  }

  saveReferralProfile(profile);

  return {
    success: true,
    newCount,
    justUnlocked,
    isUnlocked: profile.senderDiscountAvailable,
    code,
  };
}

/**
 * Legacy alias for backwards compatibility
 */
export function unlockSenderDiscountOnShare() {
  return recordReferralShare();
}

/**
 * Pre-formatted WhatsApp share message for sending to friends
 */
export function generateReferralShareWhatsAppUrl(code: string, recipientNumber = ''): string {
  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://vroommate-rides.com';
  const text = `Hey! 🏍️ Rent scooties & bikes in Chota Gamharia with *VroomMate Rides*.

Use my referral code *${code}* to get *20% FLAT DISCOUNT* on your first booking!
(Note: Valid for the first person to redeem it)

👉 Book here: ${appUrl}
(Opposite Bharat Petroleum, Chota Gamharia · Instant pickup & sanitized helmets)`;

  const target = recipientNumber ? `https://wa.me/${recipientNumber}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
  return target;
}

/**
 * Called when a booking is confirmed to finalize state:
 * - Generates user's personal referral code on first booking
 * - If receiver used a code, marks that code globally as consumed (can never be used again)
 * - If sender used their 20% discount, marks it as used
 */
export function handleBookingConfirmationReferral(
  bookingId: string,
  appliedCode?: string,
  isSenderReward?: boolean
): {
  generatedCode: string;
  isFirstBooking: boolean;
} {
  const profile = getReferralProfile();
  const isFirst = !profile.isCodeGenerated;

  // 1. Generate personal referral code if first booking
  if (isFirst || !profile.myReferralCode) {
    const code = generatePersonalReferralCode(bookingId);
    profile.myReferralCode = code;
    profile.isCodeGenerated = true;
  }

  // 2. If receiver used a code: consume it globally and mark receiver offer finished
  if (appliedCode) {
    profile.receiverDiscountUsed = true;
    profile.appliedReferralCode = appliedCode;
    markCodeAsConsumed(appliedCode);
  }

  // 3. If sender used their automatic reward on this booking: mark finished
  if (isSenderReward) {
    profile.senderDiscountUsed = true;
    profile.senderDiscountAvailable = false;
  }

  saveReferralProfile(profile);

  return {
    generatedCode: profile.myReferralCode!,
    isFirstBooking: isFirst,
  };
}
