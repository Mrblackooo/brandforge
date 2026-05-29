export interface BrandSystem {
  brandName: string;
  tagline: string;
  mission: string;
  vision: string;
  values: string[];
  targetAudience: string;
  toneOfVoice: string[];
  colorPalette: string[];
  typography: string;
  logoPrompt: string;
  socialContent: string[];
  marketingCampaigns: string[];
  landingPageHeadlines: string[];
}

export interface GenerateBrandRequest {
  idea: string;
  mode?: 'creator' | 'startup' | 'ecommerce' | 'personal';
}

export interface GenerateBrandResponse {
  success: boolean;
  data?: BrandSystem;
  error?: string;
}

export const BRAND_SYSTEM_FIELDS: (keyof BrandSystem)[] = [
  'brandName',
  'tagline',
  'mission',
  'vision',
  'values',
  'targetAudience',
  'toneOfVoice',
  'colorPalette',
  'typography',
  'logoPrompt',
  'socialContent',
  'marketingCampaigns',
  'landingPageHeadlines',
];