"use client";

import React from "react";
import Link from "next/link";
import { Shield, ArrowRight } from "lucide-react";

export function Navbar({ isWorkspace = false }: { isWorkspace?: boolean }) {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#09090b]/80 backdrop-blur-md border-b border-zinc-850">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2.5">
          <div className="h-6 w-6 rounded bg-zinc-100 text-zinc-950 flex items-center justify-center font-bold text-xs">
            <Shield className="h-3.5 w-3.5 text-zinc-950" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-white">
            SPRAT
          </span>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center space-x-3 text-xs">
          {isWorkspace ? (
            <Link
              href="/"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Exit Workspace
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 py-1.5 text-zinc-400 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-medium transition-all"
              >
                <span>Launch App</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
