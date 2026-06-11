/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Zap, 
  Brain, 
  Target, 
  Flame, 
  Activity, 
  Users, 
  Briefcase, 
  Menu, 
  X, 
  User, 
  Award, 
  BookOpen, 
  Moon, 
  Sun,
  LogOut 
} from "lucide-react";

import LandingPage from "./components/LandingPage";
import Onboarding from "./components/Onboarding";
import Auth from "./components/Auth";
import AuraChat from "./components/AuraChat";
import GoalPlanner from "./components/GoalPlanner";
import HabitsTracker from "./components/HabitsTracker";
import FocusPomodoro from "./components/FocusPomodoro";
import NutritionCoach from "./components/NutritionCoach";
import AccountabilityDesk from "./components/AccountabilityDesk";
import BusinessDashboard from "./components/BusinessDashboard";
import FamilyDashboard from "./components/FamilyDashboard";

import { 
  UserProfile, 
  Goal, 
  HabitLog, 
  FocusSession, 
  FoodLog, 
  Message, 
  DailyBriefing, 
  DailyReflection, 
  BehaviorPrediction 
} from "./types";

export default function App() {
  const [currentSection, setCurrentSection] = useState<"landing" | "signin" | "signup" | "onboarding" | "dashboard">("landing");
  const [activeTab, setActiveTab] = useState<
    "coaching" | "goals" | "habits" | "focus" | "nutrition" | "desk" | "family" | "business"
  >("coaching");

  // State contracts
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null);
  const [reflection, setReflection] = useState<DailyReflection | null>(null);
  const [prediction, setPrediction] = useState<BehaviorPrediction | null>(null);

  // App style theme
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("aura_theme") as "dark" | "light") || "dark";
  });

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("aura_theme", nextTheme);
  };

  // Scoped interceptor that automatically forwards active session header
  const fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const userId = userProfile?.id || localStorage.getItem("aura_user_id") || "";
    const headers = new Headers(init?.headers);
    if (userId) {
      headers.set("x-user-id", userId);
    }
    return window.fetch(input, {
      ...init,
      headers
    });
  };

  // Loaders
  const [loading, setLoading] = useState<Record<string, boolean>>({
    general: true,
    coaching: false,
    goals: false,
    habits: false,
    nutrition: false,
    desk: false,
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Reusable dynamic state loader
  const loadUserState = async (forcedUserId?: string) => {
    const userId = forcedUserId || userProfile?.id || localStorage.getItem("aura_user_id");
    if (!userId) {
      setLoading((prev) => ({ ...prev, general: false }));
      return;
    }

    try {
      const hHeaders = { "x-user-id": userId };
      const [profileRes, goalsRes, habitsRes, sessionsRes, foodsRes, chatRes, briefingRes, reflectionRes, predictionRes] = await Promise.all([
        window.fetch("/api/profile", { headers: hHeaders }),
        window.fetch("/api/goals", { headers: hHeaders }),
        window.fetch("/api/habits", { headers: hHeaders }),
        window.fetch("/api/focus/sessions", { headers: hHeaders }),
        window.fetch("/api/nutrition/logs", { headers: hHeaders }),
        window.fetch("/api/coaching/chat", { headers: hHeaders }),
        window.fetch("/api/coaching/briefing", { headers: hHeaders }),
        window.fetch("/api/coaching/reflection", { headers: hHeaders }),
        window.fetch("/api/coaching/predict-behavior", { headers: hHeaders })
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        const actualUser = profileData?.user || profileData;
        setUserProfile(actualUser);
        if (actualUser && actualUser.name) {
          setCurrentSection("dashboard");
        }
      }
      if (goalsRes.ok) {
        const resJson = await goalsRes.json();
        setGoals(Array.isArray(resJson) ? resJson : []);
      }
      if (habitsRes.ok) {
        const resJson = await habitsRes.json();
        setHabitLogs(Array.isArray(resJson) ? resJson : []);
      }
      if (sessionsRes.ok) {
        const resJson = await sessionsRes.json();
        setSessions(Array.isArray(resJson) ? resJson : []);
      }
      if (foodsRes.ok) {
        const resJson = await foodsRes.json();
        setFoodLogs(Array.isArray(resJson) ? resJson : []);
      }
      if (chatRes.ok) {
        const resJson = await chatRes.json();
        setConversation(Array.isArray(resJson) ? resJson : (resJson?.conversation || []));
      }
      if (briefingRes.ok) setBriefing(await briefingRes.json());
      if (reflectionRes.ok) setReflection(await reflectionRes.json());
      if (predictionRes.ok) setPrediction(await predictionRes.json());

    } catch (err) {
      console.error("Failed to compile full base state initialization logs", err);
    } finally {
      setLoading((prev) => ({ ...prev, general: false }));
    }
  };

  useEffect(() => {
    loadUserState();
  }, []);

  // 2. Action Handlers

  // Profile Onboarding save
  const handleOnboardingComplete = async (profileData: Partial<UserProfile>) => {
    setLoading((prev) => ({ ...prev, general: true }));
    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });
      if (res.ok) {
        const updated = await res.json();
        setUserProfile(updated?.user || updated);
        
        // Refresh briefing to adapt to newly registered parameters
        await handleRefreshBriefing();
        await handleRefreshPrediction();
        
        setCurrentSection("dashboard");
      }
    } catch (err) {
      console.error("Onboarding setup failure", err);
    } finally {
      setLoading((prev) => ({ ...prev, general: false }));
    }
  };

  // Coching conversation
  const handleSendMessage = async (msgText: string) => {
    setLoading((prev) => ({ ...prev, coaching: true }));
    
    // Optimistic User Bubble
    const optUserMsg: Message = {
      sender: "user",
      text: msgText,
      timestamp: new Date().toISOString(),
    };
    setConversation((prev) => [...prev, optUserMsg]);

    try {
      const chatRes = await fetch("/api/coaching/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msgText }),
      });

      if (chatRes.ok) {
        const replySet = await chatRes.json();
        setConversation(Array.isArray(replySet) ? replySet : (replySet?.conversation || []));
        
        // Refresh User profile to sync level changes/XP earned with high compliance
        const profileRes = await fetch("/api/profile");
        if (profileRes.ok) {
          const pData = await profileRes.json();
          setUserProfile(pData?.user || pData);
        }
      }
    } catch (err) {
      console.error("AI coaching message sync crash", err);
    } finally {
      setLoading((prev) => ({ ...prev, coaching: false }));
    }
  };

  // Goal Management
  const handleAddGoal = async (gData: { title: string; category: string; targetDate: string }) => {
    setLoading((prev) => ({ ...prev, goals: true }));
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gData),
      });
      if (res.ok) {
        const resJson = await res.json();
        setGoals(Array.isArray(resJson) ? resJson : []);
        // Sync profile for XP
        const pRes = await fetch("/api/profile");
        if (pRes.ok) {
          const pData = await pRes.json();
          setUserProfile(pData?.user || pData);
        }
      }
    } catch (err) {
      console.error("AI goal decomposition failed", err);
    } finally {
      setLoading((prev) => ({ ...prev, goals: false }));
    }
  };

  const handleToggleMilestone = async (goalId: string, milestoneId: string) => {
    try {
      const res = await fetch(`/api/goals/${goalId}/milestones/${milestoneId}/toggle`, {
        method: "POST",
      });
      if (res.ok) {
        const resJson = await res.json();
        setGoals(Array.isArray(resJson) ? resJson : []);
        // Sync Profile for XP
        const pRes = await fetch("/api/profile");
        if (pRes.ok) {
          const pData = await pRes.json();
          setUserProfile(pData?.user || pData);
        }
      }
    } catch (err) {
      console.error("Milestone toggle network crash", err);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      const res = await fetch(`/api/goals/${goalId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const resJson = await res.json();
        setGoals(Array.isArray(resJson) ? resJson : []);
      }
    } catch (err) {
      console.error("Goal removal check fail", err);
    }
  };

  // Habits Logging
  const handleLogHabit = async (type: HabitLog["type"], value: number) => {
    setLoading((prev) => ({ ...prev, habits: true }));
    try {
      const res = await fetch("/api/habits/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, value }),
      });
      if (res.ok) {
        const resJson = await res.json();
        setHabitLogs(Array.isArray(resJson) ? resJson : []);
        // Sync Profile for streak logs
        const pRes = await fetch("/api/profile");
        if (pRes.ok) {
          const pData = await pRes.json();
          setUserProfile(pData?.user || pData);
        }
      }
    } catch (err) {
      console.error("Habit register crash", err);
    } finally {
      setLoading((prev) => ({ ...prev, habits: false }));
    }
  };

  // Focus Pomodoro Session
  const handleLogSession = async (durationMinutes: number, mode: FocusSession["mode"]) => {
    try {
      const res = await fetch("/api/focus/log-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ durationMinutes, mode }),
      });
      if (res.ok) {
        const resJson = await res.json();
        setSessions(Array.isArray(resJson) ? resJson : []);
        // Sync profile XP
        const pRes = await fetch("/api/profile");
        if (pRes.ok) {
          const pData = await pRes.json();
          setUserProfile(pData?.user || pData);
        }
      }
    } catch (err) {
      console.error("Focus session sync error", err);
    }
  };

  // Nutrition Plans & Images Scan
  const handleGeneratePlan = async (days: number, pref: string, goal: string) => {
    setLoading((prev) => ({ ...prev, nutrition: true }));
    try {
      const res = await fetch("/api/nutrition/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days, dietaryPreferences: pref, goal }),
      });
      if (res.ok) {
        // Just reload profiles nutrition setup parameters
        const foodsRes = await fetch("/api/nutrition/logs");
        if (foodsRes.ok) {
          const resJson = await foodsRes.json();
          setFoodLogs(Array.isArray(resJson) ? resJson : []);
        }
        alert("Macro planning synchronized! New meal schedules prepared cleanly.");
      }
    } catch (err) {
      console.error("Macro plan setup crash", err);
    } finally {
      setLoading((prev) => ({ ...prev, nutrition: false }));
    }
  };

  const handleLogFoodImage = async (base64Image: string) => {
    setLoading((prev) => ({ ...prev, nutrition: true }));
    try {
      const res = await fetch("/api/nutrition/analyze-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image }),
      });
      if (res.ok) {
        const resJson = await res.json();
        setFoodLogs(Array.isArray(resJson) ? resJson : []);
        // Sync Profile for XP
        const pRes = await fetch("/api/profile");
        if (pRes.ok) {
          const pData = await pRes.json();
          setUserProfile(pData?.user || pData);
        }
      }
    } catch (err) {
      console.error("Gemini Vision processing crash", err);
    } finally {
      setLoading((prev) => ({ ...prev, nutrition: false }));
    }
  };

  const handleDeleteFoodLog = async (id: string) => {
    try {
      const res = await fetch(`/api/nutrition/logs/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const resJson = await res.json();
        setFoodLogs(Array.isArray(resJson) ? resJson : []);
      }
    } catch (err) {
      console.error("Food log record delete error", err);
    }
  };

  // Accountability Refreshes
  const handleRefreshBriefing = async () => {
    setLoading((prev) => ({ ...prev, desk: true }));
    try {
      const res = await fetch("/api/coaching/briefing", { method: "POST" });
      if (res.ok) setBriefing(await res.json());
    } catch (err) {
      console.error("Briefing generation failed", err);
    } finally {
      setLoading((prev) => ({ ...prev, desk: false }));
    }
  };

  const handleRefreshReflection = async () => {
    setLoading((prev) => ({ ...prev, desk: true }));
    try {
      const res = await fetch("/api/coaching/reflection", { method: "POST" });
      if (res.ok) setReflection(await res.json());
    } catch (err) {
      console.error("Reflection update crash", err);
    } finally {
      setLoading((prev) => ({ ...prev, desk: false }));
    }
  };

  const handleRefreshPrediction = async () => {
    setLoading((prev) => ({ ...prev, desk: true }));
    try {
      const res = await fetch("/api/coaching/predict-behavior", { method: "POST" });
      if (res.ok) setPrediction(await res.json());
    } catch (err) {
      console.error("Behavior estimation model crash", err);
    } finally {
      setLoading((prev) => ({ ...prev, desk: false }));
    }
  };

  // Business Action Blaster
  const handleBlastMindfulness = async () => {
    setLoading((prev) => ({ ...prev, general: true }));
    try {
      await fetch("/api/business/team/wellness-intervention", { method: "POST" });
    } catch (err) {
      console.error("Intervention trigger failure", err);
    } finally {
      setLoading((prev) => ({ ...prev, general: false }));
    }
  };

  // Section Routing rendering helper
  if (loading.general) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-sans">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/10 mb-4 animate-spin">
          <Zap className="w-6 h-6 text-slate-950 stroke-[2.5]" />
        </div>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
          Assembling Performance Framework...
        </span>
      </div>
    );
  }

  if (currentSection === "landing") {
    return (
      <LandingPage 
        onSignIn={() => setCurrentSection("signin")}
        onSignUp={() => setCurrentSection("signup")}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  if (currentSection === "signin" || currentSection === "signup") {
    return (
      <Auth 
        initialMode={currentSection}
        theme={theme}
        onToggleTheme={toggleTheme}
        onAuthSuccess={async (user) => {
          setUserProfile(user);
          localStorage.setItem("aura_user_id", user.id);
          // Load specific custom goals, habits or food logs
          await loadUserState(user.id);
          // If profile parameters need manual setup
          if (!user.gender || user.gender === "Other" || !user.age) {
            setCurrentSection("onboarding");
          } else {
            setCurrentSection("dashboard");
          }
        }}
        onBackToLanding={() => setCurrentSection("landing")}
      />
    );
  }

  if (currentSection === "onboarding") {
    return (
      <Onboarding 
        theme={theme}
        onToggleTheme={toggleTheme}
        onComplete={handleOnboardingComplete}
        onCancel={() => setCurrentSection("landing")}
      />
    );
  }

  // Dashboard Nav Links Config
  const navTabs = [
    { id: "coaching" as const, label: "Aura AI Coach", icon: Brain, color: "text-emerald-400" },
    { id: "goals" as const, label: "Performance Goals", icon: Target, color: "text-amber-400" },
    { id: "habits" as const, label: "Daily Habits", icon: Activity, color: "text-rose-400" },
    { id: "focus" as const, label: "Pomodoro Engine", icon: Flame, color: "text-orange-400" },
    { id: "nutrition" as const, label: "Nutrition Coach", icon: BookOpen, color: "text-teal-400" },
    { id: "desk" as const, label: "Accountability", icon: Moon, color: "text-purple-400" },
    { id: "family" as const, label: "Family wellness Map", icon: Users, color: "text-blue-400" },
    { id: "business" as const, label: "Business Hub", icon: Briefcase, color: "text-indigo-400" },
  ];

  return (
    <div className={`min-h-screen ${theme} ${theme === 'light' ? 'bg-slate-50 text-slate-800' : 'bg-slate-950 text-slate-100'} font-sans flex flex-col md:flex-row overflow-x-hidden selection:bg-emerald-500 selection:text-slate-950 transition-colors duration-300`}>
      
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col justify-between w-64 border-r border-slate-900 bg-slate-950/80 shrink-0 sticky top-0 h-screen p-5">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            </div>
            <span className="font-bold text-base tracking-tight text-white">
              Aura
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navTabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-3 transition-colors cursor-pointer ${
                    active 
                      ? "bg-slate-900 text-white" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-950"
                  }`}
                >
                  <tab.icon className={`w-4 h-4 shrink-0 ${tab.color}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User profile capsule and logout */}
        <div className="border-t border-slate-900 pt-4 space-y-4">
          {/* Theme Toggler inside Sidebar */}
          <button
            onClick={toggleTheme}
            className="w-full py-2.5 px-3.5 rounded-xl border border-slate-900 hover:border-slate-800 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-3 cursor-pointer"
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 fill-amber-400/10" />
                <span>Light Option</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-purple-600 fill-purple-600/10" />
                <span>Dark Option</span>
              </>
            )}
          </button>

          {userProfile && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 font-bold text-xs uppercase">
                {userProfile.name?.slice(0, 2) || "PL"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-205 truncate">{userProfile.name || "Default Pilot"}</div>
                <div className="text-[10px] text-slate-500 font-bold truncate">Level {userProfile.level} Active</div>
              </div>
            </div>
          )}
          
          <button
            onClick={() => {
              localStorage.removeItem("aura_user_id");
              setUserProfile(null);
              setCurrentSection("landing");
            }}
            className="w-full py-2.5 px-2.5 rounded-xl border border-slate-900 hover:border-slate-800 text-xs font-bold text-slate-500 hover:text-rose-500 transition-colors flex items-center gap-2.5 justify-center cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header Navigation */}
      <header className="md:hidden border-b border-slate-900 bg-slate-950/80 backdrop-blur sticky top-0 z-40 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
          </div>
          <span className="font-bold text-sm tracking-tight text-white">Aura</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 cursor-pointer animate-pulse"
            title="Toggle App Theme"
          >
            {theme === "dark" ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-purple-600" />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-slate-900 bg-slate-950 px-5 pb-5 pt-2 space-y-1.5 absolute top-15 left-0 w-full z-30"
          >
            {navTabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center gap-2.5 ${
                    active 
                      ? "bg-slate-950 text-white" 
                      : "text-slate-405 hover:bg-slate-950"
                  }`}
                >
                  <tab.icon className={`w-4 h-4 ${tab.color}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}

            {/* Mobile Sign Out Action */}
            <div className="pt-2 mt-2 border-t border-slate-900/40">
              <button
                onClick={() => {
                  localStorage.removeItem("aura_user_id");
                  setUserProfile(null);
                  setCurrentSection("landing");
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center gap-2.5 text-rose-500 hover:bg-rose-500/10 cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Workspace Frame */}
      <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto max-w-7xl mx-auto w-full md:h-screen">
        
        {/* Upper User identity banner */}
        {userProfile && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-900">
            <div>
              <h1 className="font-sans text-2xl font-bold tracking-tight text-white capitalize">
                Welcome back, {userProfile.name?.split(" ")[0]}
              </h1>
              <span className="text-xs text-slate-400 mt-1 block">
                Your AI-Powered behavioral assistant is active on all nodes.
              </span>
            </div>

            {/* Profile Action & Stats Controls */}
            <div className="flex items-center gap-3 shrink-0 self-start sm:self-center select-none">
              {/* Dynamic Theme Toggle Option in Header */}
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-900 hover:border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 text-xs font-bold text-slate-350 hover:text-white transition-all cursor-pointer shadow-sm"
                title="Toggle Application Theme"
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400 fill-amber-400/10 animate-spin-slow" />
                    <span>Go Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-purple-600 fill-purple-600/10" />
                    <span>Go Dark</span>
                  </>
                )}
              </button>

              {/* Micro level capsule */}
              <div className="flex items-center gap-3 bg-slate-900/40 p-2.5 px-4 rounded-xl border border-slate-900">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                  <Award className="w-4.5 h-4.5" />
                </div>
                <div className="text-xs leading-tight">
                  <div className="font-bold text-slate-100 uppercase tracking-wider">Level {userProfile.level} Active</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{userProfile.xp} / {userProfile.level * 1000} XP Accumulated</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Inner Tab routing */}
        <div className="min-h-[480px]">
          {activeTab === "coaching" && (
            <AuraChat 
              conversation={conversation} 
              userProfile={userProfile} 
              onSendMessage={handleSendMessage}
              loading={loading.coaching}
            />
          )}

          {activeTab === "goals" && (
            <GoalPlanner 
              goals={goals} 
              onAddGoal={handleAddGoal} 
              onToggleMilestone={handleToggleMilestone} 
              onDeleteGoal={handleDeleteGoal}
              loading={loading.goals}
            />
          )}

          {activeTab === "habits" && (
            <HabitsTracker 
              habitLogs={habitLogs} 
              userProfile={userProfile} 
              onLogHabit={handleLogHabit}
            />
          )}

          {activeTab === "focus" && (
            <FocusPomodoro 
              sessions={sessions} 
              onLogSession={handleLogSession}
            />
          )}

          {activeTab === "nutrition" && (
            <NutritionCoach 
              mealPlan={userProfile?.mealPlan || []} 
              foodLogs={foodLogs} 
              onGeneratePlan={handleGeneratePlan}
              onLogFoodImage={handleLogFoodImage}
              onDeleteFoodLog={handleDeleteFoodLog}
              loading={loading.nutrition}
            />
          )}

          {activeTab === "desk" && (
            <AccountabilityDesk 
              briefing={briefing} 
              reflection={reflection} 
              prediction={prediction}
              onRefreshBriefing={handleRefreshBriefing}
              onRefreshReflection={handleRefreshReflection}
              onRefreshPrediction={handleRefreshPrediction}
              loading={loading.desk}
            />
          )}

          {activeTab === "family" && (
            <FamilyDashboard />
          )}

          {activeTab === "business" && (
            <BusinessDashboard 
              onBlastMindfulness={handleBlastMindfulness}
              loading={loading.general}
            />
          )}
        </div>
      </main>
    </div>
  );
}
