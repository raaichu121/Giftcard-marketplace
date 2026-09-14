# GiftNow — Nepal Festival Gift Card Implementation Guide

> **Approach: Option B — Hybrid (Recommended)**
> Use your AI-generated PNG card designs as background images, then overlay dynamic amount, recipient name, and card code on top using CSS `position: absolute`.

---

## Why Option B?

| | Option A (Image only) | **Option B — Hybrid ✅** | Option C (Pure CSS) |
|---|---|---|---|
| Keeps your beautiful AI designs | ✅ | ✅ | ❌ Hard to match |
| Dynamic amount on card | ❌ | ✅ | ✅ |
| Dynamic recipient name | ❌ | ✅ | ✅ |
| Export card as PNG | ❌ | ✅ with html2canvas | ✅ |
| Easy to add new festivals | ✅ | ✅ Just add a PNG | ❌ Needs new component |
| Dev effort | Low | **Low** | High |

---

## Project Structure

```
giftnow/
├── public/
│   └── cards/
│       ├── dashain1.png          ← Your AI-generated card images
│       ├── dashain2.png
│       ├── diwali-light.png
│       ├── diwali-dark.png
│       ├── diwali-purple.png
│       ├── teej.png
│       ├── buddha.png
│       ├── losar.png
│       └── ...
│
├── src/
│   ├── data/
│   │   └── cards.ts              ← Card config (image path + overlay positions)
│   │
│   └── components/
│       ├── GiftCard.tsx          ← Main card component (image + overlays)
│       ├── CardPicker.tsx        ← Design selector grid for users
│       └── CardDownload.tsx      ← Export card as PNG
```

---

## Step 1 — Card Config (`src/data/cards.ts`)

Each card entry maps a design to:
- its PNG file path
- the position of the blank "GIFT CARD VALUE" box (you measure this per card)
- text colors that work on that background

```ts
export interface CardDesign {
  id: string
  name: string              // "Happy Dashain!"
  festival: string          // "Dashain"
  nepali: string            // "बडा दशैंको शुभकामना"
  image: string             // path under /public/
  // Position of the blank value box on the card (in %)
  // Measure by opening the PNG and finding where the box sits
  valueBox: {
    top: string             // e.g. "38%"
    right: string           // e.g. "6%"
    width: string           // e.g. "32%"
  }
  valueColor: string        // text color for the amount
  codeColor?: string        // text color for the card code (optional)
  season: 'autumn' | 'spring' | 'summer' | 'winter' | 'all'
}

export const CARD_DESIGNS: CardDesign[] = [
  {
    id: 'dashain1',
    name: 'Happy Dashain!',
    festival: 'Dashain',
    nepali: 'बडा दशैंको हार्दिक मंगलमय शुभकामना',
    image: '/cards/dashain1.png',
    valueBox: { top: '38%', right: '6%', width: '32%' },
    valueColor: '#1a1a2e',
    season: 'autumn',
  },
  {
    id: 'dashain2',
    name: 'Happy Dashain!',
    festival: 'Dashain',
    nepali: 'बडा दशैंको हार्दिक मंगलमय शुभकामना',
    image: '/cards/dashain2.png',
    valueBox: { top: '40%', right: '6%', width: '32%' },
    valueColor: '#1a1a2e',
    season: 'autumn',
  },
  {
    id: 'diwali-light',
    name: 'Happy Diwali!',
    festival: 'Tihar / Diwali',
    nepali: 'दीपावलीको हार्दिक शुभकामना',
    image: '/cards/diwali-light.png',
    valueBox: { top: '36%', right: '6%', width: '34%' },
    valueColor: '#2d1b00',
    season: 'autumn',
  },
  {
    id: 'diwali-dark',
    name: 'Happy Diwali!',
    festival: 'Tihar / Diwali',
    nepali: 'दीपावलीको हार्दिक शुभकामना',
    image: '/cards/diwali-dark.png',
    valueBox: { top: '36%', right: '6%', width: '34%' },
    valueColor: '#fde68a',
    season: 'autumn',
  },
  {
    id: 'diwali-purple',
    name: 'Happy Diwali!',
    festival: 'Tihar / Diwali',
    nepali: 'दीपावलीको हार्दिक शुभकामना',
    image: '/cards/diwali-purple.png',
    valueBox: { top: '36%', right: '6%', width: '34%' },
    valueColor: '#2d1b00',
    season: 'autumn',
  },
  {
    id: 'teej',
    name: 'Happy Teej!',
    festival: 'Haritalika Teej',
    nepali: 'तीजको हार्दिक मंगलमय शुभकामना',
    image: '/cards/teej.png',
    valueBox: { top: '38%', right: '6%', width: '32%' },
    valueColor: '#1a1a2e',
    season: 'autumn',
  },
  {
    id: 'buddha',
    name: 'Buddha Jayanti',
    festival: 'Buddha Purnima',
    nepali: 'बुद्ध जयन्तीको शुभकामना',
    image: '/cards/buddha.png',
    valueBox: { top: '38%', right: '6%', width: '32%' },
    valueColor: '#0f172a',
    season: 'spring',
  },
  {
    id: 'losar',
    name: 'Losar',
    festival: 'Tibetan New Year',
    nepali: 'लोसार मंगलमय होस्',
    image: '/cards/losar.png',
    valueBox: { top: '36%', right: '6%', width: '34%' },
    valueColor: '#0f172a',
    season: 'winter',
  },
]
```

