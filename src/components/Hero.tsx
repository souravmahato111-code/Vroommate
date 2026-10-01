import React from 'react';
import { ArrowRight, Calculator, ShieldCheck, Clock, Award, Fuel, Sparkles } from 'lucide-react';
import { BUSINESS_CONFIG } from '../data/fleetData';
import { VroomMateLogo } from './VroomMateLogo';

interface HeroProps {
  onExploreFleet: () => void;
  onOpenBookingModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreFleet, onOpenBookingModal }) => {
  return (
    <section className="grid-bg relative overflow-hidden bg-gradient-to-b from-black via-[#0c121d] to-[#0d1117] border-b border-white/5">
      <div className="max-w-6xl mx-auto px-5 pt-12 pb-16 md:pt-20 md:pb-24 grid md:grid-cols-12 gap-10 lg:gap-14 items-center">
        {/* Left Column: Value Proposition */}
        <div className="md:col-span-7 flex flex-col items-start">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm text-xs md:text-sm text-slate-200">
            <span className="w-2 h-2 rounded-full bg-[#43f92f] animate-pulse"></span>
            <span className="font-medium">Chota Gamharia Hub Open · 8:00 AM – 8:00 PM</span>
          </div>

          <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white mt-6 leading-[1.12] tracking-tight">
            Your Mate for <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-[#43f92f]">
              Every Ride!
            </span>
          </h1>

          <p className="mt-5 text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl">
            Affordable and well-maintained Scooties, Commuter Bikes, and Sporty Rides available for
            daily and hourly rentals in Chota Gamharia. Zero paperwork headaches, free sanitized
            helmets, and instant WhatsApp booking.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-4 w-full sm:w-auto">
            <button
              type="button"
              onClick={onExploreFleet}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-bold text-base bg-[#ff7a1a] text-[#0d1117] hover:bg-[#ff8c38] shadow-lg shadow-[#ff7a1a]/25 hover:shadow-xl hover:shadow-[#ff7a1a]/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Browse Fleet &amp; Book</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <a
              href="#calculator"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-bold text-base bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Calculator className="w-5 h-5 text-[#43f92f]" />
              <span>Estimate Fare</span>
            </a>
          </div>

          {/* Micro trust indicators */}
          <div className="mt-10 pt-6 border-t border-white/10 w-full grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#43f92f] shrink-0" />
              <span>100% Refundable Security Deposit</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#ff7a1a] shrink-0" />
              <span>Hourly &amp; Daily Plans</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#43f92f] shrink-0" />
              <span>Free Sanitized Helmets</span>
            </div>
            <div className="flex items-center gap-2">
              <Fuel className="w-4 h-4 text-[#ff7a1a] shrink-0" />
              <span>From ₹33/Hr · ₹450/Day</span>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Anchor */}
        <div className="md:col-span-5 relative">
          <div className="relative rounded-3xl p-1 bg-gradient-to-tr from-[#43f92f]/30 via-white/5 to-[#ff7a1a]/30 shadow-2xl">
            <div className="relative overflow-hidden rounded-[22px] bg-[#161c26] aspect-[4/3] sm:aspect-[16/11]">
              <img
                src="https://images.pexels.com/photos/32206238/pexels-photo-32206238.jpeg?auto=compress&cs=tinysrgb&w=1280"
                alt="Motorcyclist riding a sports bike on open road during sunset"
                loading="eager"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                onError={(e) => {
                  // Fallback container if remote image fails
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />

              {/* Styled CSS Fallback in case of image failure */}
              <div
                style={{ display: 'none' }}
                className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#161c26] via-[#1a2332] to-[#122019] text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#43f92f]/15 border border-[#43f92f]/40 grid place-items-center mb-4 text-[#43f92f]">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="font-display font-bold text-xl text-white">VroomMate Rides</h3>
                <p className="text-slate-400 text-xs mt-1">Best Two-Wheeler Rentals in Chota Gamharia</p>
              </div>

              {/* Float badge */}
              <div className="absolute bottom-2.5 left-2.5 sm:bottom-3 sm:left-3 bg-[#0d1117]/90 backdrop-blur-md border border-white/10 rounded-xl py-1.5 px-2.5 sm:py-2 sm:px-3 flex items-center gap-2 shadow-lg">
                <div className="w-7 h-6 sm:w-8 sm:h-7 rounded-lg bg-black border border-[#43f92f]/40 grid place-items-center shrink-0 p-1 overflow-hidden">
                  <VroomMateLogo variant="icon" alt="Vroommate Logo" />
                </div>
                <div>
                  <div className="text-[11px] sm:text-xs font-bold text-white leading-tight flex items-center gap-1">
                    <span>Vroommate Hub</span>
                  </div>
                  <div className="text-[9.5px] sm:text-[10.5px] text-slate-400 flex items-center gap-1 leading-tight mt-0.5">
                    <span>Opp. Bharat Petroleum</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#43f92f] font-semibold">4.9 ★ (350+ Rides)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animated road centerline */}
      <div className="road-line w-full opacity-70" aria-hidden="true"></div>
    </section>
  );
};
