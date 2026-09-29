export type VehicleCategory = 'all' | 'scooty' | 'sport' | 'commuter' | 'cruiser';

export interface Vehicle {
  id: string;
  name: string;
  subtitle: string;
  category: 'scooty' | 'sport' | 'commuter' | 'cruiser';
  pricePerDay: number;
  pricePerHour: number;
  pricePerWeek: number;
  securityDeposit: number;
  image: string;
  tag: string;
  engine: string;
  mileage: string;
  transmission: string;
  fuelCapacity: string;
  freeKmPerDay: number;
  extraKmRate: number;
  features: string[];
  description: string;
  popular?: boolean;
  available: boolean;
  isAvailable?: boolean;
  rating: number;
  reviewCount: number;
}

export interface Booking {
  id: string;
  vehicleId: string;
  vehicleName: string;
  rentalType: 'daily' | 'hourly';
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  duration: number; // in days or hours
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  hasDrivingLicense: boolean;
  helmetCount: number; // 1 free, +1 extra
  deliveryType: 'hub_pickup' | 'doorstep';
  deliveryAddress?: string;
  baseFare: number;
  addonsCost: number;
  referralDiscount?: number;
  referralCode?: string;
  referralDiscountType?: 'sender_reward' | 'receiver_code';
  totalAmount: number;
  securityDeposit: number;
  status: 'pending_whatsapp' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface RentalAgreementData {
  bookingId: string;
  customerName: string;
  customerPhone: string;
  vehicleName: string;
  pickupDate: string;
  pickupTime: string;
  returnDate?: string;
  returnTime?: string;
  totalAmount?: number;
  securityDeposit?: number;
  signingMode: 'digital' | 'office';
  signatureImageUrl?: string;
  signatureFileName?: string;
  signedAt: string;
  isAgreed: boolean;
  agreementHash?: string;
}

export interface Review {
  id: string;
  author: string;
  role: string; // e.g. "NIT Jamshedpur Student"
  rating: number;
  date: string;
  vehicle: string;
  comment: string;
  verified: boolean;
}

export interface FAQ {
  question: string;
  answer: string;
  category: 'booking' | 'docs' | 'charges' | 'safety';
}
