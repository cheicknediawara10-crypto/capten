# CAPTEN SaaS: Technical Architecture

This document specifies the complete technical architecture for CAPTEN, a SaaS designed for Run Club, Walk Social, Trail, and Rando organizers. It is written to provide absolute clarity for automated coding agents (e.g., Claude Code) to build the product without ambiguity.

## 1. Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode enabled)
- **Styling**: TailwindCSS v4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **State Management**: React Context + Zustand (for global state like auth)
- **Maps**: Leaflet (via react-leaflet) or Mapbox GL JS (for GPS check-in visualization)
- **QR Code**: `qrcode.react` (generation) + `html5-qrcode` (scanning)
- **Charts**: Recharts (for dashboard statistics and trends)
- **Date Handling**: `date-fns`
- **Toast Notifications**: Sonner

### Backend
- **BaaS**: Supabase (Auth + PostgreSQL + Storage + Edge Functions + Realtime)
- **Authentication**: 
  - Supabase Auth (email/password for organizers)
  - Magic link / OTP for members via Supabase Auth
- **Database**: PostgreSQL (via Supabase) with Row Level Security (RLS)
- **File Storage**: Supabase Storage (logos, user avatars, receipt images)
- **Realtime**: Supabase Realtime (live check-in updates on event detail pages)
- **Edge Functions**: Supabase Edge Functions (Deno environment) for:
  - Badge calculation and assignment after check-ins
  - SMS/WhatsApp notifications (via Twilio or similar integration)
  - Waiver PDF generation
  - CAPTEN Spot transaction processing and cashback computation

### Deployment
- **Hosting**: Vercel (optimized for Next.js 15)
- **Domain**: capten.app
- **CI/CD**: GitHub Actions integrated with Vercel auto-deploy on push to main
- **Environment**: `.env.local` for local development, Vercel Env Vars for production

---

## 2. Project Structure

The complete file and folder structure is defined below:

