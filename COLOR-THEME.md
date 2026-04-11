# **Color Theme — Detailed Reference**

## Overview
- **Purpose:** Centralize visual tokens and usage rules so components look consistent, accessible, and easy to maintain.
- **Scope:** Palette (brand & semantic), shadows, radii, and recommended usage patterns for UI components.
- **Primary source:** Theme values are defined in tailwind.config.js.

## Palette (tokens)
- **Surface:**
  - surface: `#0a0c14`
  - surface.secondary: `#0f1420`
  - surface.tertiary: `#141b2d`
  - surface.elevated: `#1a2340`
- **Content (text):**
  - content: `#e8ecff` (primary text)
  - content.secondary: `#94a3b8` (muted)
  - content.tertiary: `#64748b` (tertiary/disabled)
  - content.inverse: `#0a0c14` (text on light backgrounds)
- **Accent (purple/violet):**
  - accent: `#a78bfa`
  - accent.secondary: `#8b5cf6`
  - accent.tertiary: `#6366f1`
  - accent.soft: `rgba(167, 139, 250, 0.15)` (soft bg)
  - accent.glow: `rgba(167, 139, 250, 0.4)` (glow)
- **Semantic:**
  - success: `#10b981`
  - success.soft: `rgba(16, 185, 129, 0.15)`
  - warning: `#f59e0b`
  - warning.soft: `rgba(245, 158, 11, 0.15)`
  - danger: `#ef4444`
  - danger.soft: `rgba(239, 68, 68, 0.15)`
  - info: `#06b6d4`
  - info.soft: `rgba(6, 182, 212, 0.15)`
- **Legacy aliases (keep for migration):**
  - ink: `#0a0c14`
  - panel: `#0f1420`
  - panelSoft: `#141b2d`
  - textDim: `#94a3b8`
- **Other tokens from config (non-color):**
  - borderRadius glass variants: `glass` 16px, `glass-sm` 12px, `glass-lg` 24px
  - shadows: `glass`, `glass-lg`, `glow`, `glow-lg`, `aura`
  - background images: `gradient-radial`, `gradient-conic`, `glass`
  - animations: `pulseGlow`, `float`, `shimmer`, `fadeIn`

## Semantic Tokens (recommended mapping)
- **Primary background:** `--bg-primary = var(--color-surface)`
- **Panel background:** `--bg-panel = var(--color-surface-secondary)` (use for cards/panels)
- **Elevated panel:** `--bg-elevated = var(--color-surface-elevated)`
- **Primary text:** `--text-primary = var(--color-content)`
- **Muted text:** `--text-muted = var(--color-content-secondary)`
- **Accent / Brand:** `--accent = var(--color-accent)`
- **Accent soft bg:** `--accent-soft = var(--color-accent-soft)`
- **Success / Warning / Danger / Info:** map to semantic colors above
- **Border / Divider:** `--border = rgba(255,255,255,0.06)` (prefer subtle alpha on dark surfaces)
- **On-accent (text on accent bg):** `--on-accent = var(--color-content.inverse)` or `#0a0c14`

Usage rule: use semantic tokens (`--bg-panel`) in components instead of color tokens (`--color-surface-secondary`) — enables theming easily.

## Accessibility & Contrast
- **Goal:** Meet WCAG AA contrast for normal text (>= 4.5:1) where practical.
- **Checks:**
  - Primary text on `surface` (`#e8ecff` on `#0a0c14`) is high contrast — recommended for body text.
  - Use `content.secondary` or `content.tertiary` for secondary text, but verify contrast on the specific background (muted text may not meet AA on some dark panels).
- **Guidelines:**
  - For small text, prefer `content` (primary) or increase font weight/size.
  - For disabled/tertiary text, ensure UI does not rely on low-contrast text to convey critical info.
  - Test color combinations with a contrast tool (e.g., axe, Lighthouse, contrast-checker).

