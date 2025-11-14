# localStorage usage report

This file lists locations in the frontend that previously wrote to localStorage (calls to `localStorage.setItem`) so they can be refactored to use backend APIs instead. After applying the strict removal shim these writes will no-op at runtime.

Search summary (files and approximate locations):

- `dbemb/src/Components/home.jsx` — many places writing `davaoBlueEaglesUser`, `davaoBlueEaglesUsers`, `payments`, `davaoBlueEaglesCurrentView`, etc.
- `dbemb/src/Components/InstrumentRental.jsx` — writes rent-requests fallback keys (local fallback storage).
- `dbemb/src/Components/InstrumentBorrowing.jsx` — writes borrow-requests fallback keys.
- `dbemb/src/Components/Booking.jsx` — updates booking storage keys.
- `dbemb/src/Components/BookingHistory.jsx` — reads/writes payment-related items.
- `dbemb/src/Components/UserSignup.jsx` and `MemberSignup.jsx` — registration flows call `authService` and then `home.jsx` persists user; note: writers may be in `home.jsx` rather than signup components.
- `dbemb/src/Components/usermanagement.jsx` — writes `davaoBlueEaglesUsers`.
- `dbemb/src/Components/dashboard.jsx` — writes `davaoBlueEaglesUser` on edits.
- `dbemb/src/Components/inventory.jsx` — writes `dbeInventory`.
- `dbemb/src/services/notificationService.js` — writes notification storage keys.
- Several other components write `payments` and other domain caches.

Next steps to fully remove client-side caches:

1. Replace each `localStorage.setItem` call with an API call to an appropriate backend endpoint (POST/PUT). For example:
   - Payments -> POST `/api/billing/payments`
   - Rent requests -> POST `/api/instruments/rent-requests`
   - Inventory -> PUT `/api/inventory` or a dedicated endpoint
   - Notifications -> POST `/api/notifications`

2. Replace reads that expect immediate local availability with server fetches (GET) and update UI to show loading states.

3. Optionally implement short-term client-side request queuing if you need offline resilience (but that intentionally reintroduces local state).

If you'd like, I can create a branch and follow-up PR that replaces the highest-priority writes (payments and rent-requests) with server-backed calls and removes the corresponding `localStorage.setItem` calls.
