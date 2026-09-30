/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FleetSection } from './components/FleetSection';
import { FareCalculator } from './components/FareCalculator';
import { HowItWorks } from './components/HowItWorks';
import { LocationSection } from './components/LocationSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { FAQSection } from './components/FAQSection';
import { ReferralSection } from './components/ReferralSection';
import { DiscountUnlockedCelebrationModal } from './components/DiscountUnlockedCelebrationModal';
import { Footer } from './components/Footer';
import { BookingModal } from './components/BookingModal';
import { VehicleSpecsModal } from './components/VehicleSpecsModal';
import { MyBookingsDrawer } from './components/MyBookingsDrawer';
import { RentalAgreementModal } from './components/RentalAgreementModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Vehicle, Booking } from './types';
import { getSavedBookings } from './utils/whatsapp';
import { Toaster } from 'sonner';

export default function App() {
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedVehicleForBooking, setSelectedVehicleForBooking] = useState<Vehicle | null>(null);
  const [calculatorConfig, setCalculatorConfig] = useState<{
    rentalType: 'daily' | 'hourly';
    duration: number;
    extraHelmet: boolean;
    doorstepDelivery: boolean;
  }>({
    rentalType: 'daily',
    duration: 1,
    extraHelmet: false,
    doorstepDelivery: false,
  });
  const [initialReferralCode, setInitialReferralCode] = useState<string>('');

  const [specsModalVehicle, setSpecsModalVehicle] = useState<Vehicle | null>(null);
  const [myBookingsOpen, setMyBookingsOpen] = useState(false);
  const [savedBookings, setSavedBookings] = useState<Booking[]>([]);

  // Celebration Modal State
  const [celebrationModalOpen, setCelebrationModalOpen] = useState(false);
  const [celebrationDetails, setCelebrationDetails] = useState({
    title: '20% DISCOUNT UNLOCKED!',
    subtitle: 'You have shared your referral with 3 people! Your 20% discount is now active and will automatically apply on your next booking.',
  });

  const handleOpenCelebration = (info: { title: string; subtitle: string }) => {
    setCelebrationDetails(info);
    setCelebrationModalOpen(true);
  };

  // Rental Agreement State
  const [agreementModalOpen, setAgreementModalOpen] = useState(false);
  const [selectedBookingForAgreement, setSelectedBookingForAgreement] = useState<Booking | null>(null);

  // Load saved bookings from localStorage
  const refreshBookings = () => {
    setSavedBookings(getSavedBookings());
  };

  useEffect(() => {
    refreshBookings();
  }, []);

  const handleOpenAgreement = (booking?: Booking | null) => {
    setSelectedBookingForAgreement(booking || null);
    setAgreementModalOpen(true);
  };

  const handleSelectVehicleForBooking = (vehicle: Vehicle) => {
    setSelectedVehicleForBooking(vehicle);
    setCalculatorConfig({
      rentalType: 'daily',
      duration: 1,
      extraHelmet: false,
      doorstepDelivery: false,
    });
    setInitialReferralCode('');
    setBookingModalOpen(true);
  };

  const handleCalculatorProceed = (config: {
    vehicle: Vehicle;
    rentalType: 'daily' | 'hourly';
    duration: number;
    extraHelmet: boolean;
    doorstepDelivery: boolean;
    total: number;
    referralCode?: string;
  }) => {
    setSelectedVehicleForBooking(config.vehicle);
    setCalculatorConfig({
      rentalType: config.rentalType,
      duration: config.duration,
      extraHelmet: config.extraHelmet,
      doorstepDelivery: config.doorstepDelivery,
    });
    setInitialReferralCode(config.referralCode || '');
    setBookingModalOpen(true);
  };

  const handleClearBooking = (id: string) => {
    try {
      const remaining = savedBookings.filter((b) => b.id !== id);
      localStorage.setItem('ghoomify_rides_bookings_v1', JSON.stringify(remaining));
      setSavedBookings(remaining);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col font-sans selection:bg-[#2ea043] selection:text-[#0d1117]">
      {/* Navigation */}
      <Navbar
        onOpenBookings={() => setMyBookingsOpen(true)}
        savedBookingsCount={savedBookings.length}
        onOpenBookingModal={() => {
          setSelectedVehicleForBooking(null);
          setBookingModalOpen(true);
        }}
        onOpenAgreement={() => handleOpenAgreement()}
      />

      {/* Main Content Sections */}
      <main id="top" className="flex-1">
        <Hero
          onExploreFleet={() => {
            const el = document.getElementById('fleet');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onOpenBookingModal={() => setBookingModalOpen(true)}
        />

        <FleetSection
          onSelectVehicleForBooking={handleSelectVehicleForBooking}
          onOpenSpecsModal={(v) => setSpecsModalVehicle(v)}
        />

        <FareCalculator onProceedToBooking={handleCalculatorProceed} />

        <HowItWorks onOpenAgreement={() => handleOpenAgreement()} />

        {/* Referral Discount Section - Placed directly below Rules & Regulations */}
        <ReferralSection
          onOpenBookingModal={(prefilledCode) => {
            if (prefilledCode) {
              setInitialReferralCode(prefilledCode);
            }
            setSelectedVehicleForBooking(null);
            setBookingModalOpen(true);
          }}
          onOpenCelebrationModal={handleOpenCelebration}
        />

        <LocationSection />

        <TestimonialsSection />

        <FAQSection />
      </main>

      {/* Footer */}
      <Footer onOpenAgreement={() => handleOpenAgreement()} />

      {/* Floating WhatsApp Quick Action Button */}
      <FloatingWhatsApp />

      {/* Interactive Modals */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        initialVehicle={selectedVehicleForBooking}
        initialRentalType={calculatorConfig.rentalType}
        initialDuration={calculatorConfig.duration}
        initialExtraHelmet={calculatorConfig.extraHelmet}
        initialDoorstep={calculatorConfig.doorstepDelivery}
        initialReferralCode={initialReferralCode}
        onBookingCreated={() => {
          refreshBookings();
        }}
        onOpenAgreement={(booking?: Booking | null) => {
          handleOpenAgreement(booking);
        }}
      />

      <VehicleSpecsModal
        vehicle={specsModalVehicle}
        onClose={() => setSpecsModalVehicle(null)}
        onBookNow={(vehicle) => {
          setSpecsModalVehicle(null);
          handleSelectVehicleForBooking(vehicle);
        }}
      />

      <MyBookingsDrawer
        isOpen={myBookingsOpen}
        onClose={() => setMyBookingsOpen(false)}
        bookings={savedBookings}
        onClearBooking={handleClearBooking}
        onOpenAgreement={(booking: Booking) => {
          handleOpenAgreement(booking);
        }}
      />

      <RentalAgreementModal
        isOpen={agreementModalOpen}
        onClose={() => setAgreementModalOpen(false)}
        initialBooking={selectedBookingForAgreement}
      />

      <DiscountUnlockedCelebrationModal
        isOpen={celebrationModalOpen}
        onClose={() => setCelebrationModalOpen(false)}
        title={celebrationDetails.title}
        subtitle={celebrationDetails.subtitle}
        onActionClick={() => {
          setCelebrationModalOpen(false);
          setBookingModalOpen(true);
        }}
        actionText="Book Ride with 20% OFF"
      />

      {/* Global Toast Notification System */}
      <Toaster
        position="top-right"
        theme="dark"
        richColors
        closeButton
        toastOptions={{
          style: {
            background: '#161c26',
            borderColor: '#263041',
            color: '#f8fafc',
          },
        }}
      />
    </div>
  );
}
