import React, { useState } from 'react';
import { MapPin, Clock, Phone, MessageCircle, ShieldCheck, Heart, FileSignature, Gift, Copy, Check } from 'lucide-react';
import { BUSINESS_CONFIG } from '../data/fleetData';
import { generateDirectWhatsAppInquiry } from '../utils/whatsapp';
import { VroomMateLogo } from './VroomMateLogo';
import { toast } from 'sonner';

interface FooterProps {
  onOpenAgreement?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAgreement }) => {
  const [copied, setCopied] = useState(false);

  const referralShareText = `Hey! Need a self-drive bike or scooty in Chota Gamharia? Check out VroomMate Rides (Opp. Bharat Petroleum). Book via WhatsApp: https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent('Hi! My friend referred me to VroomMate Rides for a ride reservation.')}`;

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralShareText);
    setCopied(true);
    toast.success('Referral message copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <footer id="contact" className="border-t border-white/10 bg-black text-slate-300">
      {/* Refer a Friend Reward Program Section */}
      <div className="border-b border-white/10 bg-gradient-to-r from-[#111722] via-[#16202e] to-[#111722] py-12">
        <div className="max-w-6xl mx-auto px-5">
          <div className="relative rounded-3xl p-6 sm:p-8 md:p-10 bg-[#0d1117]/85 border border-[#39ff88]/30 overflow-hidden shadow-2xl">
            {/* Ambient Background Glows */}
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#39ff88]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#ff7a1a]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Reward Program Details */}
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#39ff88]/15 text-[#39ff88] border border-[#39ff88]/30">
                  <Gift className="w-3.5 h-3.5" />
                  <span>Rider Rewards Program</span>
                </div>

                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
                  Refer a Friend &amp; <span className="text-[#39ff88]">Earn Ride Rewards!</span>
                </h3>

                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
                  Introduce your friends, classmates (NIT Jamshedpur, Arka Jain), or colleagues in Chota Gamharia &amp; Jamshedpur to VroomMate Rides.
                  When they take their first self-drive ride, both of you unlock exclusive rental perks!
                </p>

                {/* 3-Step Program Outline */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="bg-[#161c26] rounded-2xl p-3.5 border border-white/5 flex flex-col justify-between">
                    <div className="w-7 h-7 rounded-lg bg-[#39ff88]/15 text-[#39ff88] flex items-center justify-center font-bold text-xs mb-2">
                      01
                    </div>
                    <div className="font-bold text-white text-xs">Share with Friends</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Send your referral message on WhatsApp or social media.</div>
                  </div>

                  <div className="bg-[#161c26] rounded-2xl p-3.5 border border-white/5 flex flex-col justify-between">
                    <div className="w-7 h-7 rounded-lg bg-[#ff7a1a]/15 text-[#ff7a1a] flex items-center justify-center font-bold text-xs mb-2">
                      02
                    </div>
                    <div className="font-bold text-white text-xs">Friend Books a Ride</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">They mention your name &amp; phone number during booking.</div>
                  </div>

                  <div className="bg-[#161c26] rounded-2xl p-3.5 border border-white/5 flex flex-col justify-between">
                    <div className="w-7 h-7 rounded-lg bg-[#39ff88]/15 text-[#39ff88] flex items-center justify-center font-bold text-xs mb-2">
                      03
                    </div>
                    <div className="font-bold text-white text-xs">Both Get Perks</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">You earn ₹100 credit on your next ride; they get a free 2nd helmet!</div>
                  </div>
                </div>
              </div>

              {/* Right Column: Instant Share Card */}
              <div className="lg:col-span-5 bg-[#161c26] border border-white/10 rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2.5">
                    <span className="font-bold uppercase tracking-wider text-slate-300">Quick Referral Message</span>
                    <span className="text-[#39ff88] font-bold text-[11px]">Instant WhatsApp Invite</span>
                  </div>

                  <div className="bg-[#0d1117] p-3.5 rounded-xl border border-white/5 text-xs text-slate-300 leading-relaxed select-all font-mono">
                    "Hey! Rent self-drive bikes &amp; scooties in Chota Gamharia with VroomMate Rides (Opp. Bharat Petroleum). Mention my name for bonus perks! WhatsApp: {BUSINESS_CONFIG.displayPhone}"
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(referralShareText)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-[#39ff88] text-[#0d1117] hover:bg-[#4dff93] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#39ff88]/20"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Share on WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyReferral}
                    className="py-3 px-4 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/15 text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-[#39ff88]" /> : <Copy className="w-4 h-4 text-slate-300" />}
                    <span>{copied ? 'Copied!' : 'Copy Message'}</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-400">
                  * Reward credits are linked to your phone number and automatically redeemed upon vehicle pickup at our Chota Gamharia hub.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

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
