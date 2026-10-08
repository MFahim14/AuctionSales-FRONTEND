"use client";

import { useEffect, useImperativeHandle, useState, type Ref, type RefObject } from "react";

export interface CopilotDrawerHandle {
  focusAndShow: () => void;
  ask: (prompt: string) => void;
}

/** Landing only. Hides the dock on the hero, then reveals it after scroll or Ask AI. */
export function usePublicDockReveal(
  enabled: boolean,
  inputRef: RefObject<HTMLTextAreaElement | null>,
  ref: Ref<CopilotDrawerHandle>,
  onAsk: (prompt: string) => void,
) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [pastClose, setPastClose] = useState(false);

  useImperativeHandle(
    ref,
    () => ({
      focusAndShow: () => {
        if (enabled) setRevealed(true);
        window.setTimeout(() => inputRef.current?.focus(), 50);
      },
      ask: (prompt: string) => {
        const text = prompt.trim();
        if (!text) return;
        if (enabled) setRevealed(true);
        onAsk(text);
      },
    }),
    [enabled, inputRef, onAsk],
  );

  useEffect(() => {
    if (!enabled) return;
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 150);
        const close = document.querySelector(".final-cta");
        if (!close) {
          setPastClose(false);
        } else {
          setPastClose(close.getBoundingClientRect().top < window.innerHeight * 0.72);
        }
        ticking = false;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [enabled]);

  return {
    heroHidden: enabled && !isScrolled && !revealed,
    footerHidden: enabled && pastClose,
  };
}
