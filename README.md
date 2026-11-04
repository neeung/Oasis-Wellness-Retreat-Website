# Oasis · Thai activity search and booking

Updated from Figma `RtBupSFu2pAAZh3NsbP1FS`, Thai flow `22:6647`, typography `22:7819`, and colors `17:2714`.

## Experience

Four connected views follow the supplied Figma layout: homepage → activity results → activity details → package booking form. Search destination, dates and guest count carry through the flow. Filters, price sorting, saved activities, itinerary accordions, gallery, room choice, price calculation, form validation and demo confirmation are interactive.

All 77 exact Figma image/icon assets are stored locally. Photography and logos were extracted from the supplied `Oasis.fig` archive, matched using the original Figma image hashes. SVGs were exported from their original design nodes. `assets/figma/provenance.json` records the source layers and hashes.

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
