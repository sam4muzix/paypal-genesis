# Security readiness — NOT CLEARED FOR DEPLOYMENT

The code includes hashed password storage, secure session cookies, same-origin mutation checks, server-side role checks, rate counters, hashed expiring email verification tokens, payment ownership checks, Sandbox-only API URLs, guarded capture, and a webhook signature verification path. These protections have **not** passed an HTTP security test in the current environment.

Blocking items: host runtime and browser verification; real email delivery; Gemini schema and injection tests; PayPal Sandbox buyer approval and capture; failed and duplicate capture tests; real webhook signature/deduplication tests; account isolation and CSRF E2E tests; merchant onboarding; privacy workflows; security review. Real webhook delivery requires an approved public HTTPS endpoint. Do not infer genuine verification from static checks or rejected unsigned events.

The Mac host restriction is unknown. Agent socket binding returned EPERM, and host Terminal control was denied. See `HOST_VERIFICATION.md`.

Worker-handler tests now cover session cookie attributes, email verification single use, role checks, account isolation, CSRF rejection, and manufacturer-only decisions against a migrated temporary SQLite database. These are local tests, not a public runtime security review. Payment and webhook security still require genuine Sandbox and HTTPS event tests.
