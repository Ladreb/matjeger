# UX second opinion (blind pass), 2026-10-11

Written by the `ux-reviewer` agent without reading `docs/UX-REVIEW-2026-10-11.md`. Saved here by the main session because the agent is read-only. Phone 375 px in light and dark, plus 1280x800.

Not checked: camera scan, offline and failed saves, a user with no postal code, the ADMIN role, the admin edit page, 44 px tap target sizes, several tabs.
Test data touched: dev USER postal code set to 9990 and back to 0150, a Kiwi Lettmelk report at the existing 22,90, and a list item ticked and added/removed on the PRODUCT_ADMIN list (the USER list was not re-checked after).

## P1
1. **Ticked items stay in the total** (`/shopping-list`). Ticking Smør strikes through the item and its price in the plan card, but the total stays 71,80 kr. Idea: "Gjenstår: X kr", or do not strike through the price.
2. **Scan result shows no price and no "add to list"** (`/scan`). Only the name and a small link "Se priser og rapporter". Idea: cheapest price and chain on the result, plus "Legg til på handlelisten" and "Rapporter pris".
3. **Desktop has no max width.** Cap at about 480 to 640 px, centred.

## P2
4. Unknown barcode is a dead end (add "Søk etter navn", later "foreslå produkt").
5. Search rows show no price ("fra 21,90 kr hos Rema 1000").
6. Adding to the list gives weak feedback: "+" turns into a check, no toast, no "Se listen", cannot be toggled off.
7. Deleting a list item is immediate, no undo. The bin sits next to the + button.
8. The list checkbox is about 20 px. Make the row, or a 44 px area, tappable.
9. Postal code save has no confirmation and no place name ("Lagret: 0150 Oslo").
10. A postal code with no data has no links (to search, to change the postal code).
11. Report feedback is weak: small grey thanks, chain resets, old red error stays while sending. Highlight the updated row, keep the chain, clear the error on submit.
12. Price error message is generic. "0" should say the price must be above 0. An implausible price (2290 vs 22,90) was not tested.
13. Admin product list will not scale (no search, count, "uten priser" filter), reachable only from the profile.
14. Admins cannot remove a wrong price report and have no "Rediger produkt" link on the product page.

## P3
15. New-product form: strekkode looks required but one of barcode or PLU is enough. Error shows at the bottom and one at a time. Placeholder text is larger than field text.
16. Empty `/search` is blank (hint such as "Søk etter vare, for eksempel melk").
17. Product page has no back link (matters in a PWA).
18. "Se sammenligning" summary bar has small text and barely stands out.
19. Dev "N" badge overlaps the Skann icon (dev only).
20. Disabled "-" stepper is low contrast in dark mode.

Positive: totals and plan order were correct and stayed correct when the quantity changed (2 x Smør = 121,70 kr). Empty list page gives clear next steps. Stale warning shown for the 45 day old price. Dark mode readable.

## Comparison with the first review (main session)

**Both found, so high confidence:** no desktop max width, unknown barcode dead end, no price in search, no postal code confirmation or place name, empty search page, no admin search or filter, no admin tool for bad reports and no "Rediger" shortcut, stale/weak report form feedback, admin form rule not explained and error at the bottom.

**Only the blind pass found (new):**
- Scan result for a *known* product has no price or add-to-list (item 2). The first review only tested the unknown barcode, so this is a real gap in coverage. Fits the owner's U6 decision (quick add plus open the product).
- Total does not change when an item is ticked while the price is struck through (item 1). The shopping list doc says a tick only dims the item, so this is a mismatch between what the UI suggests and what happens. Needs an owner decision: either the tick means "in basket" and the total shows what is left, or the strike-through goes.
- No undo for delete, weak "added" feedback, small checkbox and a bin next to the + button (items 6, 7, 8).
- No links out of the "no data in this postal code" state (item 10). Cheap to fix before the nearby-prices feature exists.
- Zero price gets the generic message (item 12).
- No back link on the product page (item 17).

**Only the first review found:** a 2 990 kr price is accepted and replaces the real price at once (the blind pass did not test an implausible price), the stale "Takk" message detail, the "Gamle priser" style plan clutter (plans 2 and 3 worse in every way), the unbranded 404, the label/input link on the price field, inconsistent 16 vs 24 px padding, the cold-start problem as a launch risk.

**Disagreement:** none on direction. Desktop width: first review and the design brief suggest 576 to 672 px, the blind pass 480 to 640 px. The design brief's numbers fit all of these.
