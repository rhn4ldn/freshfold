# Star Clean Laundry

A responsive single-page website for Star Clean Laundry (Sumenep), built with semantic HTML, hand-written CSS, and vanilla JavaScript. No frameworks, no build step.

> Business details (address: Perum BSA, Jl. Kemuning III No.10 Blok-G, Kolor, Sumenep; WhatsApp 0823398889) are the live details for Star Clean Laundry. Testimonials are examples and should be replaced with verified customer reviews.

## Features

- Editorial, responsive layout with desktop and mobile navigation.
- Live price calculator for per-kg and per-item services, add-ons, express service, and pickup/delivery.
- Booking request flow with inline validation, a review dialog, a LocalStorage draft, and a prefilled WhatsApp handoff.
- Service-area checker, FAQ accordion, scroll reveal, back-to-top, and reduced-motion support.
- Semantic landmarks, visible focus states, keyboard-operable controls, and WCAG AA contrast audited with axe-core.

## Quick start

No installation is required. A local server is recommended so the Google Maps embed and external links behave consistently.

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Open `http://127.0.0.1:4173/`.

You can also open `index.html` directly in a browser. The layout and calculator work from `file://`, but some browsers restrict embedded maps or external requests.

## Project structure

```text
laundry/
├─ index.html
├─ README.md
├─ css/
│  ├─ style.css
│  ├─ components.css
│  └─ responsive.css
├─ js/
│  ├─ config.js
│  ├─ services.js
│  ├─ main.js
│  ├─ calculator.js
│  └─ booking.js
└─ assets/
   ├─ favicon.svg
   ├─ favicon-32.png
   ├─ favicon-180.png
   └─ images/
      ├─ hero-laundry.jpg
      ├─ wash-fold.jpg
      ├─ ironing.jpg
      ├─ dry-cleaning.jpg
      ├─ bedding.jpg
      ├─ laundry-process.jpg
      └─ pickup-basket.jpg
```

Scripts load in dependency order at the end of `index.html`:

```text
config.js -> services.js -> main.js -> calculator.js -> booking.js
```

## Customization

### Business details

Edit `js/config.js`:

| Field | Purpose |
| --- | --- |
| `brandName` | Brand name used in generated messages and metadata. |
| `whatsappNumber` | Destination for WhatsApp links. Use international digits only, for example `6281234567890`; no `+`, spaces, or dashes. |
| `whatsappDisplay` | Visible phone number in the page. |
| `email`, `instagramDisplay`, `instagramUrl` | Contact links. |
| `addressLine1`, `addressLine2`, `addressQuery` | Visible address and the query used by Google Maps. Update all three when moving. |
| `hours` | Opening hours; `day` values are English weekday names used by the “today” marker. |
| `pickupWindow`, `deliveryWindow`, `pickupFee`, `minimumOrder` | Copy shown in the pickup and pricing sections. |
| `deliveryFee`, `freeDeliveryFrom` | Numeric pickup/delivery fee and free-delivery threshold in rupiah. |
| `pickupSlots`, `deliveryPreferences` | Options shown in the booking form. |
| `serviceAreas` | District list. `available: true` districts appear in the booking select; all districts appear in the area checker. |
| `draftKey`, `draftTtlDays` | LocalStorage draft identity and lifetime. |
| `bookingWindowDays` | Maximum number of days ahead a pickup can be requested. |
| `closedWeekdays` | Days the business is closed. `0` is Sunday. |
| `maxInstructions` | Maximum characters for booking instructions. |
| `messages.generic` | Default WhatsApp message for general contact links. |

### Pricing and services

Edit `js/services.js`. The main arrays are `SERVICES` and `ADDONS`.

Each service supports:

- `id`, `name`, `description`
- `pricingType`: `"weight"` or `"item"`
- `unit`, `unitPlural`
- `minQty`, `minLabel`
- `basePrice`
- `showFrom`: whether the UI says “Mulai” before the price
- `turnaround`, `expressEligible`, `expressTurnaround`
- `variants`: item types with their own `id`, `name`, and `price`

The pricing tables, calculator options, booking options, and estimates render from this data. The 50% express surcharge and delivery-fee logic live in `calculateQuote()` in the same file. If you change those rules, also update the visible copy in `index.html`, such as “Express +50%” and “targets 24 hours”.

Static fallback values in the service cards and the `<noscript>` text in `index.html` should also be updated so no-JavaScript visitors see consistent prices. Currency formatting uses `Intl.NumberFormat("id-ID")` and Indonesian rupiah.

