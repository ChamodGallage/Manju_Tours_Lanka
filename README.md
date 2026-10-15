# Manju Tours Lanka — Separate Frontend & Backend Architecture

> **Positioning**: "Your Personal Sri Lanka Travel Planner"  
> **Headquarters**: Galle Road, Hikkaduwa, Southern Province, Sri Lanka  
> **Database Provider**: Supabase (`https://zazflloyuzjqeyxrcpwl.supabase.co`)

---

## 1. Project Architecture & Directory Structure

The project has been separated into independent, decoupled `frontend` and `backend` workspaces, with an orchestration layer at the root:

```text
D:\Manju Tours\
│
├── frontend\                                # Complete Next.js 16 (App Router) + React 19 Frontend
│   ├── public\
│   │   ├── images\                          # High-resolution WebP hero & destination imagery
│   │   └── assets\                          # Static branding, icons, and vector graphics
│   ├── src\
│   │   ├── app\                             # 59+ Public routes & secure admin pages
│   │   │   ├── (public pages)               # /, /about, /contact, /custom-tour, /credits
│   │   │   ├── destinations\[slug]\         # 11 destinations (Hikkaduwa, Mirissa, Ella, etc.)
│   │   │   ├── tours\[slug]\                # Tour package detail pages & itinerary maps
│   │   │   ├── experiences\[slug]\          # Safari, scenic train & culture highlights
│   │   │   ├── stories\[slug]\              # Curated Sri Lanka travel guides
│   │   │   └── admin\                       # Admin panel (pages, packages, destinations, photos)
│   │   ├── components\                      # UI components, layout headers, forms, hero zoom
│   │   ├── pages\                           # Compatibility index & route companions
│   │   ├── layouts\                         # Section, grid, and navigation layouts
│   │   ├── hooks\                           # Custom hooks (useMedia, useAdminAuth, etc.)
│   │   ├── services\                        # Frontend API service layer (calls backend /api)
│   │   │   ├── apiClient.ts                 # Centralized fetch client with token handling
│   │   │   ├── destinationsService.ts       # Destination data queries
│   │   │   ├── packagesService.ts           # Tour package data queries
│   │   │   ├── pagesService.ts              # CMS page builder & section rendering
│   │   │   ├── enquiriesService.ts          # Tour enquiries & contact submissions
│   │   │   └── mediaService.ts              # Photo management & upload proxy
│   │   ├── styles\                          # Global Tailwind tokens & CSS styling
│   │   └── utils\                           # Utility functions, cn helper, formatters
│   ├── .env.example                         # Template for frontend environment variables
│   ├── .env.local                           # Safe public environment variables (git-ignored)
│   ├── next.config.ts                       # Proxies /api/:path* to backend http://localhost:5000
│   └── package.json
│
├── backend\                                 # Node.js + Express REST API Server
│   ├── src\
│   │   ├── config\                          # env.ts, supabase.ts (service-role & public clients)
│   │   ├── controllers\                     # Request controllers (destinations, packages, etc.)
│   │   ├── services\                        # Business logic, DB operations & in-memory fallbacks
│   │   ├── middleware\                      # CORS, auth (requireAdmin), rateLimiter, errorHandler
│   │   ├── routes\                          # REST endpoints (/api/destinations, /api/enquiry, etc.)
│   │   ├── validators\                      # Zod input schemas for server-side validation
│   │   └── utils\                           # Structured logging & XSS sanitization
│   ├── tests\
│   │   └── api.test.ts                      # Automated backend API integration tests
│   ├── supabase\
│   │   ├── schema.sql                       # Full database schema for Supabase
│   │   └── migrations\                      # Granular SQL migrations for tables, RLS & policies
│   ├── .env.example                         # Template for backend server secrets
│   ├── .env                                 # Backend secrets (service-role key, git-ignored)
│   └── package.json
│
├── scripts\
│   └── start-dev.mjs                        # Cross-platform concurrent development runner
├── README.md                                # This documentation file
├── .gitignore                               # Git ignores secrets, node_modules, and build artifacts
└── package.json                             # Root monorepo workspace orchestration
```

---

## 2. Ports and URLs