> **Tip — finding the valueBox position:** Open your PNG in Figma or any image editor. The blank white box labeled "GIFT CARD VALUE" is where you'll overlay the amount. Measure its distance from the top and right edges as a percentage of the total card size.

---

## Step 2 — GiftCard Component (`src/components/GiftCard.tsx`)

This is the core component. It renders your PNG as a background and overlays the dynamic values.

```tsx
import Image from 'next/image'
import { CardDesign } from '@/data/cards'

interface GiftCardProps {
  design: CardDesign
  amount: number
  currency?: string          // default: 'Rs.'
  recipient?: string         // shown on card if provided
  code?: string              // card code e.g. "GIFT-ABCD-1234-EFGH"
  pin?: string               // 4-digit PIN
  showCode?: boolean         // only show code on the final delivered card
  size?: 'sm' | 'md' | 'lg' // sm=240px, md=400px, lg=560px
}

const SIZE_MAP = { sm: 240, md: 400, lg: 560 }

export default function GiftCard({
  design,
  amount,
  currency = 'Rs.',
  recipient,
  code,
  pin,
  showCode = false,
  size = 'md',
}: GiftCardProps) {
  const width = SIZE_MAP[size]

  return (
    <div
      id="gift-card-print"
      style={{
        position: 'relative',
        width: width,
        // 1.586 = standard credit card aspect ratio (85.6mm × 53.98mm)
        aspectRatio: '1.586',
        borderRadius: 16,
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* ── 1. Background image ── */}
      <Image
        src={design.image}
        alt={design.name}
        fill
        style={{ objectFit: 'cover' }}
        priority
      />

      {/* ── 2. Amount overlay — sits inside the blank "GIFT CARD VALUE" box ── */}
      <div
        style={{
          position: 'absolute',
          top: design.valueBox.top,
          right: design.valueBox.right,
          width: design.valueBox.width,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontSize: 'clamp(18px, 8cqw, 52px)',
            fontWeight: 900,
            color: design.valueColor,
            lineHeight: 1,
            fontFamily: "'Barlow Condensed', sans-serif",
          }}
        >
          {currency} {amount.toLocaleString('en-IN')}
        </span>
      </div>

      {/* ── 3. Recipient name (optional) ── */}
      {recipient && (
        <div
          style={{
            position: 'absolute',
            bottom: '18%',
            left: '4%',
            fontSize: 'clamp(9px, 2cqw, 13px)',
            color: design.valueColor,
            opacity: 0.75,
            fontWeight: 600,
          }}
        >
          To: {recipient}
        </div>
      )}

      {/* ── 4. Card code + PIN (only shown on final delivered card) ── */}
      {showCode && code && (
        <div
          style={{
            position: 'absolute',
            bottom: '4%',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: 'clamp(8px, 1.8cqw, 11px)',
              color: design.valueColor,
              opacity: 0.5,
              letterSpacing: '0.1em',
            }}
          >
            {code}
          </span>
          {pin && (
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: 'clamp(8px, 1.8cqw, 10px)',
                color: design.valueColor,
                opacity: 0.4,
              }}
            >
              PIN: {pin}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
```

