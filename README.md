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

On first start, the app initializes the private database cluster and creates the `crm_local` database. The React frontend and Express API run together on [http://127.0.0.1:3001](http://127.0.0.1:3001). The old Vite frontend address [http://127.0.0.1:5173](http://127.0.0.1:5173) redirects to the app on port 3001. The development frontend supports Vite hot reload; press Ctrl+C to stop the app. The database stays running locally for the next start.

The first visit opens a one-time account setup. The email is prefilled as `cernkey@outlook.com`; enter and confirm the password you chose to create your local login. The password must be at least 12 characters and is stored only as a salted scrypt hash in PostgreSQL. After setup, sign in with that email and password. There is one local account, and account setup closes once it has been created. Sessions use a signed, HTTP-only, same-site cookie and end when the server restarts or you sign out.

Useful database commands:

```sh
npm run db:status
npm run db:setup
npm run db:dump
npm run db:stop
```

`npm run db:dump` creates a compressed PostgreSQL custom-format backup at `backups/crm_local.dump`. The backup directory is ignored by Git because database backups can contain private contacts and password hashes. Keep the dump private and transfer it to your other laptop using a secure method; do not publish it or `.env`. On a second Linux laptop with PostgreSQL 18 installed, clone the project, run `npm install` and `npm run db:setup`, and restore the backup into the empty `crm_local` database before starting the app:

```sh
pg_restore --no-owner --no-privileges \
  --host "$HOME/.local/share/crm/socket" --port 55432 --username "$USER" \
  --dbname crm_local backups/crm_local.dump
```

The checked-in `.env.example` is a safe settings template. Create a private `.env` only for optional local overrides; it is ignored by Git. The account password is entered in the first-run setup and is not stored in `.env`.

To prepare and serve a production build locally:

```sh
npm start
```

`npm start` automatically builds the React frontend and starts the Express API, serving the complete application from [http://127.0.0.1:3001](http://127.0.0.1:3001). For development, `npm run dev` serves both frontend and API on the same address with hot reload. Both start commands also redirect the old port 5173 address to port 3001. You can run `npm run build` separately to check the frontend build.

## Features

- Create, edit, search, filter, and delete contacts
- Choose which contact columns appear in the list; saved column preferences persist in the browser
- Sign in to a single, private local account
- Import up to 50,000 contacts per file from Google Contacts/Outlook CSV or standard vCard files (50 MB file size limit)
- Automatically map names, companies, email addresses, phone numbers, and notes; new imports default to Lead
- Skip imported contacts whose email address already exists, ignoring letter case
- Track company, email, phone, notes, and Lead/Active/Inactive status
- View contact, customer, lead, and company counts
- Validate contact details in the API and store them in PostgreSQL
- Health check at `/api/health`

Optional database and API settings can be copied from `.env.example` into `.env`.

Run the import parser tests with `npm test`.
