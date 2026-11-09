# Oasis · Thai activity search and booking

Updated from Figma `RtBupSFu2pAAZh3NsbP1FS`, Thai flow `22:6647`, typography `22:7819`, and colors `17:2714`.

## Experience

Four connected views follow the supplied Figma layout: homepage → activity results → activity details → package booking form. Search destination, dates and guest count carry through the flow. Filters, price sorting, saved activities, itinerary accordions, gallery, room choice, price calculation, form validation and demo confirmation are interactive.

All 77 original Figma image/icon assets are stored locally. Three low-resolution photographs now use AI-enhanced versions requested by the user; the original files are retained. `assets/enhanced/provenance.json` records those replacements. Photography and logos were extracted from the supplied `Oasis.fig` archive, matched using the original Figma image hashes. SVGs were exported from their original design nodes. `assets/figma/provenance.json` records the source layers and hashes.

Google Sans Flex, Cormorant Garamond and LINE Seed Sans TH font files are included locally. Colors follow the supplied pine green, warm sand, off white, sage and warm linen palette. No runtime Figma or font-server requests are needed.

## Run

```sh
npm ci
npm run dev
```

Open `http://localhost:4173`. Serving over HTTP is required for the HTML views. No production dependencies, server API or build step are needed.

## Checks

```sh
npm run check
npm test
npm run check:assets
```

Syntax, DOM interaction and all 77 asset checks pass. Chromium checks cover the full search-to-confirmation flow, desktop/mobile layouts at 1440px and 390px, image loading and JavaScript errors. Screens were visually checked against the supplied design.

DOM tests cover search navigation, filters, sorting, saved activity persistence, guest and room pricing, transfer to checkout, required fields, safe confirmation rendering, no sensitive local persistence and switching activity details.

## Deploy

The GitHub Pages workflow checks the application, tests interactions and validates local assets before packaging the site. Pushes to `main` trigger deployment. The static package includes the HTML views, design declarations, fonts and images.

Expected URL: https://neeung.github.io/Oasis-Wellness-Retreat-Website/

## Demo boundaries

Checkout is a frontend demonstration, as indicated in Figma. No reservation, card charge, email or personal-data transmission occurs. Names, email, phone, notes and demo card inputs stay in memory and are cleared when navigating away. Only saved activity IDs and non-personal trip preferences are stored locally. Totals use the chosen per-person package rate, THB 500 service fee per guest and 7% tax on package plus service fee; the initial two-person suite total is THB 39,590.

## Asset provenance

- Layout and copy: supplied Oasis Figma frames; `data-node-id` attributes retain the design mapping.
- Google font files: Google Fonts CSS distribution, downloaded November 4, 2026.
- Thai font files: LINE Seed Sans TH 1.000, © LINE 2020–2022, distributed by `@fontpkg/line-seed-sans-th` 1.0.1.

## Homepage interactions

Photography fills its responsive frame using `object-fit: cover`, preserving proportions. Pointer hover adds a subtle image-only zoom within the clipped frame. Homepage sections reveal once as they enter the viewport. Reduced-motion preferences disable these effects, keyboard focus reveals focused content, and unsupported browsers show content normally. Other routes retain their existing behavior.

With the local server running and Chromium available, run `npm run test:home` for hover, responsive image geometry at six widths, scroll reveals, reduced-motion and route scope checks.

The large homepage hero rotates three local Figma photographs: the original mountain resort, yoga on the terrace and the open-air spa. Photos hold for three seconds and fade in over 1.1 seconds above the previous opaque image. Captions follow the selected photo; the inset tea photo stays fixed. Dots allow direct selection, and the pause button stops rotation. Autoplay pauses on mouse hover, keyboard focus, hidden tabs and when the hero is outside the viewport. Reduced-motion preferences stop autoplay and remove fades while retaining manual selection. Images decode before rotation, failed photos are skipped, and route changes dispose of timers and listeners. Run `npm run test:hero` to verify the full loop and these controls in Chromium.

## Responsive layout

`responsive.css` owns mobile-first layout rules using Bootstrap 5 breakpoints: xs below 576px, sm 576px, md 768px, lg 992px, xl 1200px, xxl 1400px. The Bootstrap framework is not required. Container widths, navigation, activity grids, sidebar filters, galleries and checkout columns adapt at these tiers. Reference: https://getbootstrap.com/docs/5.0/layout/breakpoints/

Run `npm run test:responsive` against the local server to verify all four routes at 13 widths, including both sides of each breakpoint.

## Currency selection

The header selector supports THB (Thai baht), USD (US dollar) and CNY (Chinese yuan) across all four views. The choice is remembered locally. Activity prices, budget fields, applied chips, booking calculations and confirmation follow that choice without replacing form inputs. Budget bounds remain in THB internally to prevent drift when switching currencies. Monetary text uses LINE Seed Sans TH.

Conversion uses a fixed reference snapshot, not a live feed: EXIM Thailand selling rates, November 6, 2026, round 1 — THB 33.58 per USD and THB 5.06875 per CNY. Source: https://www.exim.go.th/TH/exchange_rate/exchange.aspx . The dated rate notice appears below each footer. Update the `exchange` constants and notice together when refreshing rates. Foreign prices display two decimal places. Booking totals use the rounded converted unit price times guests, the converted service fee, then 7% tax, so displayed line items add up to the total.

Run `npm run test:currency` with the local server running for conversions, persistence, stable budget bounds, pending filters, reconciled totals, preserved checkout inputs and foreign-currency responsive layouts.

## Shared interactive controls

`ui.js` and `ui.css` provide the Oasis dropdown, calendar, text-field, checkbox, button and focus states across all four pages. Rounded white popovers, pine primary highlights, checkmarks, subtle shadows and sage focus surfaces follow the site's existing tokens. Native form controls retain their values and original change handlers underneath the custom presentation; no framework or production package is added.

Dropdowns support pointer/touch, arrows, Home/End, typing to find an option, Enter/Space, Escape, Tab and outside dismissal. They use combobox/listbox semantics and a single active option. Popovers use the browser's top layer when available and reposition within the visible viewport. The Thai calendar supports date limits, month navigation, arrows, Home/End, PageUp/PageDown, today's date and focus restoration. Reduced-motion preferences disable popup animation.

Run `npm run test:ui` with the local server running to verify real mouse/keyboard controls, branded hover/focus, calendar state, validation, price calculations, form preservation and popup bounds at every Bootstrap boundary. GitHub Pages includes both UI files and checks their syntax before publishing.
