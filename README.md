This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

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

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## PWA & Web Push Notifications

1. Generate a VAPID key pair (the `web-push` utility is already available via the backend dependency):
   ```bash
   npx web-push generate-vapid-keys --json
   ```
2. Copy the generated keys into your environment (e.g. in `.env.local`):
   ```ini
   WEB_PUSH_PUBLIC_KEY=...
   WEB_PUSH_PRIVATE_KEY=...
   WEB_PUSH_CONTACT=mailto:you@example.com
   ```
   `WEB_PUSH_CONTACT` can be any valid mailto URL that represents the sender.
3. Start the dev server with `pnpm dev`, open the landing page, and click “푸시 구독” to allow notifications.

The frontend automatically registers `/push-service-worker.js` as the service worker and fetches the public key from `/api/webpush/publicKey` before subscribing.

### Backend endpoints

- `GET /api/webpush/publicKey` – returns the VAPID public key used to activate `PushManager`.
- `POST /api/webpush/subscribe` – stores the client’s subscription object (called automatically by the frontend).
- `POST /api/webpush/send` – dispatches a push to every stored subscription. The request body accepts an optional `payload` object with `title`, `body`, `url`, and `icon` fields.

### Manual push test

After subscribing, you can trigger a notification via:

```bash
curl -X POST http://localhost:3000/api/webpush/send \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "title": "테스트 푸시",
      "body": "서버에서 보낸 알림입니다.",
      "url": "https://your-app-domain.example"
    }
  }'
```

The service worker defined in `public/push-service-worker.js` displays the notification and focuses or opens the provided `url` when the user taps it.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.
