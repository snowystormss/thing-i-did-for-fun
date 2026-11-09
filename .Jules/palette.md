# Palette's Journal - Critical UX & Accessibility Learnings

## 2025-05-15 - Async Export States & Search Input Accessibility
**Learning:** In code explorer web apps where users download large packages or filter deep directory trees, async primary actions need explicit loading spinners, ARIA live feedback, and quick clearing mechanisms on filter inputs to provide tactile responsiveness for screen readers and keyboard users alike.
**Action:** When adding primary download/export buttons, include `Loader2` animated spinning indicators, `aria-live="polite"` feedback, and `focus-visible` ring indicators with a quick clear action on search inputs.

## 2025-05-18 - Search Filter Zero-Match Empty States in Hierarchical Trees
**Learning:** When users filter nested code trees, reaching zero matching files should never collapse into an empty container or push content out of view. Displaying a clear contextual empty state with an actionable "Clear filter" button and `role="listbox"` / `role="option"` with `aria-selected` improves both visual feedback and assistive technology navigation.
**Action:** In search-filtered lists and trees, pair the zero-match fallback with clear query echoing, an immediate reset button, and maintain semantic listbox/option ARIA roles with keyboard `focus-visible` indicators.
