/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Briefcase, 
  Users, 
  Activity, 
  Sparkles, 
  Bell, 
  TrendingUp, 
  AlertTriangle,
  Compass,
  CheckCircle,
  HelpCircle,
  Clock
} from "lucide-react";

interface BusinessDashboardProps {
  onBlastMindfulness: () => Promise<void>;
  loading: boolean;
}

export default function BusinessDashboard({ onBlastMindfulness, loading }: BusinessDashboardProps) {
  const [wellnessIndex, setWellnessIndex] = useState(78);
  const [alertText, setAlertText] = useState<string | null>(null);

  const departments = [
    { name: "Engineering / Devs", fatigue: 72, risk: "High screen exposure fatigue", color: "bg-rose-500", text: "text-rose-400" },
    { name: "Sales / Outreach", fatigue: 45, risk: "Balanced interaction loops", color: "bg-amber-400", text: "text-amber-400" },
    { name: "Design / Creative", fatigue: 38, risk: "Optimal focus cycles active", color: "bg-emerald-400", text: "text-emerald-400" },
    { name: "Admins / Ops", fatigue: 54, risk: "Mild late-afternoon pacing risks", color: "bg-amber-400", text: "text-amber-400" },
  ];

  const handleBlastTrigger = async () => {
    await onBlastMindfulness();
    setAlertText("Executed Corporate Intervention Blast! A synchronised 5-minute deep focus rest and mindfulness trigger has been dispatched to all team node screens.");
    setWellnessIndex((w) => Math.min(100, w + 2)); // Slightly raise score!
    setTimeout(() => setAlertText(null), 8000);
  };

  return (
    <div id="business_wellness_hub" className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Column 1: Organization index scorecard and quick actions */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-6 space-y-6 flex flex-col justify-between">
        <div className="space-y-4">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-950 border border-slate-850 px-2.5 py-1 rounded">
            Corporate Wellness Administration
          </span>
          <h3 className="font-sans text-lg font-bold text-white mt-1">Enterprise Wellness Indicator</h3>

          <div className="p-5 rounded-xl border border-slate-850 bg-slate-950/45 text-center space-y-3">
            <span className="text-[9px] font-bold text-slate-550 uppercase tracking-widest block">Team Wellness Index</span>
            <div className="text-4xl font-extrabold text-emerald-400 font-sans tracking-tight">
              {wellnessIndex}% <span className="text-xs font-normal text-slate-500">Optimal</span>
            </div>
            <div className="w-full bg-slate-905 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-2 transition-all duration-500" style={{ width: `${wellnessIndex}%` }} />
            </div>
          </div>
        </div>

        {/* Intervention Call Trigger */}
        <div className="space-y-3 pt-4">
          <button
            onClick={handleBlastTrigger}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-bold hover:shadow-lg hover:shadow-emerald-400/10 transition-all text-xs flex items-center justify-center gap-1.5"
          >
            <Bell className="w-4 h-4" /> Blast Global Mindfulness
          </button>
          
          <p className="text-[9px] text-slate-500 font-semibold text-center leading-relaxed">
            This issues an active alert prompting devs and admins to execute a 5-minute metabolic focus break.
          </p>
        </div>
      </div>

      {/* Column 2: Live Fatigue Analysis Departments status */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-6 space-y-6">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <Activity className="w-4.5 h-4.5 text-emerald-400" /> Departmental Fatigue Diagnostics
        </h4>

        <div className="space-y-4 pt-1">
          {departments.map((dept, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs text-slate-300 font-bold">
                <span>{dept.name}</span>
                <span className={dept.text}>{dept.fatigue}% Fatigue</span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                <div className={`h-1.5 ${dept.color}`} style={{ width: `${dept.fatigue}%` }} />
              </div>
              <span className="text-[10px] text-slate-500 font-medium block">
                Recommended: {dept.risk}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Column 3: Team Intervention logs & system warnings */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-6 space-y-6 flex flex-col justify-between">
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <TrendingUp className="w-4.5 h-4.5 text-emerald-400" /> Enterprise Aggregates
          </h4>

          <div className="grid grid-cols-2 gap-3.5 pt-2">
            <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-850 text-center space-y-1">
              <span className="text-[9px] text-slate-550 font-bold uppercase block">Active Nodes</span>
              <span className="text-sm font-bold font-mono text-white">128 Online</span>
            </div>
            <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-850 text-center space-y-1">
              <span className="text-[9px] text-slate-550 font-bold uppercase block">Total Co-XP</span>
              <span className="text-sm font-bold font-mono text-white">45.2k XP</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <span className="text-[10px] text-slate-450 font-semibold uppercase tracking-wider block">Real-time alerts</span>
            <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs text-slate-400">Next Scheduled Sync</span>
              </div>
              <span className="text-[10px] font-semibold text-slate-400">15:00 UTC</span>
            </div>
          </div>
        </div>

        {/* Toast confirmation */}
        <AnimatePresence>
          {alertText && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="p-3.5 rounded-xl border border-emerald-500/10 bg-emerald-500/5 text-emerald-300 text-xs leading-relaxed"
            >
              {alertText}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
