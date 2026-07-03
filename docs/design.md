 CatWatch — DESIGN

Visual source of truth, owned by **[You: design / frontend]**. Palette, type, spacing, components, and motion all live here; SPEC references this file for tokens.

> **Mobile-first.** This is a PWA used outdoors, one-handed, in sunlight. Where earlier drafts described a desktop dashboard (sidebar, top nav, "dashboard versions A/B/C"), that framing is superseded by the **app shell** in §2. The token system below is form-factor-agnostic and carries over wholesale.

---

## 1. Direction

**Name feel:** soft · friendly · handmade · community-driven · lightweight · trustworthy.

**Visual formula:** cream base · pink primary · soft sage accent · warm-brown text/linework · **real cat photos for credibility** · rounded cards + light borders.

The core insight to protect: **illustrations = warmth, live photos = trust.** Doodles set the tone; real cat photos earn belief. Don't over-filter the photos — let them be real.

**Usage context (decides every interaction):** someone walking outdoors, phone in one hand, squinting in sunlight, wanting to log a cat in seconds. Design for that moment and most decisions make themselves — big touch targets, primary actions in thumb reach, minimal typing, one-handed.

---

## 2. Form factor & layout (mobile app shell)

- Design at **~390px** width first; scale up only if time allows. Desktop is a `[CUT]`.
- **No sidebar, no top nav.** Primary actions sit at the **bottom**, in thumb reach.
- **44px minimum** touch targets. Taps and gestures, never hover.
- Tapping a map pin opens a **bottom sheet** that slides up — not a new full page.
- Respect **safe-area insets** (notch / home indicator); momentum scroll; feel instant.

**The four hero screens** (everything else stays plain):

```
  Map (/)            Cat Profile        Submit Sighting    Missing state
  full-bleed map     bottom sheet /     camera + status    variant of pin
  colour pins        /cats/[id]         → re-ID reveal     + profile, felt
  FAB "Register"     gallery+history                       emotionally
```

Map is the home screen and roughly half the demo — give it the most attention. Directory, "cats near me," and settings are secondary and can be minimal.

---

## 3. Colour system

**Neutrals / base**

| Token | Hex | Use |
|---|---|---|
| `bg-main` | `#F9F3EE` | app background |
| `bg-surface` | `#FFF9F6` | cards / panels |
| `bg-soft` | `#F6EEE7` | map containers / secondary panels |
| `border-soft` | `#EBDDD2` | subtle borders |
| `shadow-soft` | `rgba(140,108,89,0.10)` | soft shadow |

**Browns / text**

| Token | Hex | Use |
|---|---|---|
| `text-main` | `#5D4035` | headings / primary text |
| `text-body` | `#6E5549` | body text |
| `text-muted` | `#9A8478` | muted labels / meta |
| `line-brown` | `#7A5544` | icons / doodle outlines |

**Pink system** — `pink-100 #FDEBED` · `pink-200 #FAD8DF` · `pink-300 #F7C1CF` · `pink-400 #F39BB0` · `pink-500 #EC8EA4` · `pink-600 #DD7890`

**Green accent** — `green-100 #EEF7EE` · `green-200 #DDEEDB` · `green-300 #BFDDBE` · `green-400 #9DCAA3` · `green-500 #8FB89A` · `green-600 #6E9E7F`

**Helpers** — `yellow-soft #F6E5B8` · `orange-soft #F5C79A` · `red-soft #F3B7B3` · `blue-soft #C8DDF2`

**Role mapping:** primary CTA `pink-500` (hover `pink-600`) · secondary chip `pink-100` / `green-100` · main text `text-main` · meta `text-muted` · panel `bg-surface` · app bg `bg-main` · accent icon `green-500` · map park tint `green-100`/`green-200` · map roads/buildings muted tan.

**Status colours are functional, not decoration** — they drive pins and badges. Never colour alone; pair each with a shape/icon so it survives colourblindness and a sunlit screen.

| `STATUS` | Meaning | Chip bg / text | Pin |
|---|---|---|---|
| `healthy` | seen recently | `green-100` / `green-600` | sage cat-face pin |
| `needs_attention` | injured / flagged | `yellow-soft` / brown | amber ring |
| `missing` | past 7-day threshold | `red-soft` / dark pink | pink/red alert ring |

---

## 4. Typography

Two families, max. **Fredoka** (display / logo / titles) + **Nunito Sans** (body / UI).

| Role | Font | Weight | Size |
|---|---|---|---|
| H1 / page title | Fredoka | 600 | 32–36px |
| H2 / section | Fredoka | 500–600 | 22–24px |
| Card title | Nunito Sans | 700 | 16–18px |
| Body | Nunito Sans | 400–500 | 14–16px |
| Meta / tiny | Nunito Sans | 500 | 12–13px |

---

## 5. Spacing · radius · shadow

- **Spacing** on an 8px system: 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48.
- **Radius:** `sm 12` · `md 18` · `lg 24` · `xl 28` · `pill 999`.
- **Shadow:** `0 6px 20px rgba(140,108,89,.10)`; elevated cards `0 10px 28px rgba(140,108,89,.14)`.

