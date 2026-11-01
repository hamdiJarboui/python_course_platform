# Python Course Platform — Styles & Design Tokens

**Status:** Design specification (pre-implementation)  
**Audience:** UI, Theme, and PDF Engineer (Person 4)  
**Companion documents:** ARCHITECTURE.md, TASKS.md, TESTING.md

---

## 1. Design Philosophy

The visual theme is inspired by the Python programming language brand. The design should feel:

- **Developer-friendly** — clean, monospace-friendly, minimal chrome
- **Approachable** — not overly corporate, warm but professional
- **Readable** — high contrast, clear hierarchy, generous whitespace
- **Consistent** — one design system across light and dark modes, print, and code blocks

The color palette is derived from the Python brand: Python blue (`#3776AB`) for primary actions and Python yellow (`#FFD43B`) for highlights and cautions. Surfaces use slate/gray neutrals that shift between light and dark modes.

---

## 2. Kickoff Prompt Specs (Color & Styles)

Use the following specs when implementing the theme system, UI components, and print styles. These are intended as the authoritative reference for the kickoff implementation.

### 2.1 Color Palette

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `--color-primary` | `#3776AB` | `#4D96C6` | Primary buttons, links, accents |
| `--color-primary-hover` | `#2C5F8A` | `#3E7EA8` | Hover state for primary actions |
| `--color-secondary` | `#6C757D` | `#ADB5BD` | Secondary text, muted actions |
| `--color-accent` | `#FFD43B` | `#FFE066` | Highlights, cautions, callouts |
| `--color-accent-dark` | `#CCA92E` | `#E6C84D` | Darker accent for text on accent bg |
| `--color-success` | `#28A745` | `#34CE57` | Success states, pass indicators |
| `--color-warning` | `#FFC107` | `#FFD43B` | Warning states |
| `--color-error` | `#DC3545` | `#EF5350` | Error states, failure indicators |
| `--color-info` | `#17A2B8` | `#2EC4D6` | Informational messages |

### 2.2 Surface Colors

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `--color-bg` | `#FFFFFF` | `#0F172A` | Page background |
| `--color-bg-surface` | `#F8F9FA` | `#1E293B` | Cards, sidebars, elevated surfaces |
| `--color-bg-surface-hover` | `#E9ECEF` | `#334155` | Hovered surfaces |
| `--color-bg-code` | `#F1F3F5` | `#0B1120` | Code block backgrounds |
| `--color-bg-code-run` | `#E8F4FD` | `#122A45` | Runnable code block backgrounds |
| `--color-bg-input` | `#FFFFFF` | `#1E293B` | Form input backgrounds |
| `--color-bg-disabled` | `#E9ECEF` | `#334155` | Disabled state backgrounds |

### 2.3 Text Colors

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `--color-text-primary` | `#1A1A1A` | `#F1F5F9` | Headings, primary body text |
| `--color-text-secondary` | `#4A5568` | `#94A3B8` | Secondary body text, captions |
| `--color-text-muted` | `#718096` | `#64748B` | Disabled text, placeholders |
| `--color-text-inverse` | `#FFFFFF` | `#1A1A1A` | Text on primary/accent backgrounds |
| `--color-text-code` | `#D63384` | `#FF99CC` | Inline code text |
| `--color-text-link` | `#3776AB` | `#4D96C6` | Hyperlinks |

### 2.4 Border & Outline Colors

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `--color-border` | `#D1D5DB` | `#334155` | Input borders, dividers |
| `--color-border-focus` | `#3776AB` | `#4D96C6` | Focus ring / active border |
| `--color-border-code` | `#CBD5E1` | `#475569` | Code block borders |
| `--color-border-divider` | `#E5E7EB` | `#334155` | Section dividers |

---

## 3. Design Tokens

### 3.1 Spacing

| Token | Value | Usage |
|---|---|---|
| `--space-xs` | `0.25rem` (4px) | Tight spacing within components |
| `--space-sm` | `0.5rem` (8px) | Small gaps |
| `--space-md` | `1rem` (16px) | Standard component padding |
| `--space-lg` | `1.5rem` (24px) | Section spacing |
| `--space-xl` | `2rem` (32px) | Large section gaps |
| `--space-2xl` | `3rem` (48px) | Major page sections |

### 3.2 Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `0.25rem` (4px) | Small elements, badges |
| `--radius-md` | `0.5rem` (8px) | Buttons, inputs, cards |
| `--radius-lg` | `0.75rem` (12px) | Modals, large containers |
| `--radius-full` | `9999px` | Pills, avatars |

### 3.3 Typography

| Token | Value | Usage |
|---|---|---|
| `--font-sans` | system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif | UI text |
| `--font-mono` | ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace | Code blocks, inline code |
| `--font-size-xs` | `0.75rem` (12px) | Captions, small labels |
| `--font-size-sm` | `0.875rem` (14px) | Helper text, secondary UI |
| `--font-size-base` | `1rem` (16px) | Body text |
| `--font-size-lg` | `1.125rem` (18px) | Large body, lead text |
| `--font-size-xl` | `1.25rem` (20px) | Small headings |
| `--font-size-2xl` | `1.5rem` (24px) | Module titles |
| `--font-size-3xl` | `1.875rem` (30px) | Page headings |
| `--font-size-4xl` | `2.25rem` (36px) | Course title |
| `--line-height-tight` | `1.25` | Headings |
| `--line-height-base` | `1.5` | Body text |
| `--line-height-relaxed` | `1.75` | Readable long-form content |
| `--font-weight-normal` | `400` | Body text |
| `--font-weight-medium` | `500` | Emphasized text |
| `--font-weight-semibold` | `600` | Buttons, labels |
| `--font-weight-bold` | `700` | Headings |

