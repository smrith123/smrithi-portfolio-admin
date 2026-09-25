# Smrithi Portfolio · Admin

The content management panel behind the public portfolio. It talks to
`smrithi-portfolio-backend` over its REST API and never touches the database
directly.

## Running it

```bash
cp .env.example .env.local
npm install
npm run dev        # http://localhost:3001
```

The backend must be running first. Sign in with the single admin account from
the backend's `src/config/admin.ts` (or whatever its `ADMIN_*` variables set).

| Variable | |
| --- | --- |
| `NEXT_PUBLIC_BACKEND_URL` | The API, including `/api`. Default `http://localhost:5000/api` |
| `NEXT_PUBLIC_STOREFRONT_URL` | The public site, used by the "View on site" links |

Both are baked in at build time. `next build` refuses to run without them, and on
Vercel it also refuses `localhost` values, so a production build cannot point at
a developer's machine. After changing either one in Vercel, redeploy.

## Deploying to Vercel

Import this folder as its own Vercel project (framework Next.js, defaults
otherwise), set the two variables above for Production, and deploy. The panel
sends `X-Robots-Tag: noindex` and refuses to be framed. Add its origin to the
backend's `CORS_ORIGIN`, or every request fails with "Can't reach the server".

## How it is put together

The sidebar follows the public site from the top of the page down, so "where is
this on the website" and "where do I edit it" are the same question.

Every content screen is the same three lines:

```tsx
const state = useSection<HeroSection>("home.hero");   // load, draft, dirty, save
<SectionShell title="Hero" preview="/" state={state}> // header, errors, save bar
  ...fields                                           // the only part that differs
</SectionShell>
```

`src/components/fields/` holds the shared inputs: `ImageField` and `FileField`
(both open the media picker; uploads are checked against Cloudinary's size limits
in `src/lib/uploads.ts` before anything is sent), `HeadingField`, `CtaField` and `ItemList` for any
add / reorder / remove list. `src/lib/types.ts` mirrors the backend's section
schemas.

Display headings are stored as structured lines so the site can paint parts of
them pink. The editor shows them as plain text instead: one line per row, and
`*asterisks*` around anything that should be pink (`_underscores_` for the one
card that is pink on mobile only). `src/lib/heading.ts` converts both ways and is
covered by `npm test`.

## Design

Locked to the brand palette: `#32302B` ink, `#E8D5B5` sand, `#FFF8E7` cream,
`#DFF2D7` mint for saved confirmations, plus one muted brick tone reserved for
destructive actions. Sand is the only accent. Corner radii follow one rule:
8px on controls, 12px on panels, full pill on status chips. Motion is limited to
150ms colour transitions and the save bar sliding in. Single light theme.

Fonts are the portfolio's own: Starleague for headings, DM Sans for the
interface, DM Mono for ids and file names.

## Authentication

The JWT is kept in `localStorage` and sent as a bearer token. It lasts seven
days. There is one admin account, set in the backend's configuration: the panel
has no password reset and no way to change the password (the signed-in email is
shown at the foot of the sidebar). Changing the password on the server signs out every
session. Signing out or an expired session triggers a full reload, so nothing from the previous session
stays in memory. This is sized for one trusted operator; a panel opened to more
people should move the token into an httpOnly cookie behind a route handler.
