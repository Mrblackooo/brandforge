import { NextRequest, NextResponse } from 'next/server';
import { generateBrandSystem } from '@/lib/groq';
import { GenerateBrandRequest, GenerateBrandResponse, BrandSystem } from '@/lib/types';
import { BRAND_MODES, DEFAULT_MODE } from '@/lib/prompts';

export async function POST(request: NextRequest): Promise<NextResponse<GenerateBrandResponse>> {
  try {
    const body: GenerateBrandRequest = await request.json();
    const { idea, mode } = body;

    if (!idea || typeof idea !== 'string' || idea.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'A brand idea description is required' },
        { status: 400 }
      );
    }

    const validMode = mode && BRAND_MODES.includes(mode as typeof BRAND_MODES[number])
      ? (mode as typeof BRAND_MODES[number])
      : DEFAULT_MODE;

    const brand: BrandSystem = await generateBrandSystem(idea.trim(), validMode);

    return NextResponse.json({ success: true, data: brand });
  } catch (error) {
    console.error('Brand generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate brand identity' },
      { status: 500 }
    );
  }
}