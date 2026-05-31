# Landing Page Animations

## Overview

Phase 1 animation overhaul for the LeadsGrid landing page. Uses pure CSS 3D transforms + Framer Motion (no Three.js / R3F). All animations are GPU-accelerated via `transform` and `opacity` only.

## Tech Stack

- **Framework:** React 19 + TypeScript + Vite
- **Animations:** Framer Motion (spring physics, scroll reveals, mouse tracking)
- **3D:** CSS `perspective`, `preserve-3d`, `backface-visibility`, `translateZ`
- **Styling:** Tailwind CSS with existing `COLOR-THEME.md` tokens

## Shared Primitives

### `useMouseSpotlight`

Hook that tracks mouse position inside a referenced element.

```tsx
const { ref, coords, isHovered, handlers } = useMouseSpotlight();
```

- `ref` — attach to the target DOM element
- `coords` — `{ x, y }` relative to element bounds
- `isHovered` — boolean hover state
- `handlers` — `{ onMouseMove, onMouseEnter, onMouseLeave }`

### `ScrollReveal`

Reusable viewport-triggered spring animation wrapper.

```tsx
<ScrollReveal delay={0.2} duration={0.8} y={30}>
  <MyComponent />
</ScrollReveal>
```

### `MouseSpotlight`

Pre-built wrapper that applies a radial gradient spotlight + border glow following the cursor.

```tsx
<MouseSpotlight glowColor="rgba(167,139,250,0.15)" glowSize={400}>
  <CardContent />
</MouseSpotlight>
```

## Section: Hero

### Components

- `HeroSection.tsx` — Section wrapper with staggered headline reveal, aurora background, and CTA
- `HeroDashboard3D.tsx` — Interactive 3D parallax dashboard card

### Animation Details

**Staggered Text Reveal:**
- Container: `staggerChildren: 0.12`, `delayChildren: 0.2`
- Items: spring physics (`stiffness: 100`, `damping: 20`), fade up from `y: 24`

**Aurora Background:**
- Three radial gradient orbs (`bg-accent/8`, `bg-accent-secondary/8`, `bg-info/5`) with heavy blur
- `pointer-events-none` so clicks pass through

**3D Dashboard Card:**
- `perspective: 1200px` on the container
- Mouse position drives `rotateX` / `rotateY` via `useSpring(useTransform(...))`
- Inner notification card floats at `translateZ: 60px` for parallax depth
- Spring config: `{ damping: 30, stiffness: 300, mass: 0.5 }`

**Mobile Degradation:**
- On `< lg`, the 3D dashboard is hidden entirely (`hidden lg:flex`)
- Hero text and CTAs remain fully visible

## Section: Features (Bento Grid)

### Components

- `FeaturesSection.tsx` — Asymmetrical Bento grid layout
- `BentoGridCard.tsx` — Individual card with mouse spotlight + optional score count-up

### Layout

Asymmetrical 3-column grid:
- Row 1: **AI Lead Scoring** (spans 2 cols) + **Multi-Source Discovery** (1 col)
- Row 2: **Agent Mode** (1 col) + **Smart CRM** (spans 2 cols)

### Animation Details

**Mouse Spotlight:**
- Inner radial gradient (`mix-blend-screen`) tracks cursor
- Border glow uses CSS mask trick (`maskComposite: exclude`) to trace the card perimeter

**AI Score Count-Up:**
- Triggered on hover of the "AI Lead Scoring" card
- Animates from 0 → 92 over 1.2s using `requestAnimationFrame`
- Easing: `1 - (1 - t)³` (ease-out cubic)

**Scroll Entrance:**
- Each card uses `useInView` with `once: true`
- Spring transition: `stiffness: 100`, `damping: 20`

## Performance Rules

1. **GPU only** — Only `transform` and `opacity` are animated. No `width`, `height`, `top`, `left`.
2. **Spring over duration** — Mouse-following elements use `useSpring` for 60fps smoothness without frame-by-frame JS updates.
3. **will-change** — Applied sparingly to the hero card and bento cards.
4. **Mobile degrade** — 3D parallax disabled on small viewports.

## Section: How It Works (GSAP ScrollTrigger)

### Components

- `HowItWorksSection.tsx` — GSAP ScrollTrigger pinned sequence
- `PlatformIcon.tsx` — Glassmorphic platform badge (Reddit, LinkedIn, Google, Twitter/X)
- `AICoreNode.tsx` — Central glowing AI orb with orbiting particles

### Animation Sequence

**Pinned scroll timeline (scrubbed, 250% scroll distance):**

- **Phase 1 (0-20%):** 4 platform icons fade in from edge positions (opacity 0 → 1, scale 0.6 → 1)
- **Phase 2 (20-55%):** Icons converge to center (`x: 0, y: 0`) with `power2.inOut` easing. SVG connector beams draw via `strokeDashoffset` animation.
- **Phase 3 (55-70%):** Icons fade out and shrink. AI core scales to 1.3x and back, simulating an absorption pulse.
- **Phase 4 (70-100%):** 3 step cards (Discover, Analyze, Convert) fade in from `y: 60` with staggered delays.

**Mobile Fallback:**
- On `< md` (768px), pinning is disabled entirely.
- Static vertical card stack is shown instead.

### Performance Notes

