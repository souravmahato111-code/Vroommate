import React, { useEffect, useRef } from 'react';
import { Star, CheckCircle, Quote, ChevronLeft, ChevronRight, Hand } from 'lucide-react';
import { REVIEWS } from '../data/fleetData';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useTouchCarousel } from '../hooks/useTouchCarousel';

export const TestimonialsSection: React.FC = () => {
  const { ref, isVisible } = useScrollReveal<HTMLElement>({
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px',
  });

  const {
    containerRef,
    activeIndex,
    canScrollLeft,
    canScrollRight,
    isDragging,
    hasInteracted,
    scrollToIndex,
    scrollPrev,
    scrollNext,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleClickCapture,
  } = useTouchCarousel({ itemCount: REVIEWS.length });

  // Generous auto-advance (14 seconds) to give readers plenty of time to read each story comfortably
  const isHoveredRef = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isHoveredRef.current && !isDragging) {
        const nextIndex = (activeIndex + 1) % REVIEWS.length;
        scrollToIndex(nextIndex);
      }
    }, 14000);

    return () => clearInterval(timer);
  }, [activeIndex, isDragging, scrollToIndex]);

  return (
    <section
      ref={ref}
      id="reviews"
      className={`py-20 bg-[#0d1117] border-b border-white/5 scroll-mt-20 transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="max-w-6xl mx-auto px-5">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <p className="uppercase tracking-[0.2em] font-bold text-xs md:text-sm text-[#ff7a1a]">
            Customer Stories
          </p>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white mt-3">
            Trusted by Daily Riders &amp; Explorers
          </h2>
          <p className="mt-3 text-slate-400 text-sm md:text-base">
            Over 350+ happy riders across Chota Gamharia, NIT Jamshedpur, Adityapur, and Bistupur.
          </p>
        </div>

        {/* Mobile Swipe Hint */}
        <div className="flex sm:hidden items-center justify-center gap-2 mt-4 text-xs">
          <div
            className={`inline-flex items-center gap-1.5 py-1 px-3.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[11px] transition-opacity duration-300 ${
              hasInteracted ? 'opacity-40' : 'opacity-100 animate-pulse'
            }`}
          >
            <Hand className="w-3.5 h-3.5 text-[#2bff8e]" />
            <span>Swipe horizontally to browse rider stories</span>
          </div>
        </div>

        {/* Reviews Sliding Track */}
        <div
          ref={containerRef}
          onMouseEnter={() => {
            isHoveredRef.current = true;
          }}
          onMouseLeave={() => {
            isHoveredRef.current = false;
            handleMouseLeave();
          }}
          onTouchStart={() => {
            isHoveredRef.current = true;
          }}
          onTouchEnd={() => {
            setTimeout(() => {
              isHoveredRef.current = false;
            }, 6000);
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClickCapture={handleClickCapture}
          className={`flex overflow-x-auto snap-x snap-mandatory gap-5 sm:gap-6 mt-8 sm:mt-12 px-5 -mx-5 sm:mx-0 sm:px-0 pb-6 pt-2 no-scrollbar carousel-touch-container select-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          {REVIEWS.map((review, idx) => (
            <div
              key={review.id}
              data-carousel-item
              className={`w-[85vw] max-w-[340px] sm:w-[380px] lg:w-[410px] shrink-0 snap-center sm:snap-start bg-[#161c26] border border-[#263041] rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:border-white/20 transition-all duration-300 transform hover:-translate-y-1 shadow-lg ${
                activeIndex === idx ? 'ring-1 ring-[#ff7a1a]/40' : ''
              }`}
            >
              <div>
                {/* Header row with star rating & quote icon */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#ff7a1a]">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-white/10 shrink-0" />
                </div>

                <p className="mt-4 text-slate-300 text-xs sm:text-sm leading-relaxed italic line-clamp-4">
                  &ldquo;{review.comment}&rdquo;
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">{review.author}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{review.role}</p>
                  </div>
                  {review.verified && (
                    <span
                      className="text-[#2bff8e] text-[11px] flex items-center gap-1 font-medium bg-[#2bff8e]/10 px-2.5 py-1 rounded-full border border-[#2bff8e]/20"
                      title="Verified Rental"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Verified</span>
                    </span>
                  )}
                </div>

                <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
                  <span className="text-[#ff7a1a] font-medium truncate max-w-[180px]">
                    {review.vehicle}
                  </span>
                  <span className="font-mono text-slate-500">{review.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Controls: Arrows and Dots directly below the review boxes */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 mt-6 sm:mt-8">
          <button
            type="button"
            onClick={scrollPrev}
            disabled={!canScrollLeft}
            aria-label="Previous review"
            className="w-11 h-11 rounded-2xl bg-[#161c26] border border-[#263041] text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#202938] hover:border-[#ff7a1a]/50 active:scale-95 transition-all grid place-items-center cursor-pointer shadow-md"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Carousel Pagination Dots & Review Counter */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              {REVIEWS.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => scrollToIndex(idx)}
                  aria-label={`Go to review ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    activeIndex === idx
                      ? 'w-7 sm:w-8 bg-[#ff7a1a] shadow-[0_0_10px_rgba(255,122,26,0.6)]'
                      : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Review <span className="text-white font-bold">{activeIndex + 1}</span> of {REVIEWS.length}
            </span>
          </div>

          <button
            type="button"
            onClick={scrollNext}
            disabled={!canScrollRight}
            aria-label="Next review"
            className="w-11 h-11 rounded-2xl bg-[#161c26] border border-[#263041] text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#202938] hover:border-[#ff7a1a]/50 active:scale-95 transition-all grid place-items-center cursor-pointer shadow-md"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};