---

## Step 3 — Card Picker (`src/components/CardPicker.tsx`)

The UI where users choose a design before buying.

```tsx
'use client'
import { useState } from 'react'
import Image from 'next/image'
import { CARD_DESIGNS, CardDesign } from '@/data/cards'

interface CardPickerProps {
  selected: CardDesign
  onSelect: (design: CardDesign) => void
  festival?: string   // filter to a specific festival (optional)
}

export default function CardPicker({ selected, onSelect, festival }: CardPickerProps) {
  const [filter, setFilter] = useState<string>('All')

  const festivals = ['All', ...Array.from(new Set(CARD_DESIGNS.map(c => c.festival)))]

  const filtered = filter === 'All'
    ? CARD_DESIGNS
    : CARD_DESIGNS.filter(c => c.festival === filter)

  return (
    <div>
      {/* Festival filter tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {festivals.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '5px 14px',
              borderRadius: 20,
              border: filter === f ? '2px solid #2563eb' : '1px solid #d1d5db',
              background: filter === f ? '#dbeafe' : '#fff',
              color: filter === f ? '#1d4ed8' : '#374151',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Card grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 12,
        }}
      >
        {filtered.map(design => (
          <div
            key={design.id}
            onClick={() => onSelect(design)}
            style={{
              border: selected.id === design.id ? '2px solid #2563eb' : '1px solid #e5e7eb',
              borderRadius: 14,
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'transform 0.15s, border-color 0.15s',
            }}
          >
            <div style={{ position: 'relative', aspectRatio: '1.586', width: '100%' }}>
              <Image
                src={design.image}
                alt={design.name}
                fill
                style={{ objectFit: 'cover' }}
              />
              {selected.id === design.id && (
                <div
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 8,
                    background: '#2563eb',
                    color: '#fff',
                    borderRadius: '50%',
                    width: 20,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  ✓
                </div>
              )}
            </div>
            <div style={{ padding: '8px 10px', background: '#fff' }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{design.festival}</div>
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 1 }}>{design.name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## Step 4 — Export Card as PNG (`src/components/CardDownload.tsx`)

When a card is purchased, render it as a downloadable/emailable high-res PNG.

```bash
# Install dependency
npm install html2canvas
```

```tsx
'use client'
import html2canvas from 'html2canvas'

interface CardDownloadProps {
  cardElementId?: string   // default: 'gift-card-print'
  filename?: string
}

export default function CardDownload({
  cardElementId = 'gift-card-print',
  filename = `giftnow-card-${Date.now()}.png`,
}: CardDownloadProps) {

  async function handleDownload() {
    const el = document.getElementById(cardElementId)
    if (!el) return

    const canvas = await html2canvas(el, {
      scale: 3,           // 3× = high resolution output
      useCORS: true,      // needed if images are on a CDN
      allowTaint: false,
    })

    const link = document.createElement('a')
    link.download = filename
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <button onClick={handleDownload} style={{ /* your button styles */ }}>
      Download Card
    </button>
  )
}
```

> **For emailing the card:** Use the same `html2canvas` approach on the server side with **Puppeteer** to render a headless screenshot, then attach the PNG to your email via Nodemailer or SendGrid.

---

## Step 5 — Putting It All Together (Purchase Page)

```tsx
// app/purchase/page.tsx
'use client'
import { useState } from 'react'
import GiftCard from '@/components/GiftCard'
import CardPicker from '@/components/CardPicker'
import CardDownload from '@/components/CardDownload'
import { CARD_DESIGNS } from '@/data/cards'

