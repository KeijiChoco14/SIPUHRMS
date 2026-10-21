---
name: "SIPU Swiss-Belinn SKA Pekanbaru"
description: "Sistem Informasi Pengelolaan Usaha — Hospitality Precision with Swiss-Belinn Signature Red"
colors:
  primary: "#E31B23"
  primary-hover: "#C4141B"
  primary-active: "#A30F15"
  primary-subtle: "#FEF2F2"
  neutral-bg: "#F8FAFC"
  surface: "#FFFFFF"
  surface-subtle: "#F1F5F9"
  text-primary: "#0F172A"
  text-secondary: "#475569"
  text-muted: "#94A3B8"
  border: "#E2E8F0"
  border-subtle: "#F1F5F9"
  border-strong: "#CBD5E1"
  success: "#10B981"
  success-bg: "#ECFDF5"
  warning: "#F59E0B"
  warning-bg: "#FFFBEB"
  danger: "#EF4444"
  danger-bg: "#FEF2F2"
typography:
  display:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: "2.25rem"
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: "2rem"
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: "1.75rem"
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.25rem"
  label:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: "1rem"
    letterSpacing: "0.025em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.lg}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "10px 20px"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "#FFFFFF"
    rounded: "{rounded.lg}"
    padding: "10px 20px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
---

# Design System: SIPU Swiss-Belinn SKA Pekanbaru

## Overview

**Creative North Star: "Hospitality Precision — Swiss-Belinn Signature Red"**

SIPU (Sistem Informasi Pengelolaan Usaha) is the operational pulse of Swiss-Belinn SKA Pekanbaru. The interface embodies the professionalism, warmth, and high standard of international hospitality operations. Every interaction is structured, clean, and immediately decipherable by hotel staff across all shifts—from Front Office and Housekeeping to F&B, IT, and General Management.

The design eliminates visual clutter and inconsistent ad-hoc styling in favor of crisp administrative surfaces, disciplined spacing, and purposeful color usage. Swiss-Belinn Red (`#E31B23`) serves as the definitive brand anchor, used decisively for primary actions, active navigation states, and focal badges, while secondary surfaces recede into calm, elevated slate neutrals.

**Key Characteristics:**
- **Decisive Swiss-Belinn Red:** The iconic brand red (`#E31B23`) commands attention for key actions, status highlights, and active states without visual noise.
- **Harmonized Component Geometry:** Unified rounded corners (`rounded-xl` for cards and buttons, `rounded-lg` for inputs), crisp borders (`border-slate-200`), and consistent padding rhythm.
- **Scannable Typography:** Standardized Inter type hierarchy with legible weights (`font-semibold` for interactive triggers, `font-medium` for labels, `font-normal` for body content).
- **Consistent Icon Grammar:** Inline SVG icons standardized at 16px (`w-4 h-4`) or 20px (`w-5 h-5`) with clean, matching stroke widths (`strokeWidth={2}` or `1.5`) across all modules.

## Colors

The SIPU palette marries Swiss-Belinn's brand identity with a modern enterprise management canvas.

### Primary
- **Swiss-Belinn Red** (`#E31B23`): The definitive brand identity color. Applied to primary action buttons, key submit triggers, active sidebar items, and urgent status badges.
- **Deep Crimson Hover** (`#C4141B`): Darkened state for primary button hovers.
- **Burgundy Active** (`#A30F15`): Active / pressed state for primary interactions.
- **Rose Blush Surface** (`#FEF2F2`): Tonal tint for badge backgrounds, selected row highlights, and subtle callouts.

### Neutral
- **Slate Canvas** (`#F8FAFC`): Global application background behind cards and tables.
- **Pure White Surface** (`#FFFFFF`): Main container, card, modal, and input background.
- **Slate Subtitle Surface** (`#F1F5F9`): Table headers, secondary toolbars, and inactive tags.
- **Slate 900 Text** (`#0F172A`): Primary headings, card titles, and high-contrast labels.
- **Slate 600 Body** (`#475569`): Standard body text, table row contents, and field labels.
- **Slate 400 Muted** (`#94A3B8`): Placeholder text, helper hints, and timestamps.
- **Slate 200 Border** (`#E2E8F0`): Universal card outlines, input borders, and table dividers.

