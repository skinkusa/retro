# iOS Screen Optimization (SwiftUI + SpriteKit build)

When building the native Retro Manager app, optimize for iOS screens as follows so the app feels native and works well on all supported devices.

---

## 1. Device range and size classes

- **Target**: iPhone (SE through Pro Max); optionally iPad (same codebase with adaptive layout).
- Use SwiftUI **size classes** (`@Environment(\.horizontalSizeClass)`, `@Environment(\.verticalSizeClass)`) to:
  - Use **compact** horizontal for single-column layouts on iPhone portrait.
  - Use **regular** horizontal on iPad (or iPhone Plus/Max landscape) for side-by-side or wider content (e.g. squad list + player detail).
- Respect **safe area** everywhere: no content under notch or home indicator; use default safe area insets and avoid `.edgesIgnoringSafeArea` unless intentional (e.g. full-screen match scene with its own safe padding).

---

## 2. Touch targets and spacing

- **Minimum touch target**: 44×44 pt for all tappable elements (buttons, list rows, tab bar items, formation slot taps). Use `buttonStyle`, padding, or `frame(minHeight: 44)`.
- **List rows**: Use `List` or explicit row height so rows are easy to tap; avoid tiny text-only rows.
- **Spacing**: Enough vertical spacing in forms and between sections so the UI doesn't feel cramped on small screens (e.g. iPhone SE).

---

## 3. Navigation and tabs

- **Tab bar**: Five main tabs (HUB, SQUAD, WORLD, MARKET, CLUB) can overflow on iPhone. Options:
  - **Regroup**: e.g. "Club" tab containing Finance, Staff, Records, Settings (with internal list or sub-tabs).
  - Or keep five tabs and use system tab bar (labels may shorten); test on smallest device.
- **Navigation**: Use `NavigationStack` (iOS 16+) with push/drill-down for squad → player profile, fixture list → match, market → player detail, messages → message detail. Use **sheets** for modal flows (e.g. new bid, contract renewal, team picker at start).
- **iPad**: Consider **sidebar** (`NavigationSplitView`) for HUB/SQUAD/WORLD/MARKET/CLUB with detail pane (e.g. squad list | player detail).

---

## 4. Typography and readability

- **Dynamic Type**: Use semantic styles (`.headline`, `.body`, `.caption`) or scaled fonts so the app respects the user's text size setting.
- **Dense data**: League tables and squad lists are data-heavy. On small screens:
  - League table: Consider horizontal scroll for columns, or a condensed "key columns only" view with "See full table" for full width.
  - Squad list: Prioritize name, position, condition, key stat; full attributes on detail screen.
- **Contrast**: Keep the existing retro palette (#20262C background, #6699CC primary, #26D9D9 accent) and ensure text contrast meets accessibility (use `Color` with sufficient contrast ratios).

---

## 5. Match scene (SpriteKit)

- **Aspect ratio and safe area**: Match scene should fill the screen but keep scoreboard and main commentary within safe area (inset from top/bottom). Use `safeAreaInsets` or a fixed padding so nothing is clipped by notch or home indicator.
- **Commentary ticker**: Font size readable on smallest device; consider allowing Dynamic Type or a user setting for text size in match view.
- **Scoreboard**: Large enough to read at a glance; touch targets for any buttons (e.g. "Simulate to end", "Back") at least 44 pt.
- **Orientation**: Decide whether match is portrait-only or supports landscape; if landscape, ensure layout (scoreboard, pitch, commentary) scales and doesn't feel stretched on long/narrow screens.

---

## 6. Forms and keyboard

- **Inputs**: Transfer bid amount, manager name, contract wage/years, etc. Use `TextField` inside `Form` or `ScrollView` so the view can adjust when the keyboard appears.
- Avoid keyboard covering the primary action (e.g. "Submit bid"): use `scrollDismissesKeyboard` or scroll to focused field; consider `.toolbar { ToolbarItemGroup(placement: .keyboard) { ... } }` for "Done"/"Next" if needed.

---

## 7. Orientation and compact width

- **Portrait-first**: Management sims are often used one-handed in portrait; prioritize portrait layout for all main screens.
- **Compact width**: In compact horizontal size class, use single column; stack elements vertically; collapse "side-by-side" layouts into stacked or tabbed sections.

---

## 8. Performance and lists

- **Long lists**: Squad (20+), player market (many players), messages (many items). Use `List` or `LazyVStack` so only visible rows are created; avoid loading full content into memory for very long lists if you later add pagination or filtering.
- **SpriteKit**: Run match simulation on a background queue if it's heavy; update UI on main thread. Keep SpriteKit node count reasonable (commentary lines, scoreboard, pitch dots) so frame rate stays smooth on older devices.

---

## 9. Summary checklist

- [ ] Size classes used for compact vs regular layouts; safe area respected.
- [ ] All interactive elements ≥ 44×44 pt; list rows and buttons comfortable to tap.
- [ ] Tab bar or navigation structure works on smallest iPhone (e.g. SE) without overflow or truncation.
- [ ] Dynamic Type / readable fonts; dense tables have a small-screen strategy.
- [ ] Match scene layout and scoreboard/commentary respect safe area and readability.
- [ ] Keyboard doesn't cover key inputs; forms scroll or adjust.
- [ ] Portrait-first; compact width uses single-column or stacked layout.
- [ ] Long lists use lazy loading; match simulation doesn't block main thread.

Incorporating these points into the implementation plan will keep the native app optimized for iOS screens while maintaining full functionality.