### Booking flow

`js/booking.js` handles:

- Inline validation, including pickup date, WhatsApp number format, and required fields.
- Pickup dates within the booking window and closed weekdays.
- Draft saving in LocalStorage, with expiry and a clear-draft event.
- A native `<dialog>` review step.
- A prefilled Indonesian WhatsApp message.

The form does **not** send, store, or confirm an order. The customer must send the WhatsApp message, and the business confirms availability manually. To connect a backend, replace or supplement the final WhatsApp handoff in `booking.js`.

### Images and favicons

Replace files in `assets/images/` while keeping the same filenames, or update the paths in `index.html` and `css/style.css`. Keep similar aspect ratios to avoid layout shifts.

Favicons are `assets/favicon.svg`, `assets/favicon-32.png`, and `assets/favicon-180.png`. Replace them and update the `<link>` tags if you change filenames.

### Map

The map is a keyless Google Maps embed built from `config.addressQuery`:

```text
https://www.google.com/maps?q=...&output=embed
```

It loads lazily. For production, consider the official Google Maps Embed API with a restricted key, or a static map image, especially if you need consistent branding or privacy behavior.

### Colors and typography

Design tokens are in the `:root` block of `css/style.css`. Fonts are Lora for headings and DM Sans for body text, loaded from Google Fonts in `index.html`. Update the font links and the CSS family declarations together. The interface copy is written in Indonesian (`lang="id"`).

## Deployment

This is a static site. Any static host can serve it.

### Vercel

1. Push the project to a Git repository.
2. Import the repository in Vercel.
3. Choose **Other** as the framework preset.
4. Leave the build command empty and set the output directory to `.`.
5. Deploy.

No environment variables are required.

### Netlify, Cloudflare Pages, or GitHub Pages

Publish the repository root. There is no build step. For GitHub Pages, place the files at the branch/root configured in the repository settings.

### Traditional hosting

Upload `index.html`, `css/`, `js/`, and `assets/` to the web root. Serve over HTTPS.

For best social previews, replace the relative `og:image` and `twitter:image` paths in `index.html` with absolute production URLs.

## Accessibility and QA

The site was checked with axe-core using the WCAG 2.0 and 2.1 A/AA rule sets at 1440×1000 and 390×844, with no reported violations at the last run. A Puppeteer browser suite also passed 113 checks covering navigation, the calculator, booking validation, drafts, and the mobile menu.

Automated checks are not a guarantee. After changing content, styles, or form behavior, recheck:

- Keyboard tab order and focus visibility.
- Mobile menu open/close behavior and focus.
- The review dialog and Escape behavior.
- Form errors and success paths.
- Reduced-motion behavior.
- Color contrast for any new colors or translucent text.
- Prices and totals in the calculator and booking summary.

## Browser support

Modern evergreen Chrome, Edge, Firefox, and Safari. The site uses CSS custom properties, `<dialog>`, `Intl`, and modern layout features. Internet Explorer is not supported.

## Demo limitations

- No backend, database, payment processing, or live availability.
- Estimates are illustrative; the final price is confirmed after the order is inspected.
- WhatsApp opens with a prefilled message. Sending is manual, and the order is not confirmed until the business replies.
- The area checker uses a static district list. It does not use GPS or live coverage data.
- The booking draft is stored only in the current browser on the current device and expires after seven days.
- Testimonials are fictional and should be replaced with real, permissioned customer feedback.
- The address, map location, WhatsApp number, and pickup/delivery windows are provided by the business. Testimonials are fictional; email, Instagram, and opening hours are not yet confirmed and are configurable in `js/config.js`.

## Photography credits

The demo photographs are from [Unsplash](https://unsplash.com) and are used under the [Unsplash License](https://unsplash.com/license). They are placeholders for this portfolio demo.

Files:

- `assets/images/hero-laundry.jpg`
- `assets/images/wash-fold.jpg`
- `assets/images/ironing.jpg`
- `assets/images/dry-cleaning.jpg`
- `assets/images/bedding.jpg`
- `assets/images/laundry-process.jpg`
- `assets/images/pickup-basket.jpg`

Photographer names are not embedded in the downloaded files. Locate the original Unsplash pages if you need to credit individual photographers, or replace the images with your own licensed photography before production.

## License

No license has been assigned to this project. Add a `LICENSE` file if you plan to publish or distribute the code.
