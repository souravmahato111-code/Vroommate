import confetti from 'canvas-confetti';

/**
 * High-energy celebratory confetti animation for unlocking referral discounts
 */
export function fireCelebrationConfetti(): void {
  try {
    const count = 180;
    const defaults = {
      origin: { y: 0.65 },
      zIndex: 99999,
    };

    const fire = (particleRatio: number, opts: confetti.Options) => {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    };

    fire(0.25, {
      spread: 30,
      startVelocity: 55,
      colors: ['#39ff88', '#00FF1F', '#ff7a1a', '#FFFFFF'],
    });

    fire(0.2, {
      spread: 60,
      colors: ['#39ff88', '#ff7a1a', '#FFFFFF'],
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ['#39ff88', '#00FF1F', '#ff7a1a', '#FFFFFF'],
    });

    fire(0.1, {
      spread: 130,
      startVelocity: 30,
      decay: 0.92,
      scalar: 1.2,
      colors: ['#39ff88', '#ff7a1a'],
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      colors: ['#39ff88', '#00FF1F', '#FFFFFF'],
    });
  } catch (err) {
    console.warn('Confetti trigger skipped', err);
  }
}
