"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useLocation } from "@/compat/router";
import { useCopilotChat } from "./useCopilotChat";
import { VehicleCard } from "./VehicleCard";
import type { MatchedVehicle } from "../../api/copilot";

interface CopilotDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
}

const TYPEWRITER_PHRASES = [
  "How can FairScout.AI help you today?",
  "What are you looking for?",
  "What can FairScout.AI do for you?",
  "Ask anything about auction lots or inventory...",
];

/** Formats timestamps into relative time ("Just now", "2m ago", "1h ago", "Yesterday", "Sep 30") */
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diffMs = Math.max(0, now - timestamp);
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHour / 24);

  if (diffSec < 45) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDays === 1) return "Yesterday";
  return new Date(timestamp).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

/**
 * UI TOGGLE: Set to true to show the thread history dropdown menu in the header.
 * Set to false to show "FS FairScout.AI" as a simple, elegant brand label.
 * To revert back, simply change SHOW_HEADER_DROPDOWN to true.
 */
export const SHOW_HEADER_DROPDOWN = false;

interface CopilotVehicleCarouselProps {
  vehicles: MatchedVehicle[];
}

const CopilotVehicleCarousel: React.FC<CopilotVehicleCarouselProps> = ({ vehicles }) => {
  const [allExpanded, setAllExpanded] = useState(false);

  return (
    <div
      className="mt-2.5 -mx-1 flex w-[calc(100%+8px)] gap-3.5 overflow-x-auto pb-3 pt-1 px-1 scroll-smooth select-none [scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.18)_transparent] dark:[scrollbar-color:rgba(255,255,255,0.22)_transparent]"
      style={{ scrollSnapType: "x mandatory" }}
    >
      {vehicles.map((v) => (
        <VehicleCard
          key={v.stockNumber}
          vehicle={v}
          isExpanded={allExpanded}
          onToggleExpand={() => setAllExpanded((prev) => !prev)}
        />
      ))}
    </div>
  );
};

