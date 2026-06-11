/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Briefcase, 
  Sparkles, 
  Compass, 
  HelpCircle, 
  AlertTriangle, 
  Info, 
  Activity, 
  TrendingUp,
  Moon,
  Flame,
  Droplet,
  CheckCircle,
  Eye,
  RefreshCw,
  Zap,
  Coffee
} from "lucide-react";
import { DailyBriefing, DailyReflection, BehaviorPrediction } from "../types";

interface AccountabilityDeskProps {
  briefing: DailyBriefing | null;
  reflection: DailyReflection | null;
  prediction: BehaviorPrediction | null;
  onRefreshBriefing: () => Promise<void>;
  onRefreshReflection: () => Promise<void>;
  onRefreshPrediction: () => Promise<void>;
  loading: boolean;
}

export default function AccountabilityDesk({
  briefing,
  reflection,
  prediction,
  onRefreshBriefing,
  onRefreshReflection,
  onRefreshPrediction,
  loading,
}: AccountabilityDeskProps) {
  const [activeZone, setActiveZone] = useState<"briefing" | "reflection" | "predictions">("briefing");

  const riskColors = {
    low: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    moderate: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    high: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  };

  return (
    <div id="accountability_desk" className="space-y-6">
      {/* Navigation toggles */}
      <div className="flex bg-slate-950 p-2 rounded-xl border border-slate-900 gap-1.5 scrollbar-thin">
        {[
          { id: "briefing", label: "Morning AI Briefing", icon: Zap },
          { id: "reflection", label: "Evening Reflection", icon: Moon },
          { id: "predictions", label: "Behavior Prediction Engine", icon: Eye },
        ].map((zone) => (
          <button
            key={zone.id}
            onClick={() => setActiveZone(zone.id as any)}
            className={`flex-1 py-3 px-4 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeZone === zone.id ? "bg-slate-905 text-white shadow" : "text-slate-500 hover:text-slate-350"
            }`}
          >
            <zone.icon className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">{zone.label}</span>
            <span className="inline sm:hidden">{zone.label.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Morning Briefing Tab */}
        {activeZone === "briefing" && (
          <motion.div
            key="briefing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Left Briefing Card */}
            <div className="md:col-span-2 rounded-xl border border-slate-800 bg-slate-900/20 p-6 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-emerald-400/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                    <Zap className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <h3 className="font-sans text-base sm:text-lg font-bold text-white">Daily AI Performance Briefing</h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-mono font-bold block">Synchronized: {briefing?.date || "today"}</span>
                      {briefing?.isStandby && (
                        <span className="text-[9px] font-bold text-amber-500/80 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-md flex items-center gap-1 font-mono">
                          <Coffee className="w-3 h-3" /> STANDBY
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={onRefreshBriefing}
                  className="p-2 rounded-lg border border-slate-850 hover:bg-slate-900/60 text-slate-400 hover:text-white transition-all cursor-pointer flex items-center justify-center.5 shrink-0"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-400" : ""}`} />
                </button>
              </div>

              {briefing ? (
                <div className="space-y-6">
                  {/* Focus Goal & Nutrition targets widget */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-slate-850 bg-slate-950/40 space-y-2">
                      <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Today's Focus Goal</span>
                      <p className="text-xs sm:text-sm text-slate-300 font-semibold leading-relaxed">
                        {briefing.focusGoal}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-850 bg-slate-950/40 space-y-2">
                      <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider block">Nutrition Target Protocols</span>
                      <p className="text-xs sm:text-sm text-slate-300 font-semibold leading-relaxed">
                        {briefing.nutritionGoal}
                      </p>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-400" /> Aura Actionable Safeguards
                    </h4>
                    <div className="space-y-2.5">
                      {briefing.recs.map((rec, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl border border-slate-850 bg-slate-900/40 text-xs sm:text-sm text-slate-300 leading-relaxed font-semibold flex items-start gap-2.5">
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 text-slate-500 italic text-xs">
                  Error compiling morning parameters. Verify server connection.
                </div>
              )}
            </div>

              {/* Right Mini stats indexes */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-6 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Scores</h4>
                  
                  <div className="p-4 rounded-xl border border-slate-850 bg-slate-950/45 space-y-2 text-center sm:text-left">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Overall LifeScore™</span>
                    <div className="flex items-baseline justify-center sm:justify-start gap-1">
                      <span className="text-3xl font-extrabold text-white leading-none">{briefing?.lifeScore || 82}</span>
                      <span className="text-slate-500 text-xs">/ 100</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-1" style={{ width: `${briefing?.lifeScore || 82}%` }} />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-850 bg-slate-950/45 space-y-2 text-center sm:text-left">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Aura AI Health Score</span>
                    <div className="flex items-baseline justify-center sm:justify-start gap-1">
                      <span className="text-3xl font-extrabold text-white leading-none">{briefing?.healthScore || 84}</span>
                      <span className="text-slate-500 text-xs">%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-1" style={{ width: `${briefing?.healthScore || 84}%` }} />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-[10px] text-slate-400 leading-relaxed flex items-start gap-2 select-none">
                  <Info className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Morning indexes aggregate physical habits and goals. Read daily recommendations carefully to drive active changes.</span>
                </div>
              </div>
          </motion.div>
        )}

        {/* Evening Accountability Reflection Tab */}
        {activeZone === "reflection" && (
          <motion.div
            key="reflection"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Left Card */}
            <div className="md:col-span-2 rounded-xl border border-slate-800 bg-slate-900/20 p-6 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-purple-400/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-400">
                    <Moon className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <h3 className="font-sans text-base sm:text-lg font-bold text-white">Daily Evening Reflection</h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-mono font-bold block">Assessment date: {reflection?.date || "today"}</span>
                      {reflection?.isStandby && (
                        <span className="text-[9px] font-bold text-amber-500/80 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-md flex items-center gap-1 font-mono">
                          <Coffee className="w-3 h-3" /> STANDBY
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={onRefreshReflection}
                  className="p-2 rounded-lg border border-slate-850 hover:bg-slate-900/60 text-slate-400 hover:text-white transition-all cursor-pointer flex items-center justify-center.5 shrink-0"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-purple-400" : ""}`} />
                </button>
              </div>

              {reflection ? (
                <div className="space-y-6">
                  {/* Focus blocks and habits counts */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-850 text-center space-y-1">
                      <span className="text-[9px] text-slate-550 block font-bold uppercase">Tasks Done</span>
                      <span className="text-sm font-bold font-mono text-emerald-400">{reflection.tasksCompleted} items</span>
                    </div>

                    <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-850 text-center space-y-1">
                      <span className="text-[9px] text-slate-550 block font-bold uppercase">Deep blocks done</span>
                      <span className="text-sm font-bold font-mono text-amber-400">{reflection.focusSessionsCompleted} sets</span>
                    </div>

                    <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-850 text-center space-y-1">
                      <span className="text-[9px] text-slate-550 block font-bold uppercase">Hydration volume</span>
                      <span className="text-sm font-bold font-mono text-blue-400">{reflection.waterIntake} Glasses</span>
                    </div>

                    <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-850 text-center space-y-1">
                      <span className="text-[9px] text-slate-550 block font-bold uppercase">Compliance Score</span>
                      <span className="text-sm font-bold font-mono text-teal-400 capitalize">{reflection.nutritionCompliance}</span>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-400" /> Aura Core Calibrations for Tomorrow
                    </h4>
                    <div className="space-y-2.5">
                      {reflection.recsForTomorrow.map((rec, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl border border-slate-850 bg-slate-900/40 text-xs sm:text-sm text-slate-300 leading-relaxed font-semibold flex items-start gap-2.5">
                          <CheckCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 text-slate-500 italic text-xs">
                  Compile parameters to draft evening diagnostics.
                </div>
              )}
            </div>

            {/* Right scorecard */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-6 space-y-6 flex flex-col justify-between">
              <div className="space-y-3.5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Reflection Indexes</h4>
                
                <div className="p-4 rounded-xl border border-slate-855 bg-slate-950/45 text-center">
                  <span className="text-[9px] font-bold text-slate-550 uppercase tracking-wide block">Habit Completion Rates</span>
                  <div className="text-4xl font-extrabold text-purple-400 mt-2 font-mono">
                    {reflection?.habitCompletionRate || 85}%
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/10 text-[10px] text-slate-400 leading-relaxed flex items-start gap-2 select-none">
                <Info className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Evening Reflection compiles logged elements before concluding the cycle. Align tasks lists with tomorrow's parameters.</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Behavior Prediction Tab */}
        {activeZone === "predictions" && (
          <motion.div
            key="predictions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Left Card */}
            <div className="md:col-span-2 rounded-xl border border-slate-800 bg-slate-900/20 p-6 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-400">
                    <Eye className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <h3 className="font-sans text-base sm:text-lg font-bold text-white">Aura Behavior Prediction Model</h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-mono font-bold block">Calculated via active logging history</span>
                      {prediction?.isStandby && (
                        <span className="text-[9px] font-bold text-amber-500/80 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-md flex items-center gap-1 font-mono">
                          <Coffee className="w-3 h-3" /> STANDBY
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={onRefreshPrediction}
                  className="p-2 rounded-lg border border-slate-850 hover:bg-slate-900/60 text-slate-400 hover:text-white transition-all cursor-pointer flex items-center justify-center.5 shrink-0"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-400" : ""}`} />
                </button>
              </div>

              {prediction ? (
                <div className="space-y-6">
                  {/* Proactive Risk Warnings info */}
                  <div className="p-4 rounded-xl border border-amber-500/10 bg-amber-500/5 text-slate-300 leading-relaxed text-xs sm:text-sm font-semibold flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <h4 className="font-bold text-xs text-amber-300 uppercase tracking-wider mb-1">Slump Warning Indicator</h4>
                      <p>{prediction.warningMessage}</p>
                    </div>
                  </div>

                  {/* Interventions */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-amber-400" /> Aura Preventative Interventions
                    </h4>
                    <div className="space-y-2.5">
                      {prediction.interventions.map((rec, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl border border-slate-850 bg-slate-900/40 text-xs sm:text-sm text-slate-300 leading-relaxed font-semibold flex items-start gap-2.5">
                          <Coffee className="w-4.5 h-4.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 text-slate-500 italic text-xs">
                  Compile parameters to trigger the AI behavioral forecast.
                </div>
              )}
            </div>

            {/* Right Card: Probability Indexes */}
            {prediction && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-6 space-y-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Forecast Indicators</h4>
                
                <div className="space-y-4">
                  {/* Burnout Risk */}
                  <div className="p-4 rounded-xl border border-slate-850 bg-slate-950/45 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Burnout Risk scale</span>
                    <span className={`inline-block ml-2 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                      riskColors[prediction.burnoutRisk] || "text-slate-400 border-slate-800"
                    }`}>
                      {prediction.burnoutRisk}
                    </span>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-2">
                      <div className={`h-1.5 ${
                        prediction.burnoutRisk === "high" ? "bg-rose-500" : prediction.burnoutRisk === "moderate" ? "bg-amber-400" : "bg-emerald-400"
                      }`} style={{ width: prediction.burnoutRisk === "high" ? "90%" : prediction.burnoutRisk === "moderate" ? "50%" : "20%" }} />
                    </div>
                  </div>

                  {/* Missed Workout Probability */}
                  <div className="p-4 rounded-xl border border-slate-850 bg-slate-950/45 space-y-2">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
                      <span>Missed Workout Probability</span>
                      <span className="text-rose-400 font-mono">{prediction.missedWorkoutProb}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-1">
                      <div className="bg-rose-500 h-1.5" style={{ width: `${prediction.missedWorkoutProb}%` }} />
                    </div>
                  </div>

                  {/* Productivity Crash Prob */}
                  <div className="p-4 rounded-xl border border-slate-850 bg-slate-950/45 space-y-2">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
                      <span>Productivity Crash Probability</span>
                      <span className="text-amber-400 font-mono">{prediction.productivityCrashProb}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-1">
                      <div className="bg-amber-400 h-1.5" style={{ width: `${prediction.productivityCrashProb}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
