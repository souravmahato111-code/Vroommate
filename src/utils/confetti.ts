/**
 * Native, zero-dependency HTML5 Canvas confetti celebration system.
 * Works seamlessly in all browsers and CI/CD deployment pipelines without external packages.
 */

interface Particle {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  alpha: number;
  decay: number;
}

export function fireCelebrationConfetti(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  try {
    const existingCanvas = document.getElementById('vroommate-confetti-canvas') as HTMLCanvasElement | null;
    const canvas = existingCanvas || document.createElement('canvas');
    canvas.id = 'vroommate-confetti-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '99999';

    if (!existingCanvas) {
      document.body.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const colors = ['#39ff88', '#39ff88', '#ff7a1a', '#ffffff', '#ffd166', '#39ff88'];
    const particles: Particle[] = [];
    const count = 160;

    for (let i = 0; i < count; i++) {
      // Launch from mid-bottom area
      const angle = (Math.PI / 180) * (270 + (Math.random() * 90 - 45));
      const speed = 14 + Math.random() * 22;
      particles.push({
        x: width * (0.4 + Math.random() * 0.2),
        y: height * 0.65,
        w: 6 + Math.random() * 6,
        h: 4 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 8,
        vy: Math.sin(angle) * speed,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        alpha: 1,
        decay: 0.008 + Math.random() * 0.012,
      });
    }

    let animationId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      let aliveCount = 0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.alpha <= 0) continue;

        aliveCount++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.45; // gravity
        p.vx *= 0.98; // drag
        p.rotation += p.vRot;
        p.alpha -= p.decay;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      if (aliveCount > 0) {
        animationId = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(animationId);
        if (canvas.parentNode) {
          canvas.parentNode.removeChild(canvas);
        }
      }
    };

    animationId = requestAnimationFrame(render);
  } catch (err) {
    console.warn('Native confetti skipped', err);
  }
}
