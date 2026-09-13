"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Shield,
  Target,
  AlertTriangle,
  BookOpen,
} from "lucide-react";
import { calculateFlesch } from "@/lib/flesch";
import { Navbar } from "@/components/Navbar";

export default function HomePage() {
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<
    "goals" | "scenarios" | "readability"
  >("goals");

  // Interactive teaser text
  const [text, setText] = useState(
    "Medical personnel must ensure the secure encryption of protected health information."
  );
  const score = useMemo(() => calculateFlesch(text || ""), [text]);

  const tabs = [
    { id: "goals" as const, label: "Goal Specification", icon: Target },
    { id: "scenarios" as const, label: "Misuse Scenarios", icon: AlertTriangle },
    { id: "readability" as const, label: "Flesch Engine", icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-[#F4F1FA] text-[#332F3A] relative flex flex-col justify-between">
      {/* ── Floating 3D Ambient Blobs (Isolated in fixed/absolute container) ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-0">
        <div className="clay-blob-1" />
        <div className="clay-blob-2" />
        <div className="clay-blob-3" />
      </div>

      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-16 flex-1 w-full relative z-10">
        {/* ── HERO SECTION ── */}
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          {/* Announcement Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full clay-pill text-xs text-[#635F69] font-bold"
          >
            <span className="h-2 w-2 rounded-full bg-[#7C3AED] animate-pulse" />
            <span className="font-bold text-[#332F3A]">SPRAT 2.0</span>
            <span className="text-[#A78BFA]">•</span>
            <span className="text-[#635F69]">Security Requirements Engine</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-[#332F3A]"
            style={{ fontFamily: "var(--font-nunito), sans-serif" }}
          >
            Requirements engineering, <br />
            <span className="clay-text-gradient">formalized.</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-base sm:text-lg text-[#635F69] leading-relaxed max-w-xl mx-auto font-medium"
          >
            Model Protection & Vulnerability goals, analyze threat scenarios,
            and evaluate policy readability in real time.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="pt-4 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/projects"
              className="clay-btn-primary inline-flex items-center space-x-2.5 px-7 py-3.5 rounded-[22px] text-white text-sm font-bold shadow-[10px_10px_22px_rgba(139,92,246,0.32),-6px_-6px_14px_#ffffff]"
            >
              <span>Launch Workspace</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/login"
              className="clay-btn-secondary inline-flex items-center px-6 py-3.5 rounded-[22px] text-[#332F3A] text-sm font-bold"
            >
              Sign In
            </Link>
          </motion.div>
        </section>

        {/* ── INTERACTIVE SHOWCASE ── */}
        <section className="space-y-6 max-w-4xl mx-auto">
          {/* Recessed Tab Selector Pill */}
          <div className="flex justify-center">
            <div className="inline-flex items-center p-1.5 rounded-[24px] clay-track gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeShowcaseTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveShowcaseTab(tab.id)}
                    className={`relative px-5 py-2.5 rounded-[18px] text-xs font-bold transition-all flex items-center space-x-2 ${
                      isSelected
                        ? "bg-white text-[#7C3AED] shadow-[6px_6px_14px_rgba(160,150,180,0.2),-4px_-4px_8px_#ffffff]"
                        : "text-[#635F69] hover:text-[#332F3A]"
                    }`}
                    style={{ fontFamily: "var(--font-nunito), sans-serif" }}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* High-Fidelity Clay Card Container */}
          <div className="p-8 sm:p-10 rounded-[36px] clay-card relative overflow-hidden">
            <AnimatePresence mode="wait">
              {activeShowcaseTab === "goals" && (
                <motion.div
                  key="goals"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <div className="flex items-center justify-between border-b border-[#EAE5F3] pb-4">
                    <div className="flex items-center space-x-3">
                      <span className="font-extrabold text-xs px-3 py-1 rounded-xl bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white shadow-[3px_3px_8px_rgba(139,92,246,0.3)]">
                        G-001
                      </span>
                      <span className="text-xs px-3 py-1 rounded-full bg-[#EFEBF5] text-[#7C3AED] font-bold">
                        Protection: Integrity / Security
                      </span>
                    </div>
                    <span className="text-xs text-[#635F69] font-bold font-mono">
                      Policy Level • Observable
                    </span>
                  </div>

                  <p className="text-base text-[#332F3A] leading-relaxed font-medium">
                    Prevent unauthorized interception and exfiltration of electronic patient
                    health records during network transmission.
                  </p>

                  <div className="flex items-center justify-between text-xs font-bold text-[#635F69] pt-3 border-t border-[#EAE5F3]">
                    <span>Actor: Network Attacker</span>
                    <span className="text-[#7C3AED] font-mono">HIPAA §164.312</span>
                  </div>
                </motion.div>
              )}

              {activeShowcaseTab === "scenarios" && (
                <motion.div
                  key="scenarios"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <div className="flex items-center justify-between border-b border-[#EAE5F3] pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-xl bg-[#F59E0B]/15 text-[#F59E0B] flex items-center justify-center font-bold shadow-[inset_2px_2px_4px_rgba(245,158,11,0.2)]">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <span className="text-base font-extrabold text-[#332F3A]" style={{ fontFamily: "var(--font-nunito), sans-serif" }}>
                        Clinic Wi-Fi Eavesdropping
                      </span>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#10B981]/15 text-[#10B981]">
                      Status: Mitigated
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-[#EFEBF5] p-5 rounded-[24px] shadow-[inset_4px_4px_8px_#dcd7e7,inset_-4px_-4px_8px_#ffffff]">
                    <div>
                      <span className="text-[#635F69] block text-[10px] uppercase font-bold tracking-wider">
                        Actor
                      </span>
                      <span className="text-sm font-bold text-[#332F3A] mt-0.5 block">External Threat Actor</span>
                    </div>
                    <div>
                      <span className="text-[#635F69] block text-[10px] uppercase font-bold tracking-wider">
                        Action
                      </span>
                      <span className="text-sm font-bold text-[#332F3A] mt-0.5 block">Packet capture sniffer</span>
                    </div>
                    <div>
                      <span className="text-[#635F69] block text-[10px] uppercase font-bold tracking-wider">
                        Obstacle
                      </span>
                      <span className="text-sm font-bold text-[#332F3A] mt-0.5 block">WPA3 Enterprise Encryption</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeShowcaseTab === "readability" && (
                <motion.div
                  key="readability"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-[#635F69]">
                    <span>Live Flesch Readability Engine</span>
                    <span className="text-[#7C3AED] font-mono">Real-time</span>
                  </div>

                  <textarea
                    rows={2}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full p-4 rounded-2xl clay-input text-sm text-[#332F3A] placeholder-[#635F69] focus:outline-none font-medium resize-none"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-2xl bg-white shadow-[6px_6px_14px_rgba(160,150,180,0.14),-4px_-4px_10px_#ffffff] border border-white/80">
                      <span className="text-[#635F69] text-[10px] uppercase font-bold tracking-wider">
                        Reading Ease
                      </span>
                      <div className="text-2xl font-black text-[#7C3AED] mt-1" style={{ fontFamily: "var(--font-nunito), sans-serif" }}>
                        {score.fres}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white shadow-[6px_6px_14px_rgba(160,150,180,0.14),-4px_-4px_10px_#ffffff] border border-white/80">
                      <span className="text-[#635F69] text-[10px] uppercase font-bold tracking-wider">
                        Grade Level
                      </span>
                      <div className="text-2xl font-black text-[#332F3A] mt-1" style={{ fontFamily: "var(--font-nunito), sans-serif" }}>
                        Grade {score.fgl}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white shadow-[6px_6px_14px_rgba(160,150,180,0.14),-4px_-4px_10px_#ffffff] border border-white/80">
                      <span className="text-[#635F69] text-[10px] uppercase font-bold tracking-wider">
                        Word Stats
                      </span>
                      <div className="text-xs font-bold text-[#332F3A] mt-2">
                        {score.wordCount} words • {score.syllableCount} syllables
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* ── 3 BENTO CLAY CARDS ── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-[32px] clay-card space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white flex items-center justify-center shadow-[6px_6px_14px_rgba(139,92,246,0.3),-3px_-3px_8px_#ffffff]">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-extrabold text-[#332F3A]" style={{ fontFamily: "var(--font-nunito), sans-serif" }}>
              Goal & Threat Modeling
            </h3>
            <p className="text-sm text-[#635F69] leading-relaxed font-medium">
              Formalize Protection & Vulnerability categories, actors, and 13-attribute misuse scenarios.
            </p>
          </div>

          <div className="p-8 rounded-[32px] clay-card space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#38BDF8] to-[#0EA5E9] text-white flex items-center justify-center shadow-[6px_6px_14px_rgba(14,165,233,0.3),-3px_-3px_8px_#ffffff]">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-extrabold text-[#332F3A]" style={{ fontFamily: "var(--font-nunito), sans-serif" }}>
              Flesch Readability Scoring
            </h3>
            <p className="text-sm text-[#635F69] leading-relaxed font-medium">
              Sub-millisecond FRES ease scores and grade level interpretations across policy texts.
            </p>
          </div>

          <div className="p-8 rounded-[32px] clay-card space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#F472B6] to-[#DB2777] text-white flex items-center justify-center shadow-[6px_6px_14px_rgba(219,39,119,0.3),-3px_-3px_8px_#ffffff]">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-extrabold text-[#332F3A]" style={{ fontFamily: "var(--font-nunito), sans-serif" }}>
              Role-Based Governance
            </h3>
            <p className="text-sm text-[#635F69] leading-relaxed font-medium">
              Strict per-project RBAC separating Admins, PMs, Analysts, and restricted Guests.
            </p>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="py-8 text-center text-xs font-bold text-[#635F69] relative z-10">
        SPRAT • Security & Privacy Requirements Analysis Tool
      </footer>
    </div>
  );
}
