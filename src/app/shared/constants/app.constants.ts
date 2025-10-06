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

export const TIMING_CONFIG = {
  FOCUS_DELAY: 100,
  ARIA_ANNOUNCEMENT_DELAY: 100,
  ARIA_CLEAR_DELAY: 5000,
  MENU_SETUP_DELAY: 100,
  MODAL_FOCUS_DELAY: 100
} as const;

export const VALIDATION_CONFIG = {
  MIN_NAME_LENGTH: 3,
  MIN_MESSAGE_LENGTH: 10,
  EMAIL_PATTERN: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
} as const;

export const HTTP_CONFIG = {
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 2,
  STATUS_SERVER_ERROR: 500,
  STATUS_CLIENT_ERROR: 400
} as const;

export const AOS_CONFIG = {
  DURATION: 800,
  OFFSET: 100,
  DELAY_STEP_1: 400,
  DELAY_STEP_2: 500,
  DELAY_STEP_3: 600
} as const;

export type Breakpoints = typeof BREAKPOINTS;
export type ScrollConfig = typeof SCROLL_CONFIG;
export type SliderConfig = typeof SLIDER_CONFIG;
export type AnimationConfig = typeof ANIMATION_CONFIG;
export type PortfolioConfig = typeof PORTFOLIO_CONFIG;
export type TimingConfig = typeof TIMING_CONFIG;
export type ValidationConfig = typeof VALIDATION_CONFIG;
export type HttpConfig = typeof HTTP_CONFIG;
export type AosConfig = typeof AOS_CONFIG;