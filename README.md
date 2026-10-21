This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Word list workflow (German)

1. Extract German words from Wiktionary:
   `WIKTIONARY_XML=.../dewiktionary-latest-pages-articles.xml tsx scripts/extract-de-wordlists.ts`
2. This generates `data/<length>.txt` and `data/answers/<length>.txt` for 3–11 letters.
3. Run `pnpm generate:wordlists` to build the TypeScript wordlists.
4. Run `pnpm wordlists:browser` to build the browser bundles.


## Analytics and advertising

`lib/site-scripts.ts` controls Google Analytics and the three Adsterra formats independently. Real scripts load only in a production build on `wortchamp.com`. Development and preview hosts load no real ads or GA; eligible desktop routes show banner placeholders. AdSense remains disabled.

Following termo-jogo, only game and word-finder routes show the side banners: 160×300 on the left and 160×600 on the right. They mount on desktops at least 1440px wide with a mouse/trackpad; mobile/touch devices mount no banner iframes. The Social Bar is hidden on mobile game/finder routes (widths up to 768px) and is available on other production routes. GA is available on all production devices.

The supplied Popunder script is loaded only by a new-game action after the first completed round, once per tab session and no more than once every 24 hours. Restoring saved finished games, abandoned rounds, development, and preview environments do not count as completed ad rounds. Storage restrictions fall back to in-memory counts.