| Service | Local URL | Port | Responsibilities |
| :--- | :--- | :--- | :--- |
| **Frontend** | `http://localhost:3000` | `3000` | Public website, booking forms, page builder admin panel, Next.js rewrites proxy. |
| **Backend** | `http://localhost:5000` | `5000` | Express REST API, Supabase elevated service-role database operations, admin JWT validation, media uploads. |
| **Backend Health** | `http://localhost:5000/api/health` | `5000` | Uptime check, database connection status, and environment telemetry. |
| **Proxied API** | `http://localhost:3000/api/health` | `3000` | Next.js transparently forwards `/api/*` to backend `http://localhost:5000/api/*`. |

---

## 3. Environment Variables Configuration

### A. Frontend (`frontend/.env.local`)

Copy `frontend/.env.example` to `frontend/.env.local`:

```powershell
cmd /c copy frontend\.env.example frontend\.env.local
```

Required frontend variables:
```env
# Backend API Base URL
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
NEXT_PUBLIC_BACKEND_URL="http://localhost:5000"

# Public Supabase Client (Browser Safe — publishable key only)
NEXT_PUBLIC_SUPABASE_URL="https://zazflloyuzjqeyxrcpwl.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="<your-supabase-publishable-key>"

# Public Site Configuration
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_COMPANY_NAME="MANJU TOURS LANKA"
NEXT_PUBLIC_WHATSAPP_NUMBER="+94771234567"
```

> **Security Note**: Never place the `SUPABASE_SERVICE_ROLE_KEY` in frontend `.env.local`. The frontend only receives the safe publishable key.

---

### B. Backend (`backend/.env`)

Copy `backend/.env.example` to `backend/.env`:

```powershell
cmd /c copy backend\.env.example backend\.env
```

Required backend variables:
```env
# Server Network
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Supabase Server-Side Configuration
SUPABASE_URL=https://zazflloyuzjqeyxrcpwl.supabase.co
SUPABASE_PUBLISHABLE_KEY="<your-supabase-publishable-key>"
SUPABASE_SERVICE_ROLE_KEY="<your-supabase-service-role-key>"
SUPABASE_STORAGE_BUCKET=media

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=60
```

---

## 4. Development Commands (Windows PowerShell)

All commands can be run from the root workspace `D:\Manju Tours` using `cmd /c npm.cmd ...`:

### 🚀 1. Start Both Frontend and Backend Concurrently (Recommended)

Starts the Express API server on port 5000 and the Next.js frontend on port 3000 in parallel with unified, color-coded logging:

```powershell
cmd /c npm.cmd run dev
```

### 📦 2. Start Frontend Only

```powershell
cmd /c npm.cmd run dev:frontend
```
*Frontend runs on `http://localhost:3000`.*

### ⚙️ 3. Start Backend Only

```powershell
cmd /c npm.cmd run dev:backend
```
*Backend runs on `http://localhost:5000/api` with automatic reload on changes (`tsx watch`).*

---

## 5. Building for Production

### Build Both Services

```powershell
cmd /c npm.cmd run build
```

This compiles:
1. `backend`: Compiles TypeScript with `tsc` into `backend/dist/`.
2. `frontend`: Compiles Next.js 16 with Turbopack, generating all 59+ optimized static pages and SSR routes into `frontend/.next/`.

### Run Production Servers

Start Backend in production:
```powershell
cmd /c npm.cmd run start:backend
```

Start Frontend in production:
```powershell
cmd /c npm.cmd run start:frontend
```

---

## 6. Running Integration Tests & Code Quality

### Backend API Tests
Runs the automated test suite testing health check, destinations, packages, pages, enquiries, contact forms, and 401 unauthorized protection:

```powershell
cmd /c npm.cmd run test:backend
```

*Output summary:*
```text
┌─────────┬─────────────────────────────────────────────────────────────────────┬────────┐
│ (index) │ name                                                                │ status │
├─────────┼─────────────────────────────────────────────────────────────────────┼────────┤
│ 0       │ 'GET /api/health returns 200 with ok status'                        │ 'PASS' │
│ 1       │ 'GET /api/destinations returns destination list'                    │ 'PASS' │
│ 2       │ 'GET /api/packages returns tour packages list'                      │ 'PASS' │
│ 3       │ 'GET /api/pages?mode=pages returns all 13 core pages'               │ 'PASS' │
│ 4       │ 'POST /api/enquiry creates booking enquiry with valid data'         │ 'PASS' │
│ 5       │ 'POST /api/contact receives direct message'                         │ 'PASS' │
│ 6       │ 'POST /api/destinations rejects unauthenticated request with 401'   │ 'PASS' │
│ 7       │ 'GET /api/admin/enquiries rejects unauthenticated request with 401' │ 'PASS' │
└─────────┴─────────────────────────────────────────────────────────────────────┴────────┘
```

