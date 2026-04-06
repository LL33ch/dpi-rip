# DPI-CHECKER

Internet Censorship & Blocking Detector — a client-side web tool for detecting DPI/TSPU blocking and checking the availability of popular websites.

## What it does

- **TCP 16-20 DPI detection** — tests 35+ hosting providers using the TCP 16-20 method to detect deep packet inspection interference
- **Site availability check** — checks 175+ websites across 16 categories (social media, news, messengers, streaming, etc.) with automatic retry on failure
- **Network info** — displays your IP, ASN, ISP, and geolocation via RIPE API

## How DPI detection works

The **TCP 16-20** method works as follows:

1. **Alive check** — verifies the host is reachable via a HEAD request
2. **POST 64KB** — sends a 64KB POST body; if the connection times out while the host is alive, TSPU/DPI is cutting the stream → status `DPI`
3. **Large URI** — sends repeated HEAD requests with ~7KB query strings (~63KB total); timeout → status `Suspicious`
4. All checks pass → `OK`

More about the method: [github.com/net4people/bbs/issues/490](https://github.com/net4people/bbs/issues/490)

Provider suite from: [hyperion-cs/dpi-checkers](https://github.com/hyperion-cs/dpi-checkers)

## Site check statuses

| Status | Meaning |
|---|---|
| OK | Accessible |
| Blocked | Unreachable (connection failed or timed out after 3 attempts) |
| DPI | Host alive but POST 64KB timed out — DPI detected |
| Suspicious | Large URI request timed out — possible DPI |

## Configuration

Sites and categories are defined in `lib/config.ts`:

```typescript
export const CONFIG = [
  {
    id: 'category-id',
    en: 'Category Name',
    sites: [
      { d: 'example.com', flag: '🇺🇸', name: 'Example' },
    ],
  },
];
```

The `providers` category uses the TCP 16-20 checker (`lib/checkers/dpi-provider.ts`). All other categories use the simple HTTP checker (`lib/checkers/site.ts`) with 2 retries on failure.

## Stack

- Next.js 16 / React 19
- Tailwind CSS v4 + shadcn/ui
- TypeScript
