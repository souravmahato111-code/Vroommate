import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Star, CheckCircle, Quote, ChevronLeft, ChevronRight, MessageSquare, ThumbsUp } from 'lucide-react';
import { REVIEWS } from '../data/fleetData';
import { useScrollReveal } from '../hooks/useScrollReveal';

export const TestimonialsSection: React.FC = () => {
  const { ref, isVisible } = useScrollReveal<HTMLElement>({
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px',
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Touch swipe handling
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);
  const isDraggingRef = useRef<boolean>(false);

  // Sync scroll buttons and active index based on scroll position
  const updateScrollState = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const scrollLeft = el.scrollLeft;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < maxScroll - 10);

    // Approximate active index based on card widths
    const children = Array.from(el.children) as HTMLElement[];
    if (children.length === 0) return;

    let closestIndex = 0;
    let minDistance = Infinity;
    children.forEach((child, index) => {
      const distance = Math.abs(child.offsetLeft - scrollLeft);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    setActiveIndex(closestIndex);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);

    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState]);

  // Smooth scroll to specific review index
  const scrollToIndex = (index: number) => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const targetIndex = Math.max(0, Math.min(REVIEWS.length - 1, index));
    const children = Array.from(el.children) as HTMLElement[];
    const targetChild = children[targetIndex];

    if (targetChild) {
      targetChild.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start',
      });
      setActiveIndex(targetIndex);
    }
  };

  const handlePrev = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild ? (el.firstElementChild as HTMLElement).offsetWidth + 24 : 320;
    el.scrollBy({ left: -cardWidth, behavior: 'smooth' });
  };

  const handleNext = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild ? (el.firstElementChild as HTMLElement).offsetWidth + 24 : 320;
    el.scrollBy({ left: cardWidth, behavior: 'smooth' });
  };

  // Keyboard navigation for desktop users
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    }
  };

  // Touch Swipe Event Handlers for Mobile & Tablet
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    touchEndXRef.current = null;
    isDraggingRef.current = true;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    touchEndXRef.current = e.touches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!isDraggingRef.current || touchStartXRef.current === null || touchEndXRef.current === null) {
      isDraggingRef.current = false;
      return;
    }

    const deltaX = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 45; // Minimum px to register swipe

    if (Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        // Swiped left -> show next review
        handleNext();
      } else {
        // Swiped right -> show previous review
        handlePrev();
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
    touchEndXRef.current = null;
    isDraggingRef.current = false;
  };

  return (
    <section
      ref={ref}
      id="reviews"
      aria-label="Customer Reviews"
      className={`py-20 bg-[#0d1117] border-b border-white/5 transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="max-w-6xl mx-auto px-5">
        {/* Top Header Row with Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#39ff88]/15 border border-[#39ff88]/30 text-[#39ff88] text-xs font-bold uppercase tracking-wider mb-2">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Rider Experiences</span>
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight">
              Trusted by Daily Riders &amp; Explorers
            </h2>
            <p className="mt-1.5 text-slate-400 text-xs sm:text-sm leading-relaxed">
              Over 350+ happy riders across Chota Gamharia, NIT Jamshedpur, Adityapur, and Bistupur.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
              <ThumbsUp className="w-3 h-3 text-[#39ff88]" />
              <span>4.9 / 5.0 Rating · 350+ Rides</span>
            </span>
          </div>
        </div>

        {/* Carousel Slider Track: Supports Smooth Swiping & Native Drag/Flick */}
        <div
          ref={scrollContainerRef}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className="mt-8 flex gap-5 sm:gap-6 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth focus:outline-none scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none]"
          style={{ scrollbarWidth: 'none' }}
        >
          {REVIEWS.map((review, idx) => (
            <div
              key={review.id}
              className="w-[85vw] sm:w-[380px] md:w-[400px] lg:w-[410px] shrink-0 snap-start bg-gradient-to-b from-[#161c26] to-[#121720] border border-[#263041] hover:border-[#39ff88]/40 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-xl transition-all duration-300 hover:-translate-y-1 relative group"
            >
              {/* Decorative Background Quote Watermark */}
              <div className="absolute top-5 right-5 text-white/5 group-hover:text-[#39ff88]/10 transition-colors pointer-events-none">
                <Quote className="w-12 h-12 stroke-[1.5]" />
              </div>

              <div>
                {/* Header: Rating stars & verified badge */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-1 text-[#ff7a1a]">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                    <span className="ml-1.5 text-xs font-bold text-white">5.0</span>
                  </div>

                  {review.verified && (
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#39ff88]/15 border border-[#39ff88]/30 text-[#39ff88]"
                      title="Verified customer rental"
                    >
                      <CheckCircle className="w-3 h-3 stroke-[2.5]" />
                      <span>Verified Rider</span>
                    </span>
                  )}
                </div>

                {/* Review Text */}
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed italic relative z-10">
                  &ldquo;{review.comment}&rdquo;
                </p>
              </div>

              {/* Author & Vehicle Metadata */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Initials Avatar */}
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1e2634] to-[#0d1117] border border-white/15 grid place-items-center shrink-0 text-white font-bold text-xs shadow-inner">
                    {review.author
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-bold text-white text-sm truncate">{review.author}</h4>
                    <p className="text-[11px] text-slate-400 truncate">{review.role}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] font-semibold text-[#ff7a1a] block truncate max-w-[140px]">
                    {review.vehicle}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">{review.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Controls Just Below Reviews Track: Arrow Buttons & Pagination Dots */}
        <div className="mt-6 flex items-center justify-between gap-4 pt-2">
          {/* Pagination Dots */}
          <div className="flex items-center gap-1.5">
            {REVIEWS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollToIndex(i)}
                aria-label={`Go to review ${i + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  activeIndex === i
                    ? 'w-7 h-2 bg-[#39ff88] shadow-[0_0_8px_rgba(57,255,136,0.6)]'
                    : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
            <span className="text-[11px] text-slate-500 font-mono ml-2">
              {activeIndex + 1} / {REVIEWS.length}
            </span>
          </div>

          {/* Desktop & Mobile Arrow Buttons positioned directly below reviews */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 hidden sm:inline mr-1">
              Navigate:
            </span>
            <button
              type="button"
              onClick={handlePrev}
              disabled={!canScrollLeft}
              aria-label="Previous review"
              title="Previous review (Left Arrow)"
              className={`w-10 h-10 rounded-xl border transition-all duration-200 flex items-center justify-center cursor-pointer ${
                canScrollLeft
                  ? 'bg-[#161c26] border-white/20 text-white hover:bg-[#39ff88] hover:text-black hover:border-[#39ff88] shadow-md hover:shadow-[0_0_12px_rgba(57,255,136,0.4)] active:scale-95'
                  : 'bg-white/5 border-white/5 text-slate-600 cursor-not-allowed opacity-30'
              }`}
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={!canScrollRight}
              aria-label="Next review"
              title="Next review (Right Arrow)"
              className={`w-10 h-10 rounded-xl border transition-all duration-200 flex items-center justify-center cursor-pointer ${
                canScrollRight
                  ? 'bg-[#161c26] border-white/20 text-white hover:bg-[#39ff88] hover:text-black hover:border-[#39ff88] shadow-md hover:shadow-[0_0_12px_rgba(57,255,136,0.4)] active:scale-95'
                  : 'bg-white/5 border-white/5 text-slate-600 cursor-not-allowed opacity-30'
              }`}
            >
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
