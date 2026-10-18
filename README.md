# Week 4: JWT Authentication and Authorization

A learning project demonstrating registration, password hashing, login, JSON Web Tokens (JWT), protected routes, and role-based authorization with Node.js and Express.

## Requirements
- Node.js 18+ recommended
- npm

## Setup
1. Extract the ZIP and open the folder in VS Code.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env`.
4. Set `JWT_SECRET` to a long random secret of at least 32 characters. Keep `.env` private and never commit it.
5. Start the server:
   ```bash
   npm start
   ```
6. Open `http://localhost:3000`.

## Endpoints
| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a standard user |
| POST | `/api/auth/login` | Public | Verify credentials and return JWT |
| GET | `/api/auth/me` | Valid JWT | Return current user's public profile |
| GET | `/api/auth/admin` | Admin JWT | Demonstrate role-based access control |

### Register example
Send JSON to `POST /api/auth/register`:
```json
{"name":"Alex Example","email":"alex@example.com","password":"StrongPass123!"}
```
Public registration always assigns the `user` role. It intentionally ignores any role submitted by a client.

### Login example
Send JSON to `POST /api/auth/login`:
```json
{"email":"alex@example.com","password":"StrongPass123!"}
```
Copy the `token` field from the response. For protected requests, add this header:
```text
Authorization: Bearer YOUR_TOKEN_HERE
```
A normal user should receive `200` from `/api/auth/me` and `403` from `/api/auth/admin`. Missing or invalid tokens return `401`.

## Authentication flow
1. Registration validates inputs and hashes the password with bcrypt (12 salt rounds); the plaintext password is not stored.
2. Login finds the user and compares the submitted password with the stored bcrypt hash.
3. On success, the server signs a JWT with the configured secret, subject user ID, role claim, and expiration.
4. Authentication middleware verifies signature and expiration, then loads the user and attaches safe user details to the request.
5. Authorization middleware checks the user's role before allowing access to admin-only endpoints.

## Security measures
- Password hashing with bcrypt
- JWT secret read from environment configuration and required to be at least 32 characters
- Expiring tokens
- Role assigned on the server during public registration (not trusted from request body)
- Generic invalid-login response
- Input validation and request body size limit
- Public responses never include password hashes
- `.env` excluded by `.gitignore`

## Testing
Automated tests use Jest and Supertest:
```bash
npm test
```
The tests cover registration, password validation, duplicate registration, login success/failure, protected route access, and role checks.

## Limitations and important note
This assignment uses in-memory user storage to keep the project easy to run. Users disappear when the server restarts, and a seeded admin cannot persist across separate processes. For a production-ready role demonstration, use a database and create an admin through a trusted administrative setup process. Do not deploy this demo with real user data. The `.env.example` file is a template only; create your own `.env` locally and never commit actual secrets.
