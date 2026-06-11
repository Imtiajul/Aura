/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Users, 
  Sparkles, 
  TrendingUp, 
  Heart, 
  Dumbbell, 
  AlertCircle, 
  CheckCircle, 
  Circle,
  Plus,
  ShieldAlert
} from "lucide-react";

export default function FamilyDashboard() {
  const [familyScore, setFamilyScore] = useState(86);
  const [challengeCompleted, setChallengeCompleted] = useState<Record<string, boolean>>({
    Alex: true,
    Emma: false,
    Sarah: true,
    Leo: false,
  });

  const [dietaryLimitation, setDietaryLimitation] = useState("Peanuts allergen & gluten limits for Leo");

  const members = [
    { name: "Alex (You)", role: "Parent / Pilot", goal: "High-protein mass build", compliance: "Optimal", activeStreak: 8 },
    { name: "Emma", role: "Spouse", goal: "Running metabolic endurance", compliance: "Excellent", activeStreak: 12 },
    { name: "Sarah", role: "Child (Age 14)", goal: "Daily swimming & active blocks", compliance: "Optimal", activeStreak: 5 },
    { name: "Leo", role: "Child (Age 9)", goal: "Hydration targets, sugar limits", compliance: "Fair", activeStreak: 2 },
  ];

  const toggleChallenge = (name: string) => {
    setChallengeCompleted((prev) => {
      const updated = { ...prev, [name]: !prev[name] };
      // Dynamically alter family score based on completions!
      const totalMemberCount = Object.keys(updated).length;
      const completedCount = Object.values(updated).filter(Boolean).length;
      setFamilyScore(Math.round(75 + (completedCount / totalMemberCount) * 20));
      return updated;
    });
  };

  return (
    <div id="family_health_coordinates" className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Column 1: Family score card & parental limits */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-6 space-y-6 flex flex-col justify-between">
        <div className="space-y-4">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-950 border border-slate-850 px-2.5 py-1 rounded">
            Family Coordinates Center
          </span>
          <h3 className="font-sans text-lg font-bold text-white mt-1">Cooperative Health Matrix</h3>

          <div className="p-5 rounded-xl border border-slate-850 bg-slate-950/45 text-center space-y-3">
            <span className="text-[9px] font-bold text-slate-555 uppercase tracking-widest block">Unified Family Health Score</span>
            <div className="text-4xl font-extrabold text-teal-400 font-sans tracking-tight">
              {familyScore} <span className="text-xs font-normal text-slate-550">/ 100</span>
            </div>
            <div className="w-full bg-slate-905 h-2 rounded-full overflow-hidden">
              <div className="bg-teal-450 h-2 transition-all duration-500" style={{ width: `${familyScore}%` }} />
            </div>
          </div>
        </div>

        {/* Parental Meal Limitations control */}
        <div className="space-y-3 pt-4 border-t border-slate-800/80">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-4.5 h-4.5 text-rose-400" /> Child Diet Constraints
          </h4>
          <div className="space-y-2">
            <input
              type="text"
              value={dietaryLimitation}
              onChange={(e) => setDietaryLimitation(e.target.value)}
              placeholder="e.g. Peanuts, lactose limits, dairy free"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[9px] text-slate-500 font-medium block leading-relaxed">
              These restrictions are loaded into child meal plans to flag dangerous recipe suggestions.
            </span>
          </div>
        </div>
      </div>

      {/* Column 2: Family Member roster status */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-6 space-y-6">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <Users className="w-4.5 h-4.5 text-emerald-400" /> Member Compliance Map
        </h4>

        <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
          {members.map((member, i) => (
            <div key={i} className="p-3 bg-slate-950/45 border border-slate-850 rounded-xl flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-200">{member.name}</span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">({member.role})</span>
                </div>
                <span className="text-[10px] text-slate-450 mt-1 block font-semibold leading-relaxed">Goal: {member.goal}</span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[9px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                  {member.compliance}
                </span>
                <span className="text-[9px] text-slate-550 block mt-1 font-mono font-bold">{member.activeStreak} day streak</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Column 3: Active Family Shared Challenges (e.g. running 5K) */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-4.5 h-4.5 text-amber-400" />
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cooperative Challenge</h4>
        </div>

        <div className="p-4 rounded-xl border border-amber-500/10 bg-amber-500/5 space-y-2">
          <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider block">Active Challenge</span>
          <h5 className="text-xs sm:text-sm font-bold text-slate-200">Weekend Metabolic 5K Run</h5>
          <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
            Every member logs a 5-kilometer walk, run, or swim to earn double multiplier XP before Monday.
          </p>
        </div>

        {/* Member completion checklist */}
        <div className="space-y-2.5">
          <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">Completed check</span>
          
          {Object.keys(challengeCompleted).map((name) => {
            const isDone = challengeCompleted[name];
            return (
              <div
                key={name}
                onClick={() => toggleChallenge(name)}
                className={`p-2 rounded-lg border cursor-pointer transition-all flex items-center justify-between text-xs font-bold ${
                  isDone 
                    ? "bg-emerald-500/5 border-emerald-500/15 text-emerald-300" 
                    : "bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-800"
                }`}
              >
                <span>{name}</span>
                {isDone ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 fill-emerald-500/15" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-600" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
