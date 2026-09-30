import React from 'react';
import { Check, ShieldAlert, Sparkles, FileText, Bike, KeyRound, FileSignature } from 'lucide-react';
import { generateDirectWhatsAppInquiry } from '../utils/whatsapp';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface HowItWorksProps {
  onOpenAgreement?: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onOpenAgreement }) => {
  const { ref, isVisible } = useScrollReveal<HTMLElement>({
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px',
  });

  const steps = [
    {
      num: '01',
      title: 'Choose Your Ride',
      desc: 'Browse our collection of Scooties, Yamaha FZ, Centuro, or Royal Enfield. Pick daily or hourly duration that suits your plan.',
      color: '#00FF1F',
      icon: Bike,
    },
    {
      num: '02',
      title: 'Quick ID Verification',
      desc: 'Send a quick photo of your Government ID (Aadhaar/Voter ID) and valid Driving License on WhatsApp. We approve in under 5 minutes.',
      color: '#ff7a1a',
      icon: FileText,
    },
    {
      num: '03',
      title: 'Offline Agreement Signing',
      desc: 'Sign the standard self-drive rental agreement offline in-person at the hub desk or during handover, acknowledging vehicle inspection, safety norms, and return time.',
      color: '#00FF1F',
      icon: FileSignature,
    },
    {
      num: '04',
      title: 'Pick Up & Ride',
      desc: 'Collect your sanitized keys & complimentary helmet from our hub opposite Bharat Petroleum in Chota Gamharia, or choose Doorstep Pickup (Inside 6km Range)!',
      color: '#ff7a1a',
      icon: KeyRound,
    },
  ];

  return (
    <section
      ref={ref}
      id="how-it-works"
      className={`py-20 bg-gradient-to-b from-[#0d1117] via-[#111827] to-[#0d1117] border-b border-white/5 scroll-mt-20 transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="max-w-6xl mx-auto px-5">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <p className="uppercase tracking-[0.2em] font-bold text-xs md:text-sm text-[#ff7a1a]">
            Simple 4-Step Process
          </p>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white mt-3">
            Four Steps to the Open Road
          </h2>
          <p className="mt-3 text-slate-400 text-sm md:text-base">
            Transparent, straightforward verification and offline agreement signing. Get road-ready in just a few taps.
          </p>
        </div>

        {/* 4 Step Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                style={{
                  borderTop: `4px solid ${step.color}`,
                  transitionDelay: `${idx * 100 + 150}ms`,
                }}
                className={`rounded-3xl p-6 bg-[#161c26] border border-white/10 relative overflow-hidden group hover:border-white/20 transition-all duration-500 transform hover:-translate-y-1 flex flex-col justify-between motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className="font-display font-black text-3xl sm:text-4xl block"
                      style={{ color: step.color }}
                    >
                      {step.num}
                    </span>
                    <div
                      className="w-11 h-11 rounded-2xl grid place-items-center"
                      style={{ backgroundColor: `${step.color}15`, color: step.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="font-display font-extrabold text-lg text-white mt-5">
                    {step.title}
                  </h3>
                  <p className="mt-2.5 text-slate-300 text-xs sm:text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rules & Requirements Box matching original styling */}
        <div className="mt-14 max-w-3xl mx-auto rounded-3xl p-7 md:p-9 border-2 border-[#00FF1F] bg-[#111c17] shadow-[0_0_40px_-12px_rgba(0,255,31,0.4)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00FF1F] text-[#0d1117] grid place-items-center">
              <ShieldAlert className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h3 className="font-display font-extrabold text-2xl text-white">
              Rules &amp; Requirements
            </h3>
          </div>

          <ul className="mt-6 space-y-4">
            <li className="flex gap-3.5 items-start">
              <span className="shrink-0 w-6 h-6 rounded-full grid place-items-center bg-[#00FF1F] text-[#0d1117] mt-0.5">
                <Check className="w-4 h-4 stroke-[3]" />
              </span>
              <span className="text-slate-200 text-sm sm:text-base leading-snug">
                <strong>Valid ID &amp; Driving License:</strong> Original Aadhaar card / Voter ID and a valid 2-wheeler Driving License are mandatory.
              </span>
            </li>

            <li className="flex gap-3.5 items-start">
              <span className="shrink-0 w-6 h-6 rounded-full grid place-items-center bg-[#00FF1F] text-[#0d1117] mt-0.5">
                <Check className="w-4 h-4 stroke-[3]" />
              </span>
              <span className="text-slate-200 text-sm sm:text-base leading-snug">
                <strong>Offline Agreement Signing:</strong> All riders must sign our standard self-drive rental agreement offline (physical paper contract signed in-person at the desk or during handover) acknowledging initial fuel level, vehicle checklist, and safety norms before receiving the keys.
              </span>
            </li>

            <li className="flex gap-3.5 items-start">
              <span className="shrink-0 w-6 h-6 rounded-full grid place-items-center bg-[#00FF1F] text-[#0d1117] mt-0.5">
                <Check className="w-4 h-4 stroke-[3]" />
              </span>
              <span className="text-slate-200 text-sm sm:text-base leading-snug">
                <strong>Free Sanitized Helmet:</strong> One ISI-approved sanitized helmet is provided completely free with every booking.
              </span>
            </li>

            <li className="flex gap-3.5 items-start">
              <span className="shrink-0 w-6 h-6 rounded-full grid place-items-center bg-[#00FF1F] text-[#0d1117] mt-0.5">
                <Check className="w-4 h-4 stroke-[3]" />
              </span>
              <span className="text-slate-200 text-sm sm:text-base leading-snug">
                <strong>Instant WhatsApp Verification:</strong> No tedious physical queues. Send photos on WhatsApp for verification in minutes.
              </span>
            </li>

            <li className="flex gap-3.5 items-start">
              <span className="shrink-0 w-6 h-6 rounded-full grid place-items-center bg-[#00FF1F] text-[#0d1117] mt-0.5">
                <Check className="w-4 h-4 stroke-[3]" />
              </span>
              <span className="text-slate-200 text-sm sm:text-base leading-snug">
                <strong>Security Deposit:</strong> Low one-time deposit (from ₹500, never charged per day). 100% refunded immediately via UPI when you return the vehicle.
              </span>
            </li>

            <li className="flex gap-3.5 items-start">
              <span className="shrink-0 w-6 h-6 rounded-full grid place-items-center bg-[#ff7a1a] text-[#0d1117] mt-0.5 font-black text-xs">
                !
              </span>
              <span className="text-slate-200 text-sm sm:text-base leading-snug">
                <strong>Late Return Fine:</strong> A flat fine of <span className="text-[#ff7a1a] font-bold">₹150</span> will be charged if the vehicle is returned past the scheduled return time without prior notice or extension.
              </span>
            </li>
          </ul>

          <div className="mt-8 pt-6 border-t border-[#00FF1F]/20 flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs text-slate-300">
              Have questions regarding outstation travel or commercial use?
            </span>
            <a
              href={generateDirectWhatsAppInquiry('Rental Policy Enquiry')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#00FF1F] hover:text-white transition-colors"
            >
              <span>Ask on WhatsApp</span>
              <Sparkles className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
