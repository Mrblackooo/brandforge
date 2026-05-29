import { BrandSystem } from './types';
import { BrandMode, creator, startup, ecommerce, personal, DEFAULT_MODE } from './prompts';

const PROMPT_MAP: Record<BrandMode, string> = {
  creator,
  startup,
  ecommerce,
  personal,
};

const GROQ_API_BASE = 'https://api.groq.com/openai/v1';
const FREE_MODELS = ['llama3-70b-8192', 'mixtral-8x7b-32768', 'llama-3.1-70b-versatile'];

/**
 * Call Groq API (free tier) to generate a complete brand system.
 * Falls back to deterministic generation if no API key is configured.
 */
export async function generateBrandSystem(
  idea: string,
  mode: BrandMode = DEFAULT_MODE
): Promise<BrandSystem> {
  const apiKey = process.env.GROQ_API_KEY;
  const systemPrompt = PROMPT_MAP[mode] || PROMPT_MAP[DEFAULT_MODE];

  if (!apiKey) {
    console.log(
      '[BrandForge] No GROQ_API_KEY configured, using deterministic fallback'
    );
    return deterministicFallback(idea, mode);
  }

  // Try models in order until one works
  for (const model of FREE_MODELS) {
    try {
      const response = await fetch(`${GROQ_API_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            {
              role: 'user',
              content: `Create a complete brand identity for this ${mode} brand idea: ${idea}`,
            },
          ],
          temperature: 0.8,
          max_tokens: 1500,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Groq API error (${model}, ${response.status}):`, errorText);
        continue; // try next model
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        continue;
      }

      return parseBrandJson(content, idea, mode);
    } catch (error) {
      console.error(`Groq API call failed (${model}):`, error);
      continue;
    }
  }

  // All models failed, use fallback
  return deterministicFallback(idea, mode);
}

/**
 * Parse the AI response JSON, cleaning markdown fences
 */
function parseBrandJson(
  content: string,
  idea: string,
  mode: BrandMode
): BrandSystem {
  try {
    const cleaned = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    const parsed = JSON.parse(cleaned);

    return {
      brandName: parsed.brandName || extractBrandName(idea),
      tagline: parsed.tagline || '',
      mission: parsed.mission || '',
      vision: parsed.vision || '',
      values: Array.isArray(parsed.values) ? parsed.values : [],
      targetAudience: parsed.targetAudience || '',
      toneOfVoice: Array.isArray(parsed.toneOfVoice)
        ? parsed.toneOfVoice
        : [],
      colorPalette: Array.isArray(parsed.colorPalette)
        ? parsed.colorPalette.slice(0, 5)
        : [],
      typography: parsed.typography || '',
      logoPrompt: parsed.logoPrompt || '',
      socialContent: Array.isArray(parsed.socialContent)
        ? parsed.socialContent
        : [],
      marketingCampaigns: Array.isArray(parsed.marketingCampaigns)
        ? parsed.marketingCampaigns
        : [],
      landingPageHeadlines: Array.isArray(parsed.landingPageHeadlines)
        ? parsed.landingPageHeadlines
        : [],
    };
  } catch {
    return deterministicFallback(idea, mode);
  }
}

/**
 * Extract a brand name from the idea text
 */
function extractBrandName(idea: string): string {
  const words = idea
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 3);

  if (words.length >= 2) {
    return words
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join('');
  }

  return 'BrandForge';
}

/**
 * Deterministic fallback when no API key is available
 * Generates a reasonable brand system from the idea text
 */
