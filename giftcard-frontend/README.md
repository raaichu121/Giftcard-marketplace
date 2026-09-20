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
