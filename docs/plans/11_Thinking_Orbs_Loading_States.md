# Thinking Orbs — Loading States for FairScout and Page Loads

**Document ID:** `PLAN-UI-ORBS-011`  
**Status:** Ready to implement. Not built yet.  
**App:** `IAAI/AuctionSales-FRONTEND` (Next.js 16.3.6, React 19)  
**Package:** [`thinking-orbs`](https://libraries.dev/orbs.html)  
**Last reviewed:** 9 October 2026  

---

## 1. What this changes

Replace the spinning star, the session ring, and the full-page “Loading” ring with the hand-tuned `ThinkingOrb` from `thinking-orbs`. Leave small in-button spinners alone.

The public landing dock, the public inventory dock, and the signed-in app all open the same chat sheet. One change covers both the open site and the signed-in app.

---

## 2. Package

```bash
npm install thinking-orbs
```

React 19 already satisfies the React 18+ requirement. The package has no runtime dependencies.

```tsx
import { ThinkingOrb } from "thinking-orbs";

<ThinkingOrb state="searching" size={64} />
```

| Prop | Values | Use |
| --- | --- | --- |
| `state` | `working` \| `searching` \| `solving` \| `listening` \| `connecting` \| `weaving` \| `composing` \| `breathing` \| `shaping` | Pick the motion that matches the wait. |
| `size` | `64` or `20` | `64` is the chat-avatar scale. `20` is the inline-text scale. Each size is tuned separately. Do not invent other sizes. |
| `speed` | number, default `1` | Leave at `1`. |
| `dark` | boolean | Follow `data-theme="dark"` or the `.dark` class on `documentElement`. |
| `paused` | boolean | Leave false. |

The component animates, so it must render from a client component (`"use client"`).

---

## 3. One wrapper

Add `src/components/orb/FairOrb.tsx`. Keep it under 80 lines. Every call site uses this wrapper so theme wiring is not copied.

```tsx
"use client";

import { useEffect, useState } from "react";
import { ThinkingOrb } from "thinking-orbs";

type OrbState =
  | "working"
  | "searching"
  | "solving"
  | "listening"
  | "connecting"
  | "weaving"
  | "composing"
  | "breathing"
  | "shaping";

export function FairOrb({
  state,
  size = 64,
  label,
}: {
  state: OrbState;
  size?: 20 | 64;
  label?: string;
}) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const read = () =>
      root.getAttribute("data-theme") === "dark" || root.classList.contains("dark");
    setDark(read());
    const observer = new MutationObserver(() => setDark(read()));
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme", "class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm text-muted" role="status">
      <ThinkingOrb state={state} size={size} dark={dark} />
      {label ? <span>{label}</span> : null}
    </div>
  );
}
```

Do not pass `speed` or `paused` unless a later spec asks for it.

---

## 4. Live chat thinking state

### Where it is

`CopilotDrawer` is mounted in four places:

| Surface | File | Props |
| --- | --- | --- |
| Landing | `src/views/landing/LandingPage.tsx` | `publicDock` and `hideUntilScroll` |
| Public inventory list | `src/views/public/PublicInventoryPage.tsx` | `publicDock` |
| Public vehicle page | `src/views/public/PublicInventoryDetailPage.tsx` | `publicDock` |
| Signed-in app | `src/layouts/AppShell.tsx` | none |

All four render `CopilotSheet`. The thinking row is only here:

`src/components/copilot/CopilotSheet.tsx`, the `{loading && (...)}` block near the end of the message list.

Today it is a 20px spinning ✦ plus the sentence “FairScout.AI is scouting wholesale inventory…”. `loading` comes from `useCopilotChat`. Sending a message sets `isExpanded` first, so the sheet is open while the agent works.

### What to render

```tsx
{loading && (
  <div className="flex items-center gap-2 px-0.5 py-1 text-xs" style={{ color: "var(--muted)" }}>
    <FairOrb state="searching" size={20} label="FairScout.AI is scouting wholesale inventory…" />
  </div>
)}
```

`searching` matches a scout looking through inventory. Size `20` sits on the text line. Size `64` would break the message rhythm.

Keep the sentence. Do not add a second orb in `CopilotComposer`. The composer has no spinner today.

### Dead file — do not edit

`src/components/copilot/PublicCopilotDrawer.tsx` still has amber bouncing dots. Nothing imports it. Leave it.

Thread sync in `useCopilotChat` (`fetchCopilotThreads`) has no visible loader. Do not add one in this pass.

---

## 5. Checking session

`src/routes/guards.tsx` shows `<Spinner label="Checking session" />` in three gates:

| Guard | When |
| --- | --- |
| `RequireAuth` | Signed-in routes, before `auth.ready` |
| `RequireAdmin` | Admin routes, before `auth.ready` |
| `RedirectIfSignedIn` | Sign-in and password pages, before `auth.ready` |

Replace each with:

```tsx
<FairOrb state="connecting" size={64} label="Checking session" />
```

`connecting` is the session handshake. Size `64` because this is a full-page wait, not a line in a chat.

---

## 6. Full-page Loading

`src/components/Spinner.tsx` is a 16px ring. Default label is “Loading”. Use `FairOrb` only when the wait fills a page or a large panel.

| File | Label to keep | Orb |
| --- | --- | --- |
| `app/(public)/layout.tsx` | Loading... | `working` / 64 |
| `app/(shell)/layout.tsx` | Loading... | `working` / 64 |
| `app/(public)/sign-in/page.tsx` | Loading sign in... | `working` / 64 |
| `app/(public)/forgot-password/confirm/page.tsx` | Loading... | `working` / 64 |
| `app/(shell)/app/inventory/page.tsx` | Loading inventory... | `working` / 64 |
| `app/(shell)/app/inventory/[stockNumber]/page.tsx` | Loading vehicle details... | `working` / 64 |
| `app/(shell)/app/history/page.tsx` | Loading history... | `working` / 64 |
| `app/(shell)/admin/users/page.tsx` | Loading users... | `working` / 64 |
| `app/(shell)/admin/users/[userId]/page.tsx` | Loading user details... | `working` / 64 |
| `src/views/public/PublicInventoryPage.tsx` | Loading | `working` / 64 |
| `src/views/public/PublicInventoryDetailPage.tsx` | Loading | `working` / 64 |
| `src/views/app/HomePage.tsx` | Loading (account gate and the three panels) | `working` / 64 |
| `src/views/app/InventoryListPage.tsx` | Loading | `working` / 64 |
| `src/views/app/InventoryDetailPage.tsx` | Loading | `working` / 64 |
| `src/views/app/AccountPage.tsx` | Loading | `working` / 64 |
| `src/views/app/ActivityPage.tsx` | Loading | `working` / 64 |
| `src/views/app/WatchlistListPage.tsx` | Loading | `working` / 64 |
| `src/views/app/WatchlistDetailPage.tsx` | Loading | `working` / 64 |
| `src/views/app/WatchlistNewPage.tsx` | Loading | `working` / 64 |
| `src/views/app/WatchlistEditPage.tsx` | Loading | `working` / 64 |
| `src/views/admin/UserListPage.tsx` | Loading | `working` / 64 |
| `src/views/admin/ScrapeRunListPage.tsx` | Loading | `working` / 64 |
| `src/views/admin/ScrapeRunDetailPage.tsx` | Loading | `working` / 64 |
| `src/views/admin/FailuresPage.tsx` | Loading | `working` / 64 |
| `src/views/admin/AdminWatchlistListPage.tsx` | Loading | `working` / 64 |
| `src/features/users/UserEditModal.tsx` | Loading | `working` / 64 |
| `src/features/inventory/FilterLoadPanel.tsx` | Loading | `working` / 64 |
| `src/features/inventory/FilterLoadModal.tsx` (the list, not the row) | Loading | `working` / 64 |
| `src/features/scrape/CrawlHistoryDialog.tsx` | Loading | `working` / 64 |
| `src/features/activity/ActivityPicksModal.tsx` | Loading picks | `searching` / 64 |

`working` is a general fetch. `searching` is only for a lookup the user asked for (the chat, and “Loading picks”).

After the call sites move, `Spinner` can stay in the repo for the exclusions below. Do not delete it in the same change.

---

## 7. Leave these as a ring or as text

These sit inside a button or a one-line control. A 20px or 64px orb is the wrong scale.

| Place | Why it stays |
| --- | --- |
| `RecipeSaveModal`, `RecipePinModal`, `RecipePinChangeModal` | Spinner replaces the button label |
| `FilterLoadModal` row spinner | One row, not a page |
| `ImageGallery` “Loading photos” | Caption only |
| Save / invite / delete button labels (`Saving…`, `Sending…`, `Deleting…`) | Text state, not a loader component |
| Favorite heart `isPending` | Icon button |
| `PublicCopilotDrawer` bounce dots | Unused file |

---

## 8. Build and check

Do not run `npm run dev`. From `IAAI/AuctionSales-FRONTEND`:

1. `npm install thinking-orbs`
2. Stop the process listening on port 3000.
3. `npm run build`
4. `$env:NODE_ENV = "production"; npm run start -- --port 3000 --hostname 127.0.0.1`

Check in the browser:

1. Public landing, dark and light. Ask FairScout something. The sheet shows the size-20 searching orb beside the scouting sentence. The fill is not a spinning star.
2. Sign in and open the same drawer. The same row appears. Signed-in glass styles stay on `--glass-*` tokens.
3. Hit a signed-in route before the session resolves, or throttle the auth check. The gate shows the size-64 connecting orb and “Checking session”.
4. Open `/inventory` while the list is loading. Size-64 working orb, existing label.
5. A save or PIN button still uses the small ring or its text label.

`backdrop-filter` in the embedded browser can report `none` even when CSS sets it. Judge the orb by the canvas it paints, not by that computed filter.
