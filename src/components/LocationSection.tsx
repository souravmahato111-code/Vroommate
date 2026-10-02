import React from 'react';
import { MapPin, Clock, Phone, Navigation, ExternalLink, CheckCircle2 } from 'lucide-react';
import { BUSINESS_CONFIG } from '../data/fleetData';
import { generateDirectWhatsAppInquiry } from '../utils/whatsapp';
import { useScrollReveal } from '../hooks/useScrollReveal';

export const LocationSection: React.FC = () => {
  const { ref, isVisible } = useScrollReveal<HTMLElement>({
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px',
  });

  return (
    <section
      ref={ref}
      id="location"
      className={`py-20 bg-[#0d1117] border-b border-white/5 scroll-mt-20 transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center max-w-2xl mx-auto">
          <p className="uppercase tracking-[0.2em] font-bold text-xs md:text-sm text-[#2bff8e]">
            Hub Location &amp; Directions
          </p>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white mt-3">
            Visit Our Chota Gamharia Hub
          </h2>
          <p className="mt-3 text-slate-400 text-sm md:text-base">
            Conveniently situated right on the main commercial road, directly opposite Bharat Petroleum.
          </p>
        </div>

        <div className="mt-12 grid lg:grid-cols-12 gap-8 items-stretch">
          {/* Contact & Hours Info */}
          <div className="lg:col-span-5 bg-[#161c26] border border-[#263041] rounded-3xl p-7 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#ff7a1a] font-bold">
                  Central Hub Address
                </span>
                <div className="flex gap-3.5 mt-2 items-start">
                  <div className="w-10 h-10 rounded-xl bg-[#ff7a1a]/15 text-[#ff7a1a] grid place-items-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{BUSINESS_CONFIG.name}</h3>
                    <a
                      href={BUSINESS_CONFIG.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-300 hover:text-[#2bff8e] text-sm mt-1 leading-relaxed block transition-colors"
                      title="Click to open directions"
                    >
                      {BUSINESS_CONFIG.address}
                    </a>
                    <p className="text-xs text-[#2bff8e] mt-1 font-semibold">
                      Opposite Bharat Petroleum Petrol Pump
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                  Rental Timings
                </span>
                <div className="flex gap-3.5 mt-2 items-center">
                  <div className="w-10 h-10 rounded-xl bg-[#2bff8e]/15 text-[#2bff8e] grid place-items-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">Every Day of the Week</div>
                    <div className="text-slate-300 text-xs">8:00 AM – 8:00 PM (Monday to Sunday)</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                  Direct Helpline
                </span>
                <div className="flex gap-3.5 mt-2 items-center">
                  <div className="w-10 h-10 rounded-xl bg-white/10 text-white grid place-items-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <a
                      href={`tel:${BUSINESS_CONFIG.phone}`}
                      className="text-[#2bff8e] hover:underline font-display font-bold text-base"
                    >
                      {BUSINESS_CONFIG.displayPhone}
                    </a>
                    <div className="text-slate-400 text-xs">Instant Call &amp; WhatsApp Support</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-3">
              <a
                href={BUSINESS_CONFIG.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs md:text-sm bg-[#ff7a1a] text-[#0d1117] hover:bg-[#ff8c38] transition-colors shadow-lg shadow-[#ff7a1a]/20"
              >
                <Navigation className="w-4 h-4" />
                <span>Get Directions (Google Maps)</span>
              </a>

              <a
                href={generateDirectWhatsAppInquiry('Hub Location & Pickup')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-xs md:text-sm bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors"
              >
                <span>Chat with Hub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Landmarks & Proximity Guide */}
          <div className="lg:col-span-7 bg-[#161c26] border border-[#263041] rounded-3xl p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h3 className="font-display font-extrabold text-xl text-white">
                    Nearby Landmarks &amp; Transit
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Fast access across the industrial, academic, and transit corridors
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#2bff8e] bg-[#2bff8e]/10 px-2.5 py-1 rounded-full border border-[#2bff8e]/20">
                  Prime Highway Hub
                </span>
              </div>

              <div className="mt-6 grid sm:grid-cols-2 gap-4">
                {BUSINESS_CONFIG.landmarks.map((landmark, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#10141d] border border-white/5 hover:border-[#2bff8e]/30 transition-colors"
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2bff8e] shrink-0" />
                      <span className="truncate">{landmark.name}</span>
                    </div>
                    <div className="mt-1.5 text-xs font-mono text-[#ff7a1a] pl-5.5">
                      {landmark.distance}
                    </div>
                  </div>
                ))}
              </div>

              {/* Doorstep Pickup Zone Notice */}
              <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-[#14231b] to-[#161c26] border border-[#2bff8e]/20">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#2bff8e]"></span>
                  <span>Doorstep Pickup (Inside 6km Range)</span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Staying nearby or in the Gamharia / Adityapur area? Doorstep pickup is available inside a 6km range from our hub for a flat ₹100 charge.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span>Bharat Petroleum opposite us provides 24/7 petrol &amp; air refilling</span>
              <span className="font-mono text-[#2bff8e]">PIN: 832108</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
