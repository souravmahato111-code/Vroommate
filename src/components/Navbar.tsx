import React, { useState } from 'react';
import { Bike, MessageCircle, CalendarCheck, Menu, X, PhoneCall } from 'lucide-react';
import { BUSINESS_CONFIG } from '../data/fleetData';
import { generateDirectWhatsAppInquiry } from '../utils/whatsapp';
import { VroomMateLogo } from './VroomMateLogo';

interface NavbarProps {
  onOpenBookings: () => void;
  savedBookingsCount: number;
  onOpenBookingModal: () => void;
  onOpenAgreement?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenBookings,
  savedBookingsCount,
  onOpenBookingModal,
  onOpenAgreement,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Fleet', href: '#fleet' },
    { label: 'Fare Calculator', href: '#calculator' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Referral 20% OFF', href: '#referral' },
    { label: 'Reviews', href: '#reviews' },
    { label: 'Hub Location', href: '#location' },
    { label: 'FAQs', href: '#faqs' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#000000] transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 min-h-[66px] sm:min-h-[74px] md:min-h-[80px] lg:min-h-[84px] py-1.5 sm:py-2 flex items-center justify-between gap-3 sm:gap-4">
        {/* Zone 1: Official Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="#top"
            className="flex items-center group focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff7a1a] rounded-xl transition-transform hover:scale-[1.02]"
            aria-label="VroomMate Rides Home"
          >
            <VroomMateLogo
              variant="horizontal"
              alt="Vroommate Logo"
            />
          </a>
        </div>

        {/* Zone 2: Clean text navigation links */}
        <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-slate-300 hover:text-white text-sm font-medium transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#39ff88] hover:after:w-full after:transition-all"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenBookings}
            className="relative px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center gap-2"
            title="View saved booking slips"
          >
            <CalendarCheck className="w-4 h-4 text-[#39ff88]" />
            <span className="hidden sm:inline">My Rides</span>
            {savedBookingsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[11px] font-bold bg-[#ff7a1a] text-white">
                {savedBookingsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenBookingModal}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs md:text-sm font-bold bg-[#39ff88] text-[#0d1117] hover:bg-[#4dff93] transition-all transform hover:-translate-y-0.5 whitespace-nowrap"
          >
            <span>Book a Ride</span>
          </button>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-10 h-10 rounded-xl grid place-items-center border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label="Mobile Navigation"
          className="lg:hidden border-t border-white/10 bg-[#0d1117] px-5 py-5 space-y-3"
        >
          <div className="flex flex-col gap-2 pb-3 border-b border-white/10">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-slate-200 hover:text-[#39ff88] font-medium text-base transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBookingModal();
              }}
              className="w-full py-3 rounded-xl font-bold bg-[#ff7a1a] text-[#0d1117] flex items-center justify-center gap-2 text-sm"
            >
              <Bike className="w-4 h-4" />
              <span>Reserve a Ride Now</span>
            </button>

            <a
              href={generateDirectWhatsAppInquiry()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-xl font-bold bg-[#39ff88] text-[#0d1117] flex items-center justify-center gap-2 text-sm"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Direct WhatsApp Chat</span>
            </a>

            <a
              href={`tel:${BUSINESS_CONFIG.phone}`}
              className="w-full py-2.5 rounded-xl font-medium text-slate-300 bg-white/5 border border-white/10 flex items-center justify-center gap-2 text-xs"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#ff7a1a]" />
              <span>Call Hub: {BUSINESS_CONFIG.displayPhone}</span>
            </a>
          </div>
        </nav>
      )}
    </header>
  );
};
