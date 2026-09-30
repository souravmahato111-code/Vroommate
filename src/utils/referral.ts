export interface VerifiedFriendShare {
  name: string;
  phone: string;
  verifiedAt: string;
}

export interface UserReferralProfile {
  myReferralCode: string | null;
  isCodeGenerated: boolean;
  shareCount: number; // 0 to 3: must be shared with 3 people to unlock!
  hasSharedReferral: boolean;
  referralSharedAt: string | null;
  senderDiscountAvailable: boolean; // unlocked when shareCount >= 3 and not yet used by sender
  senderDiscountUsed: boolean; // sender gets 20% discount just once
  receiverDiscountUsed: boolean; // receiver gets 20% discount just once
  appliedReferralCode: string | null;
  totalDiscountClaimed: number;
  isFriendCodeRedeemed?: boolean; // true once 1 of the 3 friends redeems the code
  verifiedFriends: VerifiedFriendShare[]; // 3 distinct verified friends with delivery check
}

const STORAGE_KEY = 'vroommate_referral_profile_v1';
const KNOWN_CODES_KEY = 'vroommate_registered_referral_codes_v1';
const CONSUMED_CODES_KEY = 'vroommate_consumed_referral_codes_v1';
const BOOKINGS_KEY = 'ghoomify_rides_bookings_v1';

export const VROOMMATE_SITE_URL = 'https://bit.ly/vroommate';

/**
 * Check if the user has at least one confirmed booking
 */
export function hasUserCompletedFirstBooking(): boolean {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    if (!raw) return false;
    const bookings = JSON.parse(raw);
    return Array.isArray(bookings) && bookings.length > 0;
  } catch {
    return false;
  }
}

/**
 * Get the user's phone number from their bookings (to prevent self-referral)
 */
export function getUserBookingPhone(): string | null {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    if (!raw) return null;
    const bookings = JSON.parse(raw);
    return bookings[0]?.customerPhone?.replace(/[^0-9]/g, '').slice(-10) || null;
  } catch {
    return null;
  }
}

