"use client";

import { useState, useRef, useEffect } from "react";
import { BrandSystem, BrandMode } from "@/lib/types";
import { MODE_LABELS } from "@/lib/prompts";
import { motion, AnimatePresence } from "framer-motion";

const modes: { value: BrandMode; label: string }[] = [
  { value: "startup", label: MODE_LABELS.startup },
  { value: "creator", label: MODE_LABELS.creator },
  { value: "ecommerce", label: MODE_LABELS.ecommerce },
  { value: "personal", label: MODE_LABELS.personal },
];

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export default function Home() {
  const [idea, setIdea] = useState("");
  const [mode, setMode] = useState<BrandMode>("startup");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<BrandSystem | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const brandIdRef = useRef<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

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
      brandIdRef.current = generateId();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleGenerate();
    }
  };

  const copyShareLink = () => {
    if (!brandIdRef.current || !result) return;
    const url = `${window.location.origin}/share/${brandIdRef.current}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPdf = async (brand: BrandSystem) => {
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg brand-gradient-bg flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="font-semibold text-gray-900">BrandForge</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/Mrblackooo/brandforge"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              GitHub
            </a>
            <button className="text-sm px-4 py-2 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition-all">
              Get Pro
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pb-24">
        {/* Hero */}
        <div className="pt-20 pb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              AI-Powered Brand Generator
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
              Turn an idea into a
              <br />
              <span className="brand-gradient">complete brand</span>
            </h1>
            <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto">
              Describe your idea in one sentence. Get a full brand identity —
              name, colors, voice, and strategy — in under 2 minutes.
            </p>
          </motion.div>
        </div>

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="glass-card rounded-2xl p-6 sm:p-8 mb-8">
            {/* Mode selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What kind of brand?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {modes.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setMode(m.value)}
                    className={`relative px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      mode === m.value
                        ? "bg-indigo-50 border-2 border-indigo-500 text-indigo-700 shadow-sm"
                        : "bg-gray-50 border-2 border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                    }`}
                  >
                    {mode === m.value && (
                      <motion.div
                        layoutId="mode-pill"
                        className="absolute inset-0 rounded-xl bg-indigo-50"
                        style={{ zIndex: -1 }}
                      />
                    )}
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Text input */}
            <label htmlFor="idea" className="block text-sm font-medium text-gray-700 mb-2">
              Describe your brand idea
            </label>
            <div className="relative">
              <textarea
                id="idea"
                rows={3}
                className="input-field w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm 
                  placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 
                  focus:border-indigo-400 transition-all duration-200 resize-none"
                placeholder='e.g., "A sustainable fashion brand for eco-conscious millennials who love minimalist design"'
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                {idea.length > 0 && `${idea.length} chars`}
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-gray-400">
                Press <kbd className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-mono text-xs">Cmd+Enter</kbd> to generate
              </p>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !idea.trim()}
                className="relative inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white 
                  brand-gradient-bg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed 
                  transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Forging your brand...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Forge My Brand
                  </>
                )}
              </button>
            </div>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg"
              >
                {error}
              </motion.p>
            )}
          </div>
        </motion.div>

        {/* Result */}
        <AnimatePresence mode="wait">
          {isGenerating && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card rounded-2xl p-6">
                  <div className="h-4 w-24 bg-gray-200 rounded-full animate-pulse mb-4" />
                  <div className="h-3 w-full bg-gray-100 rounded-full animate-pulse mb-2" />
                  <div className="h-3 w-3/4 bg-gray-100 rounded-full animate-pulse" />
                </div>
              ))}
            </motion.div>
          )}

          {result && !isGenerating && (
            <motion.div
              key="result"
              ref={resultRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Confetti effect */}
              {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-50">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{
                        opacity: 1,
                        x: Math.random() * window.innerWidth,
                        y: -20,
                        rotate: 0,
                      }}
                      animate={{
                        y: window.innerHeight + 20,
                        rotate: 720,
                        opacity: 0,
                      }}
                      transition={{
                        duration: 2 + Math.random() * 2,
                        delay: Math.random() * 0.5,
                        ease: "easeOut",
                      }}
                      className="absolute w-2 h-2 rounded-sm"
                      style={{
                        background: result.colorPalette[i % result.colorPalette.length],
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Result Header */}
              <div className="glass-card rounded-2xl p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <motion.h2
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-3xl sm:text-4xl font-bold text-gray-900"
                    >
                      {result.brandName}
                    </motion.h2>
                    <p className="text-gray-500 italic mt-2 text-lg">
                      {result.tagline}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={copyShareLink}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
                    >
                      {copied ? (
                        <>
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Copied!
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                          Share
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => downloadPdf(result)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      PDF
                    </button>
                  </div>
                </div>
              </div>

              {/* Brand sections with staggered animation */}
              <BrandSections result={result} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!result && !isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm">Describe your idea above and forge your brand</p>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-6 h-6 rounded-md brand-gradient-bg flex items-center justify-center">
                <span className="text-white font-bold text-xs">B</span>
              </div>
              Made with BrandForge
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-gray-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-gray-600 transition-colors">Terms</a>
              <a
                href="https://github.com/Mrblackooo/brandforge"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-600 transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function BrandSections({ result }: { result: BrandSystem }) {
  const sections = [
    {
      title: "Mission & Vision",
      content: (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500 mb-2">Mission</p>
            <p className="text-gray-700 text-sm leading-relaxed">{result.mission}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500 mb-2">Vision</p>
            <p className="text-gray-700 text-sm leading-relaxed">{result.vision}</p>
          </div>
        </div>
      ),
    },
    {
      title: "Core Values",
      content: (
        <div className="flex flex-wrap gap-2">
          {result.values.map((v, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-100"
            >
              {v}
            </motion.span>
          ))}
        </div>
      ),
    },
    {
      title: "Target Audience",
      content: (
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">{result.targetAudience}</p>
        </div>
      ),
    },
    {
      title: "Tone of Voice",
      content: (
        <div className="flex flex-wrap gap-2">
          {result.toneOfVoice.map((t, i) => (
            <span
              key={i}
              className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm font-medium border border-purple-100"
            >
              {t}
            </span>
          ))}
        </div>
      ),
    },
    {
      title: "Color Palette",
      content: (
        <div className="flex gap-3 flex-wrap">
          {result.colorPalette.map((color, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex flex-col items-center gap-2"
            >
              <div
                className="w-14 h-14 rounded-xl border-2 border-gray-100 shadow-sm"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs font-mono text-gray-500">{color}</span>
            </motion.div>
          ))}
        </div>
      ),
    },
    {
      title: "Typography",
      content: (
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold text-gray-500">Aa</span>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">{result.typography}</p>
        </div>
      ),
    },
    {
      title: "Logo Design Prompt",
      content: (
        <div className="bg-gradient-to-r from-gray-50 to-indigo-50 rounded-xl p-4 border border-gray-100">
          <p className="text-gray-700 text-sm leading-relaxed font-mono">{result.logoPrompt}</p>
        </div>
      ),
    },
    {
      title: "Content Pillars",
      content: (
        <ul className="space-y-2">
          {result.socialContent.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      ),
    },
    {
      title: "Marketing Campaigns",
      content: (
        <ul className="space-y-2">
          {result.marketingCampaigns.map((campaign, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
              {campaign}
            </li>
          ))}
        </ul>
      ),
    },
    {
      title: "Landing Page Headlines",
      content: (
        <div className="space-y-3">
          {result.landingPageHeadlines.map((headline, i) => (
            <div
              key={i}
              className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 text-sm font-medium text-gray-800"
            >
              {headline}
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <>
      {sections.map((section, i) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.06, duration: 0.4 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            {section.title}
          </h3>
          {section.content}
        </motion.div>
      ))}
    </>
  );
}