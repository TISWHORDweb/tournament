# Tech Turf Championship

A premium football tournament registration and management platform for tech professionals. Built with Next.js, TypeScript, Tailwind CSS, MongoDB, Mongoose, and Paystack.

## Features

- **Landing Page** — Hero with countdown timer, live stats, team structure visualization, capacity dashboard
- **Multi-Step Registration** — Personal info → category → group → Paystack payment → confirmation
- **Public Team Dashboard** — View all registered players by stack and group
- **Announcements** — Match dates, fixtures, venue info, tournament news
- **Admin Dashboard** — Player management, transfers, reserve bench, payments, CSV export

## Tournament Structure

| Category            | Capacity |
| ------------------- | -------- |
| Backend Developers  | 18 (2×9) |
| Frontend Developers | 18 (2×9) |
| Mobile Developers   | 18 (2×9) |
| UI/UX Designers     | 18 (2×9) |
| Reserve Bench       | 10       |
| **Total**           | **82**   |

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB (local or Docker)
- Paystack account (test keys for development)

### Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   Copy `.env.example` to `.env` and fill in your values:

   ```bash
   cp .env.example .env
   ```

   | Variable | Description |
   | -------- | ----------- |
   | `DATABASE_URL` | MongoDB connection string |
   | `PAYSTACK_SECRET_KEY` | Paystack secret key |
   | `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Paystack public key |
   | `ADMIN_PASSWORD` | Admin dashboard password |
   | `ADMIN_SESSION_SECRET` | Random string for session signing |
   | `NEXT_PUBLIC_APP_URL` | App URL (e.g. `http://localhost:3000`) |
   | `REGISTRATION_FEE` | Fee in kobo (150000 = ₦1,500) |

3. **Start MongoDB**

   Using Docker:

   ```bash
   docker compose up -d
   ```

   Or use a local MongoDB instance.

   Set `DATABASE_URL` in `.env`:

   ```
   DATABASE_URL="mongodb://localhost:27017/tech_turf_tournament"
   ```

   Then seed the database:

   ```bash
   npm run db:seed
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

### Admin Access

Navigate to `/admin` and sign in with your `ADMIN_PASSWORD`.

## Deploying to Vercel

The build succeeds without a database, but **pages crash at runtime** if MongoDB is not configured. Vercel cannot use `localhost` — you need **MongoDB Atlas** (free tier works).

### 1. MongoDB Atlas

1. Create a cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. **Database Access** — create a database user (username + password).
3. **Network Access** — add `0.0.0.0/0` (allow from anywhere) so Vercel can connect.
4. **Connect** → Drivers → copy the connection string and replace `<password>` with your user password.
5. Add a database name before the `?`, e.g.:
   ```
   mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/tech_turf_tournament?retryWrites=true&w=majority
   ```

### 2. Seed Atlas (once)

From your machine, point at Atlas and seed:

```bash
DATABASE_URL="mongodb+srv://..." npm run db:seed
```

### 3. Vercel environment variables

In **Vercel → Project → Settings → Environment Variables**, add:

| Variable | Value |
| -------- | ----- |
| `DATABASE_URL` | Your Atlas connection string (required) |
| `PAYSTACK_SECRET_KEY` | Paystack secret key |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Paystack public key |
| `ADMIN_PASSWORD` | Admin login password |
| `ADMIN_SESSION_SECRET` | Long random string |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |
| `REGISTRATION_FEE` | `150000` |

Redeploy after saving env vars (**Deployments → … → Redeploy**).

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── actions/                # Server actions
├── components/             # React components
├── lib/                    # Utilities, DB, Paystack
└── models/                 # Mongoose models
```

## Payment Flow

1. User completes registration form
2. Server creates pending player record and initializes Paystack transaction
3. User redirects to Paystack checkout
4. On success, Paystack redirects to `/register/verify?reference=...`
5. Server verifies payment, approves player, updates team counts
6. User sees confirmation at `/confirmation/[registrationNumber]`

## License

Private — Tech Turf Championship
