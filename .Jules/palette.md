# Palette's Journal - Critical UX & Accessibility Learnings

## 2025-05-15 - Async Export States & Search Input Accessibility
**Learning:** In code explorer web apps where users download large packages or filter deep directory trees, async primary actions need explicit loading spinners, ARIA live feedback, and quick clearing mechanisms on filter inputs to provide tactile responsiveness for screen readers and keyboard users alike.
**Action:** When adding primary download/export buttons, include `Loader2` animated spinning indicators, `aria-live="polite"` feedback, and `focus-visible` ring indicators with a quick clear action on search inputs.
