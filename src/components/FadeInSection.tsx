import React, { ReactNode } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface FadeInSectionProps {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

export const FadeInSection: React.FC<FadeInSectionProps> = ({
  children,
  className = '',
  delayMs = 0,
  direction = 'up',
}) => {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px',
  });

  const getTransformClass = () => {
    if (isVisible) return 'translate-y-0 translate-x-0 opacity-100';
    switch (direction) {
      case 'up':
        return 'translate-y-8 opacity-0';
      case 'down':
        return '-translate-y-8 opacity-0';
      case 'left':
        return 'translate-x-8 opacity-0';
      case 'right':
        return '-translate-x-8 opacity-0';
      default:
        return 'opacity-0';
    }
  };

  return (
    <div
      ref={ref}
      style={{
        transitionDuration: '700ms',
        transitionDelay: `${delayMs}ms`,
      }}
      className={`transition-all ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 ${getTransformClass()} ${className}`}
    >
      {children}
    </div>
  );
};
