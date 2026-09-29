import React, { useState } from 'react';
import { ChevronDown, MessageCircle, HelpCircle, Gift, ArrowRight } from 'lucide-react';
import { FAQS } from '../data/fleetData';
import { generateDirectWhatsAppInquiry } from '../utils/whatsapp';

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faqs" className="py-20 bg-[#0d1117] border-b border-white/5 scroll-mt-20">
      <div className="max-w-4xl mx-auto px-5">
        <div className="text-center max-w-2xl mx-auto">
          <p className="uppercase tracking-[0.2em] font-bold text-xs md:text-sm text-[#ff7a1a]">
            Common Queries
          </p>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white mt-3">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-slate-400 text-sm md:text-base">
            Everything you need to know about renting a scooter or motorcycle with us.
          </p>
        </div>

        <div className="mt-12 space-y-3.5">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-[#161c26] border border-[#263041] rounded-2xl overflow-hidden transition-colors hover:border-white/20"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#39ff88]"
                  aria-expanded={isOpen}
                >
                  <span className="font-display font-bold text-base sm:text-lg text-white">
                    {faq.question}
                  </span>
                  <span
                    className={`w-8 h-8 rounded-full grid place-items-center bg-white/5 shrink-0 text-slate-300 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-[#39ff88] text-[#0d1117]' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-slate-300 text-sm leading-relaxed border-t border-white/5 space-y-3">
                    <p>{faq.answer}</p>
                    {idx === 0 && (
                      <div className="pt-2">
                        <a
                          href="#referral"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#39ff88] text-[#0d1117] hover:bg-[#4dff93] transition-colors"
                        >
                          <Gift className="w-3.5 h-3.5" />
                          <span>Go to Referral Program &amp; Unlock 20%</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Referral Program Banner inside FAQ */}
        <div className="mt-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#172b1d] via-[#101923] to-[#172b1d] border border-[#39ff88]/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-[#39ff88]/5">
          <div className="flex items-center gap-3.5 text-left">
            <div className="w-12 h-12 rounded-2xl bg-[#39ff88]/20 text-[#39ff88] grid place-items-center shrink-0 border border-[#39ff88]/30">
              <Gift className="w-6 h-6 text-[#39ff88]" />
            </div>
            <div>
              <div className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                <span>Want 20% OFF your next ride?</span>
                <span className="text-[10px] font-bold text-[#39ff88] bg-[#39ff88]/15 px-2 py-0.5 rounded-full border border-[#39ff88]/30">
                  HOT OFFER
                </span>
              </div>
              <div className="text-xs text-slate-300 mt-0.5">
                Send our referral invite to a friend on WhatsApp and unlock a 20% discount coupon (applicable once)!
              </div>
            </div>
          </div>

          <a
            href="#referral"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#39ff88] text-[#0d1117] hover:bg-[#4dff93] transition-all transform hover:scale-105 whitespace-nowrap shrink-0 shadow-md shadow-[#39ff88]/20"
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Unlock 20% Offer Now</span>
          </a>
        </div>

        {/* WhatsApp support strip */}
        <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-[#14231b] to-[#1a2332] border border-[#39ff88]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-[#39ff88]/20 text-[#39ff88] grid place-items-center shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Still have a question?</div>
              <div className="text-xs text-slate-300">
                Chat with our manager directly on WhatsApp. We reply within 2 minutes.
              </div>
            </div>
          </div>

          <a
            href={generateDirectWhatsAppInquiry('Rental Enquiry from FAQ')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-[#39ff88] text-[#0d1117] hover:bg-[#4dff93] transition-colors whitespace-nowrap shrink-0"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Ask on WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
};
