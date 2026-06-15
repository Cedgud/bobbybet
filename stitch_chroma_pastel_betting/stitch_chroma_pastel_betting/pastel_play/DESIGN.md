---
name: Pastel Play
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#404945'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#707975'
  outline-variant: '#c0c9c4'
  surface-tint: '#366758'
  primary: '#366758'
  on-primary: '#ffffff'
  primary-container: '#b5ead7'
  on-primary-container: '#396b5c'
  inverse-primary: '#9dd1bf'
  secondary: '#685970'
  on-secondary: '#ffffff'
  secondary-container: '#ecd9f4'
  on-secondary-container: '#6c5d74'
  tertiary: '#75593c'
  on-tertiary: '#ffffff'
  tertiary-container: '#ffd8b3'
  on-tertiary-container: '#795d3f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b9eedb'
  primary-fixed-dim: '#9dd1bf'
  on-primary-fixed: '#002018'
  on-primary-fixed-variant: '#1c4f41'
  secondary-fixed: '#efdcf7'
  secondary-fixed-dim: '#d3c0db'
  on-secondary-fixed: '#22172a'
  on-secondary-fixed-variant: '#4f4257'
  tertiary-fixed: '#ffdcbc'
  tertiary-fixed-dim: '#e5c09c'
  on-tertiary-fixed: '#2b1702'
  on-tertiary-fixed-variant: '#5b4226'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.03em
  mood-phrase:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1200px
  gutter: 24px
---

## Brand & Style
The design system is built on a foundation of **Playful Minimalism**. It reimagines the high-stress environment of online betting as a serene, low-anxiety digital playground. By stripping away the aggressive flashing lights and dark themes typical of the industry, this design system focuses on clarity, inclusivity, and delight.

The aesthetic combines the clean structure of **Modern Minimalism** with a soft, **Tactile** edge. The goal is to evoke a "breath of fresh air" emotional response, utilizing generous whitespace to allow the pastel accents to guide the user's eye without overwhelming their senses. The interface is intentionally gender-neutral, moving away from "sports-bar" tropes toward a lifestyle-oriented, friendly atmosphere.

## Colors
This design system uses a "Cloud White" (#F8F9FA) base to maintain a clean, airy feel. The palette is defined by its soft saturation:

- **Soft Mint (Primary):** Used for primary actions, success states, and active betting slips.
- **Lavender (Secondary):** Used for secondary navigation, category filters, and user milestones.
- **Accents (Peach, Sky, Lemon):** Reserved for decorative elements, sport-specific iconography, and tag categorization.
- **Typography:** Avoid pure black. Use a deep charcoal (#2D3436) to maintain softness while ensuring high legibility.
- **Feedback:** Use the primary mint for positive growth and a muted, soft coral (not pastel red) for errors to keep the vibe friendly.

## Typography
We utilize **Plus Jakarta Sans** for its modern, rounded terminals and exceptional legibility. The type scale is generous to prevent visual clutter.

- **Headlines:** Use Bold or SemiBold weights with tight letter-spacing for a confident yet friendly "pop."
- **Body Text:** Use Regular weight with increased line-height (1.6) to ensure the interface feels breathable.
- **Labels:** Small labels use SemiBold with slight tracking to maintain readability at small sizes.
- **Mood Phrase:** A unique stylistic treatment for the profile widget, using an italicized, lower-contrast version of the body font.

## Layout & Spacing
The layout follows a **Fluid Grid** model with significant horizontal padding to push content toward the center, creating a focused, app-like experience even on desktop.

- **Margins:** Desktop views should maintain a minimum of 80px side margins or a max-container width of 1200px.
- **Rhythm:** Use an 8px base unit. Component-to-component spacing should lean toward `lg` (48px) to reinforce the minimalist aesthetic.
- **Mobile:** On mobile, the gutter reduces to 16px, but vertical section spacing remains high (48px+) to prevent the "wall of data" common in betting apps.

## Elevation & Depth
Depth is conveyed through **Soft Ambient Shadows** rather than hard lines or heavy borders. Surfaces should feel like they are floating gently above the Cloud White background.

- **Base Level:** The main background is flat.
- **Card Level:** Uses a very wide, low-opacity shadow (Color: `RGBA(0,0,0, 0.04)`, Blur: `20px`, Y-Offset: `4px`).
- **Active State:** When a user interacts with a bet slip or button, the shadow deepens slightly, and the element may scale by 1-2% to provide tactile feedback.
- **Glassmorphism:** Use subtle backdrop blurs (10px) for floating navigation bars or modal overlays to maintain the airy, light-filled atmosphere.

## Shapes
The shape language is defined by **Large Radii**. Avoid sharp corners entirely to maintain the "friendly" brand promise.

- **Standard Elements:** Buttons, input fields, and small chips use a `0.5rem` radius.
- **Large Elements:** Featured cards and the profile widget use `rounded-lg` (1rem).
- **Interactive Elements:** Betting "pill" selections should use `rounded-xl` (1.5rem) to look like soft, touchable buttons.

## Components
- **Buttons:** Primary buttons are filled with Soft Mint. Text is deep charcoal. No heavy borders; use the soft ambient shadow. Secondary buttons are ghost-style with a 1px Lavender border.
- **Cards:** White background, `rounded-lg` corners, and the signature soft shadow. Content inside cards should have at least 24px of internal padding.
- **Profile Widget:** Extremely minimal. A circular avatar (48px), the username in `title-md`, and the "mood phrase" immediately below in a lighter grey. No borders around the widget; it should sit floating in the top corner.
- **Betting Chips:** Small, rounded-pill tags used for odds. When selected, they transition from a light grey background to a pastel color (e.g., Sky Blue) to indicate the choice.
- **Inputs:** Soft grey backgrounds (#F1F3F5) with no border until focused. On focus, the background stays light, but a 2px Soft Mint border appears.
- **Lists:** Use generous vertical padding (16px+) between list items. Instead of divider lines, use subtle tonal changes or whitespace to separate content.