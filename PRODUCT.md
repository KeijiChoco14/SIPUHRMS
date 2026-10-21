# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are all Swiss-Belinn SKA Pekanbaru hotel staff across roles — front office, housekeeping, F&B, IT, HRD, supervisors, and general management — using SIPU on-shift from hotel workstations and personal phones for attendance, task boards, leave and overtime requests, payroll views, documents, and IT requests (tickets, Power Pro user IDs). Role-based permissions distinguish Super Admin, HRD, General Manager, Supervisor, Employee, and IT.

## Product Purpose

SIPU (Sistem Informasi Pengelolaan Usaha) is an internal office management system that unifies HR, operations, and IT workflows for one hotel property. It replaces paper forms, spreadsheets, and ad-hoc chat approvals with a single workspace for assignments, attendance, payroll, performance, documents, announcements, and IT support. Success is day-to-day adoption by hotel staff and complete coverage of the SOPs the property currently runs on paper.

## Positioning

SIPU is primarily an internship deliverable for Swiss-Belinn SKA Pekanbaru. Positioning is correctness, coverage of the property's real SOPs and roles, and faithfulness to Swiss-Belinn brand presentation — not market differentiation against commercial HRMS products.

## Operating Context

- Shift-based hotel operation: attendance clock-in/clock-out, shift schedules, overtime, and leave approvals follow hotel rhythms, not standard office hours.
- Role-scoped approval chains: requests (leave, overtime, Power Pro user ID) route to the correct Head of Department (HOD), HRD, and IT in sequence; HOD routing is driven by the submitter's role/department.
- Printable SOP outputs: certain forms (e.g. Power Pro user ID request) have an official printable layout that mirrors the hotel's existing paper SOP and is produced from the system.
- Mixed devices: used on hotel back-office PCs and on staff phones in operational areas.

## Capabilities and Constraints

- Modules present in the codebase: Dashboard, Attendance, Leave, Overtime, Shift, Schedule, Payroll, Performance, Tasks (Kanban), Projects, Documents, Announcement, Directory, Organization, Profile, Administration, Master Key, IT (Overview, Tickets, Power Pro user ID requests).
- Stack is fixed: Laravel 11 + PHP 8.2+, Inertia.js + React 18 + TypeScript, Tailwind CSS 3, MySQL/PostgreSQL, Laravel Breeze (auth), Spatie Laravel Permission (authorization), Recharts for charts, Headless UI for primitives.
- Role model (Spatie): Super Admin, HRD, General Manager, Supervisor, Employee, IT. Permission scoping and HOD notification routing are load-bearing and must be preserved by future work.
- Interface language: Indonesian-first with English technical terms where idiomatic for hotel staff; printable SOP forms follow the property's existing bilingual conventions.
- Open: no formal accessibility standard has been established; no production deployment target recorded beyond the Vercel config present in the repo.

## Brand Commitments

- Swiss-Belinn primary red `#E31B23` is the brand color and is already mapped as `indigo-600` in `tailwind.config.js`; IT module and forms were explicitly re-themed to this red (recent commits).
- Typography is Inter across the app.
- Property name: Swiss-Belinn SKA Pekanbaru. System name: SIPU.
- Printable SOP outputs (e.g. Power Pro user ID request) must stay faithful to the hotel's official printed format.

## Evidence on Hand

- `README.md` — product summary, feature list, stack, install steps.
- `ERD.md` — data model.
- `SIPU_Management_System_Presentation.pptx` — stakeholder-facing deck.
- `resources/js/Pages/**` — all shipped surfaces (Attendance, Payroll, IT/PowerPro, Tasks, etc.).
- `tailwind.config.js` — brand red + Inter.
- No real customer testimonials, benchmarks, pricing, or external case studies exist; future work must not fabricate them.

## Product Principles

1. Match the property's real SOPs and role hierarchy before adding features.
2. Preserve role-scoped routing and permissions — correctness of who-sees-and-approves-what outranks visual ambition.
3. Printable outputs mirror the official hotel form; digital screens may be refined, printed artifacts stay faithful.
4. One property, one workspace: avoid multi-tenant abstractions the deliverable does not need.
5. Keep the Swiss-Belinn red and Inter identity consistent across every module.

## Accessibility & Inclusion

No formal accessibility standard has been established for this internship deliverable. Future work should at minimum keep text contrast legible on the red primary and ensure forms are keyboard-operable, but no WCAG target is confirmed.
