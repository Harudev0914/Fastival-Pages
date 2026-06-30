import type { Variants } from 'framer-motion';

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: 'easeOut' }
  }),
  hover: {
    y: -6,
    scale: 1.01,
    transition: { duration: 0.25, ease: 'easeOut' }
  }
};

export const heartVariants: Variants = {
  initial: { scale: 1 },
  tap: { scale: 1.4 },
  animate: { scale: 1, transition: { type: 'spring', stiffness: 400, damping: 17 } }
};
