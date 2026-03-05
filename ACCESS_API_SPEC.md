# Access Verify API Spec

## Purpose

This API verifies the access code on the server side and creates an authenticated session for the app.

## Endpoint

`POST /api/access/verify`

## Request

Content-Type: `application/json`

```json
{
  "accessCode": "string"
}
```

## Success Response

Status: `200 OK`

```json
{
  "ok": true,
  "session": {
    "authenticated": true,
    "expiresAt": "2026-03-02T23:59:59Z"
  }
}
```

## Failure Responses

Status: `401 Unauthorized`

```json
{
  "ok": false,
  "error": {
    "code": "INVALID_ACCESS_CODE",
    "message": "Invalid access code."
  }
}
```

Status: `429 Too Many Requests`

```json
{
  "ok": false,
  "error": {
    "code": "ACCESS_LOCKED",
    "message": "Too many failed attempts. Try again later."
  }
}
```

## Session Behavior

- Server should issue an `httpOnly`, `secure`, `sameSite=lax` session cookie on success.
- Frontend should send `credentials: "include"` on verification and session-check calls.
- Frontend must not store the raw access code after verification.

## Optional Session Check

`GET /api/access/session`

Success example:

```json
{
  "ok": true,
  "session": {
    "authenticated": true
  }
}
```

Failure example:

```json
{
  "ok": false,
  "session": {
    "authenticated": false
  }
}
```

## Frontend Flow

1. App loads and calls `GET /api/access/session`.
2. If `authenticated` is `true`, the app skips the locked screen and opens the guide step.
3. If not authenticated, the user enters an access code.
4. Frontend sends `POST /api/access/verify`.
5. On success, the server sets the session cookie and the app opens the guide step.
6. The app then continues into the Q1 to Q4 flow.

## Cloudflare Pages Functions Setup

Use the following secrets in Cloudflare Pages (`Settings -> Environment variables`).

- `ACCESS_HMAC_SECRET` (secret text, required)
- `ACCESS_CODE_HASHES` (comma-separated HMAC-SHA256 hashes, required)
- `SESSION_TTL_MS` (optional, default: `28800000`)
- `MAX_FAILED_ATTEMPTS` (optional, default: `3`)
- `LOCK_WINDOW_MS` (optional, default: `60000`)

Generate access-code hashes locally:

```bash
ACCESS_HMAC_SECRET="your-secret" node scripts/generate-access-hash.mjs "demo-access"
```

Then copy the output into `ACCESS_CODE_HASHES`.
