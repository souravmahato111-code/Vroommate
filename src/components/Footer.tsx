import React from 'react';
import { MapPin, Clock, Phone, MessageCircle, ShieldCheck, Heart, Gift, FileSignature } from 'lucide-react';
import { BUSINESS_CONFIG } from '../data/fleetData';
import { generateDirectWhatsAppInquiry } from '../utils/whatsapp';
import { VroomMateLogo } from './VroomMateLogo';

interface FooterProps {
  onOpenAgreement?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAgreement }) => {
  return (
    <footer id="contact" className="border-t border-white/10 bg-black text-slate-300">
      <div className="max-w-6xl mx-auto px-5 py-16 grid md:grid-cols-12 gap-10 items-start">
        {/* Brand Info */}
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center">
            <VroomMateLogo variant="horizontal" alt="Vroommate Logo" />
          </div>

          <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
            Self-drive bike and scooty rentals in Chota Gamharia by VroomMate Rides. Transparent hourly &amp; daily rates,
            free sanitized helmets, and instant WhatsApp verification.
          </p>

          <div className="flex items-center gap-3 text-xs text-slate-400 pt-2">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#39ff88]" />
              <span>Govt. Registered Hub</span>
            </div>
            <span aria-hidden="true">·</span>
            <span>Opp. Bharat Petroleum</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="md:col-span-3 space-y-3">
          <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">
            Quick Navigation
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <a href="#referral" className="text-[#39ff88] hover:underline font-bold flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 shrink-0" />
                <span>Referral Program (20% Off)</span>
              </a>
            </li>
            {onOpenAgreement && (
              <li>
                <button
                  type="button"
                  onClick={onOpenAgreement}
                  className="hover:text-[#39ff88] transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                >
                  <FileSignature className="w-3.5 h-3.5 text-[#39ff88] shrink-0" />
                  <span>Digital Rental Agreement (Sign)</span>
                </button>
              </li>
            )}
            <li>
              <a href="#fleet" className="hover:text-[#39ff88] transition-colors">
                Available Fleet &amp; Rates
              </a>
            </li>
            <li>
              <a href="#calculator" className="hover:text-[#39ff88] transition-colors">
                Real-Time Fare Calculator
              </a>
            </li>
            <li>
              <a href="#how-it-works" className="hover:text-[#39ff88] transition-colors">
                How It Works &amp; Rules
              </a>
            </li>
            <li>
              <a href="#location" className="hover:text-[#39ff88] transition-colors">
                Hub Address &amp; Directions
              </a>
            </li>
            <li>
              <a href="#faqs" className="hover:text-[#39ff88] transition-colors">
                Rental FAQs &amp; Requirements
              </a>
            </li>
          </ul>
        </div>

        {/* Hub Contact & WhatsApp Action */}
        <div className="md:col-span-4 space-y-4">
          <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">
            Hub Location &amp; Hours
          </h4>

          <div className="space-y-2.5 text-xs text-slate-300">
            <a
              href={BUSINESS_CONFIG.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2.5 hover:text-[#39ff88] transition-colors group"
            >
              <MapPin className="w-4 h-4 text-[#ff7a1a] shrink-0 mt-0.5 group-hover:text-[#39ff88] transition-colors" />
              <span>{BUSINESS_CONFIG.address} <span className="text-[#39ff88] underline block mt-0.5 font-medium">Get Directions (Google Maps)</span></span>
            </a>

            <p className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-[#ff7a1a] shrink-0" />
              <span>{BUSINESS_CONFIG.hours}</span>
            </p>

            <p className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-[#ff7a1a] shrink-0" />
              <a href={`tel:${BUSINESS_CONFIG.phone}`} className="hover:text-[#39ff88] transition-colors">
                {BUSINESS_CONFIG.displayPhone}
              </a>
            </p>
          </div>

          <div className="pt-2">
            <a
              href={generateDirectWhatsAppInquiry()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-xs md:text-sm bg-[#39ff88] text-[#0d1117] hover:bg-[#4dff93] shadow-md shadow-[#39ff88]/20 transition-all transform hover:-translate-y-0.5"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Chat with Us on WhatsApp to Book</span>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-6">
        <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© 2026 VroomMate Rides. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <span>Crafted for smooth rides in Chota Gamharia &amp; Jamshedpur</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
