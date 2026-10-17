# Northstar CRM

A private contacts CRM that runs on this laptop. The React interface, Express API, and PostgreSQL database are all local; the app does not send contact data to a hosted service.

## Requirements

- Node.js 20.19+ (or 22.12+)
- PostgreSQL 18 installed at `/usr/lib/postgresql/18/bin`

The app runs its own PostgreSQL cluster as your Linux user, separately from any system PostgreSQL service. It listens only on a private Unix socket; no database TCP port is exposed. Database files are stored in `~/.local/share/crm/postgres`.

## Start developing

From this folder, run:

```sh
npm install
npm run dev
```

On first start, the app initializes the private database cluster and creates the `crm_local` database. Open [http://127.0.0.1:5173](http://127.0.0.1:5173). Press Ctrl+C to stop the app; the database stays running locally for the next start.

The first visit opens a one-time account setup. The email is prefilled as `cernkey@outlook.com`; enter the password you chose to create your local login. The password must be at least 12 characters and is stored only as a salted scrypt hash in PostgreSQL. After setup, sign in with that email and password. There is one local account, and account setup closes once it has been created. Sessions are held in a signed, HTTP-only, same-site cookie.

Useful database commands:

```sh
npm run db:status
npm run db:setup
npm run db:stop
```

To prepare and serve a production build locally:

```sh
npm run build
npm start
```

The production app is available at [http://127.0.0.1:3001](http://127.0.0.1:3001).

## Features

- Create, edit, search, filter, and delete contacts
- Sign in to a single, private local account
- Import up to 1,000 contacts from Google Contacts/Outlook CSV or standard vCard files
- Automatically map names, companies, email addresses, phone numbers, and notes; new imports default to Lead
- Skip imported contacts whose email address already exists, ignoring letter case
- Track company, email, phone, notes, and Lead/Active/Inactive status
- View contact, customer, lead, and company counts
- Validate contact details in the API and store them in PostgreSQL
- Health check at `/api/health`

Optional database and API settings can be copied from `.env.example` into `.env`.

Run the import parser tests with `npm test`.
