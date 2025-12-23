// resources/jsx/animations/springConfigs.js
export const springConfigs = {
  // SNAPPY: Fast, responsive, minimal bounce
  snappy: {
    type: "spring",
    stiffness: 450,
    damping: 35,
    mass: 0.8,
    restDelta: 0.001,
  },

  // SATISFYING: Physical, weighty feel with subtle overshoot
  satisfying: {
    type: "spring",
    stiffness: 300,
    damping: 25,
    mass: 1.2,
    restDelta: 0.001,
  },

  // INSTANT: Almost immediate with micro-bounce
  instant: {
    type: "spring",
    stiffness: 600,
    damping: 40,
    mass: 0.5,
    restDelta: 0.001,
  },

  // MENU: Fast but smooth sidebar
  menu: {
    type: "spring",
    stiffness: 350,
    damping: 30,
    mass: 0.9,
    restDelta: 0.001,
  },

  // SCROLL: Momentum-based navigation
  scroll: {
    type: "spring",
    stiffness: 250,
    damping: 20,
    mass: 1.5,
    restDelta: 0.001,
  },
};
