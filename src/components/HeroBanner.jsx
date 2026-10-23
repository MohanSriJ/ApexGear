import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export default function HeroBanner({ onAskPrompt }) {
  const samplePrompts = [
    "Wireless mechanical keyboard for Mac under $100",
    "Best noise-cancelling headphones for long flights",
    "Compare over-ear headphones vs sport earbuds",
    "Ergonomic desk accessories to reduce wrist strain"
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-brand-950 text-white p-6 sm:p-10 my-6 shadow-2xl">
      {/* Decorative Glow Elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-24 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-400/20 text-brand-300 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>Next-Gen Consultative E-Commerce</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
          Find your dream desk & gear setup with{' '}
          <span className="bg-gradient-to-r from-brand-300 via-indigo-200 to-purple-300 bg-clip-text text-transparent">
            AI Sales Guidance
          </span>
        </h1>

        <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
          Don't waste hours filtering dozens of specs. Chat directly with our AI Personal Shopper to discover products that fit your exact workflow, budget, and ergonomics.
        </p>

        {/* Interactive Prompt Pills */}
        <div className="mt-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
            Try asking our AI shopper:
          </p>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => onAskPrompt(prompt)}
                className="group flex items-center gap-2 text-xs font-medium px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 hover:border-brand-300/40 text-slate-200 hover:text-white transition-all duration-200"
              >
                <span>"{prompt}"</span>
                <ArrowRight className="w-3 h-3 text-brand-300 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ))}
          </div>
        </div>

        {/* Feature Badges */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-brand-400 shrink-0" />
            <span>Free 2-4 day shipping over $50</span>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-brand-400 shrink-0" />
            <span>30-day hassle-free return label</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-400 shrink-0" />
            <span>2-year full hardware warranty</span>
          </div>
        </div>
      </div>
    </div>
  );
}
