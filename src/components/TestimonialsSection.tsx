import React from 'react';
import { Star, CheckCircle, Quote } from 'lucide-react';
import { REVIEWS } from '../data/fleetData';
import { useScrollReveal } from '../hooks/useScrollReveal';

export const TestimonialsSection: React.FC = () => {
  const { ref, isVisible } = useScrollReveal<HTMLElement>({
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px',
  });

  return (
    <section
      ref={ref}
      className={`py-20 bg-[#0d1117] border-b border-white/5 transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center max-w-2xl mx-auto">
          <p className="uppercase tracking-[0.2em] font-bold text-xs md:text-sm text-[#00FF1F]">
            Customer Stories
          </p>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white mt-3">
            Trusted by Daily Riders &amp; Explorers
          </h2>
          <p className="mt-3 text-slate-400 text-sm md:text-base">
            Over 350+ happy riders across Chota Gamharia, NIT Jamshedpur, Adityapur, and Bistupur.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {REVIEWS.map((review) => (
            <div
              key={review.id}
              className="bg-[#161c26] border border-[#263041] rounded-3xl p-6 flex flex-col justify-between hover:border-white/20 transition-all"
            >
              <div>
                {/* Rating stars */}
                <div className="flex items-center gap-1 text-[#ff7a1a]">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                <p className="mt-4 text-slate-300 text-xs sm:text-sm leading-relaxed italic">
                  &ldquo;{review.comment}&rdquo;
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">{review.author}</h4>
                    <p className="text-[11px] text-slate-400">{review.role}</p>
                  </div>
                  {review.verified && (
                    <span
                      className="text-[#00FF1F] text-[11px] flex items-center gap-1 font-medium"
                      title="Verified Rental"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Verified</span>
                    </span>
                  )}
                </div>

                <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-2">
                  <span className="text-[#ff7a1a] font-medium">{review.vehicle}</span>
                  <span aria-hidden="true">·</span>
                  <span>{review.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
