# Landing Page Feature

## Overview
Full-screen marketing landing page for LeadsGrid with dark UI, neon glow accents, glassmorphism cards, and Framer Motion animations. Serves as the public-facing entry point at `/`.

## Sections (9 total)
1. **HeroSection** — Headline, CTA buttons, animated dashboard preview with live lead cards
2. **LiveDemoSection** — Real-time lead discovery simulation with streaming cards
3. **HowItWorksSection** — 3-step horizontal flow (Discover → Analyze → Convert)
4. **FeaturesSection** — 2x2 glassmorphism feature cards with hover tilt
5. **WhyLeadsGridSection** — Split comparison (Without vs With LeadsGrid)
6. **TryAiSection** — Interactive AI search input with typing animation and mock results
7. **SocialProofSection** — Testimonial cards from early users
8. **PricingSection** — 3-tier pricing (Free / Pro / Scale)
9. **FinalCtaSection** — Big glowing CTA with gradient text

## Components
### Layout
- `Navbar` — Fixed top nav with scroll-based blur, nav links, login/start CTA
- `Footer` — Brand, link columns, copyright

### UI (Reusable)
- `GlowButton` — Primary/secondary variants with hover glow animation
- `GlassCard` — Glassmorphism container with optional hover tilt/glow
- `GradientText` — Purple→blue gradient text wrapper
- `AnimatedGrid` — Background grid lines + floating glow orbs
- `LeadNotificationCard` — Animated lead discovery card with score
- `SectionWrapper` — Scroll-triggered fade-in wrapper

## Hooks
- `useLeadSimulation` — Generates simulated leads at intervals for demo sections
- `useScrollAnimation` — Framer Motion `useInView` wrapper for scroll-triggered animations

## Types
- `SimulatedLead` — Lead card data shape
- `PricingTier` — Pricing card data shape
- `FeatureItem` — Feature card data shape
- `Testimonial` — Testimonial card data shape
- `HowItWorksStep` — Step flow data shape

## Design System
- **Background**: `surface` (#0a0c14)
- **Primary Accent**: `accent` (#a78bfa)
- **Secondary Accent**: `accent-secondary` (#8b5cf6)
- **Tertiary Accent**: `accent-tertiary` (#6366f1)
- **Accent Soft**: `accent-soft` (rgba(167, 139, 250, 0.15))
- **Glass**: bg-white/[0.04] + backdrop-blur-xl + border-white/10
- **Glow Shadow**: box-shadow: 0 0 30px rgba(167, 139, 250, 0.4)

## Future Improvements
- Cursor glow follow effect
- Sound micro-interactions (optional)
- Dark/light neon toggle
- Real-time counter connected to backend API
- Video embed for "Watch Demo"
