import { useRef, useState, useEffect, useCallback } from 'react';

interface UseTouchCarouselOptions {
  itemCount: number;
}

export function useTouchCarousel({ itemCount }: UseTouchCarouselOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(itemCount > 1);
  const [isDragging, setIsDragging] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

  const updateScrollState = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    const current = el.scrollLeft;

    setCanScrollLeft(current > 10);
    setCanScrollRight(current < maxScroll - 10);

    if (itemCount > 0 && el.scrollWidth > 0) {
      const scrollRatio = current / (maxScroll || 1);
      const index = Math.round(scrollRatio * (itemCount - 1));
      setActiveIndex(Math.max(0, Math.min(index, itemCount - 1)));
    }
  }, [itemCount]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);

    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState]);

  const scrollToIndex = useCallback(
    (index: number) => {
      const el = containerRef.current;
      if (!el) return;
      setHasInteracted(true);

      const items = el.querySelectorAll('[data-carousel-item]');
      if (items[index]) {
        (items[index] as HTMLElement).scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      } else {
        const maxScroll = el.scrollWidth - el.clientWidth;
        const target = (maxScroll / Math.max(1, itemCount - 1)) * index;
        el.scrollTo({ left: target, behavior: 'smooth' });
      }
    },
    [itemCount]
  );

  const scrollPrev = useCallback(() => {
    scrollToIndex(Math.max(0, activeIndex - 1));
  }, [activeIndex, scrollToIndex]);

  const scrollNext = useCallback(() => {
    scrollToIndex(Math.min(itemCount - 1, activeIndex + 1));
  }, [activeIndex, itemCount, scrollToIndex]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    setIsDragging(true);
    setHasInteracted(true);
    hasMovedRef.current = false;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const el = containerRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    if (Math.abs(walk) > 5) {
      hasMovedRef.current = true;
    }
    el.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (hasMovedRef.current) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  return {
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
  };
}
