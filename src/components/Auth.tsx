/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { Zap, Mail, Lock, ArrowRight, ShieldCheck, AlertCircle, Sun, Moon } from "lucide-react";
import { supabase } from "../supabaseClient";

interface AuthProps {
  onAuthSuccess: (user: any) => void;
  onBackToLanding: () => void;
  initialMode?: "signin" | "signup";
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export default function Auth({ 
  onAuthSuccess, 
  onBackToLanding, 
  initialMode = "signin",
  theme,
  onToggleTheme
}: AuthProps) {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        // Sign Up to Supabase Auth
        const { data, error: sbError } = await supabase.auth.signUp({ email, password });
        if (sbError) throw sbError;
        if (!data?.user) throw new Error("Could not register session logs.");

        // Sync or register the user profile in local backend DB
        let localUser;
        try {
          const syncResponse = await fetch("/api/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, name: "User" }),
          });
          const syncData = await syncResponse.json();
          if (syncResponse.ok && syncData.user) {
            localUser = syncData.user;
          }
        } catch (syncErr) {
          console.warn("Local registration auto-sync skipped:", syncErr);
        }

        // Redirect to onboarding/dashboard
        onAuthSuccess({
          name: "User",
          gender: "Other",
          age: 28,
          xp: 150,
          level: 1,
          ...localUser,
          id: data.user.id,
          email: data.user.email,
        });
      } else {
        // Sign In to Supabase Auth
        const { data, error: sbError } = await supabase.auth.signInWithPassword({ email, password });
        if (sbError) throw sbError;
        if (!data?.user) throw new Error("Could not initialize session logs.");

        // Sync or retrieve the user profile from local backend DB
        let localUser;
        try {
          const loginRes = await fetch("/api/signin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          if (loginRes.ok) {
            const loginData = await loginRes.json();
            localUser = loginData.user;
          } else {
            // Register matching profile locally if it does not exist (for smooth mock database operations)
            const signupRes = await fetch("/api/signup", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password, name: "User" }),
            });
            if (signupRes.ok) {
              const signupData = await signupRes.json();
              localUser = signupData.user;
            }
          }
        } catch (syncErr) {
          console.warn("Local session mapping skipped:", syncErr);
        }

        // Redirect to onboarding/dashboard
        onAuthSuccess({
          name: "User",
          gender: "Other",
          age: 28,
          xp: 150,
          level: 1,
          ...localUser,
          id: data.user.id,
          email: data.user.email,
        });
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "alex@example.com", // We can add default user in server backend
          password: "password123", // Or we can use the main fallback user in server db
        }),
      });

      // If demo user is not created yet, let's sign them up using fallback credentials
      if (!response.ok) {
        const signupRes = await fetch("/api/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "alex@example.com",
            password: "password123",
            name: "Alex Performance",
          }),
        });

        if (signupRes.ok) {
          const signupData = await signupRes.json();
          onAuthSuccess(signupData.user);
          return;
        } else {
          throw new Error("Unable to execute demo session onboarding.");
        }
      }

      const data = await response.json();
      onAuthSuccess(data.user);
    } catch (err: any) {
      setError("Unable to initialize demo account session. Creating a quick local session fallback.");
      // Soft fallback to standard user on local error to ensure uninterrupted sandbox experience
      onAuthSuccess({
        id: "main_user",
        name: "Alex Performance",
        email: "alex@example.com",
        level: 3,
        xp: 1250,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme === "light" ? "bg-slate-50 text-slate-800" : "bg-slate-950 text-slate-100"} font-sans flex flex-col justify-center items-center py-12 px-6 relative overflow-hidden transition-colors duration-300`}>
      {/* Background ambient glow matching the main design strategy */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] blur-3xl pointer-events-none rounded-full transition-colors duration-300 ${theme === "light" ? "bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent" : "bg-gradient-to-b from-emerald-950/20 via-transparent to-transparent"}`} />
      
      {/* Floating Theme Switcher */}
      <button
        onClick={onToggleTheme}
        className={`absolute top-6 right-6 p-2.5 rounded-xl border transition-all hover:scale-105 cursor-pointer shadow-sm ${
          theme === "light"
            ? "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
            : "border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300"
        }`}
        id="auth_theme_toggle"
        type="button"
      >
        {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-600" />}
      </button>

      {/* Container card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`w-full max-w-md ${theme === "light" ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"} border rounded-2xl shadow-2xl p-8 sticky z-10 transition-colors duration-300`}
      >
        {/* Header Branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/15 mb-4 hover:rotate-6 transition-transform">
            <Zap className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <h2 className={`text-2xl font-bold tracking-tight ${theme === "light" ? "text-slate-900" : "text-white"} mb-2`}>
            {mode === "signin" ? "Sign in to Aura" : "Create your OS Profile"}
          </h2>
          <p className={`text-xs text-center font-medium max-w-[280px] ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>
            {mode === "signin" 
              ? "Access your dashboard, nutrition goals, focus history, and AI strategist."
              : "Launch your custom behavioral strategist companion today."
            }
          </p>
        </div>

        {/* Dynamic Warning Alert */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-3.5 rounded-xl border border-red-500/10 bg-red-500/5 text-rose-400 text-xs font-semibold flex items-start gap-2.5 mb-6 leading-relaxed"
          >
            <AlertCircle className="w-4 h-4 shrink-0 stroke-[2]" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Input Formulation */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ml-1 ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="email"
                placeholder="alex@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full py-3 pl-11 pr-4 rounded-xl border text-sm focus:outline-none transition-all ${theme === "light" ? "border-slate-200 bg-slate-50 text-slate-900 focus:border-emerald-500/60 focus:bg-white" : "border-slate-800 bg-slate-950/60 text-slate-200 focus:border-emerald-500/40 focus:bg-slate-950"}`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ml-1 ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full py-3 pl-11 pr-4 rounded-xl border text-sm focus:outline-none transition-all ${theme === "light" ? "border-slate-200 bg-slate-50 text-slate-900 focus:border-emerald-500/60 focus:bg-white" : "border-slate-800 bg-slate-950/60 text-slate-200 focus:border-emerald-500/40 focus:bg-slate-950"}`}
              />
            </div>
          </div>

          {/* Form Theme Toggle Integration */}
          <div className={`p-3.5 rounded-xl border flex items-center justify-between mt-4 transition-all ${theme === "light" ? "border-slate-200 bg-slate-50" : "border-slate-800 bg-slate-950/40"}`}>
            <div className="flex flex-col">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${theme === "light" ? "text-slate-750" : "text-slate-350"}`}>App Style Theme</span>
              <span className="text-[9px] font-mono font-bold text-slate-500">{theme === "dark" ? "OBSIDIAN NIGHT" : "PEARL DAY"}</span>
            </div>
            <button
              type="button"
              onClick={onToggleTheme}
              className={`py-1.5 px-3 rounded-lg text-[10px] font-bold flex items-center gap-1.5 border transition-all hover:scale-105 cursor-pointer ${
                theme === "light"
                  ? "border-slate-300 bg-white hover:bg-slate-100 text-slate-700 shadow-sm"
                  : "border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 shadow-md"
              }`}
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>LIGHT THEME</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-purple-600" />
                  <span>DARK THEME</span>
                </>
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-bold hover:from-emerald-300 hover:to-teal-400 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-400/5 mt-6 border-none cursor-pointer text-sm"
          >
            {loading ? (
              <span className="w-5 h-5 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
            ) : (
              <>
                <span>{mode === "signin" ? "Sign In" : "Create Profile"}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>

        {/* Demo trigger helper */}
        <div className="relative my-7 flex items-center justify-center">
          <div className={`absolute inset-0 border-t w-full ${theme === "light" ? "border-slate-200" : "border-slate-800/80"}`} />
          <span className={`relative z-10 px-3 text-[10px] font-bold uppercase tracking-widest leading-none ${theme === "light" ? "bg-white text-slate-450" : "bg-slate-900 text-slate-500"}`}>
            Or Quick Access
          </span>
        </div>

        <button
          onClick={handleDemoLogin}
          disabled={loading}
          className={`w-full py-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            theme === "light" 
              ? "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-emerald-600" 
              : "border-slate-800 bg-slate-950/40 hover:bg-slate-950 text-slate-300 hover:text-emerald-400"
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Launch Immediate Demo Pilot</span>
        </button>

        {/* Mode Toggler */}
        <div className="mt-8 text-center text-xs text-slate-500 font-medium">
          {mode === "signin" ? (
            <>
              First time deploying Aura?{" "}
              <button 
                onClick={() => setMode("signup")}
                className="text-emerald-500 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
              >
                Sign Up Profile
              </button>
            </>
          ) : (
            <>
              Already registered in your local database?{" "}
              <button 
                onClick={() => setMode("signin")}
                className="text-emerald-500 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </>
          )}
        </div>

        {/* Landing Page Route Back */}
        <div className={`mt-6 pt-5 border-t text-center ${theme === "light" ? "border-slate-200" : "border-slate-800/60"}`}>
          <button 
            type="button"
            onClick={onBackToLanding}
            className={`text-[10px] font-bold uppercase tracking-wider cursor-pointer ${theme === "light" ? "text-slate-400 hover:text-slate-600" : "text-slate-500 hover:text-slate-300"}`}
          >
            ← Back to Information Screen
          </button>
        </div>
      </motion.div>
    </div>
  );
}
