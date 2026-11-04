# Oasis Wellness Retreats

A responsive, interactive static website with four connected pages: homepage, search and listing, retreat detail, and booking/checkout. Additional saved-retreat, philosophy, and demo membership views are included.

## Run locally

Requires Python 3 and Node.js 24 (Node is only needed for checks/tests).

```sh
npm ci
npm run dev
```

Open the server on port 4173. No build, API keys, database, or production dependencies are required. Hash-based routes work under the GitHub Pages repository path and on refresh.

## Validate

With the development server running:

```sh
npm run check
npm test
```

Browser tests use `/usr/bin/chromium`; set `CHROMIUM_PATH` for another installation. Tests cover filtering, saved state, detail-to-checkout selection, live totals, demo confirmation, membership, responsive overflow, mobile navigation, reduced motion, and browser errors. External image/font requests are blocked during tests to verify the included SVG fallback.

## Publish

The `pages.yml` workflow deploys the static site on pushes to `main`. In repository Settings → Pages, select **GitHub Actions** as the source, then run the workflow if needed. The expected address after a successful deployment is `https://neeung.github.io/Oasis-Wellness-Retreat-Website/`.

## Scope and content

This is a frontend demo. Prices, retreat inventory, ratings, testimonials and membership benefits are illustrative. Checkout never collects card data, takes payment, sends email, or makes real reservations. Booking and member personal data are neither stored nor transmitted. Only saved retreat IDs and non-personal trip preferences are stored locally. A production booking service needs a backend, confirmed inventory, provider terms, and a payment provider.

The supplied Figma URL was blocked by the environment's network policy during implementation. Visual design is an independent interpretation of the requested page structure, not a verified reproduction of the Figma frames. For exact matching, provide exported frames and design assets or enable access to the file.

Photography is requested from Unsplash, fonts from Google Fonts; both have system/local fallbacks. The SVG landscape and favicon are original local artwork. No runtime npm dependencies are needed.