- `gsap.context()` scopes all tweens to the section ref
- `ctx.revert()` cleans up ScrollTrigger on unmount
- `will-change-transform` applied to animated icons and core

## Section: Pricing

### Components

- `PricingSection.tsx` — Plan family/cycle toggles + grid layout
- `PricingCardInner.tsx` — Individual card with spring flip + mouse spotlight

### Animation Details

**Entrance:**
- Cards stagger in with `whileInView` spring (`stiffness: 100`, `damping: 20`, delay: `idx * 0.12`)

**Hover Flip:**
- `motion.div` drives `rotateY` via `animate={{ rotateY: isFlipped ? 180 : 0 }}`
- Spring transition: `stiffness: 200`, `damping: 25`
- Desktop: hover triggers flip. Mobile: tap toggles state.

**Mouse Spotlight:**
- Inner radial gradient (`mix-blend-screen`) tracks cursor inside card
- Border glow traces perimeter via CSS mask trick
- Spotlight only renders when `isHovered === true`

**Highlighted Card:**
- "Most Popular" badge uses `animate-glow-pulse`
- Ambient glow orb behind card (`blur-2xl`) fades in on hover

## Section: Social Proof

### Components

- `SocialProofSection.tsx` — Grid layout
- `TestimonialCard.tsx` — Inline component with mouse spotlight

### Animation Details

- Cards enter with spring physics (`stiffness: 100`, `damping: 20`)
- Star ratings stagger in individually per card
- Mouse spotlight + border glow on hover (same CSS mask technique)

## Section: Final CTA

### Animation Details

- Aurora background orbs (same style as Hero): accent, accent-secondary, info
- Orbs scale in from `0.6-0.8` to `1` with staggered delays on scroll
- Spring entrance for text content
- CTA button hover uses `motion.div` spring scale

## Phase 3: Global Polish

### Global Cursor Glow (`CursorGlow.tsx`)

- Fixed-position `div` covering the entire viewport (`pointer-events-none`, `z-[1]`)
- `useMotionValue` + `useSpring` track mouse position — **no React re-renders on mouse move**
- Spring config: `{ damping: 50, stiffness: 150, mass: 0.8 }` for fluid trailing
- Radial gradient orb (`bg-accent/6 blur-[120px]`) follows cursor
- Disabled on touch devices via `matchMedia('(pointer: coarse)')`

### WhyLeadsGridSection

- `ComparisonCard` component with inline mouse spotlight (danger vs success tinted)
- Cards slide in from opposite directions with spring physics
- List items stagger in with per-item spring delays
- Hover: card scale 1.01, text color transitions to content

### LiveDemoSection

- Floating accent particles behind demo area (6 small dots with `animate-float-y` at different delays/durations)
- Badge, headline, description, marquee, counter all get staggered spring entrances
- Lead notification cards get spring slide-in (`stiffness: 120`, `damping: 18`) on appearance

### SocialProofSection

- `TestimonialCard` inline component with mouse spotlight + border glow
- Spring entrance with staggered delays per card
- Star ratings retain individual staggered reveal

### Footer

- Brand block + link columns + bottom bar all get spring `whileInView` entrances
- Link hover color transitions to `text-accent` with 300ms duration
- Staggered column reveals (`colIdx * 0.1`)

### Navbar

- **Scrollspy:** Tracks which section is closest to `viewport top + 35% offset`
- **Active link:** `text-accent` + spring-animated underline glow (`shadow-[0_0_8px_rgba(167,139,250,0.6)]`)
- **Nav click:** Smooth scroll with navbar height offset compensation
- **Glassmorphism intensity:** Scroll adds `shadow-[0_4px_30px_rgba(0,0,0,0.15)]` to navbar backdrop

## Phase 4: Final Polish

### TryAiSection

- Headline + description: spring `whileInView` entrance with staggered delays
- Floating accent particles (4 small dots) around search input area
- Search button: `whileHover` scale + enhanced glow (`boxShadow` expansion)
- AI thinking indicator: spring `AnimatePresence` entrance/exit
- `ResultCard` inline component with mouse spotlight + source-specific colored dot (Reddit=orange, LinkedIn=blue, Google=green)
- Score badge uses accent gradient styling
- Result cards enter with spring slide-in (`stiffness: 120`, `damping: 18`)

### Global Noise Overlay (`NoiseOverlay.tsx`)

- Fixed `div` covering viewport (`pointer-events-none`, `z-[100]`)
- SVG fractal noise pattern (`feTurbulence`) as CSS `background-image`
- `mix-blend-mode: overlay` at very low opacity (~0.025)
- CSS `animation: noise-pulse` subtly modulates opacity for living texture
- Disabled on touch devices

## Performance Rules

1. **GPU only** — Only `transform` and `opacity` are animated. No `width`, `height`, `top`, `left`.
2. **Spring over duration** — Mouse-following elements use `useSpring` for 60fps smoothness.
3. **ScrollTrigger cleanup** — All GSAP contexts call `revert()` on unmount.
4. **Mobile degrade** — Scroll pinning disabled `< md`. 3D parallax disabled on small viewports. Cursor glow and noise overlay disabled on touch.
5. **will-change** — Applied sparingly to hero card, bento cards, pinned container, animated icons, and cursor glow.
6. **Noise overlay** — Pure CSS animation, no JS loop. Static `background-image`.