```text
capten/
├── public/
│   ├── assets/
│   ├── logo.png
│   └── logo-official.png
├── src/
│   ├── app/
│   │   ├── (landing)/
│   │   │   └── page.tsx                    # Landing page
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx              # Login page
│   │   │   └── signup/page.tsx             # Signup page
│   │   ├── dashboard/
│   │   │   ├── layout.tsx                  # Dashboard shell (sidebar + topbar)
│   │   │   ├── page.tsx                    # Main hub / overview
│   │   │   ├── club/
│   │   │   │   └── page.tsx                # Club settings
│   │   │   ├── events/
│   │   │   │   ├── page.tsx                # Events list
│   │   │   │   ├── new/page.tsx            # Create event
│   │   │   │   └── [id]/page.tsx           # Event detail + live check-ins
│   │   │   ├── members/
│   │   │   │   ├── page.tsx                # Members list
│   │   │   │   └── [id]/page.tsx           # Member detail
│   │   │   ├── spots/
│   │   │   │   └── page.tsx                # CAPTEN Spots management
│   │   │   ├── stats/
│   │   │   │   └── page.tsx                # Statistics dashboard
│   │   │   └── settings/
│   │   │       └── page.tsx                # Account settings
│   │   ├── join/
│   │   │   └── [slug]/page.tsx             # Public club join page
│   │   ├── event/
│   │   │   └── [id]/page.tsx               # Public event page
│   │   ├── checkin/
│   │   │   └── [id]/page.tsx               # Check-in page (GPS + QR)
│   │   ├── p/
│   │   │   └── [token]/page.tsx            # Member micro-page
│   │   ├── waiver/
│   │   │   └── [club_id]/page.tsx          # Digital waiver signing
│   │   ├── layout.tsx                      # Root layout
│   │   └── globals.css                     # Global styles
│   ├── components/
│   │   ├── landing/                        # Landing page components (already built)
│   │   ├── dashboard/                      # Dashboard components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopBar.tsx
│   │   │   ├── StatCard.tsx
│   │   │   ├── EventCard.tsx
│   │   │   ├── MemberRow.tsx
│   │   │   ├── CheckinMap.tsx
│   │   │   ├── SpotCard.tsx
│   │   │   └── BadgeDisplay.tsx
│   │   ├── member/                         # Member micro-page components
│   │   │   ├── MemberCard.tsx
│   │   │   ├── BadgeGrid.tsx
│   │   │   ├── UpcomingEvents.tsx
│   │   │   └── ICECard.tsx
│   │   ├── auth/                           # Auth components
│   │   │   ├── LoginForm.tsx
│   │   │   └── SignupForm.tsx
│   │   ├── shared/                         # Shared/reusable components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   └── ui/                             # Low-level UI primitives (shadcn-like)
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                   # Browser Supabase client
│   │   │   ├── server.ts                   # Server Supabase client
│   │   │   ├── middleware.ts               # Auth middleware
│   │   │   └── types.ts                    # Generated DB types
│   │   ├── utils/
│   │   │   ├── geo.ts                      # GPS distance calculation (Haversine)
│   │   │   ├── badges.ts                   # Badge checking logic
│   │   │   ├── format.ts                   # Date/number formatting
│   │   │   └── cn.ts                       # className merge utility
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useClub.ts
│   │   │   ├── useEvents.ts
│   │   │   ├── useMembers.ts
│   │   │   ├── useGeolocation.ts
│   │   │   └── useCheckin.ts
│   │   └── stores/
│   │       └── authStore.ts                # Zustand auth store
│   └── types/
│       └── index.ts                        # Shared TypeScript types
├── supabase/
│   ├── migrations/                         # SQL migration files
│   ├── functions/                          # Edge Functions
│   │   ├── award-badges/
│   │   ├── send-notification/
│   │   └── process-spot-transaction/
│   └── seed.sql                            # Seed data (badges, test data)
├── .env.local.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 3. Authentication Flow

### Organizer Flow (B2B - Email + Password)
1. User navigates to `/login`.
2. Enters email and password to authenticate via Supabase Auth. For new organizers, they navigate to `/signup` first.
3. Supabase sends an email confirmation link.
4. Upon confirmation and successful login, the organizer is redirected to `/dashboard`.
5. If no club is associated with their account, an onboarding wizard prompts them to create their first club.
6. **Security**: The Next.js middleware (`src/lib/supabase/middleware.ts`) protects all `/dashboard/*` routes, validating the session and ensuring the user has the `organizer` role.

### Member Flow (B2C - Passwordless / Magic Link / OTP)
1. Organizer shares the public club link (e.g., `capten.app/join/paris-run-club`).
2. The member enters their phone number on the join page.
3. Supabase Auth (integrated with Twilio) sends a one-time password (OTP) via SMS, or alternatively, a magic link via WhatsApp.
4. **First Visit**: After verifying the OTP, the member is prompted to fill out their In Case of Emergency (ICE) details and sign the digital waiver.
5. **Return Visit**: The system recognizes the user's phone number. The user logs in via OTP; their fields (Passeport CAPTEN) are pre-filled, bypassing the initial forms.
6. The user is issued a secure, unique token stored in the database, granting access to their personal micro-page at `capten.app/p/[token]`.

---

## 4. Key Technical Decisions

### GPS Check-in Validation
- **Mechanism**: The client requests location access via the browser's `navigator.geolocation` API.
- **Validation**: When coordinates are obtained, they are sent to the backend. The distance between the event's configured location and the user's current location is calculated using the Haversine formula (implemented in `src/lib/utils/geo.ts`).
- **Rules**: Default geofence radius is strictly 200 meters.
- **Fallback**: If GPS fails or is denied, the member can scan a physical QR code at the event.
- **Storage**: Raw coordinates, method (GPS/QR), timestamp, and calculated distance are recorded in the `checkins` table.

### QR Code System
- **Generation**: For every event, the backend provisions a unique, time-sensitive token. A QR code is generated on the organizer's dashboard using `qrcode.react`, embedding the URL: `capten.app/checkin/[event_id]?source=qr`.
- **Scanning**: The organizer displays this QR code. Members scan it using their native phone camera (or an in-app scanner using `html5-qrcode` if required).
- **Time Window**: The QR token is only valid within the strict event time window (Event Start Time - 30 mins to Event End Time + 30 mins).

### Realtime Check-ins
- **Mechanism**: On the event detail page (`/dashboard/events/[id]`), a Supabase Realtime subscription listens for `INSERT` operations on the `checkins` table matching the specific `event_id`.
- **UI Update**: New check-ins trigger an immediate local state update via React, updating lists and progress bars without a page refresh.
- **Display**: A live counter (e.g., "32/50 check-ins") updates dynamically as members check in.

### Badge Calculation
- **Trigger**: Following a successful row insertion in the `checkins` table, a Supabase Database Webhook or standard trigger calls the `award-badges` Edge Function.
- **Process**: 
  1. Calculate the user's total successful check-ins, streaks, and special event criteria.
  2. Compare totals against the `badges` configuration table.
  3. Insert newly awarded badges into `member_badges`.
- **Response**: The function updates a state or emits an event that the client reads to trigger an unlock animation on the member's micro-page.

### CAPTEN Spots Cashback
- **Flow**: At a partner establishment, a distinct physical QR code is scanned by the organizer or member.
- **Action**: A form opens at a secure route (e.g., `/spots/pay`) to input the consumption amount.
- **Logic**: The Edge Function `process-spot-transaction` calculates exactly 10% of the input value.
- **Storage**: The 10% value is logged into `spot_transactions` linked to the club's account.
- **Visibility**: Organizers view a real-time aggregate of their accumulated cashback on the `/dashboard/spots` page.

---

## 5. Design System Tokens

The complete TailwindCSS v4 configuration (translating to `tailwind.config.ts` or `app/globals.css` in v4 style):

```typescript
// tailwind.config.ts (or corresponding CSS variables depending on Tailwind v4 setup)
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F4F4EE',        // Warm off-white
        accent: '#FF5500',        // Orange vif
        text: {
          primary: '#1A1918',
          secondary: '#666562',
        },
        card: {
          DEFAULT: '#FFFFFF',
          beige: '#EFEFE8',
        },
        dark: '#1D1D1D',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'var(--font-plus-jakarta-sans)', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem', // 24px primarily used for Cards
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
export default config;
```

*Note: In Tailwind CSS v4, these design tokens can also be strictly defined via standard CSS variables in `globals.css` using the `@theme` directive, depending on the specific v4 integration strategy chosen by the developer.*

---

## 6. Environment Variables

The application requires the following environment variables. A `.env.local.example` file must be maintained to reflect these.

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_ROLE_KEY] # Server-side only

# Maps & Geolocation
NEXT_PUBLIC_MAPBOX_TOKEN=[YOUR_MAPBOX_TOKEN]

# SMS / WhatsApp Notifications (Twilio)
TWILIO_ACCOUNT_SID=[YOUR_TWILIO_ACCOUNT_SID]
TWILIO_AUTH_TOKEN=[YOUR_TWILIO_AUTH_TOKEN] # Server-side only
TWILIO_PHONE_NUMBER=[YOUR_TWILIO_PHONE_NUMBER]
```

---

## 7. Deployment Pipeline

The CI/CD pipeline is designed for continuous deployment with high confidence.

1. **Version Control**: Code is maintained in a GitHub repository.
2. **Branching Strategy**: 
   - Feature branches for development (`feature/add-badge-logic`).
   - PRs are merged into the `main` branch.
3. **Continuous Integration (GitHub Actions)**:
   - On push or PR to `main`, a workflow runs.
   - Steps: Checkout -> Setup Node -> `npm install` -> `npm run lint` -> `npm run type-check` -> `npm run test` (if applicable).
4. **Continuous Deployment (Vercel)**:
   - Vercel is connected to the GitHub repository.
   - Merges to `main` trigger an automated production build and deployment to `capten.app`.
   - Vercel Preview Deployments are automatically generated for all open PRs to facilitate testing.
5. **Database Migrations (Supabase)**:
   - Handled via Supabase CLI (`supabase db push`) in a GitHub Action step before the Vercel deployment finalized, ensuring schema compatibility.

---

## 8. Security Considerations

- **Row Level Security (RLS)**: Strictly enforced on all PostgreSQL tables.
  - Organizers can only read/write data associated with their `club_id`.
  - Members can only read/write data associated with their own `member_id`.
- **Rate Limiting**: Applied heavily on Supabase Auth endpoints (specifically OTP requests) to prevent SMS bombing and abuse.
- **Input Validation**: All incoming data from forms and API requests is validated using `Zod` schemas before processing.
- **CSRF & XSS**: Mitigated inherently by Next.js and React. Unsafe HTML injection is explicitly forbidden; Markdown rendering (if any) uses strict sanitization.
- **Member Token Security**: The `token` used for member micro-pages (`/p/[token]`) is a securely generated, long cryptographically random string (e.g., UUIDv4 or NanoID), treated as a bearer token that is not sequentially guessable.