### Frontend Lint Check

```powershell
cmd /c npm.cmd run lint
```

---

## 7. Applying Database Migrations to Supabase

The database schema and migrations are located in:
- `backend/supabase/schema.sql` (Master SQL Schema)
- `backend/supabase/migrations/` (Granular table and policy migrations)

### Migration Steps:
1. Open the [Supabase Dashboard](https://supabase.com/dashboard/project/zazflloyuzjqeyxrcpwl).
2. Navigate to **SQL Editor** in the left navigation menu.
3. Click **"New query"**.
4. Open [schema.sql](file:///d:/Manju%20Tours/backend/supabase/schema.sql) and paste its contents into the SQL Editor.
5. Click **"Run"** (or press Ctrl+Enter).

### Tables Created:
- `destinations`: All 11 destinations (Hikkaduwa, Mirissa, Ella, Nuwara Eliya, etc.) with coordinates, hero images, and gallery arrays.
- `tour_packages`: Tour packages with day-by-day itineraries, inclusions, highlights, pricing, and duration.
- `website_pages` & `page_sections`: Page builder system for managing all public website pages.
- `tour_enquiries`: Customer booking enquiries and travel preferences.
- `site_images`: Media library for photo metadata and Supabase Storage paths.
- `site_settings`: Global navigation, WhatsApp contact numbers, and SEO metadata.
- `admins`: Role-based administrator authorization linked to Supabase Auth users.

> **Zero-Downtime Fallback**: If the database tables are not yet migrated, the backend services automatically fall back to the built-in in-memory dataset, ensuring local development and website builds never fail.

---

## 8. Summary of API Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | System status, uptime, and database connection. |
| `GET` | `/api/destinations` | Public | List all published Sri Lanka destinations. |
| `GET` | `/api/destinations/:id` | Public | Get single destination details. |
| `POST` | `/api/destinations` | **Admin Only** | Create a new destination. |
| `PUT` | `/api/destinations/:id` | **Admin Only** | Update destination content, photos, or order. |
| `DELETE` | `/api/destinations/:id` | **Admin Only** | Delete destination. |
| `GET` | `/api/packages` | Public | List published tour packages. |
| `GET` | `/api/packages/:id` | Public | Get tour package details and itinerary. |
| `POST` | `/api/packages` | **Admin Only** | Create new tour package. |
| `PUT` | `/api/packages/:id` | **Admin Only** | Update tour package details. |
| `DELETE` | `/api/packages/:id` | **Admin Only** | Delete tour package. |
| `POST` | `/api/admin/packages/reorder` | **Admin Only** | Reorder tour package display positions. |
| `POST` | `/api/admin/packages/duplicate` | **Admin Only** | Clone an existing package as a draft. |
| `GET` | `/api/pages` | Public | Retrieve website page sections for page builder. |
| `GET` | `/api/pages/:slug` | Public | Retrieve sections for a specific page slug. |
| `POST` | `/api/admin/pages` | **Admin Only** | Save page builder draft section changes. |
| `POST` | `/api/admin/pages/publish` | **Admin Only** | Publish drafted sections to live website. |
| `POST` | `/api/enquiry` | Public | Submit customer tour booking enquiry (validated with Zod). |
| `POST` | `/api/contact` | Public | Submit general contact message. |
| `GET` | `/api/admin/enquiries` | **Admin Only** | View customer booking enquiries. |
| `PATCH` | `/api/admin/enquiries/:id` | **Admin Only** | Update enquiry status (NEW, CONTACTED, BOOKED, ARCHIVED). |
| `POST` | `/api/media/upload` | **Admin Only** | Upload image to Supabase Storage with metadata. |
| `POST` | `/api/admin/photos/replace` | **Admin Only** | Replace photo asset in website page sections. |
