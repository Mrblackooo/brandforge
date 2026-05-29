import { NextRequest, NextResponse } from 'next/server';
import { BrandSystem } from '@/lib/types';
import puppeteer from 'puppeteer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const brand: BrandSystem = body.data;

    if (!brand || !brand.brandName) {
      return NextResponse.json(
        { success: false, error: 'Valid brand data is required' },
        { status: 400 }
      );
    }

    const html = generateBrandPDFHtml(brand);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
      printBackground: true,
    });

    await browser.close();

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${brand.brandName.replace(/[^a-zA-Z0-9]/g, '')}-brand-kit.pdf`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

function generateBrandPDFHtml(brand: BrandSystem): string {
  const colors = brand.colorPalette;
  const primaryColor = colors[0] || '#0EA5E9';
  const secondaryColor = colors[1] || '#0284C7';

  const colorSwatches = colors
    .map(
      (c) =>
        `<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <div style="width:24px;height:24px;border-radius:4px;background:${c};border:1px solid #e5e7eb"></div>
          <span style="font-size:11px;font-family:monospace;color:#6b7280">${c}</span>
        </div>`
    )
    .join('');

  const values = brand.values
    .map((v) => `<span style="display:inline-block;padding:4px 12px;background:${primaryColor}15;color:${primaryColor};border-radius:20px;font-size:12px;font-weight:500;margin:0 4px 4px 0">${v}</span>`)
    .join('');

  const tones = brand.toneOfVoice
    .map((t) => `<span style="display:inline-block;padding:4px 12px;background:#f3e8ff;color:#7c3aed;border-radius:20px;font-size:12px;font-weight:500;margin:0 4px 4px 0">${t}</span>`)
    .join('');

  const contentPillars = brand.socialContent
    .map((s) => `<li style="margin-bottom:6px;font-size:13px;color:#374151">✦ ${s}</li>`)
    .join('');

  const campaigns = brand.marketingCampaigns
    .map((c) => `<li style="margin-bottom:6px;font-size:13px;color:#374151">◆ ${c}</li>`)
    .join('');

  const headlines = brand.landingPageHeadlines
    .map(
      (h) =>
        `<div style="padding:10px 14px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:6px;font-size:13px;font-weight:500;color:#1f2937">${h}</div>`
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page { margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; color: #111827; line-height: 1.5; }
    .header { background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor}); color: white; padding: 40px 50px; }
    .header h1 { font-size: 36px; font-weight: 800; margin-bottom: 6px; }
    .header .tagline { font-size: 18px; opacity: 0.9; font-style: italic; }
    .content { padding: 30px 50px; }
    .section { margin-bottom: 24px; }
    .section h2 { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #9ca3af; margin-bottom: 10px; }
    .section p { font-size: 14px; color: #374151; line-height: 1.6; }
    .two-col { display: flex; gap: 24px; }
    .two-col > div { flex: 1; }
    hr { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
    .footer { text-align: center; padding: 20px 50px; color: #9ca3af; font-size: 11px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${brand.brandName}</h1>
    <p class="tagline">${brand.tagline}</p>
  </div>

  <div class="content">
    <div class="two-col section">
      <div>
        <h2>Mission</h2>
        <p>${brand.mission}</p>
      </div>
      <div>
        <h2>Vision</h2>
        <p>${brand.vision}</p>
      </div>
    </div>

    <hr />

    <div class="section">
      <h2>Target Audience</h2>
      <p>${brand.targetAudience}</p>
    </div>

    <div class="section">
      <h2>Core Values</h2>
      <div>${values}</div>
    </div>

    <div class="section">
      <h2>Tone of Voice</h2>
      <div>${tones}</div>
    </div>

    <hr />

    <div class="two-col section">
      <div>
        <h2>Color Palette</h2>
        ${colorSwatches}
      </div>
      <div>
        <h2>Typography</h2>
        <p style="font-size:13px">${brand.typography}</p>
      </div>
    </div>

    <hr />

    <div class="section">
      <h2>Logo Design Prompt</h2>
      <p style="font-family:monospace;font-size:12px;background:#f9fafb;padding:12px;border-radius:8px;line-height:1.6">${brand.logoPrompt}</p>
    </div>

    <hr />

    <div class="section">
      <h2>Content Pillars</h2>
      <ul style="list-style:none;padding:0">${contentPillars}</ul>
    </div>

    <div class="section">
      <h2>Marketing Campaigns</h2>
      <ul style="list-style:none;padding:0">${campaigns}</ul>
    </div>

    <hr />

    <div class="section">
      <h2>Landing Page Headlines</h2>
      ${headlines}
    </div>
  </div>

  <div class="footer">
    Generated by BrandForge — brandforge.app
  </div>
</body>
</html>`;
}