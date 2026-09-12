"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Target, BookOpen, ShieldCheck } from "lucide-react";
import { calculateFlesch } from "@/lib/flesch";
import { Navbar } from "@/components/Navbar";

export default function HomePage() {
  const [text, setText] = useState(
    "All medical personnel must ensure the secure encryption of electronic protected health information."
  );

  const score = useMemo(() => calculateFlesch(text || ""), [text]);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-zinc-800 selection:text-white flex flex-col justify-between">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 space-y-16 flex-1 w-full">
        {/* Hero Section */}
        <section className="text-center space-y-5">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-[1.15]">
            Security & privacy requirements engineering.
          </h1>
          <p className="max-w-xl mx-auto text-sm sm:text-base text-zinc-400 leading-relaxed">
            A minimalist analytical tool for formalizing Protection & Vulnerability goals,
            mapping 13-attribute misuse scenarios, and scoring policy readability.
          </p>

          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              href="/projects"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs transition-all active:scale-[0.98]"
            >
              <span>Open Workspace</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 rounded-md border border-zinc-800 hover:bg-zinc-900 text-zinc-300 font-medium text-xs transition-colors"
            >
              Sign In
            </Link>
          </div>
        </section>

        {/* Minimal Interactive Readability Preview */}
        <section className="p-6 rounded-xl border border-zinc-850 bg-[#121215] space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-zinc-300">
              Interactive Readability Analyzer (FRES)
            </span>
            <span className="text-zinc-500 font-mono text-[11px]">
              Type to calculate real-time
            </span>
          </div>

          <textarea
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors font-mono resize-none"
            placeholder="Type any security policy clause..."
          />

          <div className="grid grid-cols-3 gap-3 text-xs pt-1">
            <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-850">
              <span className="text-zinc-500 text-[10px] uppercase font-semibold">
                Reading Ease
              </span>
              <div className="text-xl font-bold text-white font-mono mt-0.5">
                {score.fres}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-850">
              <span className="text-zinc-500 text-[10px] uppercase font-semibold">
                Grade Level
              </span>
              <div className="text-xl font-bold text-white font-mono mt-0.5">
                Grade {score.fgl}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-850">
              <span className="text-zinc-500 text-[10px] uppercase font-semibold">
                Corpus Count
              </span>
              <div className="text-xs text-zinc-300 font-mono mt-1">
                {score.wordCount} words • {score.syllableCount} syl
              </div>
            </div>
          </div>
        </section>

        {/* 3 Focused Feature Highlights */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl border border-zinc-850 bg-[#121215] space-y-2">
            <Target className="h-4 w-4 text-zinc-300" />
            <h3 className="text-sm font-semibold text-white">Goal & Threat Modeling</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Classify Protection and Vulnerability goals, granularity, and 13-attribute
              misuse threat scenarios.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-zinc-850 bg-[#121215] space-y-2">
            <BookOpen className="h-4 w-4 text-zinc-300" />
            <h3 className="text-sm font-semibold text-white">Readability Heuristics</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Automated Flesch Reading Ease and Kincaid Grade scoring across security policies.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-zinc-850 bg-[#121215] space-y-2">
            <ShieldCheck className="h-4 w-4 text-zinc-300" />
            <h3 className="text-sm font-semibold text-white">Role-Based Governance</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Scoped access for Admins, Project Managers, Analysts, and restricted Guests.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-850 py-6 text-center text-xs text-zinc-600">
        SPRAT • Security & Privacy Requirements Analysis Tool
      </footer>
    </div>
  );
}