function deterministicFallback(idea: string, mode: BrandMode): BrandSystem {
  const keywords = idea
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 3);

  const brandName = extractBrandName(idea);

  const paletteIndex =
    keywords.reduce((acc, w) => acc + w.length, 0) % PALETTES.length;

  const taglinesByMode: Partial<Record<BrandMode, string[]>> = {
    creator: [
      `Creating ${keywords.slice(0, 2).join(' ')} that matters`,
      `Your daily dose of ${keywords.slice(0, 2).join(' ')}`,
    ],
    startup: [
      `${keywords.slice(0, 2).join(' ')} \u2014 reimagined`,
      `The future of ${keywords.slice(0, 3).join(' ')}`,
    ],
    ecommerce: [
      `Curated ${keywords.slice(0, 2).join(' ')} for modern living`,
      `Discover better ${keywords.slice(0, 2).join(' ')}`,
    ],
    personal: [
      `Helping you ${keywords.slice(0, 2).join(' ')} better`,
      `${brandName}: ${keywords.slice(0, 3).join(' ')}`,
    ],
  };

  const taglines = taglinesByMode[mode] || taglinesByMode.startup!;
  const tagline = taglines[paletteIndex % taglines.length];

  return {
    brandName,
    tagline,
    mission: `To ${keywords.slice(0, 4).join(' ')} for ${mode === 'ecommerce' ? 'customers' : mode === 'creator' ? 'our community' : mode === 'personal' ? 'clients' : 'users'} everywhere.`,
    vision: `A world where ${keywords.slice(0, 3).join(' ')} is accessible to everyone.`,
    values: [
      'Innovation',
      'Quality',
      'Community',
      'Transparency',
      'Sustainability',
    ],
    targetAudience: `${mode === 'ecommerce' ? 'Shoppers' : mode === 'creator' ? 'Content consumers' : mode === 'personal' ? 'Professionals' : 'Early adopters'} interested in ${keywords.slice(0, 3).join(', ')}.`,
    toneOfVoice: modeTones(mode),
    colorPalette: PALETTES[paletteIndex],
    typography: 'Inter or Plus Jakarta Sans for headings, paired with DM Sans or Source Serif 4 for body text \u2014 clean, modern, and highly readable across devices.',
    logoPrompt: `A modern, minimalist logo for "${brandName}" \u2014 a ${mode} brand focused on ${keywords.slice(0, 3).join(', ')}. Clean lines, geometric shapes, ${paletteIndex % 2 === 0 ? 'bold colors' : 'muted tones'}.`,
    socialContent: [
      `Educational content around ${keywords.slice(0, 2).join(' and ')}`,
      'Behind-the-scenes and process stories',
      'Customer/community spotlights and testimonials',
      'Industry insights and trend analysis',
      'Interactive content (polls, Q&As, challenges)',
    ],
    marketingCampaigns: [
      `"The ${brandName} Launch" \u2014 Multi-channel rollout with teaser campaign`,
      `"Built with ${keywords[0] || 'Purpose'}" \u2014 Brand story campaign`,
      'Community referral program with early adopter rewards',
    ],
    landingPageHeadlines: [
      `${brandName}: ${tagline}`,
      `Join the ${keywords.slice(0, 2).join(' ')} revolution`,
      `Built for ${keywords.slice(0, 3).join(', ') || 'the future'}. Designed for you.`,
    ],
  };
}

function modeTones(mode: BrandMode): string[] {
  const tones: Record<BrandMode, string[]> = {
    creator: ['Authentic', 'Engaging', 'Relatable', 'Inspiring', 'Raw'],
    startup: ['Bold', 'Direct', 'Confident', 'Technical', 'Ambitious'],
    ecommerce: ['Aspirational', 'Warm', 'Trustworthy', 'Lifestyle-focused', 'Detail-oriented'],
    personal: ['Authoritative', 'Approachable', 'Thoughtful', 'Empathetic', 'Clear'],
  };
  return tones[mode] || tones.startup;
}

const PALETTES = [
  ['#0EA5E9', '#0284C7', '#0369A1', '#7DD3FC', '#BAE6FD'],
  ['#8B5CF6', '#7C3AED', '#6D28D9', '#A78BFA', '#C4B5FD'],
  ['#10B981', '#059669', '#047857', '#6EE7B7', '#A7F3D0'],
  ['#F59E0B', '#D97706', '#B45309', '#FCD34D', '#FDE68A'],
  ['#EC4899', '#DB2777', '#BE185D', '#F9A8D4', '#FBCFE8'],
  ['#6366F1', '#4F46E5', '#4338CA', '#A5B4FC', '#C7D2FE'],
];
