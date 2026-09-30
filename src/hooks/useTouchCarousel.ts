import { useRef, useState, useEffect, useCallback } from 'react';

interface UseTouchCarouselOptions {
  itemCount: number;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export function useTouchCarousel({
  itemCount,
  autoPlay = false,
  autoPlayInterval = 5000,
}: UseTouchCarouselOptions) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % itemCount);
  }, [itemCount]);

  const prev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + itemCount) % itemCount);
  }, [itemCount]);

  const goTo = useCallback(
    (index: number) => {
      if (index >= 0 && index < itemCount) {
        setCurrentIndex(index);
      }
    },
    [itemCount]
  );

  useEffect(() => {
    if (!autoPlay || itemCount <= 1) return;
    const timer = setInterval(next, autoPlayInterval);
    return () => clearInterval(timer);
  }, [autoPlay, autoPlayInterval, itemCount, next]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
    touchStartYRef.current = e.targetTouches[0].clientY;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const diffX = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 50;

    if (diffX > minSwipeDistance) {
      next();
    } else if (diffX < -minSwipeDistance) {
      prev();
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
    touchEndXRef.current = null;
  };

  return {
    currentIndex,
    next,
    prev,
    goTo,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}
