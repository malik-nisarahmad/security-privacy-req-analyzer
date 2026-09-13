"use client";

import React from "react";
import Link from "next/link";
import { Shield, ArrowRight } from "lucide-react";

export function Navbar({ isWorkspace = false }: { isWorkspace?: boolean }) {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#F4F1FA]/85 backdrop-blur-xl border-b border-[#EAE5F3] shadow-[0_4px_20px_rgba(160,150,180,0.1)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white flex items-center justify-center font-bold text-xs shadow-[4px_4px_10px_rgba(139,92,246,0.3),-2px_-2px_6px_#ffffff]">
            <Shield className="h-5 w-5 text-white fill-white/20" />
          </div>
          <span
            className="font-extrabold text-base tracking-tight text-[#332F3A]"
            style={{ fontFamily: "var(--font-nunito), sans-serif" }}
          >
            SPRAT
          </span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#EFEBF5] text-[#7C3AED] border border-white/60 shadow-[inset_2px_2px_4px_#dcd7e7,inset_-2px_-2px_4px_#ffffff]">
            2.0
          </span>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center space-x-3 text-sm font-medium">
          {isWorkspace ? (
            <Link
              href="/"
              className="px-4 py-2 rounded-2xl bg-white text-[#635F69] hover:text-[#332F3A] hover:bg-[#EFEBF5] transition-all shadow-[4px_4px_10px_rgba(160,150,180,0.12),-4px_-4px_8px_#ffffff]"
            >
              Exit Workspace
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-[#635F69] hover:text-[#332F3A] transition-colors rounded-2xl hover:bg-white/60"
              >
                Sign In
              </Link>
              <Link
                href="/projects"
                className="clay-btn-primary inline-flex items-center space-x-2 px-5 py-2.5 rounded-[18px] text-white text-sm font-bold shadow-[8px_8px_18px_rgba(139,92,246,0.32),-4px_-4px_10px_#ffffff]"
              >
                <span>Launch App</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
