/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Brain, 
  Send, 
  Flame, 
  Sparkles, 
  User, 
  Dumbbell, 
  BookOpen, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Trash2, 
  Plus, 
  MessageSquare,
  Volume1,
  History
} from "lucide-react";
import { Message, UserProfile, ChatThread } from "../types";

interface AuraChatProps {
  threads: ChatThread[];
  activeThreadId: string;
  conversation: Message[];
  userProfile: UserProfile | null;
  onSendMessage: (msg: string, threadId?: string) => Promise<void>;
  onCreateThread: () => Promise<void>;
  onDeleteThread: (threadId: string) => Promise<void>;
  onSelectThread: (threadId: string) => void;
  loading: boolean;
}

export default function AuraChat({ 
  threads = [], 
  activeThreadId, 
  conversation = [], 
  userProfile, 
  onSendMessage, 
  onCreateThread, 
  onDeleteThread, 
  onSelectThread, 
  loading 
}: AuraChatProps) {
  const [input, setInput] = useState("");
  const [autoSpeak, setAutoSpeak] = useState(() => {
    return localStorage.getItem("aura_auto_speak") === "true";
  });
  const [isListening, setIsListening] = useState(false);
  const [currentlySpeakingText, setCurrentlySpeakingText] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Sync autoSpeak to localStorage
  useEffect(() => {
    localStorage.setItem("aura_auto_speak", String(autoSpeak));
  }, [autoSpeak]);

  // Handle speaking of fresh AI message if autoSpeak is enabled
  useEffect(() => {
    if (conversation.length > 0) {
      const lastMsg = conversation[conversation.length - 1];
      if (lastMsg && lastMsg.sender === "aura" && autoSpeak) {
        speakText(lastMsg.text);
      }
    }
  }, [conversation]);

  // Clean speaking on unmount
  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSendMessage(input, activeThreadId);
    setInput("");
  };

  const handlePresetClick = (preset: string) => {
    if (loading) return;
    onSendMessage(preset, activeThreadId);
  };

  const presets = [
    { text: "Help me fight physical fatigue", icon: Dumbbell, color: "hover:bg-slate-50 hover:border-slate-300" },
    { text: "Draft routine for deep work", icon: Flame, color: "hover:bg-slate-50 hover:border-slate-300" },
    { text: "My focus is drifting today", icon: Brain, color: "hover:bg-slate-50 hover:border-slate-300" },
    { text: "Calorie target review", icon: BookOpen, color: "hover:bg-slate-50 hover:border-slate-300" },
  ];

  // Speech Recognition (STT)
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Mic speech recognition is not supported in this browser. Please use keyboard standard input.");
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput((prev) => (prev ? prev + " " + transcript : transcript));
        }
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  // Text to Speech (TTS) Helper
  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      if (currentlySpeakingText === text && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setCurrentlySpeakingText(null);
        return;
      }

      window.speechSynthesis.cancel(); // cancel any current voices
      
      const cleanText = text
        .replace(/\*+/g, "") // remove asterisks
        .replace(/#+/g, "") // remove title formatting
        .replace(/`+/g, "") // remove code ticks
        .replace(/(https?:\/\/[^\s]+)/g, "") // remove link URLs
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      const voices = window.speechSynthesis.getVoices();
      // Look for a pleasant English speech engine
      const premiumVoice = voices.find(v => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural") || !v.name.includes("Microsoft")));
      if (premiumVoice) utterance.voice = premiumVoice;
      
      utterance.rate = 1.0;
      utterance.pitch = 1.05;

      utterance.onstart = () => {
        setCurrentlySpeakingText(text);
      };

      utterance.onend = () => {
        setCurrentlySpeakingText(null);
      };

      utterance.onerror = () => {
        setCurrentlySpeakingText(null);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div id="aura_coaching_layout" className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Sidebar: Chat Session Threads Manager */}
      <div className="md:col-span-1 flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <History className="w-4 h-4 text-emerald-400" /> Coaching History
          </h4>
          <span className="text-[10px] bg-slate-900 pr-1.5 pl-1.5 py-0.5 rounded font-mono text-emerald-400 border border-slate-800 font-bold">
            {threads.length}/5
          </span>
        </div>

        {/* Create message session button */}
        <button
          onClick={onCreateThread}
          disabled={threads.length >= 5}
          className="w-full py-2.5 rounded-xl border border-dashed border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/40 text-xs text-white font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>New Coaching Session</span>
        </button>

        {/* Quick thread row for Mobile view */}
        <div className="flex sm:hidden overflow-x-auto gap-2 pb-2 scrollbar-none">
          {threads.map((thread) => {
            const isActive = thread.id === activeThreadId;
            return (
              <button
                key={thread.id}
                onClick={() => onSelectThread(thread.id)}
                className={`px-3 py-1.5 rounded-lg border text-xs whitespace-nowrap shrink-0 transition-colors font-semibold flex items-center gap-1.5 ${
                  isActive 
                    ? "bg-emerald-400 text-slate-950 border-emerald-400" 
                    : "bg-slate-900/60 border-slate-850 text-slate-400 hover:text-slate-300"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{thread.title}</span>
              </button>
            );
          })}
        </div>

        {/* List of active threads for desktop layout */}
        <div className="hidden sm:block space-y-2">
          {threads.map((thread) => {
            const isActive = thread.id === activeThreadId;
            const isDeleting = deletingId === thread.id;
            
            return (
              <div
                key={thread.id}
                onClick={() => onSelectThread(thread.id)}
                className={`group px-3.5 py-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                  isActive
                    ? "bg-slate-900 border-emerald-500 shadow-lg shadow-emerald-500/10 text-white font-bold"
                    : "bg-slate-950/40 border-slate-850 hover:bg-slate-900/60 hover:border-slate-800 text-slate-300 font-medium"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                  <span className="text-xs truncate pr-2">{thread.title}</span>
                </div>
                {/* Delete button with secure inline double-click/confirm model */}
                {threads.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (isDeleting) {
                        onDeleteThread(thread.id);
                        setDeletingId(null);
                      } else {
                        setDeletingId(thread.id);
                        // Auto-reset confirmation indicator after 3.5 seconds
                        setTimeout(() => {
                          setDeletingId(prev => prev === thread.id ? null : prev);
                        }, 3500);
                      }
                    }}
                    className={`p-1 px-2 rounded font-mono font-bold text-[9px] uppercase tracking-wider transition-all cursor-pointer inline-flex items-center justify-center shrink-0 ${
                      isDeleting 
                        ? "bg-rose-500/20 border border-rose-500/60 text-rose-300 hover:bg-rose-500/40 animate-pulse" 
                        : "bg-slate-900/70 hover:bg-rose-500/10 border border-slate-800/80 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 duration-150"
                    }`}
                    title={isDeleting ? "Click again to confirm delete" : "Archive session"}
                  >
                    {isDeleting ? "CONFIRM" : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Aura Personal AI Ambient Core Dashboard Widget */}
        <div className="hidden sm:block p-4 rounded-xl border border-emerald-500/15 bg-gradient-to-br from-slate-900/95 to-slate-950/90 shadow-xl shadow-emerald-500/5 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="text-[10px] font-bold text-emerald-400 font-mono uppercase tracking-widest">
                AI Core Active
              </span>
            </div>
            <span className="text-[9px] text-slate-500 font-mono font-bold">MODE: CHIEF-OF-STAFF</span>
          </div>

          <div className="space-y-2 text-[11px] leading-relaxed">
            <p className="text-slate-300 font-semibold">
              Aura is initialized with deep cognitive state-tracking layers mapped over Alex's goals.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-800/60 text-[9px] font-mono font-bold text-slate-400">
              <div className="space-y-0.5">
                <span className="block text-slate-500">SYNAPSE VALUE</span>
                <span className="text-emerald-400">98.2% Accurate</span>
              </div>
              <div className="space-y-0.5">
                <span className="block text-slate-500">ATTENTION W.</span>
                <span className="text-slate-200">Continuous</span>
              </div>
              <div className="space-y-0.5 pt-1">
                <span className="block text-slate-500">BIOMETRIC SYNC</span>
                <span className="text-slate-200">Active (Streak: {userProfile?.streakDays || 0}d)</span>
              </div>
              <div className="space-y-0.5 pt-1">
                <span className="block text-slate-500">PROCRISTIN. LEVEL</span>
                <span className="text-rose-400">Suppressed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Companion Pane */}
      <div className="md:col-span-3 flex flex-col">
        {/* Main Conversation Canvas Container structured precisely like the screenshot */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xl flex flex-col h-[520px] overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 bg-white flex items-center justify-between shadow-sm shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
                <Brain className="w-5.5 h-5.5 text-emerald-500 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="font-extrabold text-[#0f172a] tracking-tight text-[15px] sm:text-[16px]">Aura Behavioral Coach</h3>
                <span className="text-[11px] text-emerald-500 font-bold flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse animate-duration-1000" /> Memory Engaged
                </span>
              </div>
            </div>

            {/* Speaking Output Toggle & User Stats */}
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={() => setAutoSpeak(!autoSpeak)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                  autoSpeak 
                    ? "bg-emerald-50 border-emerald-200 text-emerald-500 shadow-sm" 
                    : "bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-500"
                }`}
                title={autoSpeak ? "Auto Voice replies (Enabled)" : "Auto Voice replies (Disabled)"}
              >
                {autoSpeak ? <Volume2 className="w-3.5 h-3.5 animate-bounce text-emerald-500" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">Voice Reply</span>
              </button>

              <div className="text-right">
                <span className="text-[9px] font-mono text-slate-400 font-bold tracking-widest uppercase block text-right">CONSISTENCY BASE</span>
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1 justify-end">
                  <span>Level {userProfile?.level || 3}</span>
                  <span className="text-slate-300 font-normal">•</span>
                  <span className="text-emerald-500">{userProfile?.streakDays || 8} Day Streak</span>
                </div>
              </div>
            </div>
          </div>

          {/* Message Board with precise Light Gray Solid backdrop from the screenshot */}
          <div className="flex-1 p-5 overflow-y-auto space-y-6 bg-slate-200">
            {conversation.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                <Brain className="w-8 h-8 text-slate-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Aura Stream Is Ready</span>
                <p className="text-[11px] max-w-sm text-slate-500 leading-relaxed font-semibold">Initiate a behavioral consulting conversation below using suggestions or your voice inputs.</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {conversation.map((msg, index) => {
                  const isUser = msg.sender === "user";
                  const isSpeakingThis = currentlySpeakingText === msg.text;

                  if (isUser) {
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex gap-3 max-w-[85%] ml-auto flex-row-reverse items-end"
                      >
                        {/* User Avatar */}
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/85 flex items-center justify-center text-emerald-500 shadow-sm shrink-0 mb-1">
                          <User className="w-4 h-4 text-emerald-500" />
                        </div>

                        {/* User Message Bubble with Gorgeous Light Green Tint Background */}
                        <div className="bg-[#eefdf6] text-[#0a945b] rounded-2xl rounded-tr-none p-4 shadow-sm max-w-full relative border border-emerald-100/30">
                          <div className="text-[13px] sm:text-sm leading-relaxed font-semibold whitespace-pre-wrap">
                            {msg.text}
                          </div>

                          <div className="flex items-center justify-end pt-1 mt-1.5 select-none text-[9px] font-mono text-emerald-400/80">
                            <span>
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  } else {
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex gap-3 max-w-[85%] mr-auto items-end"
                      >
                        {/* Aura Avatar */}
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/85 flex items-center justify-center text-emerald-500 shadow-sm shrink-0 mb-1">
                          <Brain className="w-4 h-4 text-emerald-500" />
                        </div>

                        {/* Aura Message Bubble with Clean White Background & Elegant Shadows */}
                        <div className="bg-white text-slate-800 rounded-2xl rounded-tl-none p-4 shadow-sm max-w-full relative border border-slate-100">
                          <div className="text-[13px] sm:text-sm leading-relaxed font-semibold text-slate-700 whitespace-pre-wrap">
                            {msg.text}
                          </div>

                          <div className="flex items-center justify-between border-t border-slate-100 pt-2 mt-2 select-none text-[9px] font-mono text-slate-400">
                            <button
                              type="button"
                              onClick={() => speakText(msg.text)}
                              className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-all hover:bg-slate-50 ${
                                isSpeakingThis 
                                  ? "text-emerald-500 font-bold bg-emerald-50" 
                                  : "text-slate-400 hover:text-slate-600"
                              }`}
                              title={isSpeakingThis ? "Mute" : "Read Aloud"}
                            >
                              <Volume1 className={`w-3.5 h-3.5 ${isSpeakingThis ? "animate-pulse" : ""}`} />
                              <span>{isSpeakingThis ? "SPEAKING" : "READ ALOUD"}</span>
                            </button>
                            
                            <span>
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  }
                })}
              </AnimatePresence>
            )}

            {/* Pulsing Loading Bubble in Crisp White */}
            {loading && (
              <div className="flex gap-3 max-w-[85%] mr-auto items-end">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/85 flex items-center justify-center text-emerald-500 shadow-sm shrink-0 mb-1">
                  <Brain className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="px-5 py-4 rounded-xl bg-white border border-slate-100 text-xs text-slate-500 rounded-tl-none flex items-center gap-1.5 font-bold shadow-sm">
                  <span>Aura formulation engine running</span>
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-100" />
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-200" />
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-300" />
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Suggestion cards row rendered separately at the bottom exactly matching the screenshot layout */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200 mt-4 shadow-sm">
          {presets.map((preset, index) => (
            <button
              key={index}
              disabled={loading}
              onClick={() => handlePresetClick(preset.text)}
              className="p-3 bg-white border border-slate-200/80 hover:bg-slate-50 hover:border-slate-300 text-xs text-slate-700 font-extrabold rounded-xl transition-all flex items-center gap-2.5 text-left justify-start shadow-sm disabled:opacity-50 disabled:pointer-events-none duration-150 cursor-pointer"
            >
              <preset.icon className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="line-clamp-2 leading-relaxed text-[11px] font-semibold text-slate-700">{preset.text}</span>
            </button>
          ))}
        </div>

        {/* Functional Custom Input Area elegantly integrated below the layout row */}
        <div className="mt-3.5 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-md">
          <form onSubmit={handleSubmit} className="flex gap-3">
            {/* Voice Input trigger button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all shrink-0 border ${
                isListening
                  ? "bg-rose-500 border-rose-500 text-white animate-pulse shadow-md shadow-rose-500/20"
                  : "bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              }`}
              title={isListening ? "Listening... Click to stop" : "Use Voice Input"}
            >
              {isListening ? (
                <MicOff className="w-4.5 h-4.5 text-white" />
              ) : (
                <Mic className="w-4.5 h-4.5 text-emerald-500" />
              )}
            </button>

            <input
              type="text"
              value={input}
              disabled={loading}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening to your inputs..." : "Consult Aura on nutrition limits, fitness fatigue, or focus tactics..."}
              className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:border-emerald-400 focus:bg-white focus:outline-none text-xs sm:text-sm font-semibold transition-all placeholder:text-slate-400 shadow-inner"
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all shrink-0 border ${
                input.trim() && !loading
                  ? "bg-[#e6fcf0] border-emerald-100 hover:bg-[#eefdf6] text-[#0a945b] shadow-sm"
                  : "bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed"
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
