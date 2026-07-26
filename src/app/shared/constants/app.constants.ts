export const BREAKPOINTS = {
  MOBILE_MAX: 530,
  TABLET_MAX: 768,
  SMALL_PREVIEW_MAX: 860
} as const;

export const SCROLL_CONFIG = {
  THRESHOLD: 100,
  HEADER_HEIGHT: 98,
  MOBILE_SKILLS_OFFSET: -5,
  NAVIGATION_DELAY: 100,
  SCROLL_CORRECTION_DELAY: 350
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

export const CONTACT_INFO = {
  name: 'Mihaela Melania Aghirculesei',
  firstName: 'Mihaela Melania',
  lastName: 'Aghirculesei',
  email: 'aghirculesei@gmail.com',
  phone: '+49 174 9627899',
  address: {
    street: 'Springwiesen, 29',
    postalCode: '38446',
    city: 'Wolfsburg'
  }
} as const;

