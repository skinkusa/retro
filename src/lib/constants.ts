export const STORAGE_KEY = 'retro_manager_save_v1.9.3';
export const OVERRIDES_KEY = 'retro_manager_team_overrides_v1.9.3';

/** Breakpoints aligned with Tailwind (md: 768px, lg: 1024px). Use for JS/matchMedia and custom CSS. */
export const BREAKPOINT_MD = 768;
export const BREAKPOINT_LG = 1024;
/** Media query strings for use in matchMedia or CSS: mobile < 768px, below lg < 1024px. */
export const MEDIA_MOBILE = `(max-width: ${BREAKPOINT_MD - 1}px)`;
export const MEDIA_BELOW_LG = `(max-width: ${BREAKPOINT_LG - 1}px)`;
