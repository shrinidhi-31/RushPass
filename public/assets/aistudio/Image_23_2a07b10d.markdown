---
name: Urban Commute Tactile
colors:
  surface: '#fdf9f0'
  surface-dim: '#dddad1'
  surface-bright: '#fdf9f0'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3ea'
  surface-container: '#f1eee5'
  surface-container-high: '#ece8df'
  surface-container-highest: '#e6e2d9'
  on-surface: '#1c1c16'
  on-surface-variant: '#3e4946'
  inverse-surface: '#31302b'
  inverse-on-surface: '#f4f0e7'
  outline: '#6e7a75'
  outline-variant: '#bdc9c4'
  surface-tint: '#006b5b'
  primary: '#006858'
  on-primary: '#ffffff'
  primary-container: '#1a8370'
  on-primary-container: '#f4fffa'
  inverse-primary: '#7bd7c1'
  secondary: '#416279'
  on-secondary: '#ffffff'
  secondary-container: '#c2e4ff'
  on-secondary-container: '#46667d'
  tertiary: '#a03934'
  on-tertiary: '#ffffff'
  tertiary-container: '#c0514a'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#97f4dd'
  primary-fixed-dim: '#7bd7c1'
  on-primary-fixed: '#00201a'
  on-primary-fixed-variant: '#005144'
  secondary-fixed: '#c8e6ff'
  secondary-fixed-dim: '#a9cbe5'
  on-secondary-fixed: '#001e2e'
  on-secondary-fixed-variant: '#294a60'
  tertiary-fixed: '#ffdad6'
  tertiary-fixed-dim: '#ffb3ac'
  on-tertiary-fixed: '#410003'
  on-tertiary-fixed-variant: '#842421'
  background: '#fdf9f0'
  on-background: '#1c1c16'
  surface-variant: '#e6e2d9'
typography:
  headline-xl:
    fontFamily: Manrope
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '800'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 26px
  headline-sm:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 22px
  body-lg:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  body-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 18px
  label-lg:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Manrope
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-tablet: 1.5rem
  gutter-desktop: 2rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system is engineered for the high-frequency, dynamic context of Indian urban mobility—specifically regular bus transit in Bangalore. It serves daily commuters, students, and professionals navigating fluctuating connectivity, intense sunlight, crowded bus terminals, and rapid decision-making environments.

The brand personality is **pragmatic, dependable, grounded, and orderly**. Rather than relying on ephemeral UI trends, neon accents, or low-contrast glassmorphic treatments, the system adopts a **warm tactile modernism** rooted in physical utility. It echoes municipal civil design, tactile transit tokens, and modern ticket architecture. Visual cues prioritize extreme legibility, rapid scannability under direct daylight, and finger-friendly hit states for moving vehicles.

## Colors

The palette balances public transit authority with regional warmth, departing from sterile cold grays in favor of an organic ivory substrate.

### Primary Palette
- **Primary Teal (`#278B78`)**: Used for affirmative transit actions, live route tracking status, active passes, and primary callouts.
- **Primary Hover/Pressed (`#1E7060`)**: Provides decisive physical feedback on tap and hover.
- **Deep Navy (`#183B50`)**: High-contrast anchor for primary titles, route numbers, depot identifiers, and key quantitative data.

### Functional & Neutral Surfaces
- **Canvas / Background (`#F5F1E8`)**: Warm ivory that minimizes visual fatigue in harsh glare while preventing stark digital starkness.
- **Surface Layer (`#FFFFFF`)**: Pure crisp white for elevated cards, tickets, QR containers, and action panels.
- **Subtle Border (`#E5DFD3`)**: Structural divider defining tactile sections without creating harsh grid clutter.
- **Body Slate (`#4B6272`)**: Primary reading color for intermediate descriptions, stops, and timestamps.
- **Muted Slate (`#7D909E`)**: Low-emphasis metadata, inactive track steps, and micro-labels.
- **Alert Coral Red (`#C95750`)**: Critical system alerts, route delays, bus cancellations, and emergency actions.

## Typography

The design system standardizes on **Manrope** across all typographic applications. Manrope's robust geometric skeletons, semi-rounded junctions, and wide apertures provide immediate numerical and character differentiation—crucial for reading bus route codes (e.g., `335-E`, `V-500D`) and platform stop counts in low-visibility situations.

- **Route Numbers & Identifiers**: Set in `headline-xl` or `headline-lg` with heavy weights (700/800) using tabular numerals to guarantee alignment across transit tables.
- **Stop Names & Timestamps**: Set in `body-md` and `label-md` to preserve legibility when paired with real-time transit status icons.
- **Badges & Meta Caps**: Set in `label-sm` with slight positive tracking (`0.04em`) to maintain legibility when rendered inside solid transit chips.

