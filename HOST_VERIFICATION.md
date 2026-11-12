# Run Phase 3.5 on the Mac host

These commands must be run in the Mac's own Terminal because the agent process is sandboxed and host Terminal control was denied.

```sh
cd /Users/shyamlraj/Downloads/PPGEN/paypal-genesis
uname -a
node -v
npm -v
npm config get registry
npm ping
python3 -c 'import socket; s=socket.socket(); s.bind(("127.0.0.1", 0)); print("localhost bind OK", s.getsockname()); s.close()'
npm install
npm run db:migrate
```

Create local settings with `nano .dev.vars` and add only:

```text
DEV_VERIFICATION_DELIVERY=log
```

Save, then run:

```sh
npm run dev -- --ip 127.0.0.1 --port 8787
```

Open `http://127.0.0.1:8787/` in Chrome. Register with a test email. The local verification link appears in the Wrangler Terminal log. Do not send the link or token to anyone. Open it in the same local browser, sign in, and test the product and feedback flows. In a second Terminal window:

```sh
cd /Users/shyamlraj/Downloads/PPGEN/paypal-genesis
curl -i http://127.0.0.1:8787/api/me
npm test
```

For browser automation, install Playwright from the official npm registry when npm access works, then run `npx playwright test`. The current test file requires review against the live UI; a green result must be recorded, not assumed.

For genuine Gemini tests, set `GEMINI_API_KEY` in `.dev.vars` locally. The selected model is `GEMINI_MODEL` (currently defaults to `gemini-2.5-flash`). For PayPal, configure `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, and `PAYPAL_WEBHOOK_ID` from a Sandbox application, plus separate Sandbox buyer and merchant accounts. Do not paste credentials into chat or commit `.dev.vars`. Webhook delivery needs a public HTTPS endpoint and approval before configuring one. Do not deploy or change DNS merely to run this checklist.

Share only command exit codes, redacted errors, and screenshots without passwords, verification tokens, or payment details. The agent can continue from those results.
