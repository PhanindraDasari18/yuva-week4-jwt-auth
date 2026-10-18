# Week 4 Security Architecture Notes

## Components
- `src/routes/auth.js`: registration, login, current-user, and admin endpoints.
- `src/middleware/authenticate.js`: parses Bearer token, verifies JWT signature/expiry, reloads user, and attaches safe identity to the request.
- `src/middleware/authorizeRole.js`: denies access when the authenticated user's role is not allowed.
- `src/services/userStore.js`: in-memory user storage for this educational demo.
- `src/config.js`: loads environment variables and rejects a missing/short JWT secret.

## Security decisions
1. Passwords are hashed with bcrypt (12 salt rounds), never returned by API responses.
2. JWTs expire according to `JWT_EXPIRES_IN` (default one hour).
3. The token is sent in the `Authorization: Bearer` header.
4. Registration always creates the `user` role; it does not trust a client-supplied role.
5. Failed login uses the same error for unknown email and incorrect password.
6. Admin endpoint requires both a valid JWT and an `admin` role.

## Manual test sequence
1. Register a user.
2. Log in with the same email/password and copy the token.
3. Call `/api/auth/me` with `Authorization: Bearer <token>`; expect 200.
4. Call `/api/auth/me` without a token; expect 401.
5. Call `/api/auth/admin` as a normal user; expect 403.
6. Try a wrong password; expect 401.
7. Try duplicate registration; expect 409.

## Limitation
The demo uses an in-memory store, so user accounts are lost when the Node process exits. For persistent accounts and a durable admin role, integrate a database and a secure admin provisioning process.
