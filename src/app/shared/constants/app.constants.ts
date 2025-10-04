export const BREAKPOINTS = {
  MOBILE_MAX: 480,
  TABLET_MAX: 768,
  SMALL_PREVIEW_MAX: 860
} as const;

export const SCROLL_CONFIG = {
  THRESHOLD: 100,
  HEADER_HEIGHT: 98,
  MOBILE_SKILLS_OFFSET: -5,
  NAVIGATION_DELAY: 100
} as const;

export const SLIDER_CONFIG = {
  FEEDBACK_OFFSET: 105,
  SWIPE_THRESHOLD: 50,
  AUTO_PLAY_INTERVAL: 5000,
  TRANSITION_DURATION: 500
} as const;

export const ANIMATION_CONFIG = {
  SCALE_ACTIVE: 1.1,
  SCALE_INACTIVE: 0.8
} as const;

export const PORTFOLIO_CONFIG = {
  TOUCH_THRESHOLD: 10,
  PREVIEW_BASE_OFFSET: 100,
  POSITION_OFFSETS: {
    PROJECT_0: {
      BASE: 70,
      SMALL_PREVIEW: -10
    },
    PROJECT_1: {
      BASE: 15,
      SMALL_PREVIEW: 30
    },
    PROJECT_2: {
      BASE: -40,
      SMALL_PREVIEW: 70
    }
  }
} as const;

export type Breakpoints = typeof BREAKPOINTS;
export type ScrollConfig = typeof SCROLL_CONFIG;
export type SliderConfig = typeof SLIDER_CONFIG;
export type AnimationConfig = typeof ANIMATION_CONFIG;
export type PortfolioConfig = typeof PORTFOLIO_CONFIG;