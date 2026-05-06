# DPI-CHECKER

[🇷🇺 Русский](./README.ru.md) | 🇬🇧 English

Internet Censorship & Blocking Detector — a client-side web tool for detecting DPI/TSPU blocking, checking site availability, and detecting geo-restrictions via Cloudflare's `cdn-cgi/trace`.

## What it does

- **TCP 16-20 DPI detection** — tests 35+ hosting providers using the TCP 16-20 method to detect deep packet inspection interference
- **Site availability check** — checks 175+ websites across 17 categories (social media, news, messengers, streaming, etc.) with automatic retry on failure
- **GeoBlock check** — detects whether services (AI assistants, streaming platforms, etc.) are geo-restricted for your actual exit IP, including split-tunnel and policy-based routing scenarios
- **Network info** — displays your IP, ASN, ISP, and geolocation via RIPE API
- **Statistics** — saves test history to localStorage and displays availability charts across runs

## How DPI detection works

The **TCP 16-20** method works as follows:

1. **Alive check** — verifies the host is reachable via a HEAD request
2. **POST 64KB** — sends a 64KB POST body; if the connection times out while the host is alive, TSPU/DPI is cutting the stream → status `DPI`
3. **Large URI** — sends repeated HEAD requests with ~7KB query strings (~63KB total); timeout → status `Suspicious`
4. All checks pass → `OK`

More about the method: [github.com/net4people/bbs/issues/490](https://github.com/net4people/bbs/issues/490)

Provider suite from: [hyperion-cs/dpi-checkers](https://github.com/hyperion-cs/dpi-checkers)

## How GeoBlock detection works

Services in the GeoBlock category sit behind Cloudflare. Every Cloudflare-proxied domain exposes a `/cdn-cgi/trace` endpoint that returns the client IP and country as seen by Cloudflare — readable cross-origin.

The checker fetches `https://{domain}/cdn-cgi/trace` for each service. Because the request goes to the actual service domain, it follows the user's routing policy — including split-tunnel VPN and domain-based routing rules (e.g. Keenetic, MikroTik). This means the IP and country returned reflect what the service actually sees, not the general browser IP.

The `loc` field from the trace response is compared against each service's known blocked-country list. If the country matches, the status is `GeoBlocked`.

```
chatgpt.com/cdn-cgi/trace response:
  ip=203.0.113.42   ← actual exit IP seen by the service
  loc=PL            ← country seen by the service → checked against blockedIn list
  colo=WAW          ← Cloudflare datacenter
```

## Site check statuses

| Status     | Meaning                                                                 |
| ---------- | ----------------------------------------------------------------------- |
| OK         | Accessible                                                              |
| Blocked    | Unreachable (connection failed or timed out after 3 attempts)           |
| DPI        | Host alive but POST 64KB timed out — DPI detected                       |
| Suspicious | Large URI request timed out — possible DPI                              |
| GeoBlocked | Reachable, but exit IP country is on the service's blocked-country list |

## Configuration

Sites and categories are defined in `lib/config.ts`. Each category has an optional `checker` field:

```typescript
export const CONFIG = [
  // GeoBlock services — uses cdn-cgi/trace checker with per-service geo-block lists
  {
    id: 'geoblock',
    en: 'GeoBlock',
    checker: 'cdn-trace',
    sites: [
      {
        d: 'chatgpt.com',
        flag: '🇺🇸',
        name: 'ChatGPT',
        logo: '/openai.svg',
        blockedIn: ['CN', 'RU', 'BY', 'KP', 'CU', 'IR', 'SY', 'VE', 'MM'],
      },
    ],
  },

  // DPI providers — uses TCP 16-20 checker
  {
    id: 'providers',
    en: 'Providers (TCP 16-20)',
    sites: [{ d: 'example.com', flag: '🇺🇸', name: 'Provider' }],
  },

  // All other categories — uses simple HTTP reachability checker
  {
    id: 'social_intl',
    en: 'Social Media (International)',
    sites: [{ d: 'twitter.com', flag: '🇺🇸', name: 'X / Twitter', logo: '/twitter.svg' }],
  },
];
```

### Checkers

| Category    | Checker                             | File                           |
| ----------- | ----------------------------------- | ------------------------------ |
| `providers` | TCP 16-20 DPI detection             | `lib/checkers/dpi-provider.ts` |
| `geoblock`  | `cdn-cgi/trace` + geo-block verdict | `lib/checkers/cdn-trace.ts`    |
| all others  | Simple HTTP fetch with 2 retries    | `lib/checkers/site.ts`         |

## Stack

- Next.js / React 19
- Tailwind CSS v4 + shadcn/ui
- TypeScript
