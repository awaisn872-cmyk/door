# API quick reference

Base URL: `http://localhost:5000/api`. Protected endpoints require `Authorization: Bearer <JWT>`.

## Auth
- `POST /auth/register` — customer registration only.
- `POST /auth/login` — login.
- `GET /auth/me` — current profile.
- `PUT /auth/profile` — update name/phone.
- `PUT /auth/change-password` — current/new/confirm password.
- `PUT /auth/addresses` — replace saved address list.

## Parcels
- `GET /parcels/pricing` — public current rates.
- `GET /parcels/track/:trackingId` — public limited tracking view.
- `POST /parcels` — customer booking; charge is calculated on the server.
- `GET /parcels/mine` — customer's own parcels.
- `GET /parcels/assigned` — current agent's assigned parcels.
- `GET /parcels/:id` — owner/assigned agent/admin only.
- `PATCH /parcels/:id/status` — assigned agent or admin updates status; OTP required for Delivered.

## Admin only
- `GET /admin/overview`
- `GET /admin/parcels?q=&status=`
- `GET /admin/users?role=&q=`
- `POST /admin/agents`
- `PATCH /admin/users/:id/active`
- `PATCH /admin/parcels/:id/assign`
- `GET /admin/pricing`, `PUT /admin/pricing`
- `GET /admin/payments`
- `GET /admin/reports`
