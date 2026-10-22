# TCL Business Account Portal

A Next.js portal for client and service records, transactions, invoicing, receipts, and financial statements.

## Requirements

- Node.js 20 or later
- npm
- PostgreSQL / Neon connection string for persistent deployments
- Gmail account with 2-Step Verification enabled and a Google App Password for outgoing mail

## Local setup

1. Install packages with `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Set `DATABASE_URL`, `APP_LOGIN_EMAIL`, an `APP_LOGIN_PASSWORD` of at least 12 characters, and a unique random `APP_SESSION_SECRET` of at least 32 characters.
4. For Gmail delivery, set `GMAIL_USER` to the sending Gmail address and `GMAIL_APP_PASSWORD` to its Google App Password.
5. Set `FINANCIAL_OPENING_BANK_BALANCE` and `FINANCIAL_SHARE_CAPITAL` to the actual accounting opening balances.
6. Start the application with `npm run dev`.

Never commit `.env.local`, a Gmail App Password, database credentials, or the application login password. In production, store these values in the hosting provider's encrypted environment-variable settings. The local JSON database is intended for development only; use PostgreSQL for persistent or multi-instance deployments.

## Gmail setup

Enable 2-Step Verification for the Gmail account, then create an App Password in the Google Account security settings. Use that generated password only as `GMAIL_APP_PASSWORD`; do not use the normal Gmail password. The app uses Gmail's SMTP service over TLS on port 465. Gmail configuration is server-only and is not returned by settings or API responses.

## Checks

- `npm test` runs unit tests for invoice calculations, date validation, signed sessions, and atomic payment records.
- `npm run lint` runs ESLint.
- `npm run build` creates a production build.

## Deployment notes

Configure the same environment variables on the deployment host, use a strong unique session signing secret, and redeploy after changing secrets. Keep database backups and verify financial opening balances with an accountant before relying on generated statements for filings.