export function getReferralProfile(): UserReferralProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const hasBooking = hasUserCompletedFirstBooking();

    if (!raw) {
      let initialCode: string | null = null;
      let isGen = false;

      // CRITICAL: Generate referral code ONLY after first booking!
      if (hasBooking) {
        try {
          const bookings = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
          if (bookings[0]?.id) {
            initialCode = generatePersonalReferralCode(bookings[0].id);
            isGen = true;
          }
        } catch {
          // ignore
        }
      }

      return {
        myReferralCode: initialCode,
        isCodeGenerated: isGen,
        shareCount: 0,
        hasSharedReferral: false,
        referralSharedAt: null,
        senderDiscountAvailable: false,
        senderDiscountUsed: false,
        receiverDiscountUsed: false,
        appliedReferralCode: null,
        totalDiscountClaimed: 0,
        isFriendCodeRedeemed: false,
        verifiedFriends: [],
      };
    }

    const data = JSON.parse(raw);
    let myCode = data.myReferralCode || null;
    let isCodeGenerated = !!data.isCodeGenerated;

    // Strict rule: Referral code exists only if user has completed a booking!
    if (!hasBooking) {
      myCode = null;
      isCodeGenerated = false;
    } else if (!myCode && hasBooking) {
      try {
        const bookings = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
        if (bookings[0]?.id) {
          myCode = generatePersonalReferralCode(bookings[0].id);
          isCodeGenerated = true;
        }
      } catch {
        // ignore
      }
    }

    // Load verified friends
    let rawFriends: VerifiedFriendShare[] = Array.isArray(data.verifiedFriends)
      ? data.verifiedFriends
      : [];

    // Strictly deduplicate verified friends by phone number to ensure DIFFERENT people only
    const uniqueFriends: VerifiedFriendShare[] = [];
    const seenPhones = new Set<string>();
    for (const vf of rawFriends) {
      const clean = (vf.phone || '').replace(/[^0-9]/g, '').slice(-10);
      if (clean && clean.length === 10 && !seenPhones.has(clean)) {
        seenPhones.add(clean);
        uniqueFriends.push({
          name: vf.name || `Friend ${uniqueFriends.length + 1}`,
          phone: clean,
          verifiedAt: vf.verifiedAt || new Date().toISOString(),
        });
      }
    }
    let verifiedFriends = uniqueFriends;

    // Fallback migration: only if truly empty
    if (verifiedFriends.length === 0 && typeof data.shareCount === 'number' && data.shareCount > 0) {
      for (let i = 1; i <= Math.min(3, data.shareCount); i++) {
        verifiedFriends.push({
          name: `Friend ${i}`,
          phone: `987654321${i}`,
          verifiedAt: data.referralSharedAt || new Date().toISOString(),
        });
      }
    }

    const shareCount = Math.min(3, verifiedFriends.length);
    const senderUsed = !!data.senderDiscountUsed;
    const receiverUsed = !!data.receiverDiscountUsed;

    // Check if one of the friends has redeemed this code
    const isFriendCodeRedeemed = myCode ? isCodeConsumed(myCode) : false;

    // Sender discount is available ONLY if:
    // 1. Shared with at least 3 strictly different, verified people
    // 2. Sender hasn't used their sender discount yet
    const senderAvailable = shareCount >= 3 && !senderUsed;

    return {
      myReferralCode: myCode,
      isCodeGenerated: isCodeGenerated && hasBooking,
      shareCount,
      hasSharedReferral: !!data.hasSharedReferral || shareCount > 0,
      referralSharedAt: data.referralSharedAt || null,
      senderDiscountAvailable: senderAvailable,
      senderDiscountUsed: senderUsed,
      receiverDiscountUsed: receiverUsed,
      appliedReferralCode: data.appliedReferralCode || null,
      totalDiscountClaimed: data.totalDiscountClaimed || 0,
      isFriendCodeRedeemed,
      verifiedFriends,
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
      isFriendCodeRedeemed: false,
      verifiedFriends: [],
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
 * Check if a code has already been redeemed by a friend.
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
export function registerKnownCode(code: string): void {
  try {
    const raw = localStorage.getItem(KNOWN_CODES_KEY);
    const codes: string[] = raw ? JSON.parse(raw) : [];
    const upper = code.trim().toUpperCase();
    if (!codes.includes(upper)) {
      codes.push(upper);
      localStorage.setItem(KNOWN_CODES_KEY, JSON.stringify(codes));
    }
  } catch {
    // ignore storage errors
  }
}

export function isKnownCode(code: string): boolean {
  try {
    const raw = localStorage.getItem(KNOWN_CODES_KEY);
    const codes: string[] = raw ? JSON.parse(raw) : [];
    return codes.includes(code.trim().toUpperCase());
  } catch {
    return false;
  }
}

/**
 * Generates a memorable, unique personal referral code ONLY after first booking.
 * Example: VMR-REF-4821
 */
export function generatePersonalReferralCode(bookingId: string): string {
  const cleanId =
    bookingId.replace(/[^0-9]/g, '').slice(-4) ||
    Math.floor(1000 + Math.random() * 9000).toString();
  const code = `VMR-REF-${cleanId}`;
  registerKnownCode(code);
  return code;
}

/**
 * Validates a referral code entered by user:
 * - Code is single-use: "Hurry or someone else will claim the offer!"
 * - Receiver gets 20% discount for just once
 * - If own code: must have shared to 3 people to unlock sender reward
 * - Must match valid VMR referral code format
 */
export function validateReferralCodeInput(code: string): { valid: boolean; reason?: string } {
  const profile = getReferralProfile();
  const trimmed = code.trim().toUpperCase();

  if (!trimmed) {
    return { valid: false, reason: 'Please enter a referral code.' };
  }

  // 1. Check if this code was already consumed
  if (isCodeConsumed(trimmed)) {
    return {
      valid: false,
      reason:
        'This referral code has already been claimed! Hurry next time or someone else will claim the offer.',
    };
  }

  // 2. Check if current user already used a receiver referral discount before (discount for just once)
  if (profile.receiverDiscountUsed) {
    return {
      valid: false,
      reason:
        'You have already claimed your one-time 20% receiver discount on your first booking.',
    };
  }

  // 3. Check own code
  if (profile.myReferralCode && profile.myReferralCode.toUpperCase() === trimmed) {
    if (!profile.senderDiscountAvailable) {
      return {
        valid: false,
        reason:
          'This is your personal referral code. Send it to 3 people on WhatsApp first to unlock your 20% discount!',
      };
    }
    if (profile.senderDiscountUsed) {
      return {
        valid: false,
        reason: 'You have already used your 20% sender discount (applicable for just once).',
      };
    }
    return {
      valid: true,
      reason: 'Your 20% sender discount is unlocked and active! It will apply to your booking.',
    };
  }

  // 4. Pattern & Known Code validation
  const isValidPattern = /^VMR(-REF)?-[A-Z0-9]{3,6}$/i.test(trimmed) || isKnownCode(trimmed);
  if (!isValidPattern) {
    return {
      valid: false,
      reason: 'Invalid referral code format. Example: VMR-REF-4821',
    };
  }

  return { valid: true };
}

/**
 * ANTI-LOOPHOLE VERIFICATION:
 * Only accepts a referral share when:
 * 1. Targeted WhatsApp number is a valid 10-digit Indian phone number.
 * 2. Recipient is not the user's own booking phone.
 * 3. Recipient has not already been invited (each of the 3 friends must be unique).
 * 4. User actually spends time in the WhatsApp chat (anti-bounce check >= 4 seconds).
 */
export function verifyAndRecordFriendShare(friend: {
  name: string;
  phone: string;
  durationSeconds?: number;
}): {
  success: boolean;
  reason?: string;
  newCount: number;
  justUnlocked: boolean;
  isUnlocked: boolean;
  code: string;
  verifiedFriends: VerifiedFriendShare[];
} {
  const profile = getReferralProfile();
  const code = profile.myReferralCode || '';

  if (!code) {
    return {
      success: false,
      reason: 'Please complete your first ride to generate your personal referral code.',
      newCount: 0,
      justUnlocked: false,
      isUnlocked: false,
      code: '',
      verifiedFriends: [],
    };
  }

  const cleanPhone = friend.phone.replace(/[^0-9]/g, '').slice(-10);
  if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
    return {
      success: false,
      reason: 'Please enter a valid 10-digit Indian mobile number for your friend.',
      newCount: profile.verifiedFriends.length,
      justUnlocked: false,
      isUnlocked: profile.senderDiscountAvailable,
      code,
      verifiedFriends: profile.verifiedFriends,
    };
  }

  // Prevent self-sharing
  const userPhone = getUserBookingPhone();
  if (userPhone && userPhone === cleanPhone) {
    return {
      success: false,
      reason: 'Cannot confirm share: You cannot share with your own mobile number. Please share with three friends.',
      newCount: profile.verifiedFriends.length,
      justUnlocked: false,
      isUnlocked: profile.senderDiscountAvailable,
      code,
      verifiedFriends: profile.verifiedFriends,
    };
  }

  // Check if this mobile number was already shared
  const alreadyInvitedPhone = profile.verifiedFriends.some((f) => f.phone === cleanPhone);
  if (alreadyInvitedPhone) {
    return {
      success: false,
      reason: `Cannot confirm share: You have already shared with this friend (+91 ${cleanPhone})! Each share must be with a different friend to confirm.`,
      newCount: profile.verifiedFriends.length,
      justUnlocked: false,
      isUnlocked: profile.senderDiscountAvailable,
      code,
      verifiedFriends: profile.verifiedFriends,
    };
  }

  // Check if same friend name was already used (if explicit name provided)
  const trimmedName = friend.name.trim();
  const isGeneric = /^friend\s*\d*$/i.test(trimmedName);
  if (!isGeneric && trimmedName.length >= 2) {
    const alreadyInvitedName = profile.verifiedFriends.some(
      (f) => f.name.toLowerCase().trim() === trimmedName.toLowerCase()
    );
    if (alreadyInvitedName) {
      return {
        success: false,
        reason: `Cannot confirm share: You have already shared with "${trimmedName}". Please share with a different friend to confirm.`,
        newCount: profile.verifiedFriends.length,
        justUnlocked: false,
        isUnlocked: profile.senderDiscountAvailable,
        code,
        verifiedFriends: profile.verifiedFriends,
      };
    }
  }

  // Already reached 3 distinct people
  if (profile.verifiedFriends.length >= 3) {
    return {
      success: true,
      reason: 'Referral code already confirmed with 3 different people! 20% discount is unlocked.',
      newCount: 3,
      justUnlocked: false,
      isUnlocked: true,
      code,
      verifiedFriends: profile.verifiedFriends,
    };
  }

  // Anti-bounce check: prevent immediately clicking and closing in <4 seconds
  if (typeof friend.durationSeconds === 'number' && friend.durationSeconds < 4) {
    return {
      success: false,
      reason:
        'Cannot confirm share: Verification incomplete. You returned too quickly without sending the message in WhatsApp chat. Please ensure the message is sent to confirm share.',
      newCount: profile.verifiedFriends.length,
      justUnlocked: false,
      isUnlocked: profile.senderDiscountAvailable,
      code,
      verifiedFriends: profile.verifiedFriends,
    };
  }

  const friendName = trimmedName || `Different Person ${profile.verifiedFriends.length + 1}`;
  const newVerified = [
    ...profile.verifiedFriends,
    {
      name: friendName,
      phone: cleanPhone,
      verifiedAt: new Date().toISOString(),
    },
  ];

  profile.verifiedFriends = newVerified;
  profile.shareCount = Math.min(3, newVerified.length);
  profile.hasSharedReferral = true;
  profile.referralSharedAt = new Date().toISOString();

  let justUnlocked = false;
  // Confirm share only when shared with 3 different people successfully!
  if (profile.shareCount >= 3 && !profile.senderDiscountUsed) {
    if (!profile.senderDiscountAvailable) {
      justUnlocked = true;
      profile.senderDiscountAvailable = true;
    }
  }

  saveReferralProfile(profile);

  return {
    success: true,
    newCount: profile.shareCount,
    justUnlocked,
    isUnlocked: profile.senderDiscountAvailable,
    code,
    verifiedFriends: profile.verifiedFriends,
  };
}

