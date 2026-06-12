/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  User, 
  Activity, 
  Flame, 
  ShieldCheck, 
  Sparkles, 
  Info, 
  Scale, 
  Clock, 
  Heart, 
  Lock, 
  Award, 
  Check, 
  ChevronRight, 
  AlertTriangle 
} from "lucide-react";
import { UserProfile } from "../types";

interface UserProfileAreaProps {
  userProfile: UserProfile;
  theme: "dark" | "light";
  onUpdateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  loading?: boolean;
}

export default function UserProfileArea({ 
  userProfile, 
  theme, 
  onUpdateProfile, 
  loading = false 
}: UserProfileAreaProps) {
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: userProfile.name || "",
    age: userProfile.age || 28,
    gender: userProfile.gender || "Male",
    height: userProfile.height || 175,
    weight: userProfile.weight || 80,
    goalWeight: userProfile.goalWeight || 75,
    activityLevel: userProfile.activityLevel || "moderate",
    dietaryPreferences: userProfile.dietaryPreferences || "",
    allergies: userProfile.allergies || "",
    medicalConditions: userProfile.medicalConditions || "",
    sleepHours: userProfile.sleepHours || 7.5,
    dailyRoutine: userProfile.dailyRoutine || "",
    workSchedule: userProfile.workSchedule || "",
    fitnessExperience: userProfile.fitnessExperience || "intermediate",
  });

  const [activeTab, setActiveTab] = useState<"general" | "physical" | "diet_habits">("general");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const calculateBMI = () => {
    const heightInMeters = (formData.height || 175) / 100;
    const weight = formData.weight || 80;
    if (heightInMeters > 0) {
      return (weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return "0.0";
  };

  const getBMICategory = (bmi: string) => {
    const val = parseFloat(bmi);
    if (val < 18.5) return { label: "Underweight", color: "text-amber-400" };
    if (val < 25) return { label: "Normal (Healthy)", color: "text-emerald-400" };
    if (val < 30) return { label: "Overweight", color: "text-amber-500" };
    return { label: "Obese", color: "text-rose-500" };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    try {
      await onUpdateProfile(formData);
      setStatusMessage({
        type: "success",
        text: "Bio-Twin calibrations synchronized successfully! All neural widgets updated."
      });
      // Clear notification after 4s
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: "Failed to update profile indicators. Please check your data fields and try again."
      });
    }
  };

  const bmiVal = calculateBMI();
  const bmiCat = getBMICategory(bmiVal);

  return (
    <div id="user_profile_area" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded ${
            theme === "light" ? "text-emerald-700 bg-emerald-50" : "text-emerald-400 bg-emerald-500/10"
          }`}>
            Profile Engine
          </span>
          <h2 className="text-xl font-extrabold tracking-tight text-white mt-1">
            Personal Bio-Twin Setup & Goals
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage your physical telemetry, dietary configurations, and performance metrics.
          </p>
        </div>

        {/* Level Banner */}
        <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-900/80 max-w-xs">
          <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center text-emerald-400 border border-slate-800">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5 uppercase">
              {userProfile.name}
              <span className="text-[10px] text-emerald-400 lowercase font-normal">lv.{userProfile.level}</span>
            </div>
            <div className="w-28 h-1.5 bg-slate-950 rounded-full mt-1.5 overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500" 
                style={{ width: `${Math.min(100, (userProfile.xp / (userProfile.level * 1000)) * 100)}%` }} 
              />
            </div>
            <div className="text-[9px] text-slate-500 font-bold mt-1">
              {userProfile.xp} / {userProfile.level * 1000} XP
            </div>
          </div>
        </div>
      </div>

      {statusMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3.5 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
            statusMessage.type === "success"
              ? "border-emerald-500/15 bg-emerald-500/5 text-emerald-400"
              : "border-rose-500/15 bg-rose-500/5 text-rose-400"
          }`}
        >
          {statusMessage.type === "success" ? (
            <ShieldCheck className="w-4 h-4 text-emerald-500 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5" />
          )}
          <span>{statusMessage.text}</span>
        </motion.div>
      )}

      {/* Profile Area Layout Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Hand Navigation / Stats Cards */}
        <div className="lg:col-span-1 space-y-4">
          {/* Quick Metrics Badge */}
          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Physiological Summary</h4>
            
            <div className="flex items-center justify-between border-b border-slate-905 pb-2">
              <span className="text-xs text-slate-400">BMI Index</span>
              <div className="text-right">
                <span className="text-sm font-bold text-slate-200">{bmiVal}</span>
                <span className={`text-[10px] block font-semibold ${bmiCat.color}`}>{bmiCat.label}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-slate-905 pb-2">
              <span className="text-xs text-slate-400">Target Deficit</span>
              <div className="text-right">
                <span className="text-sm font-bold text-slate-200">
                  {formData.weight && formData.goalWeight ? (formData.weight - formData.goalWeight).toFixed(1) : "0"} kg
                </span>
                <span className="text-[10px] block text-slate-500 font-semibold">To Goal</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-slate-905 pb-2">
              <span className="text-xs text-slate-400">Active Shields</span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                🛡 {userProfile.consistencyShields || 1} Remaining
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Current Streak</span>
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                🔥 {userProfile.streakDays || 1} Consecutive Days
              </span>
            </div>
          </div>

          {/* Setup Subsection Tabs */}
          <div className="bg-slate-900/20 border border-slate-900/60 rounded-xl overflow-hidden p-1.5 flex flex-col gap-1">
            <button
              onClick={() => setActiveTab("general")}
              className={`w-full py-2 px-3 text-xs font-bold flex items-center gap-2.5 rounded-lg transition-all ${
                activeTab === "general"
                  ? "bg-slate-900 text-white border border-slate-800"
                  : "text-slate-400 hover:text-slate-205 hover:bg-slate-950/40"
              }`}
            >
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>Personal Profile</span>
            </button>
            <button
              onClick={() => setActiveTab("physical")}
              className={`w-full py-2 px-3 text-xs font-bold flex items-center gap-2.5 rounded-lg transition-all ${
                activeTab === "physical"
                  ? "bg-slate-900 text-white border border-slate-800"
                  : "text-slate-400 hover:text-slate-205 hover:bg-slate-950/40"
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-amber-400" />
              <span>Weight & Energy</span>
            </button>
            <button
              onClick={() => setActiveTab("diet_habits")}
              className={`w-full py-2 px-3 text-xs font-bold flex items-center gap-2.5 rounded-lg transition-all ${
                activeTab === "diet_habits"
                  ? "bg-slate-900 text-white border border-slate-800"
                  : "text-slate-400 hover:text-slate-205 hover:bg-slate-950/40"
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-rose-400" />
              <span>Dietary & Schedule</span>
            </button>
          </div>
        </div>

        {/* Right Hand Form Settings */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="bg-slate-900/40 border border-slate-900 rounded-xl p-5 md:p-6 space-y-6">
            
            {activeTab === "general" && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-900">
                  <User className="w-4.5 h-4.5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-slate-100">Personal Staging Data</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-405 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name || ""}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-405 mb-1.5">Gender Alignment</label>
                    <select
                      value={formData.gender || "Male"}
                      onChange={(e) => handleInputChange("gender", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer font-semibold"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Non-binary</option>
                      <option>Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-405 mb-1.5">Age Index</label>
                    <input
                      type="number"
                      required
                      min="12"
                      max="105"
                      value={formData.age || 28}
                      onChange={(e) => handleInputChange("age", Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-405 mb-1.5">Physiological Height (cm)</label>
                    <input
                      type="number"
                      required
                      min="100"
                      max="250"
                      value={formData.height || 175}
                      onChange={(e) => handleInputChange("height", Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "physical" && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-900">
                  <Scale className="w-4.5 h-4.5 text-amber-400" />
                  <h3 className="text-sm font-bold text-slate-100">Weight & Energy Targets</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-405 mb-1.5">Current Weight (kg)</label>
                    <input
                      type="number"
                      required
                      min="30"
                      max="220"
                      step="0.1"
                      value={formData.weight || 80}
                      onChange={(e) => handleInputChange("weight", Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-semibold font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-405 mb-1.5">Goal Target Weight (kg)</label>
                    <input
                      type="number"
                      required
                      min="30"
                      max="220"
                      step="0.1"
                      value={formData.goalWeight || 75}
                      onChange={(e) => handleInputChange("goalWeight", Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-semibold font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-405 mb-1.5">Activity Multiplier</label>
                    <select
                      value={formData.activityLevel || "moderate"}
                      onChange={(e) => handleInputChange("activityLevel", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer font-semibold"
                    >
                      <option value="sedentary">Sedentary (No workouts, heavy desk bound)</option>
                      <option value="light">Lightly Active (Light exercise 1-2x/wk)</option>
                      <option value="moderate">Moderately Active (Train 3-5x/wk)</option>
                      <option value="very">Highly Athletic (Resistance training/cardio 6-7x/wk)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-405 mb-1.5">Fitness Level Experience</label>
                    <select
                      value={formData.fitnessExperience || "intermediate"}
                      onChange={(e) => handleInputChange("fitnessExperience", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer font-semibold"
                    >
                      <option value="beginner">Beginner (Ramping Up Base)</option>
                      <option value="intermediate">Intermediate (Regular Habits Routine)</option>
                      <option value="advanced">Advanced (High Intensity Compliance)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "diet_habits" && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-900">
                  <Activity className="w-4.5 h-4.5 text-rose-400" />
                  <h3 className="text-sm font-bold text-slate-100">Nutrition & Behavioral Targets</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-405 mb-1.5">Dietary Orientation Preferences</label>
                    <input
                      type="text"
                      value={formData.dietaryPreferences || ""}
                      onChange={(e) => handleInputChange("dietaryPreferences", e.target.value)}
                      placeholder="e.g. Vegetarian, keto, high-protein lean cut"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-405 mb-1.5">Allergens Matrix</label>
                    <input
                      type="text"
                      value={formData.allergies || ""}
                      onChange={(e) => handleInputChange("allergies", e.target.value)}
                      placeholder="e.g. Peanuts, wheat gluten, none"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-405 mb-1.5">Focus Schedule / Desk Hours</label>
                    <input
                      type="text"
                      value={formData.workSchedule || ""}
                      onChange={(e) => handleInputChange("workSchedule", e.target.value)}
                      placeholder="e.g. 9 AM - 6 PM remote, high screen exposure"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-405 mb-1.5">Medical Indications</label>
                    <input
                      type="text"
                      value={formData.medicalConditions || ""}
                      onChange={(e) => handleInputChange("medicalConditions", e.target.value)}
                      placeholder="e.g. Lower-back strain, none"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-405 mb-1.5">Target Daily Sleep (Hours: {formData.sleepHours})</label>
                  <input
                    type="range"
                    min="4"
                    max="10.5"
                    step="0.5"
                    value={formData.sleepHours || 7.5}
                    onChange={(e) => handleInputChange("sleepHours", Number(e.target.value))}
                    className="w-full accent-emerald-500 h-2 bg-slate-950 rounded-lg cursor-pointer border border-slate-800"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-2">
                    <span>4 Hrs</span>
                    <span className="text-emerald-400 font-bold">{formData.sleepHours} Hours Staged</span>
                    <span>10.5 Hrs</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-405 mb-1.5">Routine Description & Habit Traps</label>
                  <textarea
                    rows={3}
                    value={formData.dailyRoutine || ""}
                    onChange={(e) => handleInputChange("dailyRoutine", e.target.value)}
                    placeholder="Describe morning work sets, coffee intake time, typical fatigue points..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 resize-none font-semibold"
                  />
                </div>
              </div>
            )}

            {/* Bottom Form Actions */}
            <div className="flex items-center justify-between pt-5 border-t border-slate-900/60 mt-4">
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <Lock className="w-3.5 h-3.5 text-emerald-500/80" />
                <span>Encrypted secure Bio-Twin storage node</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-emerald-500/10 cursor-pointer flex items-center gap-1.5"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-slate-950" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                    <span>Synchronize Profile</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
