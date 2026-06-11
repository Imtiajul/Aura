/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  Coffee, 
  Flame, 
  Plus, 
  Target, 
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Award
} from "lucide-react";
import { FocusSession } from "../types";

interface FocusPomodoroProps {
  sessions: FocusSession[];
  onLogSession: (durationMinutes: number, mode: FocusSession["mode"]) => Promise<void>;
}

export default function FocusPomodoro({ sessions, onLogSession }: FocusPomodoroProps) {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<FocusSession["mode"]>("work");
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [customMins, setCustomMins] = useState(45);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sound buzz or visual alert flash simulated cleanly via a text notification
  const [alertText, setAlertText] = useState<string | null>(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        if (seconds > 0) {
          setSeconds((s) => s - 1);
        } else if (seconds === 0) {
          if (minutes === 0) {
            // Timer finished!
            handleTimerComplete();
          } else {
            setMinutes((m) => m - 1);
            setSeconds(59);
          }
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, seconds, minutes]);

  const handleTimerComplete = async () => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Save to server
    await onLogSession(selectedDuration, mode);
    
    setAlertText(`Session Complete! Aura tracked your ${selectedDuration}-minute ${mode} cycle. XP and Level sync initialized.`);
    setTimeout(() => setAlertText(null), 8000);

    // Switch mode automatically
    if (mode === "work") {
      setMode("short_break");
      setMinutes(5);
      setSelectedDuration(5);
    } else {
      setMode("work");
      setMinutes(25);
      setSelectedDuration(25);
    }
    setSeconds(0);
  };

  const handleStartPause = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setMinutes(selectedDuration);
    setSeconds(0);
  };

  const handleSelectPreset = (mins: number, m: FocusSession["mode"]) => {
    setIsActive(false);
    setMode(m);
    setSelectedDuration(mins);
    setMinutes(mins);
    setSeconds(0);
  };

  const handleSetCustom = () => {
    setIsActive(false);
    setMode("work");
    setSelectedDuration(customMins);
    setMinutes(customMins);
    setSeconds(0);
  };

  // Aggregates
  const totalFocusMins = sessions
    .filter((s) => s.mode === "work")
    .reduce((acc, curr) => acc + curr.durationMinutes, 0);

  return (
    <div id="pomodoro_focus_engine" className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Column 1: Focus Visual Timer Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-6 flex flex-col justify-center items-center relative text-center min-h-[340px]">
        {/* Glow behind timer */}
        <div className={`absolute w-[180px] h-[180px] rounded-full blur-3xl opacity-10 pointer-events-none ${
          mode === "work" ? "bg-amber-400" : "bg-teal-400"
        }`} />

        <div className="mb-4">
          <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
            mode === "work"
              ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
              : "text-teal-400 bg-teal-500/10 border-teal-500/20"
          }`}>
            {mode === "work" ? "Deep Work Block" : "Rest & Recharge"}
          </span>
        </div>

        {/* Big countdown numbers */}
        <div className="text-5xl sm:text-6xl font-extrabold font-mono text-white tracking-tight leading-none mb-6">
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleStartPause}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${
              isActive 
                ? "bg-slate-800 text-amber-400 border border-slate-700 hover:bg-slate-705" 
                : "bg-emerald-400 text-slate-950 hover:bg-emerald-300 shadow-emerald-400/10"
            }`}
          >
            {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-slate-950 translate-x-0.5" />}
          </button>
          
          <button
            onClick={handleReset}
            className="w-10 h-10 rounded-full border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900/60 transition-colors flex items-center justify-center"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Alert box */}
        <AnimatePresence>
          {alertText && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="mt-6 p-3 rounded-lg border border-emerald-500/10 bg-emerald-500/5 text-emerald-300 text-[10px] sm:text-xs leading-relaxed max-w-xs"
            >
              {alertText}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Column 2: Presets & Custom Trigger configs */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-6 space-y-6">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <Timer className="w-4 h-4 text-emerald-400" /> Focus Presets & Custom
        </h4>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3.5">
            <button
              onClick={() => handleSelectPreset(25, "work")}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between h-24 transition-all hover:scale-[1.01] ${
                selectedDuration === 25 && mode === "work"
                  ? "bg-amber-400/5 border-amber-400/30 text-amber-300"
                  : "bg-slate-950/40 border-slate-850 text-slate-400"
              }`}
            >
              <Flame className="w-4.5 h-4.5" />
              <div>
                <div className="text-xs font-bold text-slate-200">Standard set</div>
                <span className="text-[10px] font-mono">25 Min Focus</span>
              </div>
            </button>

            <button
              onClick={() => handleSelectPreset(50, "work")}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between h-24 transition-all hover:scale-[1.01] ${
                selectedDuration === 50 && mode === "work"
                  ? "bg-amber-400/5 border-amber-400/30 text-amber-300"
                  : "bg-slate-950/40 border-slate-850 text-slate-400"
              }`}
            >
              <Flame className="w-4.5 h-4.5" />
              <div>
                <div className="text-xs font-bold text-slate-200">Extended block</div>
                <span className="text-[10px] font-mono">50 Min Focus</span>
              </div>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <button
              onClick={() => handleSelectPreset(5, "short_break")}
              className={`p-3.5 rounded-xl border text-left flex flex-col justify-between h-20 transition-all hover:scale-[1.01] ${
                selectedDuration === 5 && mode === "short_break"
                  ? "bg-teal-400/5 border-teal-400/30 text-teal-300"
                  : "bg-slate-950/40 border-slate-850 text-slate-400"
              }`}
            >
              <Coffee className="w-4 h-4" />
              <div>
                <span className="text-xs font-bold text-slate-200 block">Short Break</span>
                <span className="text-[9px] font-mono">5 Mins</span>
              </div>
            </button>

            <button
              onClick={() => handleSelectPreset(15, "long_break")}
              className={`p-3.5 rounded-xl border text-left flex flex-col justify-between h-20 transition-all hover:scale-[1.01] ${
                selectedDuration === 15 && mode === "long_break"
                  ? "bg-teal-400/5 border-teal-400/30 text-teal-300"
                  : "bg-slate-950/40 border-slate-850 text-slate-400"
              }`}
            >
              <Coffee className="w-4 h-4" />
              <div>
                <span className="text-xs font-bold text-slate-200 block">Long break</span>
                <span className="text-[9px] font-mono">15 Mins</span>
              </div>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800/80">
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Configure Custom minutes</label>
            <div className="flex gap-2">
              <input
                type="number"
                min="5"
                max="180"
                value={customMins}
                onChange={(e) => setCustomMins(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleSetCustom}
                className="px-3.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900 font-semibold text-xs text-slate-200 flex items-center justify-center cursor-pointer shrink-0"
              >
                Set Mins
              </button>
            </div>
          </div>
        </div>
      </div>

      {// Column 3: Analytics Summary & History logs
      <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-6 space-y-6">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-emerald-400" /> Focus Performance Index
        </h4>

        {/* Dashboard index */}
        <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Total Work blocks</span>
            <div className="text-lg font-bold text-white mt-1.5">{sessions.filter(s => s.mode === "work").length} Sets</div>
          </div>
          <div>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Deep focus duration</span>
            <div className="text-lg font-bold text-white mt-1.5">{totalFocusMins} Mins</div>
          </div>
        </div>

        {/* History records */}
        <div className="space-y-3">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Recent Intervals</span>
          <div className="space-y-2 max-h-[120px] overflow-y-auto">
            {sessions.slice(-3).reverse().map((s) => (
              <div key={s.id} className="p-3 rounded-lg border border-slate-900 bg-slate-950/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className={`w-3.5 h-3.5 ${s.mode === "work" ? "text-amber-400" : "text-teal-400"}`} />
                  <span className="text-xs font-bold text-slate-200 capitalize">{s.mode} block</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 font-bold">{s.durationMinutes} minutes</span>
              </div>
            ))}
            {sessions.length === 0 && (
              <span className="text-xs text-slate-600 block italic">No history logged yet. Work block tasks now.</span>
            )}
          </div>
        </div>
      </div>}
    </div>
  );
}
