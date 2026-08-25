import confetti from 'canvas-confetti';

/**
 * Triggers a celebratory mini party popper confetti animation from center or specified coordinates.
 */
export function firePartyPopper(options = {}) {
  try {
    const count = options.particleCount || 75;
    const origin = options.origin || { y: 0.65, x: 0.5 };

    // Burst 1
    confetti({
      particleCount: count,
      spread: 70,
      origin: origin,
      colors: ['#9FD842', '#171717', '#EC5AC8', '#6257FF', '#FFD700', '#FF6B6B'],
      disableForReducedMotion: true,
      zIndex: 9999,
    });

    // Secondary micro-sparkle burst
    setTimeout(() => {
      confetti({
        particleCount: Math.round(count * 0.5),
        angle: 60,
        spread: 55,
        origin: { x: 0.35, y: origin.y },
        colors: ['#9FD842', '#FFD700', '#EC5AC8'],
        zIndex: 9999,
      });
      confetti({
        particleCount: Math.round(count * 0.5),
        angle: 120,
        spread: 55,
        origin: { x: 0.65, y: origin.y },
        colors: ['#9FD842', '#6257FF', '#FFD700'],
        zIndex: 9999,
      });
    }, 180);
  } catch (err) {
    console.warn('Confetti animation error:', err);
  }
}
