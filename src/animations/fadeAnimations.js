/**
 * fadeAnimations.js
 *
 * Standardized fade entrance variants with Apple-style smooth easing curves.
 */

export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom = {}) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: custom.duration || 0.45,
      delay: custom.delay || 0,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

export const fadeInDown = {
  hidden: { opacity: 0, y: -20 },
  visible: (custom = {}) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: custom.duration || 0.45,
      delay: custom.delay || 0,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: (custom = {}) => ({
    opacity: 1,
    transition: {
      duration: custom.duration || 0.3,
      delay: custom.delay || 0,
      ease: 'easeOut',
    },
  }),
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: (staggerDelay = 0.08) => ({
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: 0.05,
    },
  }),
};
