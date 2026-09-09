/**
 * hoverAnimations.js
 *
 * Micro-interaction animations for hover states, button clicks, and card lifts.
 */

export const buttonTap = {
  hover: { scale: 1.02, transition: { duration: 0.15 } },
  tap: { scale: 0.97, transition: { duration: 0.1 } },
};

export const cardHover = {
  initial: { y: 0 },
  hover: {
    y: -4,
    transition: {
      duration: 0.25,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export const iconBounce = {
  hover: {
    rotate: [0, -10, 10, 0],
    transition: { duration: 0.4 },
  },
};