### 3.4 Shadows

| Token | Value | Usage |
|---|---|---|
| `--shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Small elements |
| `--shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` | Cards, dropdowns |
| `--shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` | Modals, overlays |

### 3.5 Transitions

| Token | Value | Usage |
|---|---|---|
| `--transition-fast` | `150ms ease` | Hover states, focus rings |
| `--transition-base` | `250ms ease` | Theme switches, modals |
| `--transition-slow` | `350ms ease` | Page transitions, drawer |

---

## 4. Theme Implementation

### 4.1 Theme Attribute

Apply `data-theme` on the `<html>` element:

```html
<html data-theme="light">  <!-- or "dark" -->
```

An inline script in `<head>` runs before React hydration to set this attribute immediately, preventing a flash of incorrect theme.

### 4.2 Theme Values

| Value | Meaning |
|---|---|
| `light` | Light mode always |
| `dark` | Dark mode always |
| `system` | Follows `prefers-color-scheme` media query |

Persistence: stored in `localStorage` as `light`, `dark`, or `system`. The theme toggle writes to both `localStorage` and the Zustand `themeStore`.

### 4.3 CSS Variable Consumption

Components must consume design tokens via `var()` and never hard-code theme colors:

```css
.button-primary {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  font-weight: var(--font-weight-semibold);
  transition: background-color var(--transition-fast);
}

.button-primary:hover {
  background-color: var(--color-primary-hover);
}

[data-theme="dark"] .code-block {
  background-color: var(--color-bg-code);
  color: var(--color-text-primary);
  border: 1px solid var(--border-color-code);
}
```

---

## 5. Component Style Specs

### 5.1 Buttons

- **Primary:** `--color-primary` background, `--color-text-inverse` text, `--radius-md`, `--font-weight-semibold`
- **Secondary:** `--color-bg-surface` background, `--color-text-primary` text, `--color-border` border
- **Danger:** `--color-error` background, `--color-text-inverse` text
- **Ghost:** Transparent background, `--color-text-primary` text, `--color-border` border
- All buttons: `--transition-fast` on background/border, visible `:focus-visible` ring using `--color-border-focus`

### 5.2 Code Blocks

- **Normal (static):** `--color-bg-code` background, `--color-text-primary` text, monospace font, `--radius-md`, `--color-border-code` border, horizontal scroll on overflow
- **Runnable (executable):** `--color-bg-code-run` background to visually distinguish, `--color-text-primary` text, includes Run/Reset controls and output panel
- **Inline code:** `--color-text-code` color, `--color-bg-code` light background, `--radius-sm`, smaller font size

### 5.3 Cards

- Background: `--color-bg-surface`
- Border: `1px solid var(--color-border)`
- Radius: `--radius-md`
- Shadow: `--shadow-md`
- Padding: `--space-lg`

### 5.4 Sidebar / Layout

- Sidebar width: `260px` (collapsed: `72px`)
- Header height: `64px`
- Breakpoints: `768px` (mobile drawer), `1024px` (desktop)

### 5.5 Quiz Components

- Question card: `--color-bg-surface`, `--color-border`, `--radius-md`
- Selected option: `--color-bg-code-run` background, `--color-primary` border
- Correct answer: `--color-success` subtle background/tint
- Incorrect answer: `--color-error` subtle background/tint
- Explanation: `--color-text-secondary`, smaller font, `--color-info` icon accent

### 5.6 Progress Indicators

- Progress bar track: `--color-border`
- Progress bar fill: `--color-primary`
- Complete badge: `--color-success` background, `--color-text-inverse` text

---

## 6. Print Styles (`@media print`)

Print-specific overrides in `print.css`:

| Token | Print Value | Rationale |
|---|---|---|
| `--color-bg` | `#FFFFFF` | White paper background |
| `--color-bg-surface` | `#FFFFFF` | No card backgrounds in print |
| `--color-text-primary` | `#1A1A1A` | High contrast black text |
| `--color-text-secondary` | `#4A5568` | Dark gray secondary text |
| `--color-bg-code` | `#F5F5F5` | Light gray code background |
| `--color-primary` | `#000000` | Primary becomes black for print |
| `--color-accent` | `#000000` | Accent becomes black for print |

Print layout rules:
- Hide navigation, sidebar, header, theme toggle, buttons, and interactive controls
- `break-inside: avoid` on code blocks, quiz questions, and cards
- Page breaks between modules
- Code blocks use high-contrast monochrome styling
- Links show URL in parentheses after text
- Font sizes reduced slightly for print density

---

## 7. Accessibility (Contrast)

All color combinations must meet WCAG AA:

| Pair | Minimum Contrast | Status |
|---|---|---|
| Primary text on bg | 4.5:1 | Required |
| Large text on bg | 3:1 | Required |
| UI components / borders | 3:1 | Required |
| Primary button text on `--color-primary` | 4.5:1 | Required |
| Accent text on `--color-accent` | 4.5:1 | Use `--color-accent-dark` for text |

Verify contrast in both light and dark modes before finalizing any token.

---

## 8. Files Affected

| File | Purpose |
|---|---|
| `src/styles/globals.css` | Design tokens + dark/light CSS variables |
| `src/styles/print.css` | `@media print` overrides |
| `src/styles/code.css` | Code block styling (normal + runnable) |
| `src/components/layout/ThemeToggle.tsx` | Theme toggle UI |
| `src/stores/themeStore.ts` | Theme state persistence |
| `src/components/layout/Layout.tsx` | Applies `data-theme` to `<html>` |