export default function PurchasePage() {
  const [design, setDesign] = useState(CARD_DESIGNS[0])
  const [amount, setAmount] = useState(500)
  const [recipient, setRecipient] = useState('')

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>

      {/* Left: configurator */}
      <div>
        <h2>Choose a design</h2>
        <CardPicker selected={design} onSelect={setDesign} />

        <h2 style={{ marginTop: 24 }}>Set amount</h2>
        {[500, 1000, 2000, 5000].map(a => (
          <button key={a} onClick={() => setAmount(a)}>Rs. {a}</button>
        ))}

        <h2 style={{ marginTop: 24 }}>Recipient (optional)</h2>
        <input
          value={recipient}
          onChange={e => setRecipient(e.target.value)}
          placeholder="Enter name"
        />
      </div>

      {/* Right: live preview + order summary */}
      <div>
        <GiftCard
          design={design}
          amount={amount}
          recipient={recipient}
          size="md"
        />
        <CardDownload />
        <button onClick={() => { /* add to cart / checkout */ }}>
          Buy Now — Rs. {amount.toLocaleString('en-IN')}
        </button>
      </div>

    </div>
  )
}
```

---

## How to Add a New Festival Card

When a new festival comes (Holi, New Year, Christmas, etc.):

1. **Generate or create the PNG** — AI image generator, Canva, Photoshop, etc. Keep the blank "GIFT CARD VALUE" box in the same general area.
2. **Drop the PNG** into `/public/cards/` — e.g. `holi.png`
3. **Add one entry** to `CARD_DESIGNS` in `src/data/cards.ts`:

```ts
{
  id: 'holi',
  name: 'Happy Holi!',
  festival: 'Holi',
  nepali: 'होली को रंगीलो शुभकामना',
  image: '/cards/holi.png',
  valueBox: { top: '38%', right: '6%', width: '32%' },
  valueColor: '#fff',
  season: 'spring',
},
```

4. **Done.** No code changes needed — the picker and card component pick it up automatically.

---

## Image Optimization Tips for Next.js

```tsx
// next.config.js — allow optimizing images from your CDN if needed
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'your-cdn.com',  // if cards are hosted on a CDN
      },
    ],
  },
}

module.exports = nextConfig
```

```tsx
// For cards stored in /public — use the Image component with fill + sizes
// This auto-generates srcSet for all screen sizes
<Image
  src={design.image}
  alt={design.name}
  fill
  sizes="(max-width: 640px) 90vw, 400px"
  style={{ objectFit: 'cover' }}
  priority   // above the fold — no lazy loading
/>
```

---

## Packages Summary

| Package | Purpose | Install |
|---|---|---|
| `next/image` | Optimized image rendering | Built into Next.js |
| `html2canvas` | Export card div as PNG | `npm i html2canvas` |
| `puppeteer` | Server-side PNG for email | `npm i puppeteer` |
| `nodemailer` | Send card via email | `npm i nodemailer` |

---

## Common Issues and Fixes

**Amount text is misaligned on different screens**
- Use `clamp()` for font size: `clamp(18px, 8cqw, 52px)` — scales with card width
- All position values in `valueBox` are `%` not `px`, so they scale automatically

**Card image looks blurry**
- Use `scale: 3` in html2canvas for 3× resolution
- Store card PNGs at minimum `1680×1059px` (3× of 560×353)

**html2canvas cuts off the image**
- Make sure the card container has an explicit `width` and `aspectRatio`, not just `height: auto`
- Add `overflow: hidden` on the wrapper

**CORS error with html2canvas**
- If images are served from a CDN, set `useCORS: true` in html2canvas options
- Also add `crossOrigin="anonymous"` to the `<Image>` component

**Next.js Image component shows wrong size**
- Never use `width` and `height` props together with `fill` — use one or the other
- With `fill`, the parent must have `position: relative` and explicit dimensions

---

*Last updated: 2026 · GiftNow by Su Indra Group*
