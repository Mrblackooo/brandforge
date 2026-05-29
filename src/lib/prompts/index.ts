export { CREATOR_SYSTEM_PROMPT as creator } from './creator';
export { STARTUP_SYSTEM_PROMPT as startup } from './startup';
export { ECOMMERCE_SYSTEM_PROMPT as ecommerce } from './ecommerce';
export { PERSONAL_SYSTEM_PROMPT as personal } from './personal';

export const BRAND_MODES = ['creator', 'startup', 'ecommerce', 'personal'] as const;
export type BrandMode = (typeof BRAND_MODES)[number];

export const DEFAULT_MODE: BrandMode = 'startup';

export const MODE_LABELS: Record<BrandMode, string> = {
  creator: 'Creator / Influencer',
  startup: 'Startup / SaaS',
  ecommerce: 'E-commerce / DTC',
  personal: 'Personal Brand',
};