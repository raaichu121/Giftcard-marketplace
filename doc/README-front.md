# Frontend Documentation

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Installation

```bash
npm install
```

### Environment Setup

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

### Running the Application

**Development:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Production Build:**

```bash
npm run build
npm start
```

## Project Structure

```
pages/
├── index.js                    # Home page
├── _app.js                     # Next.js app wrapper
├── customer/
│   ├── create.js              # Create gift cards
│   └── redeem.js              # Redeem gift cards
└── admin/
    ├── login.js               # Admin login
    └── dashboard.js           # Admin dashboard

lib/
├── api.js                     # API utilities
└── store.js                   # Zustand state management

components/
└── (Coming soon)

styles/
└── globals.css               # Tailwind CSS styles
```

## Pages

### Home Page (`/`)

Landing page with feature overview and navigation to customer and admin areas.

### Customer Pages

#### Create Gift Card (`/customer/create`)

- Create single or bulk gift cards
- Customize amount, type (digital/physical), expiry date
- Add buyer and recipient information
- Display created card numbers, PINs, and QR codes
- Copy-to-clipboard functionality

Features:

- Dynamic form validation
- Real-time QR code generation
- Bulk creation support (up to 100 cards)
- Theme selection for card design

#### Redeem Gift Card (`/customer/redeem`)

- Two modes: Check Balance and Redeem
- **Balance Check**: View available funds without redeeming
- **Redeem**: Deduct funds for a purchase
- Masked card number display
- Transaction confirmation

### Admin Pages

#### Admin Login (`/admin/login`)

- Username/password authentication
- JWT token generation
- Session persistence
- Demo credentials: admin/admin

#### Admin Dashboard (`/admin/dashboard`)

- Overview statistics:
  - Total gift cards issued
  - Active cards count
  - Redeemed cards count
  - Total value issued
  - Remaining balance value
  - Redemption rate percentage
- Key metrics visualization
- Quick links to management sections
- Logout functionality
- Auto-refresh capability

## Components

### API Utilities (`lib/api.js`)

```javascript
import { giftCardAPI, adminAPI } from "../lib/api";

// Customer APIs
await giftCardAPI.create(data);
await giftCardAPI.redeem(data);
await giftCardAPI.checkBalance(data);

// Admin APIs
await adminAPI.getDashboardStats();
await adminAPI.listGiftCards(filters);
await adminAPI.getGiftCard(id);
await adminAPI.getTransactionHistory(giftCardId);
await adminAPI.blockGiftCard(id, reason);
await adminAPI.refundGiftCard(id, amount, reason);
```

### State Management (`lib/store.js`)

Using Zustand for simple, powerful state management:

```javascript
import {
  useAuthStore,
  useGiftCardStore,
  useDashboardStore,
} from "../lib/store";

// Auth store
const token = useAuthStore((state) => state.token);
const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
useAuthStore((state) => state.setAuth(token, user));
useAuthStore((state) => state.logout());

// Gift card store
const giftCards = useGiftCardStore((state) => state.giftCards);
useGiftCardStore((state) => state.setGiftCards(cards));

// Dashboard store
const stats = useDashboardStore((state) => state.stats);
useDashboardStore((state) => state.setStats(stats));
```

## Styling

The project uses Tailwind CSS with custom utilities defined in `styles/globals.css`:

```css
.btn-primary      /* Blue primary button */
.btn-secondary    /* Gray secondary button */
.btn-danger       /* Red danger button */
.card             /* White card with shadow */
.input-field      /* Styled input element */
.container-main   /* Responsive container */
```

### Theme Customization

Edit `tailwind.config.js` to customize colors and theme:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#3b82f6',
      secondary: '#10b981',
      danger: '#ef4444',
      // Add more colors
    },
  },
},
```

## Form Handling

Forms use React hooks for state management:

```javascript
const [formData, setFormData] = useState({
  amount: "",
  type: "DIGITAL",
  // ...
});

const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};
```

## Error Handling & Notifications

Uses `react-hot-toast` for notifications:

```javascript
import toast from "react-hot-toast";

toast.success("Operation successful!");
toast.error("Something went wrong");
toast.loading("Processing...");
```

## Authentication Flow

1. User logs in on `/admin/login`
2. Credentials sent to backend
3. JWT token received and stored in localStorage
4. Token automatically added to all API requests via axios interceptor
5. Token stored in Zustand store for React component access
6. Protected routes check `isAuthenticated` before rendering

## Protected Routes

Wrap components with authentication check:

```javascript
useEffect(() => {
  if (!isAuthenticated) {
    router.push("/admin/login");
  }
}, [isAuthenticated]);
```

## API Integration

### Making API Calls

```javascript
import { giftCardAPI } from "../lib/api";

async function createCard(data) {
  try {
    const response = await giftCardAPI.create(data);
    return response.data;
  } catch (error) {
    console.error(error.response?.data?.error);
  }
}
```

### Request/Response Handling

- Automatic JWT token inclusion in headers
- Error interceptor for handling 401/403
- JSON response parsing
- Base URL configuration via environment variable

## Deployment

### Vercel (Recommended)

1. Push code to GitHub/GitLab
2. Import repository in Vercel
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL`
4. Deploy

### Self-Hosted

```bash
npm run build
npm start
```

Production-optimized build runs on port 3000

## Performance Optimization

- Next.js Image optimization
- Automatic code splitting
- CSS modules for scoped styling
- React hooks for efficient re-renders
- Zustand for lightweight state management

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### API Connection Issues

- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure backend is running
- Check CORS settings on backend

### Authentication Issues

- Clear localStorage
- Log in again
- Check JWT token expiry

### Styling Issues

- Run `npm install` to ensure Tailwind is installed
- Restart dev server after CSS changes
- Clear `.next` cache: `rm -rf .next && npm run dev`

---

For API documentation, see [Backend README](../giftcard-backend/README.md)
