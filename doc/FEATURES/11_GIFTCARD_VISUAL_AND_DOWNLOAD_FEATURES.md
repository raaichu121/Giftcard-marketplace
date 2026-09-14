# Gift Card Visual and Download Features

## 1) Purpose

This feature provides the frontend visual presentation of gift cards, including dynamic card rendering with occasion-based templates, live previews during purchase, and downloadable card images.

## 2) Frontend components

### GiftCard component

Main file:

- `giftcard-frontend/src/components/giftnow/GiftCard.tsx`

What it does:

- Renders a styled gift card with either a selected occasion template image or a default gradient background.
- Overlays the card value (amount) at a configurable position and color defined by the `valueBox` and `valueColor` properties from the occasion card template.
- Displays recipient info and code (masked or revealed based on purchase state).
- Supports multiple sizes (`full`, and smaller variants).
- Uses the `id="gift-card-print"` attribute to enable screenshot-based download.

Props:

- `imagePath` — path to occasion card template image
- `valueBox` — positioning object `{ top, right, width }` for amount overlay
- `valueColor` — hex color for amount text
- `amount` — face value in NPR
- `recipient` — recipient identifier shown on card
- `code` — the gift card code
- `shouldShowCode` — controls code visibility
- `size` — render size variant

### CardPicker component

Main file:

- `giftcard-frontend/src/components/giftnow/CardPicker.tsx`

What it does:

- Displays available occasion themes with their associated card templates.
- Allows the user to browse occasions and select a specific card design during purchase.
- Selected card design flows into the `GiftCard` preview and is sent as `cardDesignId` with the purchase request.

### CardDownload component

Main file:

- `giftcard-frontend/src/components/giftnow/CardDownload.tsx`

What it does:

- After a successful purchase, renders a download button.
- Uses `html2canvas` or similar approach to capture the rendered `GiftCard` DOM element as a PNG image.
- Downloads the image file with a filename like `giftnow-card-GN-XXXX-XXXX-XXXX-XXXXXXXX.png`.

## 3) Where these components are used

- **Purchase flow** (`giftcard-frontend/src/app/giftnow/buy/page.tsx`):
  - `CardPicker` for design selection
  - `GiftCard` for live preview (right panel)
  - `CardDownload` for post-purchase download

## 4) Backend support

- `GET /api/v1/gift-cards/occasions` — returns active occasions with their card templates
- Card template images are stored in `giftcard-frontend/public/cards/{slug}/` and served as static files
- Admin can upload template images via `POST /api/v1/gift-cards/occasions/admin/upload-card`

## 5) Tech used in this feature

- React components with dynamic styling and image overlays
- CSS positioning for value overlay on card templates
- DOM-to-image screenshot capture for card download
- Next.js static file serving from `/public` directory