### Status Accents
- **Emerald Success** (`#10B981` text / `#ECFDF5` bg): Approved requests, clocked-in status, completed tasks.
- **Amber Warning** (`#F59E0B` text / `#FFFBEB` bg): Pending approvals, in-review requests, nearing due dates.
- **Rose Danger** (`#EF4444` text / `#FEF2F2` bg): Rejected requests, overdue tasks, critical IT tickets, destructive actions.
- **Sky Info** (`#3B82F6` text / `#EFF6FF` bg): Informational banners, in-progress workflows.

### Named Rules
**The Single Brand Voice Rule.** Swiss-Belinn Red (`#E31B23`) is reserved exclusively for the primary action on a view, active navigation links, and brand emblems. Generic utilities (blue, purple, teal) must not be used for primary buttons or sidebar selections.

**The Semantic Status Rule.** Colors outside the brand red and neutral scale are strictly semantic: emerald for success, amber for pending/warning, rose for danger/rejection, sky for info. They never replace primary UI buttons.

## Typography

**Display Font:** Inter, system-ui, sans-serif
**Body Font:** Inter, system-ui, sans-serif
**Label/Mono Font:** Inter, system-ui, sans-serif (tabular numbers via `tabular-nums`)

**Character:** Modern, clean, objective, and effortlessly readable on both high-resolution back-office monitors and staff mobile devices.

### Hierarchy
- **Display** (`font-bold`, `text-2xl` / `1.75rem`, `leading-8`): Page titles and major dashboard metric values.
- **Headline** (`font-semibold`, `text-xl` / `1.25rem`, `leading-7`): Modal titles, card section headers.
- **Title** (`font-semibold`, `text-base` / `1rem`, `leading-6`): Table column groups, sub-section headers, tab labels.
- **Body** (`font-normal`, `text-sm` / `0.875rem`, `leading-5`): Standard table cells, description text, form inputs, notes. Max line length 65–75ch for prose.
- **Label / Micro** (`font-medium` or `font-semibold`, `text-xs` / `0.75rem`, `leading-4`): Badges, status pills, helper captions, uppercase table headers (`uppercase tracking-wider`).

### Named Rules
**The Tabular Data Rule.** All numeric counters, clock-in times, currency amounts, and dates in tables must use `tabular-nums` to maintain vertical alignment across rows.

## Layout

SIPU utilizes a responsive layout with a persistent desktop sidebar (collapsible on smaller screens), a sticky top header bar for global search and profile controls, and a structured main container.

- **Content Max-Width:** Views default to fluid containers with a maximum boundary of `max-w-7xl` centered with horizontal padding (`px-4 sm:px-6 lg:px-8`).
- **Vertical Spacing Rhythm:** Page header to content uses `space-y-6` (24px). Inner card sections use `space-y-4` (16px).
- **Grid Layouts:** Metrics grids use `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6`. Detail layouts use `grid grid-cols-1 lg:grid-cols-3 gap-6`.

## Elevation & Depth

SIPU employs crisp surface boundaries with subtle elevation. Depth is created primarily through tonal contrast (`bg-slate-50` background with `bg-white` cards and `border-slate-200` borders) rather than heavy dramatic shadows.

### Shadow Vocabulary
- **Card Rest** (`shadow-xs` / `0 1px 2px 0 rgba(0, 0, 0, 0.05)`): Standard elevation for resting cards and tables.
- **Hover Lift** (`shadow-md` / `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)`): Interactive card or row hover state.
- **Modal / Floating Dropdown** (`shadow-xl` / `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)`): Floating overlays, dialogs, popovers.

### Named Rules
**The Border-First Depth Rule.** Every elevated container must have a crisp border (`border border-slate-200/80`). Shadows accompany borders, never replace them.

## Shapes

- **Buttons & Action Triggers:** Standardized at `rounded-xl` (12px) for a modern, tactile, premium feel.
- **Cards & Data Tables:** Standardized at `rounded-2xl` (16px) with `border border-slate-200`.
- **Form Controls & Inputs:** Standardized at `rounded-xl` (12px) with `border-slate-300`.
- **Badges & Status Pills:** Standardized at `rounded-full` (9999px) for clear semantic separation from square action buttons.

