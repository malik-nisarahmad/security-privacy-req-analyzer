"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, ArrowRight, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { PRESET_USERS, setStoredSession } from "@/lib/auth/session";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      await res.json();
      if (res.ok) {
        toast.success("Signed in successfully");
      }
    } catch {
      // Offline fallback
    }

    const matched = Object.values(PRESET_USERS).find((u) => u.email === email);
    setStoredSession(
      matched || {
        id: "usr-custom",
        name: email.split("@")[0] || "User",
        email,
        role: "analyst",
      }
    );

    setIsLoading(false);
    router.push("/projects");
  };

  const handleSelectAccount = (userKey: keyof typeof PRESET_USERS) => {
    const user = PRESET_USERS[userKey];
    setStoredSession(user);
    toast.success(`Signed in as ${user.name}`, {
      description: `Role: ${user.role.replace("_", " ").toUpperCase()}`,
    });
    router.push("/projects");
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F4F1FA] text-[#332F3A] p-4 sm:p-6 relative overflow-hidden select-none">
      {/* ── Floating 3D Blobs ── */}
      <div className="clay-blob-1" />
      <div className="clay-blob-2" />

      {/* Top Bar */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between relative z-10">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white flex items-center justify-center transition-transform group-hover:scale-105 shadow-[4px_4px_10px_rgba(139,92,246,0.3),-2px_-2px_6px_#ffffff]">
            <Shield className="h-4 w-4" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-[#332F3A]" style={{ fontFamily: "var(--font-nunito), sans-serif" }}>
            SPRAT
          </span>
        </Link>

        <Link
          href="/"
          className="text-xs font-bold text-[#635F69] hover:text-[#332F3A] transition-colors px-3 py-1.5 rounded-xl hover:bg-white/50"
        >
          ← Back to Home
        </Link>
      </div>

      {/* Main Authentication Card */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={fadeUp}
        className="w-full max-w-sm mx-auto my-6 relative z-10"
      >
        <div className="clay-card p-7 sm:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#332F3A]" style={{ fontFamily: "var(--font-nunito), sans-serif" }}>
              Sign in
            </h1>
            <p className="text-xs font-medium text-[#635F69] mt-1">
              Select a demo profile or enter credentials
            </p>
          </div>

          {/* Quick Account Profiles */}
          <div className="space-y-2.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#7C3AED] block">
              Quick access demo
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { key: "pm" as const, name: "Sarah Chen", role: "Project Manager" },
                { key: "analyst" as const, name: "David Kim", role: "Analyst" },
                { key: "admin" as const, name: "Elena Rostova", role: "Admin" },
                { key: "guest" as const, name: "Auditor Guest", role: "Read-only" },
              ].map((account) => (
                <button
                  key={account.key}
                  type="button"
                  onClick={() => handleSelectAccount(account.key)}
                  className="p-3 rounded-2xl bg-white border border-white/90 text-left shadow-[4px_4px_10px_rgba(160,150,180,0.15),-2px_-2px_6px_#ffffff] hover:-translate-y-0.5 active:scale-95 transition-all"
                >
                  <div className="text-xs font-bold text-[#332F3A] truncate" style={{ fontFamily: "var(--font-nunito), sans-serif" }}>
                    {account.name}
                  </div>
                  <div className="text-[10px] mt-1 px-2 py-0.5 rounded-full bg-[#EFEBF5] text-[#7C3AED] inline-block font-bold">
                    {account.role}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 text-[10px] text-[#635F69] uppercase font-bold tracking-wider">
            <div className="flex-1 h-px bg-[#EAE5F3]" />
            <span>or email</span>
            <div className="flex-1 h-px bg-[#EAE5F3]" />
          </div>

          {/* Standard Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#635F69] mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.com"
                className="w-full px-4 py-3 clay-input text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#635F69] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 clay-input text-xs font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-[#635F69] hover:text-[#332F3A] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 clay-btn-primary text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[8px_8px_18px_rgba(139,92,246,0.3),-4px_-4px_10px_#ffffff]"
            >
              <span>{isLoading ? "Signing in..." : "Sign in"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="text-center text-xs text-[#635F69] font-medium pt-2">
            <span>No account? </span>
            <Link href="/signup" className="text-[#7C3AED] hover:underline font-bold">
              Sign up
            </Link>
          </div>
        </div>
      </motion.div>

      <footer className="text-center text-[11px] font-bold text-[#635F69] max-w-md mx-auto w-full relative z-10">
        SPRAT • Security & Privacy Requirements Analysis Tool
      </footer>
    </div>
  );
}
