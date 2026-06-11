/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Droplet, 
  Flame, 
  Moon, 
  Sparkles, 
  Timer, 
  Activity, 
  BookOpen, 
  Compass, 
  CompassIcon, 
  CheckCircle,
  Plus,
  Shield,
  Award,
  Lock
} from "lucide-react";
import { HabitLog, UserProfile } from "../types";

interface HabitsTrackerProps {
  habitLogs: HabitLog[];
  userProfile: UserProfile | null;
  onLogHabit: (type: HabitLog["type"], value: number) => Promise<void>;
}

export default function HabitsTracker({ habitLogs, userProfile, onLogHabit }: HabitsTrackerProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({
    water: 1,
    exercise: 30,
    sleep: 8,
    reading: 15,
    meditation: 10,
    walking: 2000,
  });

  const handleLogClick = async (type: HabitLog["type"]) => {
    const val = quantities[type] || 1;
    await onLogHabit(type, val);
  };

  const handleQtyChange = (type: string, d: number, min = 1) => {
    setQuantities((prev) => ({
      ...prev,
      [type]: Math.max(min, (prev[type] || 0) + d),
    }));
  };

  // Aggregates for today
  const getTodayLogs = (type: HabitLog["type"]) => {
    return habitLogs
      .filter((h) => h.type === type)
      .reduce((acc, curr) => acc + curr.value, 0);
  };

  const habitTypes = [
    { type: "water" as const, label: "Water Intake", unit: "Glasses", icon: Droplet, color: "text-blue-400 bg-blue-500/10 border-blue-500/20", step: 1, min: 1, target: 8 },
    { type: "exercise" as const, label: "Resistance Workout", unit: "Mins", icon: Activity, color: "text-rose-400 bg-rose-500/10 border-rose-500/20", step: 15, min: 15, target: 45 },
    { type: "sleep" as const, label: "Sleep Duration", unit: "Hours", icon: Moon, color: "text-purple-400 bg-purple-500/10 border-purple-500/20", step: 1, min: 4, target: 7.5 },
    { type: "meditation" as const, label: "Sustained Mindfulness", unit: "Mins", icon: Compass, color: "text-teal-400 bg-teal-500/10 border-teal-500/20", step: 5, min: 5, target: 15 },
    { type: "reading" as const, label: "Focus Reading", unit: "Mins", icon: BookOpen, color: "text-amber-400 bg-amber-500/10 border-amber-500/20", step: 10, min: 10, target: 30 },
  ];

  return (
    <div id="habits_tracker" className="space-y-6">
      {/* Upper stats row: streaks, shields, level */}
      {userProfile && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-xl border border-slate-800 bg-slate-900/10 backdrop-blur-sm">
          <div className="text-center sm:text-left">
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Gamified Tier</span>
            <div className="text-lg font-bold text-white flex items-center gap-1.5 justify-center sm:justify-start mt-0.5">
              <Award className="w-4.5 h-4.5 text-amber-400" />
              <span>Level {userProfile.level} Elite</span>
            </div>
          </div>

          <div className="text-center sm:text-left">
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Current XP Index</span>
            <div className="text-lg font-bold text-white flex items-baseline gap-1 justify-center sm:justify-start mt-0.5">
              <span className="text-emerald-400 font-extrabold">{userProfile.xp}</span>
              <span className="text-slate-500 text-xs">/ {userProfile.level * 1000} XP</span>
            </div>
          </div>

          <div className="text-center sm:text-left">
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Consistency Streak</span>
            <div className="text-lg font-bold text-emerald-400 flex items-center gap-1.5 justify-center sm:justify-start mt-0.5">
              <Flame className="w-4.5 h-4.5 text-orange-400 fill-orange-500/10 animate-pulse" />
              <span>{userProfile.streakDays} Days Strong</span>
            </div>
          </div>

          <div className="text-center sm:text-left">
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Streak Shields</span>
            <div className="text-lg font-bold text-amber-400 flex items-center gap-1.5 justify-center sm:justify-start mt-0.5">
              <Shield className="w-4.5 h-4.5 text-amber-400 fill-amber-500/10" />
              <span>{userProfile.consistencyShields} Guarded</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Habits Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Habit controls */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-400" /> Daily Habit Registers
          </h3>

          <div className="space-y-3">
            {habitTypes.map((ht) => {
              const currentQty = quantities[ht.type] || ht.min;
              const todaySum = getTodayLogs(ht.type);
              const progressPct = Math.min(100, Math.round((todaySum / ht.target) * 100));

              return (
                <div key={ht.type} className="p-4 rounded-xl border border-slate-850 bg-slate-900/30 hover:border-slate-800 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${ht.color}`}>
                      <ht.icon className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-white">{ht.label}</h4>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-[10px] font-mono font-bold text-slate-400">Today: {todaySum} {ht.unit}</span>
                        <span className="text-[9px] text-slate-600 font-semibold">• Goal {ht.target}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity selector and logger */}
                  <div className="flex items-center gap-3.5 ml-auto sm:ml-0">
                    <div className="flex items-center border border-slate-800 bg-slate-950 rounded-lg overflow-hidden h-9">
                      <button
                        type="button"
                        onClick={() => handleQtyChange(ht.type, -ht.step, ht.min)}
                        className="px-2 text-slate-500 hover:text-slate-200 transition-colors cursor-pointer text-xs font-bold"
                      >
                        -
                      </button>
                      <span className="px-2 w-16 text-center text-xs text-white font-mono font-bold">
                        {currentQty} {ht.unit === "Glasses" ? "gl" : ht.unit === "Mins" ? "m" : "h"}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQtyChange(ht.type, ht.step, ht.min)}
                        className="px-2 text-slate-500 hover:text-slate-200 transition-colors cursor-pointer text-xs font-bold"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => handleLogClick(ht.type)}
                      className="h-9 px-3.5 rounded-lg bg-emerald-400 text-slate-950 font-bold hover:bg-emerald-300 text-xs flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Log
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gamified unlocking Achievements & Badges */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4.5 h-4.5 text-amber-400" /> Consistency Achievements
          </h3>

          <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-5 space-y-4">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-950 border border-slate-850 px-2 py-0.5 rounded">
              Earned Badges ({userProfile?.badges.length || 0})
            </span>
            <div className="grid grid-cols-2 gap-3 pt-1">
              {userProfile?.badges.map((badge, i) => (
                <div key={i} className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-400/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-200 line-clamp-1">{badge}</span>
                </div>
              ))}
            </div>

            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-950 border border-slate-850 px-2 py-0.5 rounded block pt-2">
              Next Unlockable Goals
            </span>
            <div className="space-y-2.5">
              <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-lg flex items-center justify-between opacity-60">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-600" />
                  <span className="text-xs text-slate-400">Focus Specialist (Lv5 check)</span>
                </div>
                <span className="text-[10px] font-mono text-amber-500 font-bold">500 XP Reward</span>
              </div>

              <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-lg flex items-center justify-between opacity-60">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-600" />
                  <span className="text-xs text-slate-400">Zen Master (3 day water lock)</span>
                </div>
                <span className="text-[10px] font-mono text-amber-500 font-bold">Zen Badge</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
