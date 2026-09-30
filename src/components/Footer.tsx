import React from 'react';
import { MapPin, Clock, Phone, ShieldCheck, Heart } from 'lucide-react';
import { BUSINESS_CONFIG } from '../data/fleetData';
import { VroomMateLogo } from './VroomMateLogo';

interface FooterProps {
  onOpenAgreement?: () => void;
}

export const Footer: React.FC<FooterProps> = () => {
  return (
    <footer id="contact" className="border-t border-white/10 bg-black text-slate-300">
      <div className="max-w-6xl mx-auto px-5 py-16 grid md:grid-cols-12 gap-10 items-start">
        {/* Brand Info */}
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center">
            <VroomMateLogo variant="horizontal" alt="Vroommate Logo" />
          </div>

          <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
            Self-drive bike and scooty rentals in Chota Gamharia by Vroommate Rides. Transparent hourly &amp; daily rates,
            free sanitized helmets, and instant WhatsApp verification.
          </p>

          <div className="flex items-center gap-3 text-xs text-slate-400 pt-2">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#00FF1F]" />
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
              <a href="#fleet" className="hover:text-[#00FF1F] transition-colors">
                Our Fleet &amp; Pricing
              </a>
            </li>
            <li>
              <a href="#calculator" className="hover:text-[#00FF1F] transition-colors">
                Fare Calculator
              </a>
            </li>
            <li>
              <a href="#how-it-works" className="hover:text-[#00FF1F] transition-colors">
                How It Works
              </a>
            </li>
            <li>
              <a href="#referral" className="hover:text-[#00FF1F] transition-colors">
                Refer &amp; Earn Program
              </a>
            </li>
            <li>
              <a href="#location" className="hover:text-[#00FF1F] transition-colors">
                Hub Location &amp; Map
              </a>
            </li>
            <li>
              <a href="#faqs" className="hover:text-[#00FF1F] transition-colors">
                FAQs
              </a>
            </li>
          </ul>
        </div>

        {/* Contact & Hours */}
        <div className="md:col-span-4 space-y-3">
          <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">
            Hub Contact &amp; Hours
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#ff7a1a] shrink-0 mt-0.5" />
              <span>
                <strong>Vroommate Hub:</strong> Opposite Bharat Petroleum, Main Road, Chota Gamharia, Jamshedpur, Jharkhand - 832108
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#00FF1F] shrink-0" />
              <span>Open Daily: 8:00 AM to 8:00 PM (Instant Pickup)</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#00FF1F] shrink-0" />
              <a href={`tel:${BUSINESS_CONFIG.phone}`} className="hover:text-white transition-colors">
                {BUSINESS_CONFIG.displayPhone}
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5 py-6">
        <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <p>© {new Date().getFullYear()} Vroommate. All rights reserved. Chota Gamharia, Jamshedpur.</p>
            <span className="hidden sm:inline text-white/20">•</span>
            <p className="text-[#00FF1F] font-bold italic tracking-wide">
              Wanna Ghoom? Just do Vroom!
            </p>
          </div>
          <p className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>Crafted for smooth rides in Gamharia and Jamshedpur.</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
