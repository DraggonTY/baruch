# BARUCH — Pre-Launch Website

A pre-launch marketing site for BARUCH, an independent fragrance house.

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Framer Motion

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```

## Email Waitlist (Stub)

The join form posts to `POST /api/waitlist`. The current implementation logs signups to the server console.

To wire a real provider, update [`lib/waitlist.ts`](lib/waitlist.ts):

| Provider | Env vars |
|----------|----------|
| Supabase | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| Resend Audiences | `RESEND_API_KEY` |
| Mailchimp | `MAILCHIMP_API_KEY`, `MAILCHIMP_LIST_ID` |

## Deployment

Deploy to [Vercel](https://vercel.com):

1. Push this repo to GitHub
2. Import the project in Vercel
3. Deploy — no env vars required for the stub waitlist

## Project Structure

```
app/              # Routes, layout, API
components/       # UI, sections, layout
lib/              # Copy constants, waitlist handler
public/           # Logo, lab images, OG image
```

## Replacing Lab Images

Placeholder images live in `public/images/lab/`. Replace with brand photography when ready and update paths in `lib/constants.ts` if needed.