export const CopilotDrawer: React.FC<CopilotDrawerProps> = ({ isOpen, onClose, onOpen }) => {
  const {
    messages,
    threads,
    activeThreadId,
    loading,
    sendMessage,
    startNewConversation,
    switchThread,
    deleteThread,
  } = useCopilotChat();

  const [input, setInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Dynamic width: 90% (368px) on usual/idle, 450px when focused/typing, 480px when vehicle carousel present
  const hasVehicles = useMemo(() => messages.some((m) => m.vehicles && m.vehicles.length > 0), [messages]);
  const isExpandedOrFocused = isExpanded || isFocused || input.length > 0;
  const currentWidthClass = isExpandedOrFocused
    ? (hasVehicles ? "w-[480px] max-w-[calc(100vw-32px)]" : "w-[450px] max-w-[calc(100vw-32px)]")
    : "w-[368px] max-w-[calc(100vw-32px)]";

  // Typewriter placeholder state
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Active ongoing conversation exists if there are messages in current thread
  const hasActiveConversation = useMemo(
    () => messages.length > 0,
    [messages]
  );

  const location = useLocation();
  const prevPathnameRef = useRef(location.pathname);

  // Sync external isOpen prop if provided
  useEffect(() => {
    if (isOpen !== undefined) {
      setIsExpanded(isOpen);
    }
  }, [isOpen]);

  // Auto-minimize chat when switching navigation tabs (e.g. from Inventory to Presets or other tabs)
  useEffect(() => {
    if (prevPathnameRef.current !== location.pathname) {
      prevPathnameRef.current = location.pathname;
      // If navigation was initiated from inside Copilot chat (e.g. clicking View Details on a vehicle), keep drawer open
      const isFromChat = typeof window !== "undefined" && sessionStorage.getItem("copilot_prevent_collapse") === "true";
      if (isFromChat) {
        try {
          sessionStorage.removeItem("copilot_prevent_collapse");
        } catch {}
        return;
      }
      setIsExpanded(false);
      if (onClose) onClose();
    }
  }, [location.pathname, onClose]);

  // Auto-minimize when user switches browser tab or minimizes window
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setIsExpanded(false);
        if (onClose) onClose();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [onClose]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isExpanded) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isExpanded]);

  // Close header conversation menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  // Typewriter animation loop: holds each phrase for 14 seconds
  useEffect(() => {
    if (input.length > 0) return;

    const currentPhrase = TYPEWRITER_PHRASES[phraseIdx];
    let timeout: NodeJS.Timeout;

    if (!isDeleting && charIdx < currentPhrase.length) {
      timeout = setTimeout(() => {
        setCharIdx((prev) => prev + 1);
      }, 45);
    } else if (!isDeleting && charIdx === currentPhrase.length) {
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 14000);
    } else if (isDeleting && charIdx > 0) {
      timeout = setTimeout(() => {
        setCharIdx((prev) => prev - 1);
      }, 25);
    } else if (isDeleting && charIdx === 0) {
      setIsDeleting(false);
      setPhraseIdx((prev) => (prev + 1) % TYPEWRITER_PHRASES.length);
    }

    return () => clearTimeout(timeout);
  }, [charIdx, isDeleting, phraseIdx, input]);

  const animatedPlaceholder = useMemo(() => {
    if (input) return "";
    return TYPEWRITER_PHRASES[phraseIdx].slice(0, charIdx);
  }, [phraseIdx, charIdx, input]);

  // Submit / Send handler: ONLY top arrow or Enter opens the answer chat display area
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = input.trim();
    setIsExpanded(true);
    if (onOpen) onOpen();

    if (trimmed && !loading) {
      sendMessage(trimmed);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Close chevron handler:
  // If active conversation exists -> collapses to "Continue conversation" pill
  // If empty conversation -> collapses to initial resting input pill
  const handleCloseChevron = () => {
    setIsExpanded(false);
    setIsMenuOpen(false);
    if (onClose) onClose();
  };

  // Reset / New conversation handler
  const handleNewConversationClick = () => {
    startNewConversation();
    setIsMenuOpen(false);
    setIsExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  const handleSelectThread = (threadId: string) => {
    switchThread(threadId);
    setIsMenuOpen(false);
    setIsExpanded(true);
  };

  return (
    <aside
      aria-label="FairScout.AI"
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-auto select-none font-sans"
    >
      {/* ========================================================= */}
      {/* 1. EXPANDED ANSWER & CHAT SHEET (Full High-End Glassmorphism) */}
      {/* ========================================================= */}
      {isExpanded && (
        <div
          role="region"
          aria-label="FairScout.AI Messenger"
          className={`relative mb-3 flex ${currentWidthClass} h-[520px] max-h-[calc(100vh-120px)] flex-col overflow-hidden rounded-[26px] border animate-in fade-in slide-in-from-bottom-5 duration-300 transition-all ease-out select-text text-[#141413] dark:text-[#f7f6f2]`}
          style={{
            background: "var(--glass-drawer-bg)",
            backdropFilter: "var(--glass-drawer-blur, blur(52px) saturate(210%))",
            WebkitBackdropFilter: "var(--glass-drawer-blur, blur(52px) saturate(210%))",
            boxShadow: "var(--glass-drawer-shadow, var(--glass-shadow))",
            border: "var(--glass-drawer-border)",
            color: "var(--ink)",
            transition: "background 0.45s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.45s ease, box-shadow 0.45s cubic-bezier(0.16, 1, 0.3, 1), color 0.35s ease",
          }}
        >
          {/* Optical Glare & Specular Refraction Overlay */}
          <div
            className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500 opacity-90 dark:opacity-40"
            style={{
              background: "var(--glass-drawer-glare)",
            }}
            aria-hidden="true"
          />

          {/* Header Bar */}
          <div
            className="relative z-20 flex shrink-0 items-center justify-between border-b px-3.5 py-2.5 transition-all duration-300"
            style={{
              backgroundColor: "var(--glass-header-bg)",
              borderColor: "var(--glass-border-hairline)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow: "inset 0 1px 0 0 var(--glass-highlight)",
              color: "var(--ink)",
              transition: "background 0.45s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.45s ease, box-shadow 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {/* Header Brand: Dropdown vs Simple Clean Label */}
            {SHOW_HEADER_DROPDOWN ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen((prev) => !prev);
                  }}
                  className="flex items-center gap-2 rounded-xl px-2 py-1 -ml-1 hover:bg-white/15 dark:hover:bg-white/10 transition cursor-pointer"
                  style={{ color: "var(--ink)" }}
                  title="FairScout.AI options"
                >
                  {/* FS Avatar Badge */}
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-tr from-accent via-[#ce6e42] to-[#e88a59] text-white font-bold text-[11px] shadow-sm border border-white/20">
                    FS
                  </span>
                  <span className="text-xs font-semibold tracking-tight">FairScout.AI</span>
                  {/* Downward Chevron */}
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 16 16"
                    fill="none"
                    style={{ color: "var(--muted)" }}
                    className={`transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`}
                  >
                    <path
                      d="M4.00009 5.1499C4.22009 5.1499 4.44009 5.2299 4.60009 5.3999L8.00009 8.7999L11.4001 5.3999C11.7301 5.0699 12.2701 5.0699 12.6001 5.3999C12.9301 5.7299 12.9301 6.2699 12.6001 6.5999L8.00009 11.1999L3.40009 6.5999C3.07009 6.2699 3.07009 5.7299 3.40009 5.3999C3.57009 5.2299 3.78009 5.1499 4.00009 5.1499Z"
                      fill="currentColor"
                    />
                  </svg>
                </button>

                {/* Fin AI Style Dropdown Menu (Glassmorphism card) */}
                {isMenuOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute left-0 top-full mt-1.5 w-64 max-h-72 overflow-y-auto rounded-2xl border p-1.5 shadow-2xl z-40 animate-in fade-in zoom-in-95 duration-150 scrollbar-thin"
                    style={{
                      backgroundColor: "var(--glass-drawer-bg)",
                      borderColor: "var(--glass-border)",
                      backdropFilter: "blur(28px) saturate(190%)",
                      WebkitBackdropFilter: "blur(28px) saturate(190%)",
                      boxShadow: "var(--glass-shadow)",
                      color: "var(--ink)",
                    }}
                  >
                    {/* + New conversation action */}
                    <button
                      type="button"
                      onClick={handleNewConversationClick}
                      className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-medium hover:bg-accent hover:text-white transition cursor-pointer"
                      style={{ color: "var(--ink)" }}
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-black/5 dark:bg-white/10 text-current text-xs font-bold">
                        +
                      </span>
                      <span>New conversation</span>
                    </button>

                    <div
                      className="my-1 border-t"
                      style={{ borderColor: "color-mix(in srgb, var(--hairline) 50%, transparent)" }}
                    />

                    {/* Convo History Section */}
                    <div
                      className="px-2.5 py-1 text-[9.5px] font-semibold uppercase tracking-wider"
                      style={{ color: "var(--muted)" }}
                    >
                      Recent Conversations
                    </div>

                    {threads.length === 0 ? (
                      <div
                        className="px-2.5 py-2 text-[10.5px] italic"
                        style={{ color: "var(--muted)" }}
                      >
                        No past conversations yet
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        {threads.map((t) => {
                          const isActive = t.id === activeThreadId;
                          return (
                            <div
                              key={t.id}
                              className={`group flex items-center justify-between rounded-xl px-2 py-1.5 text-xs transition cursor-pointer ${
                                isActive
                                  ? "bg-accent/15 text-accent font-medium"
                                  : "hover:bg-black/5 dark:hover:bg-white/10"
                              }`}
                              style={{ color: isActive ? "var(--accent)" : "var(--ink)" }}
                              onClick={() => handleSelectThread(t.id)}
                            >
                              <div className="min-w-0 flex-1 pr-1.5">
                                <p className="truncate text-xs">{t.title}</p>
                                <span
                                  className="text-[9px] tabular-nums"
                                  style={{ color: "var(--muted)" }}
                                >
                                  {formatRelativeTime(t.createdAt)}
                                </span>
                              </div>

                              <div className="flex items-center gap-1">
                                {isActive && (
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-xs" />
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => deleteThread(t.id, e)}
                                  title="Delete conversation"
                                  className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-muted hover:text-danger transition cursor-pointer"
                                >
                                  <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Simple Non-interactive Brand Label */
              <div className="flex items-center gap-2 px-1 select-none">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-tr from-accent via-[#ce6e42] to-[#e88a59] text-white font-bold text-[11px] shadow-sm border border-white/20">
                  FS
                </span>
                <span className="text-xs font-semibold tracking-tight" style={{ color: "var(--ink)" }}>
                  FairScout.AI
                </span>
              </div>
            )}

            {/* Right: Close Down-Chevron Button */}
            <button
              type="button"
              onClick={handleCloseChevron}
              aria-label="Close"
              className="flex h-6 w-6 items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer"
              style={{ color: "var(--muted)" }}
              title="Close"
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path
                  d="M4.00009 5.1499C4.22009 5.1499 4.44009 5.2299 4.60009 5.3999L8.00009 8.7999L11.4001 5.3999C11.7301 5.0699 12.2701 5.0699 12.6001 5.3999C12.9301 5.7299 12.9301 6.2699 12.6001 6.5999L8.00009 11.1999L3.40009 6.5999C3.07009 6.2699 3.07009 5.7299 3.40009 5.3999C3.57009 5.2299 3.78009 5.1499 4.00009 5.1499Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>

          {/* Conversation Feed */}
          <div className="relative z-10 flex-1 overflow-y-auto p-3.5 space-y-3.5 scrollbar-thin">
            {messages.length === 0 ? (
              /* Clean, translucent prompt invitation when in a fresh new conversation */
              <div className="flex h-full flex-col items-center justify-center text-center px-4 py-8">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-accent/15 text-accent font-bold text-xs mb-2.5 shadow-sm border border-white/20">
                  FS
                </span>
                <p className="text-xs font-semibold" style={{ color: "var(--ink)" }}>
                  New FairScout.AI Session
                </p>
                <p
                  className="mt-1 text-[11px] max-w-[260px] leading-relaxed"
                  style={{ color: "var(--muted)" }}
                >
                  Type below to scout inventory by make, damage, auction location, or margin.
                </p>
              </div>
            ) : (
              messages.map((msg) =>
                msg.role === "user" ? (
                  <div key={msg.id} className="flex flex-col items-end gap-1">
                    {/* User Message Bubble: Option 4 Peach Prismatic in Light Mode, Smoked Glass in Dark Mode */}
                    <div
                      className="max-w-[86%] px-4 py-2.5 text-xs leading-relaxed rounded-[20px] rounded-br-[4px] border transition-all duration-300"
                      style={{
                        background: "var(--glass-user-bubble-bg)",
                        border: "var(--glass-user-bubble-border)",
                        boxShadow: "var(--glass-user-bubble-shadow)",
                        color: "var(--ink)",
                        backdropFilter: "blur(24px) saturate(190%)",
                        WebkitBackdropFilter: "blur(24px) saturate(190%)",
                        transition: "background 0.45s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.45s ease, box-shadow 0.45s cubic-bezier(0.16, 1, 0.3, 1), color 0.35s ease",
                      }}
                    >
                      <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                    </div>

                    {/* User Receipt */}
                    <span
                      className="mr-1 text-[10px] tabular-nums font-medium text-[#64748b] dark:text-[#94a3b8]"
                    >
                      You • {formatRelativeTime(msg.timestamp)}
                    </span>
                  </div>
                ) : (
                  <div key={msg.id} className="flex flex-col items-start gap-1.5 w-full">
                    {/* Agent Header Row matching POC */}
                    <div
                      className="flex items-center gap-1.5 px-0.5 text-[11px] font-semibold text-[#475569] dark:text-[#94a3b8]"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] shrink-0" />
                      <span>FairScout.AI • {formatRelativeTime(msg.timestamp)}</span>
                    </div>

                    {/* Agent Message Prose Bubble: Pure Frosted Glassmorphism */}
                    <div
                      className="max-w-[92%] px-4 py-3 text-xs leading-relaxed rounded-[20px] rounded-tl-[4px] border transition-all duration-300"
                      style={{
                        background: "var(--glass-card-bg)",
                        border: "var(--glass-card-border)",
                        boxShadow: "var(--glass-card-shadow)",
                        color: "var(--ink)",
                        backdropFilter: "blur(24px) saturate(190%)",
                        WebkitBackdropFilter: "blur(24px) saturate(190%)",
                        transition: "background 0.45s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.45s ease, box-shadow 0.45s cubic-bezier(0.16, 1, 0.3, 1), color 0.35s ease",
                      }}
                    >
                      <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                    </div>

                    {/* Curated Horizontal Snap Carousel: Clicking any title expands/collapses all cards in sync */}
                    {msg.vehicles && msg.vehicles.length > 0 && (
                      <CopilotVehicleCarousel vehicles={msg.vehicles} />
                    )}
                  </div>
                )
              )
            )}

            {loading && (
              <div
                className="flex items-center gap-2 text-xs py-1"
                style={{ color: "var(--muted)" }}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-accent animate-spin text-[10px]">
                  ✦
                </span>
                <span>FairScout.AI is scouting wholesale inventory…</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. BOTTOM COMPOSER: 2 VARIANTS (Pure Glassmorphism)         */}
      {/*    A: Active & Collapsed -> "Continue conversation" Pill  */}
      {/*    B: Expanded OR Start  -> Clean Spotlight Input Pill    */}
      {/* ========================================================= */}
      {!isExpanded && hasActiveConversation ? (
        /* CASE A: Minimized with an active conversation -> "Continue conversation" */
        <div
          onClick={() => {
            setIsExpanded(true);
            if (onOpen) onOpen();
          }}
          className="flex items-center justify-between gap-3.5 rounded-full border px-4 py-2.5 transition-all duration-300 cursor-pointer group select-none min-w-[240px]"
          style={{
            background: "var(--glass-pill-bg)",
            border: "var(--glass-pill-border)",
            backdropFilter: "blur(28px) saturate(190%)",
            WebkitBackdropFilter: "blur(28px) saturate(190%)",
            boxShadow: "var(--glass-pill-shadow)",
            color: "var(--ink)",
            transition: "background 0.45s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.45s ease, box-shadow 0.45s cubic-bezier(0.16, 1, 0.3, 1), color 0.35s ease",
          }}
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-accent via-[#ce6e42] to-[#e88a59] text-white text-[10px] font-bold shadow-xs border border-white/20">
              FS
            </span>
            <span className="text-xs font-semibold tracking-tight group-hover:text-accent transition">
              Continue conversation
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Upward Chevron to re-open */}
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full transition"
              style={{ color: "var(--muted)" }}
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path
                  d="M4.00009 10.8501C4.22009 10.8501 4.44009 10.7701 4.60009 10.6001L8.00009 7.2001L11.4001 10.6001C11.7301 10.9301 12.2701 10.9301 12.6001 10.6001C12.9301 10.2701 12.9301 9.7301 12.6001 9.4001L8.00009 4.8001L3.40009 9.4001C3.07009 9.7301 3.07009 10.2701 3.40009 10.6001C3.57009 10.7701 3.78009 10.8501 4.00009 10.8501Z"
                  fill="currentColor"
                />
              </svg>
            </span>
          </div>
        </div>
      ) : (
        /* CASE B: Clean Spotlight Input Pill */
        <form
          onSubmit={handleSubmit}
          className={`${currentWidthClass} select-text transition-[width] duration-300 ease-out`}
        >
          <div
            className="relative flex items-center overflow-hidden rounded-full border pl-4 pr-1.5 py-1 transition-all duration-300"
            style={{
              background: "var(--glass-pill-bg)",
              border: "var(--glass-pill-border)",
              backdropFilter: "blur(28px) saturate(190%)",
              WebkitBackdropFilter: "blur(28px) saturate(190%)",
              boxShadow: isFocused
                ? "var(--glass-pill-shadow-focus)"
                : "var(--glass-pill-shadow)",
              transition: "background 0.45s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.45s ease, box-shadow 0.45s cubic-bezier(0.16, 1, 0.3, 1), color 0.35s ease",
            }}
          >
            {/* Direct Input Field: Pure styling without any rectangle or border outline */}
            <div className="relative flex-1 flex items-center">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder={animatedPlaceholder}
                style={{
                  outline: "none",
                  boxShadow: "none",
                  border: "none",
                }}
                className="w-full resize-none bg-transparent py-1.5 text-xs text-[#141413] dark:text-[#f7f6f2] placeholder:text-[#64748b]/80 dark:placeholder:text-[#94a3b8]/60 focus:outline-none focus:ring-0 focus:border-0 border-0 outline-none ring-0 shadow-none leading-relaxed font-normal"
              />
            </div>

            {/* Top Arrow Submit Button: Glassmorphic depth with subtle bevels and shadow */}
            <div className="shrink-0 ml-1.5">
              <button
                type="submit"
                className={`flex h-7 w-7 items-center justify-center rounded-full transition-all active:scale-95 cursor-pointer border ${
                  input.trim().length > 0
                    ? "bg-accent/90 dark:bg-accent/85 border-white/60 dark:border-white/25 text-white shadow-[0_4px_12px_rgba(15,23,42,0.18),inset_0_1px_0_rgba(255,255,255,0.7)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.4)] scale-105"
                    : "bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.14] border-black/[0.06] dark:border-white/10 text-muted hover:text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
                }`}
                title="Send message"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="13"
                  height="13"
                  fill="none"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    fillRule="evenodd"
                    d="M7.4 1.899a.85.85 0 0 1 1.201 0l4.5 4.5A.85.85 0 1 1 11.9 7.6L8.85 4.552V13.5a.85.85 0 0 1-1.7 0V4.552L4.101 7.601A.85.85 0 1 1 2.9 6.399z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </form>
      )}
    </aside>
  );
};
