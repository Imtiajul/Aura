/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, Activity, Flame, Shield, ArrowRight, ArrowLeft, Heart, Sparkles, Check, Sun, Moon } from "lucide-react";
import { UserProfile } from "../types";

interface OnboardingProps {
  onComplete: (profile: Partial<UserProfile>) => void;
  onCancel: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export default function Onboarding({ onComplete, onCancel, theme, onToggleTheme }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: "",
    age: 28,
    gender: "Male",
    height: 175,
    weight: 80,
    goalWeight: 75,
    activityLevel: "moderate",
    dietaryPreferences: "High protein, low carb",
    allergies: "None",
    medicalConditions: "None",
    sleepHours: 7,
    dailyRoutine: "Desk work primarily, gym 3x a week",
    workSchedule: "9-5 remote",
    fitnessExperience: "intermediate",
  });

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const nextStep = () => {
    if (step < totalSteps) setStep((s) => s + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
  };

  return (
    <div id="onboarding_wizard" className={`min-h-screen ${theme === "light" ? "bg-slate-50 text-slate-800" : "bg-slate-950 text-slate-100"} font-sans flex items-center justify-center p-6 relative transition-colors duration-400`}>
      {/* Background ambient glow */}
      <div className={`absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full blur-3xl pointer-events-none transition-all ${theme === "light" ? "bg-emerald-500/5" : "bg-emerald-500/10"}`} />
      <div className={`absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full blur-3xl pointer-events-none transition-all ${theme === "light" ? "bg-teal-500/5" : "bg-teal-500/10"}`} />

      <div className={`w-full max-w-xl ${theme === "light" ? "bg-white border-slate-200 shadow-xl" : "bg-slate-900 border-slate-800 shadow-2xl"} border rounded-2xl p-8 relative z-10 overflow-hidden transition-colors duration-300`}>
        {/* Step Indicator with Header Theme Toggle */}
        <div className={`flex items-center justify-between mb-8 pb-4 border-b ${theme === "light" ? "border-slate-200" : "border-slate-800/80"}`}>
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded ${theme === "light" ? "text-emerald-600 bg-emerald-50" : "text-emerald-400 bg-emerald-50/10"}`}>
              Aura Core Setup
            </span>
            <h2 className={`text-lg font-bold mt-2 ${theme === "light" ? "text-slate-900" : "text-white"}`}>Initialize Performance Bio-Twin</h2>
          </div>
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={onToggleTheme}
              className={`p-2 rounded-xl border transition-all hover:scale-105 cursor-pointer ${
                theme === "light"
                  ? "border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm"
                  : "border-slate-800 bg-slate-800/50 hover:bg-slate-800 text-slate-300"
              }`}
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-purple-600" />}
            </button>
            <span className="text-slate-500 text-xs font-mono font-bold">
              Step {step} of {totalSteps}
            </span>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
               >
                <div className="flex items-center gap-3 mb-2">
                  <User className="w-5 h-5 text-emerald-400" />
                  <h3 className={`font-bold text-base ${theme === "light" ? "text-slate-800" : "text-slate-100"}`}>Tell us about yourself</h3>
                </div>

                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ""}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Alex Hunter"
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all ${
                      theme === "light"
                        ? "border-slate-200 bg-slate-50 text-slate-900 focus:border-emerald-500 focus:bg-white"
                        : "border-slate-800 bg-slate-950 text-slate-100 focus:border-emerald-500 focus:bg-slate-950"
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>Age</label>
                    <input
                      type="number"
                      required
                      min="12"
                      max="100"
                      value={formData.age || 28}
                      onChange={(e) => handleInputChange("age", Number(e.target.value))}
                      className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all ${
                        theme === "light"
                          ? "border-slate-200 bg-slate-50 text-slate-900 focus:border-emerald-500 focus:bg-white"
                          : "border-slate-800 bg-slate-950 text-slate-100 focus:border-emerald-500 focus:bg-slate-950"
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>Gender</label>
                    <select
                      value={formData.gender || "Male"}
                      onChange={(e) => handleInputChange("gender", e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all ${
                        theme === "light"
                          ? "border-slate-200 bg-slate-50 text-slate-900 focus:border-emerald-500 focus:bg-white cursor-pointer"
                          : "border-slate-800 bg-slate-950 text-slate-100 focus:border-emerald-500 focus:bg-slate-950 cursor-pointer"
                      }`}
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Non-binary</option>
                      <option>Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>Physiological Height (cm)</label>
                  <input
                    type="number"
                    required
                    min="100"
                    max="250"
                    value={formData.height || 175}
                    onChange={(e) => handleInputChange("height", Number(e.target.value))}
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all ${
                      theme === "light"
                        ? "border-slate-200 bg-slate-50 text-slate-900 focus:border-emerald-500 focus:bg-white"
                        : "border-slate-800 bg-slate-950 text-slate-100 focus:border-emerald-500 focus:bg-slate-950"
                    }`}
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="w-5 h-5 text-amber-400" />
                  <h3 className={`font-bold text-base ${theme === "light" ? "text-slate-800" : "text-slate-100"}`}>Weight & Energy Dynamics</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>Current Weight (kg)</label>
                    <input
                      type="number"
                      required
                      min="30"
                      max="200"
                      value={formData.weight || 80}
                      onChange={(e) => handleInputChange("weight", Number(e.target.value))}
                      className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all ${
                        theme === "light"
                          ? "border-slate-200 bg-slate-50 text-slate-900 focus:border-emerald-500 focus:bg-white"
                          : "border-slate-800 bg-slate-950 text-slate-100 focus:border-emerald-500 focus:bg-slate-950"
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>Goal Target Weight (kg)</label>
                    <input
                      type="number"
                      required
                      min="30"
                      max="200"
                      value={formData.goalWeight || 75}
                      onChange={(e) => handleInputChange("goalWeight", Number(e.target.value))}
                      className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all ${
                        theme === "light"
                          ? "border-slate-200 bg-slate-50 text-slate-900 focus:border-emerald-500 focus:bg-white"
                          : "border-slate-800 bg-slate-950 text-slate-100 focus:border-emerald-500 focus:bg-slate-950"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>Physical Activity Baseline</label>
                  <select
                    value={formData.activityLevel || "moderate"}
                    onChange={(e) => handleInputChange("activityLevel", e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all ${
                      theme === "light"
                        ? "border-slate-200 bg-slate-50 text-slate-900 focus:border-emerald-500 focus:bg-white cursor-pointer"
                        : "border-slate-800 bg-slate-950 text-slate-100 focus:border-emerald-500 focus:bg-slate-950 cursor-pointer"
                    }`}
                  >
                    <option value="sedentary">Sedentary (Primarily desk bound, minimal walking)</option>
                    <option value="light">Lightly Active (Occasions of walking, light exercises 1-2x/wk)</option>
                    <option value="moderate">Moderately Active (Sustained workouts, active training 3-5x/wk)</option>
                    <option value="very">Highly Athletic (Resistance training/cardio 6-7x/wk)</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>Fitness Experience LEVEL</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["beginner", "intermediate", "advanced"].map((exp) => (
                      <button
                        type="button"
                        key={exp}
                        onClick={() => handleInputChange("fitnessExperience", exp)}
                        className={`py-2 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
                          formData.fitnessExperience === exp
                            ? "bg-amber-400 border-amber-400 text-slate-950 shadow-md scale-102"
                            : theme === "light"
                              ? "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-350 hover:bg-slate-100"
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900"
                        } capitalize`}
                      >
                        {exp}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Flame className="w-5 h-5 text-rose-400" />
                  <h3 className={`font-bold text-base ${theme === "light" ? "text-slate-800" : "text-slate-100"}`}>Nutrition & Allergens</h3>
                </div>

                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>Dietary Orientation & Focus</label>
                  <input
                    type="text"
                    value={formData.dietaryPreferences || ""}
                    onChange={(e) => handleInputChange("dietaryPreferences", e.target.value)}
                    placeholder="e.g. Vegetarian, keto, high-protein lean cut"
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all ${
                      theme === "light"
                        ? "border-slate-200 bg-slate-50 text-slate-900 focus:border-emerald-500 focus:bg-white"
                        : "border-slate-800 bg-slate-950 text-slate-100 focus:border-emerald-500 focus:bg-slate-950"
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>Food Allergies</label>
                    <input
                      type="text"
                      value={formData.allergies || ""}
                      onChange={(e) => handleInputChange("allergies", e.target.value)}
                      placeholder="e.g. Peanuts, gluten, none"
                      className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all ${
                        theme === "light"
                          ? "border-slate-200 bg-slate-50 text-slate-900 focus:border-emerald-500 focus:bg-white"
                          : "border-slate-800 bg-slate-950 text-slate-100 focus:border-emerald-500 focus:bg-slate-950"
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>Medical Conditions</label>
                    <input
                      type="text"
                      value={formData.medicalConditions || ""}
                      onChange={(e) => handleInputChange("medicalConditions", e.target.value)}
                      placeholder="e.g. Hypertension, none"
                      className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all ${
                        theme === "light"
                          ? "border-slate-200 bg-slate-50 text-slate-900 focus:border-emerald-500 focus:bg-white"
                          : "border-slate-800 bg-slate-950 text-slate-100 focus:border-emerald-500 focus:bg-slate-950"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>Daily Sleep Targets (Hours)</label>
                  <input
                    type="range"
                    min="4"
                    max="10"
                    step="0.5"
                    value={formData.sleepHours || 7}
                    onChange={(e) => handleInputChange("sleepHours", Number(e.target.value))}
                    className="w-full accent-emerald-400 h-2 bg-slate-200 dark:bg-slate-950 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-xs font-mono text-slate-500 mt-2">
                    <span>4 Hours</span>
                    <span className="text-emerald-500 font-bold">{formData.sleepHours} Hours Target</span>
                    <span>10 Hours</span>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-5 h-5 text-teal-400" />
                  <h3 className={`font-bold text-base ${theme === "light" ? "text-slate-800" : "text-slate-100"}`}>Discipline & Work-Cycle Cues</h3>
                </div>

                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>Daily Routine & Procrastination Traps</label>
                  <textarea
                    rows={2}
                    value={formData.dailyRoutine || ""}
                    onChange={(e) => handleInputChange("dailyRoutine", e.target.value)}
                    placeholder="Describe your morning workflow, habits, or points where focus crashes..."
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all resize-none ${
                      theme === "light"
                        ? "border-slate-200 bg-slate-50 text-slate-900 focus:border-emerald-500 focus:bg-white"
                        : "border-slate-800 bg-slate-950 text-slate-100 focus:border-emerald-500 focus:bg-slate-950"
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>Work hours / Desk Schedule</label>
                  <input
                    type="text"
                    value={formData.workSchedule || ""}
                    onChange={(e) => handleInputChange("workSchedule", e.target.value)}
                    placeholder="e.g. 9 AM - 6 PM remote, high screens exposure"
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all ${
                      theme === "light"
                        ? "border-slate-200 bg-slate-50 text-slate-900 focus:border-emerald-500 focus:bg-white"
                        : "border-slate-800 bg-slate-950 text-slate-100 focus:border-emerald-500 focus:bg-slate-950"
                    }`}
                  />
                </div>

                <div className={`p-4 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
                  theme === "light"
                    ? "border-emerald-100 bg-emerald-50/40 text-slate-600"
                    : "border-emerald-500/10 bg-emerald-500/5 text-slate-400"
                }`}>
                  <Heart className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    Aura constructs an adaptive Performance Digital Twin based on these metrics. Recalibrations run synchronously across milestones, focus intervals, and hydration warnings.
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dialog Action Buttons */}
          <div className={`flex items-center justify-between pt-6 border-t mt-8 ${theme === "light" ? "border-slate-200" : "border-slate-800/80"}`}>
            <button
              type="button"
              onClick={step === 1 ? onCancel : prevStep}
              className={`px-4 py-2.5 text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                theme === "light" ? "text-slate-500 hover:text-slate-800" : "text-slate-400 hover:text-slate-100"
              }`}
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            {step < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={step === 1 && !formData.name}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                  step === 1 && !formData.name
                    ? theme === "light"
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-slate-800 text-slate-500 cursor-not-allowed"
                    : "bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-lg shadow-emerald-400/5 hover:scale-102"
                }`}
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-bold hover:shadow-lg hover:shadow-emerald-500/10 hover:scale-102 transition-all text-sm flex items-center gap-1.5 cursor-pointer"
              >
                Synthesize Twin <Check className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