## Components

### Buttons
All buttons share: `inline-flex items-center justify-center font-medium text-sm transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed`.

- **Primary Button:**
  - **Class:** `bg-[#E31B23] text-white hover:bg-[#C4141B] active:bg-[#A30F15] shadow-sm hover:shadow focus:ring-2 focus:ring-[#E31B23] focus:ring-offset-2 rounded-xl px-4 py-2.5`
  - **Role:** Main page action (e.g., "Tambah Jadwal", "Ajukan Cuti", "Buat Tiket IT", "Simpan").
- **Secondary Button:**
  - **Class:** `bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100 shadow-sm focus:ring-2 focus:ring-[#E31B23] focus:ring-offset-2 rounded-xl px-4 py-2.5`
  - **Role:** Filters, cancel actions, export buttons, back buttons.
- **Danger Button:**
  - **Class:** `bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm hover:shadow focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-xl px-4 py-2.5`
  - **Role:** Delete confirmation, reject request, revoke access.
- **Ghost / Icon Button:**
  - **Class:** `text-slate-500 hover:text-slate-800 hover:bg-slate-100 active:bg-slate-200 rounded-lg p-2 transition-colors`
  - **Role:** Table row actions (view, edit, more menu), close modal X, pagination arrows.

### Form Inputs & Selects
- **Text & Select Fields:**
  - **Class:** `block w-full rounded-xl border-slate-300 text-slate-900 text-sm shadow-sm placeholder:text-slate-400 focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23] transition-colors py-2.5 px-3.5`
- **Labels:**
  - **Class:** `block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5`

### Status Badges & Pills
- **Structure:** `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold`
- **Approved / Active:** `bg-emerald-50 text-emerald-700 border border-emerald-200/60`
- **Pending / In Review:** `bg-amber-50 text-amber-700 border border-amber-200/60`
- **Rejected / Urgent:** `bg-rose-50 text-rose-700 border border-rose-200/60`
- **Draft / Inactive:** `bg-slate-100 text-slate-600 border border-slate-200`

### Cards & Data Tables
- **Container:** `bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden`
- **Card Header:** `px-6 py-4 border-b border-slate-100 flex items-center justify-between`
- **Table Row:** `border-b border-slate-100 hover:bg-slate-50/75 transition-colors`
- **Table Header:** `bg-slate-50/80 px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500`

### Icons
- **Standard Action Icon:** `w-4 h-4` (16px), `strokeWidth={2}` or `1.5`
- **Section / Header Icon:** `w-5 h-5` (20px), `text-slate-500` or `text-[#E31B23]`
- **Status Dot Icon:** `w-2 h-2 rounded-full`

## Do's and Don'ts

### Do:
- **Do** use Swiss-Belinn Red (`#E31B23`) as the sole primary action color across all views.
- **Do** ensure all interactive buttons use `rounded-xl` with consistent height and padding (`px-4 py-2.5` for standard buttons, `px-3 py-1.5` for compact table buttons).
- **Do** accompany button icons with `mr-2 w-4 h-4` (or `ml-2` for trailing arrows) and ensure vertical alignment with text.
- **Do** use standard semantic color badges (`emerald`, `amber`, `rose`, `slate`) for status representations.
- **Do** use `tabular-nums` on all numerical data columns, dates, times, and financial figures.
- **Do** preserve the official printable format on SOP print layouts (such as Power Pro ID forms).

### Don't:
- **Don't** use arbitrary colors (`bg-blue-600`, `bg-purple-600`, `bg-indigo-600`) for primary buttons.
- **Don't** mix corner radius styles on the same view (e.g. sharp `rounded-none` or `rounded-sm` buttons next to `rounded-xl` inputs).
- **Don't** make secondary buttons look like disabled primary buttons; keep them clean white with a clear slate border and dark text.
- **Don't** use filled colored backgrounds for table action icons (e.g., bright blue or green squares behind edit/delete icons); use sleek ghost buttons with contextual hover colors.
- **Don't** use pure black text (`#000000`); use `#0F172A` (slate-900) for headers and `#475569` (slate-600) for body copy.