---

## 6. Components

**App shell (mobile).** Cream background; a bottom action bar or a single **FAB "Register"** in the bottom-right thumb zone; active state = pink pill, brown line icons. No sidebar.

**Map (the hero).** Muted/softened base — parks lightly green, roads warm beige, water pale blue-green, labels muted brown. Avoid default map visual intensity. Overlays: cat-face markers, recent-sighting dots, legend chip, filter + rounded white zoom buttons.

Markers — `pastel cat-face pin` known cat · `green house pin` feeding zone / home base · `pink dot / pulse` recent sighting · `yellow/orange chip` active area · `pink/red ring` missing / needs follow-up.

**Cards / panels.** `bg-surface`, `border-soft`, radius 24, light shadow, title row with icon + title + optional "view all".

**Live photo cards** (cat database, sighting feed, alerts). Square or rounded-rect image, radius 12, subtle cream border, small chip below/beside. Real, minimally styled photos — this is what makes it feel alive.

**Buttons.** Primary `bg pink-500` / white / radius 16 or pill / hover `pink-600`. Secondary `bg pink-100` / `text-main` / 1px `border-soft`. Ghost transparent / brown text.

**Inputs / forms.** Cream fill, rounded 14–16, thin soft border, muted-brown placeholder, focus = pink border + soft shadow. Upload box: dashed pink border, soft pink tint, centered icon, spacious.

**Chips.** Friendly/Active `green-100`/`green-600` · Missing `red-soft`/dark-pink · Needs Care `yellow-soft`/brown-orange · New `pink-100`/`pink-600`. Use them heavily.

---

## 7. Signature moments & motion

Spend boldness in one place; keep everything else quiet. Motion is authored to fit intent — a reference image can't contain it.

- **Re-ID match reveal** *(single most demo-able animation)*: on submit, a ring fills to "92% match". This is your whole technical story on video — design it deliberately.
- **Bottom-sheet profile**: slides up when a pin is tapped.
- **Loading screen** (§8): the branded page-load moment.
- **Skeletons, not spinners** for loading states.
- **Optimistic update**: the profile visibly changes the instant a photo is submitted.
- **Missing-cat state**: should land *emotionally*, not just informationally — this is where Theme + UX score.

---

## 8. Loading screen (built — `catwatch-loading.html`)

Reusable component, not a one-off image.

Structure: cream base · soft pink blob corners · tiny pink dots · leaf + paw doodles · rounded card with brown outline and subtle shadow · brown hand-drawn cat doodle · Fredoka caption "Looking for kitties nearby…" · progress bar with pink fill, cream track, green paw-knob.

| Part | Value |
|---|---|
| Card border | `#7A5544` |
| Card fill | `#FFF9F6` |
| Text | `#5D4035` |
| Progress | `#F39BB0 → #EC8EA4` |
| Track | `#F4E4DE` |
| Paw knob | `#8FB89A` |
| Leaf | `#A9C9AF` |
| Bg blob | `#FAD8DF` |

---

## 9. Tokens in code (Tailwind v4)

Tokens live in `globals.css` as CSS custom properties, mapped with `@theme inline` — **not** `tailwind.config.js` (removed in Tailwind v4). This file is the design guide; `globals.css` is its executable copy — paste this in, then theme shadcn's variables to match.

```css
:root {
  --bg-main:#F9F3EE; --bg-surface:#FFF9F6; --bg-soft:#F6EEE7;
  --text-main:#5D4035; --text-body:#6E5549; --text-muted:#9A8478;
  --line-brown:#7A5544; --border-soft:#EBDDD2;

  --pink-100:#FDEBED; --pink-200:#FAD8DF; --pink-300:#F7C1CF;
  --pink-400:#F39BB0; --pink-500:#EC8EA4; --pink-600:#DD7890;
  --green-100:#EEF7EE; --green-200:#DDEEDB; --green-300:#BFDDBE;
  --green-400:#9DCAA3; --green-500:#8FB89A; --green-600:#6E9E7F;

  --yellow-soft:#F6E5B8; --orange-soft:#F5C79A; --red-soft:#F3B7B3; --blue-soft:#C8DDF2;

  --radius-sm:12px; --radius-md:18px; --radius-lg:24px; --radius-xl:28px; --radius-pill:999px;
}
```

---

## 10. Reusable assets

**As SVG:** `cat-logo-doodle` · `cat-loading-doodle` · `paw-print-icon` · `leaf-doodle` · `flower-doodle` · `cat-pin-outline` · `cat-marker-base` · `home-base-pin` · `recent-sighting-dot`.

**As real components** (not flat images): loading card · progress bar · nav / FAB · cat list card · photo thumbnail · alert card · registration form · map legend · search bar · empty-state card.

---

## 11. Quality floor

Ship these without announcing them: responsive down to 390px, visible keyboard focus, **reduced motion respected**, colourblind-safe status colours (shape + colour), and every state designed — loading (skeletons), empty (an invitation to act), offline, error (says what happened + how to fix, in the interface's voice), success. On mobile web, skipping states is exactly where it feels janky.
