"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, ArrowRight, Lock, Mail, User, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("analyst");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isPasswordValid = password.length >= 8;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isPasswordValid) {
      setErrorMessage("Password must be at least 8 characters (SRS R9 requirement).");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg =
          data.error ||
          (data.errors ? Object.values(data.errors).join(", ") : "Signup failed");
        setErrorMessage(msg);
        toast.error("Registration Failed", { description: msg });
        setIsLoading(false);
        return;
      }

      toast.success("Account created successfully", {
        description: "Registered with Bcrypt hashing (R9).",
      });
      router.push("/login");
    } catch (err: any) {
      const msg = err?.message || "An unexpected network error occurred";
      setErrorMessage(msg);
      toast.error("Registration Error", { description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F4F1FA] text-[#332F3A] p-4 sm:p-6 relative overflow-hidden select-none">
      {/* ── Floating 3D Blobs ── */}
      <div className="clay-blob-1" />
      <div className="clay-blob-2" />

      {/* Top Header */}
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

      {/* Main Registration Card */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={fadeUp}
        className="w-full max-w-md mx-auto my-6 relative z-10"
      >
        <div className="clay-card p-7 sm:p-9 space-y-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFEBF5] text-[10px] font-bold text-[#7C3AED]">
              <Lock className="h-3 w-3" />
              <span>Bcrypt R9 Hashing</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-[#332F3A]" style={{ fontFamily: "var(--font-nunito), sans-serif" }}>
              Create account
            </h1>
            <p className="text-xs font-medium text-[#635F69]">
              Join your organization&apos;s workspace
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-[#FEE2E2] border border-[#FCA5A5] text-[#991B1B] text-xs font-medium flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#635F69] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Mercer"
                  className="w-full pl-10 pr-4 py-3 clay-input text-xs font-medium"
                />
                <User className="h-4 w-4 text-[#635F69] absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#635F69] mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@healthcare.org"
                  className="w-full pl-10 pr-4 py-3 clay-input text-xs font-medium"
                />
                <Mail className="h-4 w-4 text-[#635F69] absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#635F69] mb-1.5">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 clay-input text-xs font-medium"
              >
                <option value="analyst">Analyst (Authoring)</option>
                <option value="project_manager">Project Manager</option>
                <option value="guest">Guest (Read-only)</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#635F69]">Password</label>
                <span
                  className={`text-[11px] font-bold flex items-center gap-1 ${
                    isPasswordValid ? "text-[#10B981]" : "text-[#635F69]"
                  }`}
                >
                  {isPasswordValid && <Check className="h-3 w-3" />}
                  <span>Min 8 chars</span>
                </span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 clay-input text-xs font-medium"
                />
                <Lock className="h-4 w-4 text-[#635F69] absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 clay-btn-primary text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[8px_8px_18px_rgba(139,92,246,0.3),-4px_-4px_10px_#ffffff]"
            >
              <span>{isLoading ? "Creating account..." : "Create Account"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Link to Login */}
          <div className="pt-3 border-t border-[#EAE5F3] text-center text-xs font-medium">
            <span className="text-[#635F69]">Already registered? </span>
            <Link
              href="/login"
              className="text-[#7C3AED] font-bold hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="text-center text-[11px] font-bold text-[#635F69] max-w-md mx-auto w-full relative z-10">
        SPRAT • Security & Privacy Requirements Analysis Tool
      </footer>
    </div>
  );
}
