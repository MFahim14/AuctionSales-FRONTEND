"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { VehicleCard } from "./VehicleCard";
import { streamPublicCopilotChat, getOrCreateGuestSessionId } from "../../api/publicCopilot";
import type { MatchedVehicle, CopilotMessage } from "../../api/copilot";
import { paths } from "../../routes/paths";

interface PublicCopilotDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  hideTrigger?: boolean;
}

interface MessageItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  vehicles?: MatchedVehicle[];
  isStreaming?: boolean;
}

const INITIAL_WELCOME_MESSAGE: MessageItem = {
  id: "welcome-1",
  role: "assistant",
  content:
    "👋 Welcome to FairSales! I'm FairScout, your AI auction consultant. Ask me to find vehicles by make, budget, damage condition, or body style!",
  timestamp: 0,
};

export const PublicCopilotDrawer: React.FC<PublicCopilotDrawerProps> = ({
  isOpen: controlledIsOpen,
  onClose,
  onOpen,
  hideTrigger = false,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isDrawerOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<MessageItem[]>([INITIAL_WELCOME_MESSAGE]);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleDrawer = () => {
    if (isDrawerOpen) {
      if (onClose) onClose();
      else setInternalIsOpen(false);
    } else {
      if (onOpen) onOpen();
      else setInternalIsOpen(true);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const prompt = input.trim();
    if (!prompt || isSending) return;

    setInput("");
    const userMsgId = "user-" + Date.now();
    const assistantMsgId = "asst-" + Date.now();

    const newMessages: MessageItem[] = [
      ...messages,
      { id: userMsgId, role: "user", content: prompt, timestamp: Date.now() },
      { id: assistantMsgId, role: "assistant", content: "", timestamp: Date.now(), isStreaming: true },
    ];
    setMessages(newMessages);
    setIsSending(true);

    const apiPayload: CopilotMessage[] = newMessages
      .filter((m) => m.id !== assistantMsgId)
      .map((m) => ({ role: m.role, content: m.content }));

    const sessionId = getOrCreateGuestSessionId();

    await streamPublicCopilotChat(
      apiPayload,
      (chunk) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId ? { ...m, content: m.content + chunk } : m
          )
        );
      },
      (data) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content: data.reply || m.content,
                  vehicles: data.vehicles,
                  isStreaming: false,
                }
              : m
          )
        );
        setIsSending(false);
      },
      (err) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content:
                    m.content ||
                    `⚠️ Sorry, I ran into an issue finding inventory: ${err.message}. Please try again or browse our categories.`,
                  isStreaming: false,
                }
              : m
          )
        );
        setIsSending(false);
      },
      sessionId
    );
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!hideTrigger && !isDrawerOpen && (
        <button
          onClick={toggleDrawer}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 px-5 py-3.5 text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:from-amber-500 hover:to-amber-600 focus:outline-none focus:ring-4 focus:ring-amber-500/30"
          aria-label="Open FairScout AI Assistant"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 font-bold text-xs">
            FS
          </div>
          <span className="font-semibold text-sm tracking-tight">Ask FairScout.AI</span>
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
          </span>
        </button>
      )}

      {/* Drawer Overlay & Panel */}
      {isDrawerOpen && (
        <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl transition-all dark:bg-stone-900 border-l border-stone-200 dark:border-stone-800">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/80 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600 font-bold text-white text-xs shadow-md">
                FS
              </div>
              <div>
                <h3 className="font-semibold text-stone-900 text-sm dark:text-stone-100">
                  FairScout.AI
                </h3>
                <span className="flex items-center gap-1.5 text-xs text-stone-700 dark:text-stone-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  Live Auction Assistant (Guest)
                </span>
              </div>
            </div>
            <button
              onClick={toggleDrawer}
              className="rounded-lg p-1.5 text-stone-700 hover:bg-stone-200/70 hover:text-stone-700 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-stone-200"
              aria-label="Close"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Guest Sign-In Notice Banner */}
          <div className="flex items-center justify-between bg-amber-50 px-4 py-2.5 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200 border-b border-amber-200/60 dark:border-amber-900/40">
            <span>Want to save watchlists or set bid alerts?</span>
            <Link
              href={paths.signIn}
              className="font-semibold text-amber-700 underline hover:text-amber-800 dark:text-amber-300"
            >
              Sign In
            </Link>
          </div>

          {/* Messages Scroll Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-amber-600 text-white rounded-br-xs shadow-md"
                      : "bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-200 rounded-bl-xs border border-stone-200/60 dark:border-stone-700/60"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                  {m.isStreaming && !m.content && (
                    <span className="inline-flex gap-1 py-1">
                      <span className="h-2 w-2 rounded-full bg-amber-500 animate-bounce"></span>
                      <span className="h-2 w-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.2s]"></span>
                      <span className="h-2 w-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.4s]"></span>
                    </span>
                  )}
                </div>

                {/* Render Vehicle Recommendations if returned */}
                {m.vehicles && m.vehicles.length > 0 && (
                  <div className="mt-2.5 w-full flex gap-3 overflow-x-auto pb-2 pt-1">
                    {m.vehicles.map((v) => (
                      <div key={v.stockNumber} className="w-56 shrink-0">
                        <VehicleCard vehicle={v} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSend}
            className="border-t border-stone-200 p-3.5 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/80 backdrop-blur-md"
          >
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about clean SUVs, Toyotas under $20k..."
                disabled={isSending}
                className="w-full rounded-full border border-stone-300 bg-white py-2.5 pl-4 pr-11 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:placeholder-stone-500"
              />
              <button
                type="submit"
                disabled={isSending || !input.trim()}
                className="absolute right-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-white transition hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
