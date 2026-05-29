import { NextRequest, NextResponse } from 'next/server';
import { BrandSystem } from '@/lib/types';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export const runtime = 'nodejs';

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

    const pdfBuffer = await generatePdfBuffer(brand);
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
    const arrayBuffer = await blob.arrayBuffer();

    return new NextResponse(Buffer.from(arrayBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${brand.brandName.replace(/[^a-zA-Z0-9]/g, '')}-brand-kit.pdf`,
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

function hexToRgb(hex: string) {
  const h = hex.replace('#', '');
  return rgb(
    parseInt(h.substring(0, 2), 16) / 255,
    parseInt(h.substring(2, 4), 16) / 255,
    parseInt(h.substring(4, 6), 16) / 255
  );
}

function wrapText(text: string, maxWidth: number, font: any, fontSize: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0] || '';

  for (let i = 1; i < words.length; i++) {
    const testLine = currentLine + ' ' + words[i];
    const width = font.widthOfTextAtSize(testLine, fontSize);
    if (width < maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = words[i];
    }
  }
  lines.push(currentLine);
  return lines;
}

async function generatePdfBuffer(brand: BrandSystem): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  let page = doc.addPage([595.28, 841.89]); // A4
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const mono = await doc.embedFont(StandardFonts.Courier);

  const primary = hexToRgb(brand.colorPalette[0] || '#0EA5E9');

  let y = 800;
  const margin = 50;
  const maxWidth = 495;

  const drawSection = (title: string, bodyText: string, startY: number) => {
    page.drawText(title.toUpperCase(), { x: margin, y: startY, size: 10, font: bold, color: rgb(0.6, 0.6, 0.6) });
    const lines = wrapText(bodyText, maxWidth, font, 11);
    let cy = startY - 16;
    for (const line of lines) {
      if (cy < 50) { page = doc.addPage([595.28, 841.89]); cy = 800; }
      page.drawText(line, { x: margin, y: cy, size: 11, font, color: rgb(0.22, 0.22, 0.22) });
      cy -= 16;
    }
    return cy - 12;
  };

  const drawBulletList = (items: string[], startY: number, bullet: string) => {
    let cy = startY;
    for (const item of items) {
      if (cy < 50) { page = doc.addPage([595.28, 841.89]); cy = 800; }
      const text = `${bullet} ${item}`;
      const lines = wrapText(text, maxWidth, font, 10);
      for (const line of lines) {
        page.drawText(line, { x: margin, y: cy, size: 10, font, color: rgb(0.22, 0.22, 0.22) });
        cy -= 14;
      }
      cy -= 4;
    }
    return cy - 8;
  };

  // HEADER
  page.drawRectangle({ x: 0, y: 680, width: 595.28, height: 161.89, color: primary });
  page.drawText(brand.brandName, { x: margin, y: 760, size: 32, font: bold, color: rgb(1, 1, 1) });
  page.drawText(brand.tagline, { x: margin, y: 732, size: 14, font, color: rgb(0.95, 0.95, 0.95) });
  y = 660;

  // MISSION & VISION
  page.drawText('MISSION', { x: margin, y, size: 10, font: bold, color: rgb(0.6, 0.6, 0.6) });
  const missionLines = wrapText(brand.mission, maxWidth, font, 11);
  y -= 16;
  for (const line of missionLines) { page.drawText(line, { x: margin, y, size: 11, font, color: rgb(0.22, 0.22, 0.22) }); y -= 16; }
  y -= 8;
  page.drawText('VISION', { x: margin, y, size: 10, font: bold, color: rgb(0.6, 0.6, 0.6) });
  const visionLines = wrapText(brand.vision, maxWidth, font, 11);
  y -= 16;
  for (const line of visionLines) { page.drawText(line, { x: margin, y, size: 11, font, color: rgb(0.22, 0.22, 0.22) }); y -= 16; }
  y -= 16;
  page.drawLine({ start: { x: margin, y }, end: { x: 545, y }, thickness: 0.5, color: rgb(0.9, 0.9, 0.9) });
  y -= 20;

  // SECTIONS
  y = drawSection('Target Audience', brand.targetAudience, y);
  y -= 8;

  // VALUES
  page.drawText('CORE VALUES', { x: margin, y, size: 10, font: bold, color: rgb(0.6, 0.6, 0.6) });
  y -= 16;
  for (const val of brand.values) {
    if (y < 50) { page = doc.addPage([595.28, 841.89]); y = 800; }
    page.drawRectangle({ x: margin, y: y - 2, width: font.widthOfTextAtSize(val, 10) + 16, height: 18, color: rgb(0.95, 0.95, 0.95) });
    page.drawText(val, { x: margin + 8, y, size: 10, font: bold, color: primary });
    y -= 24;
  }
  y -= 8;

  // TONE OF VOICE
  page.drawText('TONE OF VOICE', { x: margin, y, size: 10, font: bold, color: rgb(0.6, 0.6, 0.6) });
  y -= 16;
  for (const tone of brand.toneOfVoice) {
    if (y < 50) { page = doc.addPage([595.28, 841.89]); y = 800; }
    page.drawRectangle({ x: margin, y: y - 2, width: font.widthOfTextAtSize(tone, 10) + 16, height: 18, color: rgb(0.97, 0.94, 1) });
    page.drawText(tone, { x: margin + 8, y, size: 10, font: bold, color: rgb(0.48, 0.24, 0.93) });
    y -= 24;
  }
  y -= 8;

  page.drawLine({ start: { x: margin, y }, end: { x: 545, y }, thickness: 0.5, color: rgb(0.9, 0.9, 0.9) });
  y -= 20;

  // COLOR PALETTE
  page.drawText('COLOR PALETTE', { x: margin, y, size: 10, font: bold, color: rgb(0.6, 0.6, 0.6) });
  y -= 20;
  for (const color of brand.colorPalette) {
    if (y < 50) { page = doc.addPage([595.28, 841.89]); y = 800; }
    const c = hexToRgb(color);
    page.drawRectangle({ x: margin, y: y - 2, width: 18, height: 18, color: c, borderColor: rgb(0.9, 0.9, 0.9), borderWidth: 0.5 });
    page.drawText(color, { x: margin + 26, y, size: 9, font: mono, color: rgb(0.42, 0.42, 0.42) });
    y -= 22;
  }
  y -= 8;

  y = drawSection('Typography', brand.typography, y);
  y -= 8;
  page.drawLine({ start: { x: margin, y }, end: { x: 545, y }, thickness: 0.5, color: rgb(0.9, 0.9, 0.9) });
  y -= 20;

  // LOGO PROMPT
  page.drawText('LOGO DESIGN PROMPT', { x: margin, y, size: 10, font: bold, color: rgb(0.6, 0.6, 0.6) });
  y -= 16;
  const logoLines = wrapText(brand.logoPrompt, maxWidth, mono, 9);
  for (const line of logoLines) {
    if (y < 50) { page = doc.addPage([595.28, 841.89]); y = 800; }
    page.drawText(line, { x: margin, y, size: 9, font: mono, color: rgb(0.22, 0.22, 0.22) });
    y -= 14;
  }
  y -= 12;

  page.drawLine({ start: { x: margin, y }, end: { x: 545, y }, thickness: 0.5, color: rgb(0.9, 0.9, 0.9) });
  y -= 20;

  y = drawBulletList(brand.socialContent, drawSection('Content Pillars', '', y), '✦');
  y -= 8;
  y = drawBulletList(brand.marketingCampaigns, drawSection('Marketing Campaigns', '', y), '◆');
  y -= 8;

  page.drawLine({ start: { x: margin, y }, end: { x: 545, y }, thickness: 0.5, color: rgb(0.9, 0.9, 0.9) });
  y -= 20;

  page.drawText('LANDING PAGE HEADLINES', { x: margin, y, size: 10, font: bold, color: rgb(0.6, 0.6, 0.6) });
  y -= 16;
  for (const headline of brand.landingPageHeadlines) {
    if (y < 50) { page = doc.addPage([595.28, 841.89]); y = 800; }
    page.drawRectangle({ x: margin, y: y - 4, width: maxWidth, height: 22, color: rgb(0.97, 0.97, 0.97), borderColor: rgb(0.9, 0.9, 0.9), borderWidth: 0.5 });
    page.drawText(headline, { x: margin + 8, y: y + 2, size: 10, font: bold, color: rgb(0.12, 0.12, 0.12) });
    y -= 28;
  }
  y -= 20;

  // FOOTER
  page.drawLine({ start: { x: margin, y }, end: { x: 545, y }, thickness: 0.5, color: rgb(0.9, 0.9, 0.9) });
  y -= 16;
  page.drawText('Generated by BrandForge', { x: margin, y, size: 9, font, color: rgb(0.6, 0.6, 0.6) });

  return doc.save();
}