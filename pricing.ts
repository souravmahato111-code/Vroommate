import { Vehicle } from '../types';

/**
 * Calculates security deposit charged strictly ONCE per rental booking:
 * - Scooty & Centuro: Flat ₹700 once for daily bookings (₹1,000 for 1-week rental; ₹500 for hourly)
 * - Yamaha FZ: Flat ₹1,000 once for daily bookings (₹1,500 for 1-week rental; ₹500 for hourly)
 * - Royal Enfield / Cruiser: Flat ₹1,500 once for booking (₹2,000 for 1-week rental; ₹1,000 for hourly)
 * Charged just once per rental booking, 100% refunded upon return.
 */
export function getVehicleSecurityDeposit(
  vehicleId: string,
  rentalType: 'daily' | 'hourly',
  duration?: number
): number {
  const isWeek = rentalType === 'daily' && (duration ?? 1) >= 7;

  if (vehicleId === 'scooty-activa' || vehicleId === 'bike-centuro' || vehicleId === 'bike-splendor') {
    if (rentalType === 'hourly') return 500;
    return isWeek ? 1000 : 700;
  }

  if (vehicleId === 'bike-yamaha-fz' || vehicleId === 'bike-apache') {
    if (rentalType === 'hourly') return 500;
    return isWeek ? 1500 : 1000;
  }

  if (vehicleId === 'bike-cruiser-classic') {
    if (rentalType === 'hourly') return 1000;
    return isWeek ? 2000 : 1500;
  }

  return isWeek ? 1000 : 700;
}

/**
 * Returns structured security deposit breakdown for display in vehicle cards & modals:
 * Security Deposits (100% Refundable): Just once per booking - amount/Hourly, Amount/Day, Amount/Week
 */
export function getVehicleDepositBreakdown(vehicleId: string): {
  hourly: number;
  daily: number;
  weekly: number;
  summaryText: string;
} {
  if (vehicleId === 'bike-yamaha-fz' || vehicleId === 'bike-apache') {
    return {
      hourly: 500,
      daily: 1000,
      weekly: 1500,
      summaryText: '₹500/Hourly, ₹1,000/Day, ₹1,500/Week',
    };
  }

  if (vehicleId === 'bike-cruiser-classic') {
    return {
      hourly: 1000,
      daily: 1500,
      weekly: 2000,
      summaryText: '₹1,000/Hourly, ₹1,500/Day, ₹2,000/Week',
    };
  }

  return {
    hourly: 500,
    daily: 700,
    weekly: 1000,
    summaryText: '₹500/Hourly, ₹700/Day, ₹1,000/Week',
  };
}

/**
 * Calculates rental base fare with special 7-day weekly package prices:
 * - Yamaha FZ: ₹3,900 for 7 days (saves ₹1,000)
 * - Scooty: ₹2,400 for 7 days (saves ₹750)
 * - Centuro: ₹2,100 for 7 days (saves ₹700)
 */
export function calculateRentalBaseFare(
  vehicle: Vehicle,
  rentalType: 'daily' | 'hourly',
  duration: number
): number {
  if (rentalType === 'hourly') {
    return vehicle.pricePerHour * duration;
  }

  const days = Math.min(7, Math.max(1, duration));
  if (days === 7 && vehicle.pricePerWeek) {
    return vehicle.pricePerWeek;
  }

  return vehicle.pricePerDay * days;
}

export function isWeeklyDiscountActive(
  rentalType: 'daily' | 'hourly',
  duration: number
): boolean {
  return rentalType === 'daily' && duration >= 7;
}

export function getSavingsOnWeeklyPackage(
  vehicle: Vehicle,
  rentalType: 'daily' | 'hourly',
  duration: number
): number {
  if (rentalType === 'daily' && duration >= 7 && vehicle.pricePerWeek) {
    const regularCost = vehicle.pricePerDay * 7;
    return Math.max(0, regularCost - vehicle.pricePerWeek);
  }
  return 0;
}

/**
 * Calculates extra pillion helmet cost:
 * - Hourly: ₹50
 * - Daily (1-6 days): ₹50 per day
 * - Weekly package (7 days): ₹200 (discounted from ₹350)
 */
export function calculateExtraHelmetCost(
  rentalType: 'daily' | 'hourly',
  duration: number
): number {
  if (rentalType === 'hourly') {
    return 50;
  }
  const days = Math.min(7, Math.max(1, duration));
  if (days >= 7) {
    return 200;
  }
  return 50 * days;
}
