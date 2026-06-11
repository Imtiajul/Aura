/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { 
  Zap, 
  Shield, 
  Target, 
  Brain, 
  Flame, 
  Users, 
  Briefcase, 
  ArrowRight, 
  Activity, 
  CheckCircle,
  TrendingUp,
  Apple,
  Sun,
  Moon
} from "lucide-react";

interface LandingPageProps {
  onSignIn: () => void;
  onSignUp: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export default function LandingPage({ onSignIn, onSignUp, theme, onToggleTheme }: LandingPageProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15 } 
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div id="landing_page" className={`min-h-screen ${theme} ${theme === 'light' ? 'bg-slate-50 text-slate-800' : 'bg-slate-950 text-slate-100'} font-sans selection:bg-emerald-500 selection:text-slate-950 overflow-x-hidden transition-colors duration-400`}>
      {/* Background radial gradient glow for a stellar visual identity */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-emerald-950/20 via-transparent to-transparent blur-3xl pointer-events-none rounded-full" />
      
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-950/40">
              <Zap className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <span className="font-sans font-bold text-xl tracking-tight text-slate-100">
              Aura
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Header Theme Toggler */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl border border-slate-850 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900 text-slate-400 hover:text-white transition-all cursor-pointer flex items-center justify-center"
              title="Toggle App Theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400 fill-amber-400/10 animate-spin-slow" />
              ) : (
                <Moon className="w-4 h-4 text-purple-600 fill-purple-600/10" />
              )}
            </button>

            <button 
              onClick={onSignIn}
              className="px-4 py-2 text-sm font-semibold text-slate-450 hover:text-slate-100 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button 
              onClick={onSignUp}
              className="px-4 py-2 rounded-lg bg-emerald-400 text-slate-950 font-bold text-sm hover:bg-emerald-300 transition-colors shadow-lg shadow-emerald-400/10 hover:shadow-emerald-300/20 cursor-pointer"
            >
              Register
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 px-6 max-w-7xl mx-auto">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-4xl mx-auto flex flex-col items-center"
        >
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-8"
          >
            <Flame className="w-3.5 h-3.5 fill-emerald-400" />
            Introducing Performance Operating System
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="font-sans text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.1] max-w-3xl"
          >
            Your Personal AI Coach for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">Health, Focus & Productivity</span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-slate-400 text-lg sm:text-xl font-medium leading-relaxed max-w-2xl mb-10"
          >
            Transform your daily habits, nutrition, fitness, goals, and focus with an AI companion that learns, plans, and grows with you. Let Aura optimize your day.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 w-full justify-center mb-16"
          >
            <button 
              onClick={onSignUp}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-bold hover:shadow-xl hover:shadow-emerald-500/10 hover:from-emerald-300 hover:to-teal-400 transition-all flex items-center justify-center gap-2 text-base shadow-lg shadow-emerald-500/5 group cursor-pointer"
            >
              Get Started Free <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => {
                const element = document.getElementById("features_section");
                element?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-8 py-4 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 hover:text-slate-100 hover:bg-slate-900 hover:border-slate-700 transition-all font-semibold text-base"
            >
              See How It Works
            </button>
          </motion.div>
        </motion.div>

        {/* Hero Visual - Premium Mock UI Presentation */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
          className="relative max-w-5xl mx-auto"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl opacity-10 blur-xl" />
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden">
            {/* Header of Mock App */}
            <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/60" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <span className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <div className="px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-500 text-xs font-mono">
                aura.ai/dashboard
              </div>
              <div className="w-16" />
            </div>

            {/* Content Preview Frame */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-950/40">
              {/* Left Column: LifeScore & Health Score */}
              <div className="space-y-6">
                <div className="p-5 rounded-xl border border-slate-800/80 bg-slate-900/60 hover:border-slate-800 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Overall LifeScore™</span>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-slate-100 font-sans tracking-tight">82</span>
                    <span className="text-slate-500 text-sm">/ 100</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 w-[82%]" />
                  </div>
                </div>

                <div className="p-5 rounded-xl border border-slate-800/80 bg-slate-900/60">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Aura AI Health Score</span>
                    <Activity className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="text-2xl font-bold text-slate-100">84% <span className="text-xs text-emerald-500 font-normal">Optimal</span></div>
                  <p className="text-slate-400 text-xs mt-2 font-medium">Metabolism & physical recovery benchmarks running at perfect baseline logs.</p>
                </div>
              </div>

              {/* Middle Column: Active AI Chat Coach */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 flex flex-col justify-between h-[280px]">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">Aura Coach</div>
                    <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active
                    </div>
                  </div>
                </div>
                <div className="flex-1 py-4 space-y-3 overflow-y-auto">
                  <div className="p-3.5 rounded-xl bg-slate-900/80 text-xs text-slate-300 max-w-[85%] border border-slate-800/50">
                    Aura: Let's block 50 minutes for programming. Your afternoon burnout risk warning is active, hydrate now.
                  </div>
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 text-xs text-emerald-300 ml-auto max-w-[80%] text-right border border-emerald-500/10">
                    Completed 2 glasses & scheduled Focus Block.
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-slate-500 text-xs">
                  <span>Press enter to chat...</span>
                  <div className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center text-[10px] hover:text-slate-300 cursor-pointer">↵</div>
                </div>
              </div>

              {/* Right Column: Focus & Progress */}
              <div className="space-y-6">
                <div className="p-5 rounded-xl border border-slate-800/80 bg-slate-900/60">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Focus Pomodoro</span>
                    <Flame className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-3xl font-extrabold font-mono text-amber-400 mb-1">21:45</div>
                  <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2.5 py-0.5 rounded font-bold uppercase tracking-wide">
                    Deep Work Segment
                  </span>
                </div>

                <div className="p-5 rounded-xl border border-slate-800/80 bg-slate-900/60 space-y-2">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Tracked Milestones</span>
                  <div className="space-y-2 pt-1.5">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 fill-emerald-500/20" /> Formulate API core structures
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-700" /> Complete 90-day nutrition roadmap
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Modern Pain points Section */}
      <section className="py-24 border-t border-slate-900 bg-slate-950/40 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-4">THE STRUGGLE</h2>
            <h3 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Modern Life Is Making Us Less Healthy and Less Productive
            </h3>
            <p className="text-slate-400 mt-4 font-medium">
              The problem is not a lack of content or data. The challenge is the lack of seamless execution and accountability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { p: "Poor Nutrition", desc: "Forced conveniences trigger junk cravings and inconsistent deficits.", icon: Apple, color: "text-rose-400 border-rose-500/10 bg-rose-500/5" },
              { p: "Accountability Deficits", desc: "Traditional trackers wait for you; they do not predict failure or challenge routines.", icon: Shield, color: "text-amber-400 border-amber-500/10 bg-amber-500/5" },
              { p: "Deep Focus Fragmentation", desc: "Constant notifications and tabs fracture the cognitive reserve required for deep milestones.", icon: Target, color: "text-emerald-400 border-emerald-500/10 bg-emerald-500/5" },
              { p: "Burnout risk accumulation", desc: "Working through physiological fatigue without strategic recovery triggers crash events.", icon: Activity, color: "text-teal-400 border-teal-500/10 bg-teal-500/5" },
            ].map((p, i) => (
              <div key={i} className={`p-6 rounded-xl border ${p.color} transition-all hover:scale-[1.02]`}>
                <p.icon className="w-6 h-6 mb-4 stroke-[2]" />
                <h4 className="text-base font-bold text-white mb-2">{p.p}</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">{p.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <span className="text-slate-400 text-sm font-semibold">
              The answer is a single, unified <strong className="text-emerald-400 font-bold">Personal Performance OS</strong> that takes command.
            </span>
          </div>
        </div>
      </section>

      {/* Solutions Core Features Section */}
      <section id="features_section" className="py-24 border-t border-slate-900 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4">THE OS POWER</h2>
            <h3 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Meet Aura, Your Performance Strategist
            </h3>
            <p className="text-slate-400 mt-4 font-medium">
              We compile wellness, focus, habit mechanics, nutritional adaptions, family networks, and corporate energy assessments into one command dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/30">
              <Brain className="w-6 h-6 text-emerald-400 mb-4 stroke-[2]" />
              <h4 className="text-lg font-bold text-white mb-3">AI Coach & Memory Hub</h4>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Aura reviews your health files, routines, and historical responses. She intervenes before you hit late-day scrolling traps or crash cycles.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/30">
              <Apple className="w-6 h-6 text-amber-400 mb-4 stroke-[2]" />
              <h4 className="text-lg font-bold text-white mb-3">Nutrition Adaptations</h4>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Generate 7, 15, or 30-day macros and adaptive menus. Scan meal photos with Gemini to instantly calculate protein, carb, and hydration targets.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/30">
              <Target className="w-6 h-6 text-teal-400 mb-4 stroke-[2]" />
              <h4 className="text-lg font-bold text-white mb-3">AI Goal Decomposition</h4>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Input any major goal—like learning WebGL or launching a business. Aura expands it into week-by-week actionable milestones and tasks.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/30">
              <Flame className="w-6 h-6 text-orange-400 mb-4 stroke-[2]" />
              <h4 className="text-lg font-bold text-white mb-3">Pomodoro Focus Engine</h4>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Enforce Deep Work blocks. Tailor 25/5 or 50/10 intervals, earn multiplier XP, and log cognitive metrics seamlessly behind the server database.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/30">
              <Users className="w-6 h-6 text-blue-400 mb-4 stroke-[2]" />
              <h4 className="text-lg font-bold text-white mb-3">Family Wellness Portals</h4>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Monitor family wellness aggregates, set mutual weekend movement challenges, and synchronize meal profiles without intrusive tracking.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/30">
              <Briefcase className="w-6 h-6 text-rose-400 mb-4 stroke-[2]" />
              <h4 className="text-lg font-bold text-white mb-3">Business Team Metrics</h4>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Integrate organization dashboards. Spot impending burnout scales, drive mindfulness triggers, and generate corporate productivity evaluations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 border-t border-slate-900 bg-slate-950 text-center relative px-6">
        <div className="absolute inset-0 bg-emerald-500/5 blur-3xl pointer-events-none" />
        <h3 className="text-3xl sm:text-4xl font-extrabold max-w-2xl mx-auto mb-6">
          Ready to take full command of your daily discipline?
        </h3>
        <p className="text-slate-400 font-medium max-w-md mx-auto mb-8">
          Gain immediate clarity, optimize caloric ratios, structure work milestones, and work closely with Aura.
        </p>
        <button 
          onClick={onSignUp}
          className="px-8 py-4 rounded-xl bg-emerald-400 text-slate-950 font-bold hover:bg-emerald-300 transition-colors shadow-xl shadow-emerald-400/20 text-base cursor-pointer"
        >
          Initialize Onboarding Free
        </button>
      </section>

      {/* Modern Detailed Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 pt-16 pb-12 px-6 relative z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-slate-900">
            {/* Column 1: Brand details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-950/20">
                  <Zap className="w-4.5 h-4.5 text-slate-950 stroke-[2.5]" />
                </div>
                <span className="font-sans font-bold text-lg tracking-tight text-slate-100">
                  Aura
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold max-w-xs">
                The high-performance human operating system. Integrate mental clarity, nutritional science, team energy metrics, and AI coaching into a singular, responsive mission command.
              </p>
              <div className="pt-2 flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[10px] font-mono font-bold text-emerald-400 tracking-wider uppercase">System Live & Secure</span>
              </div>
            </div>

            {/* Column 2: Product modules */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-250 uppercase tracking-widest">Pilot Core Engine</h4>
              <ul className="space-y-2">
                <li><a href="#features_section" className="text-xs text-slate-405 hover:text-emerald-400 transition-colors font-semibold">AI Aura Coaching</a></li>
                <li><a href="#features_section" className="text-xs text-slate-405 hover:text-emerald-400 transition-colors font-semibold">Smart Vision Calories</a></li>
                <li><a href="#features_section" className="text-xs text-slate-405 hover:text-emerald-400 transition-colors font-semibold">Focus State Machine</a></li>
                <li><a href="#features_section" className="text-xs text-slate-405 hover:text-emerald-400 transition-colors font-semibold">AI Goal Decomposition</a></li>
              </ul>
            </div>

            {/* Column 3: Collaboration portals */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-250 uppercase tracking-widest">Expansion Modules</h4>
              <ul className="space-y-2">
                <li><a href="#features_section" className="text-xs text-slate-405 hover:text-emerald-400 transition-colors font-semibold">Family Group Syncing</a></li>
                <li><a href="#features_section" className="text-xs text-slate-405 hover:text-emerald-400 transition-colors font-semibold">Corporate Wellness Index</a></li>
                <li><a href="#features_section" className="text-xs text-slate-405 hover:text-emerald-400 transition-colors font-semibold">Task Schedule Deferral</a></li>
                <li><a href="#features_section" className="text-xs text-slate-405 hover:text-emerald-400 transition-colors font-semibold">Weekly Habit Streaks</a></li>
              </ul>
            </div>

            {/* Column 4: Trust & Developers */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-250 uppercase tracking-widest">Platform Integrity</h4>
              <ul className="space-y-2">
                <li><span className="text-xs text-slate-405 font-semibold block">Client Isolation: Enabled</span></li>
                <li><span className="text-xs text-slate-405 font-semibold block">Database Sandbox: Local JSON</span></li>
                <li><span className="text-xs text-slate-405 font-semibold block">Secured via API Proxy</span></li>
                <li><span className="text-xs text-slate-405 font-semibold block">Gemini 3.5 AI Integration</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-[11px] text-slate-500 font-medium font-mono">
              &copy; 2026 Aura Inc. All capabilities registered on server side.
            </span>
            <div className="flex gap-6">
              <button onClick={onSignIn} className="text-[11px] text-slate-500 hover:text-slate-350 font-mono font-bold cursor-pointer">
                COACH SIGN IN
              </button>
              <button onClick={onSignUp} className="text-[11px] text-slate-500 hover:text-slate-350 font-mono font-bold cursor-pointer">
                ONBOARDING SIGN UP
              </button>
              <span className="text-[11px] text-slate-600 font-mono">
                v2.1.0-STABLE
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
