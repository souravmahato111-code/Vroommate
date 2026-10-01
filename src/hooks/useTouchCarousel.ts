import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseTouchCarouselOptions {
  itemCount: number;
}

export function useTouchCarousel({ itemCount }: UseTouchCarouselOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(itemCount > 1);
  const [isDragging, setIsDragging] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const dragDistanceRef = useRef(0);

  const updateScrollState = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const maxScroll = Math.max(0, scrollWidth - clientWidth);

    setCanScrollLeft(scrollLeft > 8);
    setCanScrollRight(scrollLeft < maxScroll - 8);

    const items = Array.from(
      container.querySelectorAll<HTMLElement>('[data-carousel-item]')
    );

    if (items.length > 0) {
      const containerCenter = scrollLeft + clientWidth / 2;
      let closestIndex = 0;
      let minDistance = Infinity;

      items.forEach((item, index) => {
        const itemCenter = item.offsetLeft + item.offsetWidth / 2;
        const distance = Math.abs(containerCenter - itemCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });

      setActiveIndex(closestIndex);
    }
  }, []);

  const scrollToIndex = useCallback(
    (index: number) => {
      const container = containerRef.current;
      if (!container) return;

      setHasInteracted(true);
      const clampedIndex = Math.max(0, Math.min(itemCount - 1, index));
      const items = Array.from(
        container.querySelectorAll<HTMLElement>('[data-carousel-item]')
      );
      const targetItem = items[clampedIndex];

      if (targetItem) {
        const targetLeft =
          targetItem.offsetLeft - (container.clientWidth - targetItem.offsetWidth) / 2;

        container.scrollTo({
          left: Math.max(0, targetLeft),
          behavior: 'smooth',
        });
        setActiveIndex(clampedIndex);
      }
    },
    [itemCount]
  );

  const scrollPrev = useCallback(() => {
    scrollToIndex(activeIndex - 1);
  }, [activeIndex, scrollToIndex]);

  const scrollNext = useCallback(() => {
    scrollToIndex(activeIndex + 1);
  }, [activeIndex, scrollToIndex]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const container = containerRef.current;
    if (!container) return;

    isMouseDownRef.current = true;
    startXRef.current = e.pageX - container.offsetLeft;
    scrollLeftRef.current = container.scrollLeft;
    dragDistanceRef.current = 0;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDownRef.current) return;
    const container = containerRef.current;
    if (!container) return;

    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = x - startXRef.current;
    dragDistanceRef.current = Math.abs(walk);

    if (Math.abs(walk) > 4) {
      setIsDragging(true);
      setHasInteracted(true);
    }

    container.scrollLeft = scrollLeftRef.current - walk;
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!isMouseDownRef.current) return;
    isMouseDownRef.current = false;
    setTimeout(() => {
      setIsDragging(false);
    }, 50);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (isMouseDownRef.current) {
      isMouseDownRef.current = false;
      setIsDragging(false);
    }
  }, []);

  const handleClickCapture = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (dragDistanceRef.current > 6) {
      e.preventDefault();
      e.stopPropagation();
    }
    dragDistanceRef.current = 0;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setHasInteracted(true);
      updateScrollState();
    };

    updateScrollState();

    container.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateScrollState);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState]);

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