## Light / Dark Theming
- **Current theme** is dark-first. For a light theme, provide inverse tokens:
  - `--bg-primary-light`, `--text-primary-light`, `--panel-light`, etc.
- **Switch approach:** keep semantic names and swap CSS custom properties when theme changes (see CSS snippet below).

## Implementation Snippets

- CSS custom properties (recommended place: `frontend/src/styles/_color-theme.css` or similar):

```css
:root {
  --color-surface: #0a0c14;
  --color-surface-secondary: #0f1420;
  --color-surface-tertiary: #141b2d;
  --color-surface-elevated: #1a2340;

  --color-content: #e8ecff;
  --color-content-secondary: #94a3b8;
  --color-content-tertiary: #64748b;
  --color-content-inverse: #0a0c14;

  --color-accent: #a78bfa;
  --color-accent-2: #8b5cf6;
  --color-accent-3: #6366f1;
  --color-accent-soft: rgba(167,139,250,0.15);
  --color-accent-glow: rgba(167,139,250,0.4);

  --color-success: #10b981;
  --color-success-soft: rgba(16,185,129,0.15);
  --color-warning: #f59e0b;
  --color-warning-soft: rgba(245,158,11,0.15);
  --color-danger: #ef4444;
  --color-danger-soft: rgba(239,68,68,0.15);
  --color-info: #06b6d4;
  --color-info-soft: rgba(6,182,212,0.15);

  --border: rgba(255,255,255,0.06);
  --radius-glass: 16px;
  --radius-glass-sm: 12px;
  --radius-glass-lg: 24px;
  --shadow-glass: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1);
}

[data-theme="light"] {
  /* example light overrides */
  --color-surface: #ffffff;
  --color-content: #0a0c14;
  --border: rgba(10,12,20,0.06);
  /* override other tokens as needed */
}
```

- Tailwind usage
  - Use classes extended in your config: `bg-surface`, `bg-surface-secondary`, `text-content`, `text-content-secondary`, `bg-accent`, `shadow-glow`.
  - For semantic usage in components prefer utility classes built from tokens:
    - `className="bg-surface p-4 rounded-glass shadow-glass text-content"`
  - When using CSS variables inside Tailwind (if you prefer), configure theme with `cssVar` or use `bg-[var(--color-surface)]` syntax (Vite/Tailwind JIT).

## Component Examples & Patterns
- **Card / Panel**
  - `className="bg-surface-secondary rounded-glass p-4 shadow-glass text-content"`
- **Primary Button**
  - `className="inline-flex items-center gap-2 bg-accent px-4 py-2 rounded-full text-content-inverse shadow-glow hover:bg-accent-secondary"`
- **Secondary Button**
  - `className="bg-surface-elevated border border-[var(--border)] text-content px-3 py-1.5 rounded-full"`
- **Status Badge**
  - Success: `bg-success/15 text-success rounded-full px-2 py-0.5`
  - Danger: `bg-danger/15 text-danger rounded-full px-2 py-0.5`
- **Toast / Feedback**
  - Use soft backgrounds (`--color-success-soft`) with border or subtle icon color from semantic color.

## Token Usage Rules (do's & don'ts)
- Do: use semantic tokens in components (`--bg-panel`, `--text-primary`) so a theme swap affects all components.
- Do: use accent soft for backgrounds, accent for interactive highlights.
- Don't: use hard-coded hexes in components — reference tokens or Tailwind classes.
- Don't: use low-contrast color for actionable labels (buttons/links).

## Testing & Tooling
- **Contrast:** run automated checks (axe, Lighthouse).
- **Design QA:** verify colors in multiple displays and color blindness simulators.
- **Storybook:** expose color tokens as a theme panel for designers and devs.

## Tailwind integration notes
- Primary tokens exist in tailwind.config.js. Keep the Tailwind theme and CSS variables consistent.
- If you add `--color-*` variables, consider a PostCSS step or runtime injection to keep Tailwind and CSS variable values aligned for dynamic theming.

