"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, ArrowRight, Lock, Mail, Eye, EyeOff, User } from "lucide-react";
import { toast } from "sonner";
import { PRESET_USERS, setStoredSession } from "@/lib/auth/session";

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

      const data = await res.json();

      if (res.ok) {
        toast.success("Signed in successfully");
      }
    } catch {
      // Offline fallback
    }

    // Determine matching demo account or default to analyst
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
    <div className="min-h-screen flex flex-col justify-between bg-[#09090b] text-zinc-100 p-4 sm:p-6">
      {/* Top Bar */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-6 w-6 rounded bg-zinc-100 text-zinc-950 flex items-center justify-center font-bold text-xs">
            <Shield className="h-3.5 w-3.5 text-zinc-950" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-white">
            SPRAT
          </span>
        </Link>

        <Link
          href="/"
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Back
        </Link>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-sm mx-auto my-8">
        <div className="bg-[#121215] border border-zinc-850 rounded-xl p-6 space-y-6 shadow-xl">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">
              Sign in to your account
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Select your profile or enter your credentials
            </p>
          </div>

          {/* Quick Account Profiles for Testing */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-500 block">
              Sign in as:
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleSelectAccount("pm")}
                className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-left transition-colors"
              >
                <div className="font-medium text-zinc-200">Sarah Chen</div>
                <div className="text-[10px] text-zinc-500">Project Manager</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectAccount("analyst")}
                className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-left transition-colors"
              >
                <div className="font-medium text-zinc-200">David Kim</div>
                <div className="text-[10px] text-zinc-500">Analyst</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectAccount("admin")}
                className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-left transition-colors"
              >
                <div className="font-medium text-zinc-200">Elena Rostova</div>
                <div className="text-[10px] text-zinc-500">Admin</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectAccount("guest")}
                className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-left transition-colors"
              >
                <div className="font-medium text-zinc-200">Auditor Guest</div>
                <div className="text-[10px] text-zinc-500">Guest (Read-only)</div>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-[10px] text-zinc-600 uppercase font-mono">
            <div className="flex-1 h-px bg-zinc-850" />
            <span>or email</span>
            <div className="flex-1 h-px bg-zinc-850" />
          </div>

          {/* Standard Form */}
          <form onSubmit={handleLogin} className="space-y-3 text-xs">
            <div>
              <label className="block text-zinc-300 font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.com"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2 px-3 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs transition-all shadow-sm flex items-center justify-center space-x-1.5"
            >
              <span>{isLoading ? "Signing in..." : "Sign in"}</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-zinc-500">
            <span>Don't have an account? </span>
            <Link href="/signup" className="text-zinc-300 hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>

      <footer className="text-center text-xs text-zinc-600 max-w-md mx-auto w-full">
        SPRAT • Minimal Security Analysis
      </footer>
    </div>
  );
}