/**
 * Fallback share recorder
 */
export function recordReferralShare(friendIndex?: number): {
  success: boolean;
  newCount: number;
  justUnlocked: boolean;
  isUnlocked: boolean;
  code: string;
} {
  const profile = getReferralProfile();
  return {
    success: true,
    newCount: profile.shareCount,
    justUnlocked: false,
    isUnlocked: profile.senderDiscountAvailable,
    code: profile.myReferralCode || '',
  };
}

/**
 * WhatsApp message sent to friends with bit.ly link and urgency text
 */
export function generateReferralShareWhatsAppUrl(code: string, recipientNumber = ''): string {
  const siteUrl = VROOMMATE_SITE_URL;
  const cleanNumber = recipientNumber.replace(/[^0-9]/g, '');
  const target = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;

  const text = `Hey! 🏍️ Rent scooties & bikes in Chota Gamharia with *Vroommate*.

Use my referral code *${code}* to get *20% FLAT DISCOUNT* on your booking!
⚡ *Hurry or someone else will claim the offer!* 🔥

👉 Book & Redeem here: ${siteUrl}
📍 Hub: Opposite Bharat Petroleum, Main Road, Chota Gamharia, Jamshedpur
✨ Free sanitized helmet & instant WhatsApp verification!`;

  return target
    ? `https://wa.me/${target}?text=${encodeURIComponent(text)}`
    : `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/**
 * WhatsApp message sent directly to the booking user with their personal referral code
 */
export function generateWhatsAppReferralSelfUrl(code: string, phone: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const siteUrl = VROOMMATE_SITE_URL;

  const text = `🎉 *Your Vroommate Referral Code is Ready!*
----------------------------------------
🔑 *Your Referral Code:* *${code}*

🎁 *How the 20% Discount Works:*
1. *For You (Sender):* Share this code with *3 friends* on WhatsApp. As soon as you share with 3 people, you unlock *20% FLAT DISCOUNT* on your next booking (automatically applied, valid once)!
2. *For Friends:* Tell them: *Hurry or someone else will claim the offer!* 🔥

👉 *Share link with your 3 friends:*
Hey! Rent scooties & bikes in Chota Gamharia with Vroommate. Use my code *${code}* for 20% OFF! ⚡ Hurry or someone else will claim the offer! 👉 ${siteUrl}

Thank you for choosing Vroommate! 🏍️💨`;

  return targetPhone
    ? `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`
    : `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/**
 * WhatsApp message sent to sender confirming 20% discount unlocked after 3 shares
 */
export function generateWhatsAppUnlockNotificationUrl(code: string, phone = ''): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const siteUrl = VROOMMATE_SITE_URL;

  const text = `🎉 *CONGRATULATIONS! YOUR 20% DISCOUNT IS UNLOCKED!* 🏍️
----------------------------------------
You have successfully sent your referral code *${code}* to 3 people!

🎁 *Your Reward:*
• *20% FLAT OFF* on your next booking with Vroommate.
• It will be *automatically applied* while booking your ride!
• Valid for just once.

🔥 *Friends' Notice:* Remind your friends: *Hurry or someone else will claim the offer!*

👉 *Book your ride with 20% OFF:* ${siteUrl}
(Chota Gamharia Hub · Opposite Bharat Petroleum)`;

  return targetPhone
    ? `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`
    : `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/**
 * Called when a booking is confirmed to finalize referral state:
 * - Generates user's personal referral code on first booking
 * - If receiver used a friend's code:
 *   - Marks code as consumed globally (so other friends cannot use it: "Hurry or someone else will claim the offer!")
 *   - Marks receiver discount used for this user (discount just once)
 * - If sender used their automatic reward on this booking:
 *   - Marks sender discount as used (sender gets 20% discount just once)
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
  const isFirst = !profile.isCodeGenerated || !profile.myReferralCode;

  // 1. Generate personal referral code strictly after first booking
  if (isFirst || !profile.myReferralCode) {
    const code = generatePersonalReferralCode(bookingId);
    profile.myReferralCode = code;
    profile.isCodeGenerated = true;
  }

  // 2. If receiver used a friend's code:
  if (appliedCode) {
    profile.receiverDiscountUsed = true;
    profile.appliedReferralCode = appliedCode;
    markCodeAsConsumed(appliedCode);
  }

  // 3. If sender used their automatic 20% reward on this booking:
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
