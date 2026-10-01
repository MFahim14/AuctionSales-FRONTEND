import { useLayoutEffect, useState, type CSSProperties, type RefObject } from "react";

const PANEL_WIDTH = 296;
const GAP = 8;
const INSET = 8;

export function useAnchoredPanel(
  open: boolean,
  anchorRef: RefObject<HTMLElement | null>,
  panelRef: RefObject<HTMLElement | null>,
  panelWidth = PANEL_WIDTH,
): CSSProperties {
  const [style, setStyle] = useState<CSSProperties>({
    position: "fixed",
    visibility: "hidden",
    top: 0,
    left: 0,
  });

  useLayoutEffect(() => {
    if (!open) {
      setStyle({ position: "fixed", visibility: "hidden", top: 0, left: 0 });
      return;
    }

    function place() {
      const anchor = anchorRef.current;
      if (!anchor) {
        return;
      }
      const boundsEl = anchor.closest("main") ?? document.documentElement;
      const bounds = boundsEl.getBoundingClientRect();
      const a = anchor.getBoundingClientRect();
      const minL = bounds.left + INSET;
      const maxR = bounds.right - INSET;
      const width = Math.min(panelWidth, Math.max(0, maxR - minL));
      let left = a.right - width;
      if (left < minL) {
        left = minL;
      }
      if (left + width > maxR) {
        left = Math.max(minL, maxR - width);
      }
      const height = panelRef.current?.offsetHeight ?? 280;
      let top = a.bottom + GAP;
      const maxB = bounds.bottom - INSET;
      if (top + height > maxB && a.top - GAP - height >= bounds.top + INSET) {
        top = a.top - GAP - height;
      }
      setStyle({
        position: "fixed",
        top,
        left,
        width,
        zIndex: 50,
        visibility: "visible",
      });
    }

    place();
    window.addEventListener("resize", place);
    const scroller = anchorRef.current?.closest("main");
    scroller?.addEventListener("scroll", place, { passive: true });
    return () => {
      window.removeEventListener("resize", place);
      scroller?.removeEventListener("scroll", place);
    };
  }, [open, anchorRef, panelRef, panelWidth]);

  return style;
}
