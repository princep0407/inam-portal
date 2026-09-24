# Inam Vitran – Balmandal Portal (Netlify)

## Deploy
Option A (Git): push this folder to GitHub -> Netlify "Add new site > Import from Git". No build command; publish dir `public`.
Option B (CLI): `npm i -g netlify-cli && npm install && netlify deploy --prod`

## Environment variables (Site settings > Environment variables)
- `ADMIN_PASSWORD` – admin password (default `admin@123`)
- `TOKEN_SECRET` – any long random string (signs login tokens)

## Logins
Balmandal: username = name (case/spaces ignored), password = name (lowercase, no spaces) + `@123`. Admin: `admin`.
Data (sent ticks, phones, message, image) is stored in Netlify Blobs and shared by everyone.
