# DoorDash Courier Management System (MERN)

A responsive courier-management course project built with **MongoDB, Express, React and Node.js**. It includes public parcel tracking, customer booking, role-based dashboards, delivery-agent assignment and updates, admin pricing, payment records (card mode is explicitly a demo), and reporting.

## Included features

- Public landing page and public Tracking ID lookup with a status timeline.
- Customer registration/login, profile update, password change, saved addresses and parcel booking history.
- Admin dashboard, parcel search, user/agent management, agent assignment/reassignment, configurable base/per-kg/per-km pricing, payments and monthly reports.
- Delivery agent dashboard for assigned parcels; status updates, failed-delivery reasons, and OTP requirement for Delivered status.
- JWT authentication, bcrypt password hashing, backend role authorization, server-side charge calculation, request validation, Helmet, CORS and rate limiting.
- Responsive white/navy/orange interface, toasts, loading and empty states.

## Requirements

- Node.js 20+ (Node 22 LTS recommended) and npm.
- MongoDB local installation **or** a MongoDB Atlas database.
- Windows PowerShell, macOS Terminal or Linux shell.

## 1. Configure MongoDB and environment variables

Open a terminal at the project root. Copy the examples:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

Edit `backend/.env` and set:

- `MONGODB_URI`: local MongoDB URI or Atlas connection string.
- `JWT_SECRET`: a long random secret (32+ characters).
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and optionally `ADMIN_NAME` for the initial admin account. Use a strong private password of at least 12 characters.
- `CLIENT_URL=http://localhost:5173` for local development.

For a local MongoDB instance, start MongoDB before continuing. For Atlas, create a database user, allow your development IP in Network Access, and paste the connection string into `MONGODB_URI`.

## 2. Install dependencies

Run in the project root:

```powershell
cd backend
npm install
cd ../frontend
npm install
cd ..
```

## 3. Create the administrator account

Run once after setting `backend/.env`:

```powershell
cd backend
npm run seed:admin
cd ..
```

The seed script only creates an administrator from the server-side environment. Public registration can create **customers only**. Do not publish your `.env` file or share the admin password.

## 4. Start the app

Open **two terminals** in the project root.

Terminal 1 — backend:

```powershell
cd backend
npm run dev
```

Terminal 2 — frontend:

```powershell
cd frontend
npm run dev
```

Open **http://localhost:5173**. Backend health check: **http://localhost:5000/api/health**.

## Role flows

- **Admin:** sign in using the account from `npm run seed:admin`. Manage parcels, users, delivery agents, pricing, payments and reports.
- **Customer:** register at `/register`, book a parcel, save the tracking ID and OTP shown after booking, and follow the status timeline.
- **Delivery agent:** an admin creates an agent account from Customers & agents. The agent signs in, sees only parcels assigned to them, and can update delivery status. The delivery OTP is required for Delivered.

## Pricing and distance notes

The server calculates each new booking as:

`base fee + (weight in kg × per-kg rate) + (distance in km × per-km rate)`

Default demonstration rates are PKR 100 base + PKR 80/kg + PKR 5/km. Administrators can change the rates. The customer enters an estimated route distance; this project does **not** call Google Maps or another live distance API. The distance must not be represented as a verified road distance.

## Payments and OTP notes

- Cash bookings are stored as `unpaid` payment records.
- Selecting Card creates a clearly labelled `demo` record. **No card details are collected and no real payment is charged.** A real gateway such as Stripe requires merchant configuration, server-side payment intents, verified webhooks, and security testing before production use.
- The six-digit delivery OTP is shown to the customer after booking for course-project demonstration. In a production deployment it should be sent privately to the recipient and protected from public tracking views. Do not treat the demo OTP workflow as production-grade identity verification.

## Password reset limitation

Password change is implemented and verifies the current password. Email-based forgot-password reset is not configured because it requires an SMTP/email provider and reset-token delivery/expiry workflow. The login page tells users to contact the administrator for a reset; do not claim email reset is enabled.

## Test checklist

