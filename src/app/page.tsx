"use client";

import { useState } from "react";
import { BrandSystem, BrandMode } from "@/lib/types";
import { MODE_LABELS } from "@/lib/prompts";

const modes: { value: BrandMode; label: string }[] = [
  { value: "startup", label: MODE_LABELS.startup },
  { value: "creator", label: MODE_LABELS.creator },
  { value: "ecommerce", label: MODE_LABELS.ecommerce },
  { value: "personal", label: MODE_LABELS.personal },
];

export default function Home() {
  const [idea, setIdea] = useState("");
  const [mode, setMode] = useState<BrandMode>("startup");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<BrandSystem | null>(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!idea.trim()) return;
    setIsGenerating(true);
    setResult(null);
    setError("");

    try {
      const res = await fetch("/api/generate-brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: idea.trim(), mode }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Generation failed");
      }
      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-sky-500 to-sky-700 bg-clip-text text-transparent">
            BrandForge
          </h1>
          <p className="text-gray-500 text-lg">
            Turn a simple idea into a complete brand identity — in under 2 minutes
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What kind of brand are you building?
            </label>
            <div className="flex gap-2 flex-wrap">
              {modes.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMode(m.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    mode === m.value
                      ? "bg-sky-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <label
            htmlFor="idea"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Describe your brand idea
          </label>
          <textarea
            id="idea"
            rows={3}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            placeholder="e.g., A sustainable fashion brand for eco-conscious millennials who love minimalist design"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !idea.trim()}
            className="mt-4 w-full rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? "Forging your brand..." : "Forge My Brand"}
          </button>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </div>

        {result && <BrandResultDisplay result={result} />}
      </div>
    </main>
  );
}

async function downloadPdf(brand: BrandSystem) {
  try {
    const res = await fetch("/api/export/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: brand }),
    });
    if (!res.ok) throw new Error("PDF generation failed");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${brand.brandName.replace(/[^a-zA-Z0-9]/g, "")}-brand-kit.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("PDF download error:", err);
  }
}

function BrandResultDisplay({ result }: { result: BrandSystem }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{result.brandName}</h2>
            <p className="text-gray-500 italic mt-1">{result.tagline}</p>
          </div>
          <button
            onClick={() => downloadPdf(result)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </button>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Mission" text={result.mission} />
        <Card title="Vision" text={result.vision} />
      </div>

      {/* Values */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <SectionHeader title="Core Values" />
        <div className="flex flex-wrap gap-2">
          {result.values.map((v, i) => (
            <span
              key={i}
              className="px-3 py-1.5 bg-sky-50 text-sky-700 rounded-full text-sm font-medium"
            >
              {v}
            </span>
          ))}
        </div>
      </div>

      {/* Target Audience */}
      <Card title="Target Audience" text={result.targetAudience} />

      {/* Tone of Voice */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <SectionHeader title="Tone of Voice" />
        <div className="flex flex-wrap gap-2">
          {result.toneOfVoice.map((t, i) => (
            <span
              key={i}
              className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm font-medium"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Color Palette */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <SectionHeader title="Color Palette" />
        <div className="flex gap-3 flex-wrap">
          {result.colorPalette.map((color, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className="w-12 h-12 rounded-lg border border-gray-200 shadow-sm"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs font-mono text-gray-500">{color}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Typography */}
      <Card title="Typography" text={result.typography} />

      {/* Logo Prompt */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <SectionHeader title="Logo Design Prompt" />
        <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg font-mono">
          {result.logoPrompt}
        </p>
      </div>

      {/* Social Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <SectionHeader title="Content Pillars" />
        <ul className="space-y-2">
          {result.socialContent.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-sky-500 mt-0.5">✦</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Marketing Campaigns */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <SectionHeader title="Marketing Campaigns" />
        <ul className="space-y-2">
          {result.marketingCampaigns.map((campaign, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-purple-500 mt-0.5">◆</span>
              {campaign}
            </li>
          ))}
        </ul>
      </div>

      {/* Landing Page Headlines */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <SectionHeader title="Landing Page Headlines" />
        <div className="space-y-2">
          {result.landingPageHeadlines.map((headline, i) => (
            <div
              key={i}
              className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm font-medium text-gray-800"
            >
              {headline}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Card({ title, text }: { title: string; text: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <SectionHeader title={title} />
      <p className="text-gray-700 text-sm leading-relaxed">{text}</p>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
      {title}
    </h3>
  );
}