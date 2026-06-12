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
  LogOut,
  Sparkles,
  AlertTriangle 
} from "lucide-react";

import { supabase } from "./supabaseClient";
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
import UserProfileArea from "./components/UserProfileArea";

import { 
  UserProfile, 
  Goal, 
  HabitLog, 
  FocusSession, 
  FoodLog, 
  Message, 
  ChatThread,
  Task,
  DailyBriefing, 
  DailyReflection, 
  BehaviorPrediction 
} from "./types";

export default function App() {
  const [currentSection, setCurrentSection] = useState<"landing" | "signin" | "signup" | "onboarding" | "dashboard">("landing");
  const [activeTab, setActiveTab] = useState<
    "coaching" | "goals" | "habits" | "focus" | "nutrition" | "desk" | "family" | "business" | "profile"
  >("coaching");

  // State contracts
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>("");
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
    onboarding: false,
  });

  const [onboardingError, setOnboardingError] = useState<string | null>(null);

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
      const [profileRes, goalsRes, habitsRes, sessionsRes, foodsRes, chatRes, briefingRes, reflectionRes, predictionRes, tasksRes] = await Promise.all([
        window.fetch("/api/profile", { headers: hHeaders }),
        window.fetch("/api/goals", { headers: hHeaders }),
        window.fetch("/api/habits", { headers: hHeaders }),
        window.fetch("/api/focus/sessions", { headers: hHeaders }),
        window.fetch("/api/nutrition/logs", { headers: hHeaders }),
        window.fetch("/api/coaching/chat", { headers: hHeaders }),
        window.fetch("/api/coaching/briefing", { headers: hHeaders }),
        window.fetch("/api/coaching/reflection", { headers: hHeaders }),
        window.fetch("/api/coaching/predict-behavior", { headers: hHeaders }),
        window.fetch("/api/tasks", { headers: hHeaders })
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        const actualUser = profileData?.user || profileData;
        setUserProfile(actualUser);
        if (actualUser && actualUser.name) {
          const skipKey = "onboarding_skipped_" + actualUser.id;
          const hasSkipped = localStorage.getItem(skipKey) === "true";
          const isIncomplete = !actualUser.gender || actualUser.gender === "Other" || !actualUser.age;
          if (isIncomplete && !hasSkipped) {
            setCurrentSection("onboarding");
          } else {
            setCurrentSection("dashboard");
          }
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
        const fetchedThreads = Array.isArray(resJson?.threads) ? resJson.threads : [];
        setThreads(fetchedThreads);
        if (fetchedThreads.length > 0) {
          setActiveThreadId(fetchedThreads[0].id);
          setConversation(fetchedThreads[0].messages || []);
        } else if (Array.isArray(resJson)) {
          // Fallback legacy support
          const legacyThread = {
            id: "thread_legacy",
            title: "Coaching Session",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            messages: resJson
          };
          setThreads([legacyThread]);
          setActiveThreadId("thread_legacy");
          setConversation(resJson);
        }
      }
      if (tasksRes.ok) {
        const resJson = await tasksRes.json();
        setTasks(Array.isArray(resJson) ? resJson : []);
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
    let active = true;
    let subscription: any = null;

    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!active) return;

        if (session?.user) {
          const user = session.user;
          const id = user.id;
          if (localStorage.getItem("aura_user_id") !== id) {
            localStorage.setItem("aura_user_id", id);
          }
          if (!userProfile || userProfile.id !== id) {
            await loadUserState(id);
          }
        } else {
          // Protect private pages with getSession() - redirect dashboard/onboarding to "signin" (which is equivalent to /login in this state router)
          if (currentSection === "onboarding" || currentSection === "dashboard") {
            localStorage.removeItem("aura_user_id");
            setUserProfile(null);
            setCurrentSection("signin");
          } else {
            setLoading((prev) => ({ ...prev, general: false }));
          }
        }
      } catch (err) {
        console.error("Error restoring Supabase session on section change:", err);
        if (currentSection === "onboarding" || currentSection === "dashboard") {
          localStorage.removeItem("aura_user_id");
          setUserProfile(null);
          setCurrentSection("signin");
        } else {
          setLoading((prev) => ({ ...prev, general: false }));
        }
      }

      try {
        const { data } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!active) return;
            if (event === "SIGNED_OUT" || !session?.user) {
              localStorage.removeItem("aura_user_id");
              setUserProfile(null);
              if (currentSection === "onboarding" || currentSection === "dashboard") {
                setCurrentSection("signin");
              }
            } else if (session?.user && (!userProfile || userProfile.id !== session.user.id)) {
              const id = session.user.id;
              if (localStorage.getItem("aura_user_id") !== id) {
                localStorage.setItem("aura_user_id", id);
              }
              await loadUserState(id);
            }
          }
        );
        subscription = data.subscription;
      } catch (authErr) {
        console.error("Error subscribing to auth changes:", authErr);
      }
    };
    initSession();

    return () => {
      active = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [currentSection]);

  // 2. Action Handlers

  // Profile Onboarding save
  const handleOnboardingComplete = async (profileData: Partial<UserProfile>) => {
    setLoading((prev) => ({ ...prev, onboarding: true }));
    setOnboardingError(null);
    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });
      if (res.ok) {
        const updated = await res.json();
        const actualUser = updated?.user || updated;
        setUserProfile(actualUser);

        if (actualUser?.id) {
          localStorage.removeItem("onboarding_skipped_" + actualUser.id);
        }
        
        // Refresh briefing to adapt to newly registered parameters
        await handleRefreshBriefing();
        await handleRefreshPrediction();
        
        setCurrentSection("dashboard");
      } else {
        const errJson = await res.json().catch(() => ({}));
        setOnboardingError(errJson.error || "Aura profile calibration update failed. Please try again.");
      }
    } catch (err) {
      console.error("Onboarding setup failure", err);
      setOnboardingError("Connection or network failure during calibration. Please check details and retry.");
    } finally {
      setLoading((prev) => ({ ...prev, onboarding: false }));
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem("aura_user_id");
    setUserProfile(null);
    setCurrentSection("landing");
    setMobileMenuOpen(false);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Supabase auth signout skipped:", err);
    }
  };

  // Coaching conversation
  const handleSendMessage = async (msgText: string, targetThreadId?: string) => {
    setLoading((prev) => ({ ...prev, coaching: true }));
    const threadId = targetThreadId || activeThreadId;
    
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
        body: JSON.stringify({ message: msgText, threadId }),
      });

      if (chatRes.ok) {
        const replySet = await chatRes.json();
        const updatedThreads = Array.isArray(replySet?.threads) ? replySet.threads : [];
        setThreads(updatedThreads);
        
        const currentThread = updatedThreads.find((t: any) => t.id === threadId);
        if (currentThread) {
          setConversation(currentThread.messages);
        } else if (updatedThreads.length > 0) {
          setConversation(updatedThreads[0].messages);
        }
        
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

  const handleCreateChatThread = async () => {
    try {
      const res = await fetch("/api/coaching/chat/new", {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setThreads(data.threads);
        if (data.newThreadId) {
          setActiveThreadId(data.newThreadId);
          const activeTh = data.threads.find((t: any) => t.id === data.newThreadId);
          if (activeTh) {
            setConversation(activeTh.messages);
          }
        }
      }
    } catch (err) {
      console.error("Failed to create thread", err);
    }
  };

  const handleDeleteChatThread = async (threadId: string) => {
    try {
      const res = await fetch("/api/coaching/chat/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId }),
      });
      if (res.ok) {
        const data = await res.json();
        setThreads(data.threads);
        const remaining = data.threads || [];
        if (remaining.length > 0) {
          const newActive = remaining[0].id;
          setActiveThreadId(newActive);
          setConversation(remaining[0].messages);
        }
      }
    } catch (err) {
      console.error("Failed to delete thread", err);
    }
  };

  const handleSelectChatThread = (threadId: string) => {
    setActiveThreadId(threadId);
    const th = threads.find((t) => t.id === threadId);
    if (th) {
      setConversation(th.messages);
    }
  };

  // Daily Tasks Management
  const handleAddTask = async (title: string, priority: "low" | "medium" | "high" = "medium") => {
    try {
      // Optimistic Update to give immediate feedback
      const tempId = `task_temp_${Date.now()}`;
      const tempTask = {
        id: tempId,
        title,
        priority,
        completed: false,
        dueDate: new Date().toISOString().split("T")[0],
        autoGenerated: false,
      };
      setTasks(prev => [tempTask, ...prev]);

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, priority }),
      });
      if (res.ok) {
        const savedTask = await res.json();
        // Replace temp task with confirmed saved task
        setTasks(prev => prev.map(t => t.id === tempId ? savedTask : t));

        // Sync with official list
        const tasksRes = await fetch("/api/tasks");
        if (tasksRes.ok) {
          const tData = await tasksRes.json();
          setTasks(Array.isArray(tData) ? tData : []);
        }
      } else {
        // Rollback on failure
        setTasks(prev => prev.filter(t => t.id !== tempId));
      }
    } catch (err) {
      console.error("Failed to add task", err);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      const res = await fetch("/api/tasks/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId }),
      });
      if (res.ok) {
        const tasksRes = await fetch("/api/tasks");
        if (tasksRes.ok) {
          const tData = await tasksRes.json();
          setTasks(Array.isArray(tData) ? tData : []);
        }
        
        // Refresh User profile for potential level up or XP sync!
        const pRes = await fetch("/api/profile");
        if (pRes.ok) {
          const pData = await pRes.json();
          setUserProfile(pData?.user || pData);
        }
      }
    } catch (err) {
      console.error("Failed to toggle task", err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const tasksRes = await fetch("/api/tasks");
        if (tasksRes.ok) {
          const tData = await tasksRes.json();
          setTasks(Array.isArray(tData) ? tData : []);
        }
      }
    } catch (err) {
      console.error("Failed to delete task", err);
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
          const skipKey = "onboarding_skipped_" + user.id;
          const hasSkipped = localStorage.getItem(skipKey) === "true";
          if (!hasSkipped && (!user.gender || user.gender === "Other" || !user.age)) {
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
        onSkip={() => {
          if (userProfile?.id) {
            localStorage.setItem("onboarding_skipped_" + userProfile.id, "true");
          }
          setCurrentSection("dashboard");
        }}
        onCancel={() => setCurrentSection("landing")}
        loading={loading.onboarding}
        error={onboardingError}
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
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all hover:scale-[1.01] cursor-pointer ${
                activeTab === "profile" 
                  ? "bg-slate-900 border-emerald-500/30 ring-1 ring-emerald-500/20" 
                  : "bg-slate-950/40 border-slate-900 hover:border-slate-800"
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 font-bold text-xs uppercase shrink-0">
                {userProfile.name?.slice(0, 2) || "PL"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-205 truncate">{userProfile.name || "Default Pilot"}</div>
                <div className="text-[10px] text-slate-500 font-bold truncate">Level {userProfile.level} Active</div>
              </div>
            </button>
          )}
          
          <button
            onClick={handleLogout}
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

            {userProfile && (
              <button
                onClick={() => {
                  setActiveTab("profile");
                  setMobileMenuOpen(false);
                }}
                className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center gap-2.5 ${
                  activeTab === "profile" 
                    ? "bg-slate-900 text-white animate-pulse" 
                    : "text-slate-400 hover:bg-slate-900"
                }`}
              >
                <User className="w-4 h-4 text-emerald-400" />
                <span>My Profile Area ({userProfile.name})</span>
              </button>
            )}

            {/* Mobile Sign Out Action */}
            <div className="pt-2 mt-2 border-t border-slate-900/40">
              <button
                onClick={handleLogout}
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

        {/* Onboarding Skip Reminder Banner */}
        {userProfile && localStorage.getItem("onboarding_skipped_" + userProfile.id) === "true" && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
              theme === "light"
                ? "border-amber-200 bg-amber-50/75 text-amber-900 shadow-sm"
                : "border-amber-500/10 bg-amber-500/10 text-amber-300"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl shrink-0 ${
                theme === "light" ? "bg-amber-100" : "bg-amber-400/10"
              }`}>
                <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold tracking-tight">Onboarding Calibration Skip Reminder</h4>
                <p className={`text-xs mt-0.5 leading-relaxed ${theme === "light" ? "text-amber-700" : "text-amber-400"}`}>
                  You are currently using generic defaults. Complete the full Bio-Twin setup to unlock personalized metabolic ranges, hydration markers, and tailor your coaching insights.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
              <button
                onClick={() => setCurrentSection("onboarding")}
                className="w-full sm:w-auto px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/15 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Calibrate Now
              </button>
            </div>
          </motion.div>
        )}

        {/* Dynamic Inner Tab routing */}
        <div className="min-h-[480px]">
          {activeTab === "coaching" && (
            <AuraChat 
              threads={threads}
              activeThreadId={activeThreadId}
              conversation={conversation} 
              userProfile={userProfile} 
              onSendMessage={handleSendMessage}
              onCreateThread={handleCreateChatThread}
              onDeleteThread={handleDeleteChatThread}
              onSelectThread={handleSelectChatThread}
              loading={loading.coaching}
            />
          )}

          {activeTab === "goals" && (
            <GoalPlanner 
              goals={goals} 
              onAddGoal={handleAddGoal} 
              onToggleMilestone={handleToggleMilestone} 
              onDeleteGoal={handleDeleteGoal}
              tasks={tasks}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
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

          {activeTab === "profile" && userProfile && (
            <UserProfileArea 
              userProfile={userProfile}
              theme={theme}
              onUpdateProfile={handleOnboardingComplete}
              loading={loading.onboarding}
            />
          )}
        </div>
      </main>
    </div>
  );
}