1. `/api/health` responds with `{ "status": "ok" }`.
2. Admin seed creates the configured administrator; the admin can sign in.
3. Public registration creates a customer and never accepts a requested role.
4. Customer booking calculates its charge on the backend and creates a unique Tracking ID.
5. Public tracking works for a valid ID and returns a clear 404 message for an invalid ID.
6. Customer cannot read another customer's parcel by API ID.
7. Agent cannot view/update a parcel not assigned to that agent.
8. Admin can create an agent and assign a pending parcel.
9. Agent can update status; Delivered is rejected without the correct OTP.
10. Failed Delivery is rejected without a reason.
11. Admin can update pricing; new bookings use the new rate while existing bookings keep their saved charge.
12. Password change rejects an incorrect current password and mismatched confirmation.
13. Test layouts at desktop and mobile widths.

## Troubleshooting

- **MongoDB connection refused:** start local MongoDB or verify Atlas URI, network access and database credentials.
- **JWT secret error:** ensure `backend/.env` exists and `JWT_SECRET` is set.
- **CORS error:** set `CLIENT_URL=http://localhost:5173` in `backend/.env`, then restart the backend.
- **Frontend API errors:** check `frontend/.env` contains `VITE_API_URL=http://localhost:5000/api`; restart Vite after changing env files.
- **Admin login fails:** rerun `npm run seed:admin` from `backend` and verify credentials in `backend/.env`. If the admin already exists, the seed script will not overwrite its password.
- **Port in use:** change `PORT` in backend `.env` and update `VITE_API_URL` to match.
- **Missing packages:** run `npm install` separately inside `backend` and `frontend`.

## Project structure

```text
doordash-courier-system/
├── backend/
│   ├── src/models/        # User, Parcel, Pricing, Payment
│   ├── src/routes/        # Auth, parcels, admin APIs
│   ├── src/middleware/    # Authentication, role and error handling
│   ├── src/utils/         # Tracking IDs and server-side pricing
│   ├── src/server.js
│   ├── src/seedAdmin.js
│   └── .env.example
├── frontend/
│   ├── src/components/    # Shared navigation, shell and UI components
│   ├── src/context/       # Authentication context
│   ├── src/pages/         # Public, auth, dashboard and management pages
│   └── .env.example
└── README.md
```

## Deploy the project

### Frontend (Vercel)

1. Push the project to your Git repository.
2. Import it into Vercel and set **Root Directory** to `frontend`.
3. Use build command `npm run build` and output directory `dist` (Vercel normally detects Vite automatically).
4. Add the environment variable `VITE_API_URL` with your deployed backend URL followed by `/api`, for example `https://your-api.onrender.com/api`.
5. Deploy. `frontend/vercel.json` includes an SPA rewrite so direct visits to `/login`, `/track`, `/terms`, and other routes work after refresh.

### Backend (Render)

1. Create a Web Service from the same repository. The included `render.yaml` uses `backend` as its root directory.
2. Set `MONGODB_URI` to your production MongoDB Atlas connection string.
3. Set `JWT_SECRET` to a strong private random value, `ADMIN_EMAIL` to the intended administrator email, and `ADMIN_PASSWORD` to a unique password of at least 12 characters. Never reuse the sample values.
4. Set `CLIENT_URL` to your exact deployed Vercel origin (for example `https://your-project.vercel.app`, without a path). Multiple allowed origins can be comma-separated.
5. After the backend has deployed and connected to MongoDB, open the Render Shell and run `npm run seed:admin` from the backend service root to create the administrator. If your hosting dashboard opens at the repository root, change into `backend` first.
6. Confirm `https://your-api.onrender.com/api/health` returns `{ "status": "ok" }`, then verify the Vercel site's login and parcel API calls.

**Important:** Frontend environment variables are compiled into the Vite build. After changing `VITE_API_URL`, redeploy the frontend. Never put `MONGODB_URI`, `JWT_SECRET`, or `ADMIN_PASSWORD` in frontend variables.

## Before accepting real shipments

The card option is a demonstration record, not a live payment gateway. Configure a real payment provider and verified webhooks if payments will be accepted. Configure private OTP delivery, an email-based password reset flow, HTTPS, production CORS, database backups, monitoring, audit logs, and automated tests. Replace all business contact placeholders and review the policy templates against your actual service and applicable law before handling real customer data.
