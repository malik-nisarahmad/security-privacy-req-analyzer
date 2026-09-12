"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, ArrowRight, Lock, Mail, User, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";

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
        description: "Registered in Supabase Auth with Bcrypt (R9).",
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
    <div className="min-h-screen flex flex-col justify-between bg-[#09090b] text-zinc-100 p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="h-8 w-8 rounded-lg bg-zinc-100 text-zinc-950 flex items-center justify-center font-bold transition-transform group-hover:scale-105">
            <Shield className="h-4 w-4 text-zinc-900" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-white">
            SPRAT
          </span>
        </Link>

        <Link
          href="/"
          className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          ← Back to Overview
        </Link>
      </div>

      {/* Main Registration Card */}
      <div className="w-full max-w-md mx-auto my-8">
        <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="space-y-2 mb-6">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-mono mb-1">
              <Lock className="h-3 w-3" />
              <span>R9: Bcrypt Password Hashing</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Create an Account
            </h1>
            <p className="text-xs text-zinc-400">
              Join your organization&apos;s security requirements workspace
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-300 font-medium mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Mercer"
                  className="w-full pl-9 pr-3 py-2.5 bg-zinc-900/90 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
                />
                <User className="h-4 w-4 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@healthcare.org"
                  className="w-full pl-9 pr-3 py-2.5 bg-zinc-900/90 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
                />
                <Mail className="h-4 w-4 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1.5">
                Role Preference (R1/R8)
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2.5 bg-zinc-900/90 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-zinc-500"
              >
                <option value="analyst">Requirements Analyst (Authoring)</option>
                <option value="project_manager">Project Manager (Member Scoping)</option>
                <option value="guest">Guest (Read-only / Restricted R7)</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-zinc-300 font-medium">Password</label>
                <span
                  className={`text-[11px] font-mono flex items-center space-x-1 ${
                    isPasswordValid ? "text-emerald-400" : "text-zinc-500"
                  }`}
                >
                  {isPasswordValid && <Check className="h-3 w-3" />}
                  <span>Min 8 characters</span>
                </span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-zinc-900/90 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
                />
                <Lock className="h-4 w-4 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition-all shadow-sm active:scale-[0.99] flex items-center justify-center space-x-2"
            >
              <span>{isLoading ? "Creating account..." : "Create Account"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>

          {/* Link to Login */}
          <div className="mt-6 pt-4 border-t border-zinc-800/80 text-center text-xs">
            <span className="text-zinc-400">Already registered? </span>
            <Link
              href="/login"
              className="text-zinc-200 font-semibold hover:underline"
            >
              Sign in to your account
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-zinc-500 max-w-7xl mx-auto w-full">
        SPRAT Security & Privacy Requirements Analysis Tool — SE3002
      </footer>
    </div>
  );
}
