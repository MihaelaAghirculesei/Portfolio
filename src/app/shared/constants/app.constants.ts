export const BREAKPOINTS = {
  TABLET_MAX: 768
} as const;

export const SCROLL_CONFIG = {
  THRESHOLD: 100,
  HEADER_HEIGHT: 98,
  MOBILE_SKILLS_OFFSET: -5,
  NAVIGATION_DELAY: 100
} as const;

export const SLIDER_CONFIG = {
  FEEDBACK_OFFSET: 105
} as const;

export type Breakpoints = typeof BREAKPOINTS;
export type ScrollConfig = typeof SCROLL_CONFIG;
export type SliderConfig = typeof SLIDER_CONFIG;