## Layout & Spacing

Layout adheres to an 8pt modular grid with a strictly enforced 4pt baseline for compact component states.

### Breakpoints & Grids
- **Mobile (<640px)**: 4-column fluid layout, `1rem` (16px) margins and gutters. Designed for one-handed thumb interaction with primary actions sticky to the bottom viewport edge.
- **Tablet (640px - 1024px)**: 8-column layout, `2rem` (32px) margins, `1.5rem` (24px) gutters. Splits viewport into live map visualization and transit pass control sheets.
- **Desktop (>1024px)**: 12-column layout with a maximum container boundary of `1200px`, centered with `3rem` margins. Primary views balance schedule search panes and geospatial route trackers.

Content reflows vertically on mobile to prioritize instant verification of digital passes (QR, ticket number, countdown timer) without requiring horizontal scroll gestures.

## Elevation & Depth

Visual depth is achieved through **tonal separation and soft physical layering** rather than floaty, atmospheric dropshadows. Surfaces must feel physically printed and inspectable.

- **Level 0 (Canvas)**: Background ivory (`#F5F1E8`). Flat base layer.
- **Level 1 (Stacked Cards & Lists)**: Surface white (`#FFFFFF`) with a `1px` continuous border in `#E5DFD3`. Shadow: `0 2px 4px rgba(24, 59, 80, 0.04)`.
- **Level 2 (Active Transit Tickets & Modal Sheets)**: Surface white (`#FFFFFF`) framed with `#E5DFD3`. Shadow: `0 8px 16px -2px rgba(24, 59, 80, 0.08)`.
- **Level 3 (Floating Route Triggers & Emergency Overlays)**: Surface white (`#FFFFFF`) or Primary Teal (`#278B78`). Shadow: `0 12px 24px -4px rgba(24, 59, 80, 0.14)`.

No blurred backdrop filters or translucent surfaces are permitted; opacity should remain 100% on card surfaces to maintain absolute contrast across diverse ambient light settings.

## Shapes

The shape hierarchy establishes clear functional distinctions through deliberate corner radii:

- **Cards & Transit Sheets**: Bound to `16px` (`rounded-lg` contextual override) for safe pocket-like containment.
- **Input Fields & Dropdowns**: Bound to `12px` for comfortable tap zones and finger guidance.
- **Buttons & Interactive Tags**: Bound to `10px` to maintain a distinct, tactile push-button character.
- **Pills / Status Dots**: Fully rounded (`9999px`) reserved strictly for live indicators, route chips, and fare stage counts.

## Components

### Buttons
- **Primary**: Solid background `#278B78`, text `#FFFFFF`, radius `10px`, min-height `48px` on mobile for accessible tap area. Hover/active state transitions smoothly to `#1E7060`.
- **Secondary**: Surface `#FFFFFF`, border `1.5px` solid `#183B50`, text `#183B50`, radius `10px`.
- **Tertiary / Destructive**: Background `transparent`, text `#C95750`, active state `#F5F1E8`.
- Focus states display a crisp `2px` offset ring in `#278B78`.

### Input Fields & Search Bars
- Background `#FFFFFF`, border `1px` solid `#E5DFD3`, radius `12px`, padding `12px 16px`.
- Placeholder text in `#7D909E`, active text in `#183B50`.
- Focused state: Border increases to `1.5px` in `#278B78` with an inset `2px` tint ring. Error state shifts border to `#C95750`.

### Cards & Ticket Modules
- Built on `#FFFFFF` with `16px` radius and `1px` outline `#E5DFD3`.
- Digital Bus Pass Card features a perforated cutout divider separating the dynamic QR code from passenger trip details.
- Real-time ETA badges use `#278B78` with white text; delays transition to `#C95750`.

### Chips & Route Badges
- **Bus Number Badge**: High-contrast block with `#183B50` background, `#FFFFFF` bold typography, `6px` radius.
- **Filter Chips**: Background `#FFFFFF`, border `1px` solid `#E5DFD3`, radius `9999px`, text `#4B6272`. Selected state converts to background `#278B78` with `#FFFFFF` text and no border.

### Checkboxes & Radio Buttons
- Custom controls with `1.5px` solid border in `#7D909E`. Checked state transitions instantly to `#278B78` fill with clean white interior glyphs. Target bounding box maintains an absolute minimum touch zone of `44x44px`.

### Transit Stop Lists & Timelines
- Vertical spine line in `2px` solid `#E5DFD3`. Passed stops utilize solid `#7D909E` dots; upcoming stops use `#183B50`; current live vehicle position is rendered with an active animated `#278B78` pulse ring.