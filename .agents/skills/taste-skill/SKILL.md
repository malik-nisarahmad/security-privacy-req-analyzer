---
name: taste-skill
description: Gives AI good taste. Stops the AI from generating boring, generic, blue-gradient SaaS interfaces. Enforces editorial typography, purposeful macro-whitespace, subtle 1px borders, and refined micro-interactions.
---

# Taste Skill: Editorial Minimalism & Purposeful Interface Design

## Core Directives
1. **Typography as Structure**:
   - Rely on high typographical contrast rather than boxes inside boxes.
   - Headings use tight tracking (`tracking-tight` or `-0.03em`), proportional line heights (`1.15` to `1.25`).
   - Monospace font (`Geist Mono`, `SF Mono`) for system identifiers, codes, metadata, and formulas.
   - Micro-labels (`text-[10px] uppercase tracking-wider font-semibold text-zinc-500`).

2. **Color Economy (Warm Monochrome + Spot Pastels)**:
   - Primary canvas: Rich obsidian `#09090b` or zinc `#0c0c0e` in dark mode; warm bone `#fcfcfc` or `#f8fafc` in light mode.
   - Cards and containers: Elevated `#121215` / `#18181b` with subtle `1px solid rgba(255, 255, 255, 0.08)`.
   - Accent colors are strictly semantic and desaturated:
     - Protection & Notice: Soft desaturated emerald (`#10b981` at 10-15% opacity tint)
     - Vulnerabilities & Attacks: Soft desaturated amber (`#f59e0b` at 10-15% opacity tint)
     - Formal Requirements: Soft indigo/violet (`#6366f1` at 10-15% opacity tint)
     - Technical Specifications: Slate/zinc neutral tones
   - Reject loud primary blues and rainbow gradients across every card.

3. **Restrained Layout**:
   - Bento grids with asymmetric balance.
   - Generous vertical padding (`py-16` to `py-24`).
   - Cards have crisp borders (`rounded-xl` or `rounded-2xl`, maximum `12px` to `16px`).
   - Avoid heavy drop shadows; prefer ultra-fine 1px border contrast.

4. **Micro-Interactions**:
   - Fluid transitions (`duration-200 ease-out`).
   - Subtly elevate hovered cards with soft border lightening (`hover:border-zinc-700`).
   - Buttons respond cleanly with micro-scale (`active:scale-[0.98]`).
