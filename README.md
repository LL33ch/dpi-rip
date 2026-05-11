# DPI-CHECKER

[🇷🇺 Русский](./README.ru.md) | 🇬🇧 English

Internet Censorship & Blocking Detector — a client-side web tool for detecting DPI/TSPU blocking, checking site availability, detecting geo-restrictions, and checking if an IP is whitelisted on Russia's mobile internet.

## What it does

- **TCP 16-20 DPI detection** — tests 35+ hosting providers using the TCP 16-20 method to detect deep packet inspection interference
- **Site availability check** — checks 175+ websites across 17 categories (social media, news, messengers, streaming, etc.) with automatic retry on failure
- **GeoBlock check** — detects whether services (AI assistants, streaming platforms, etc.) are geo-restricted for your actual exit IP, including split-tunnel and policy-based routing scenarios
- **IP Whitelist check** — checks if any IPv4 address is present in Russia's mobile internet whitelist ([zarazaex/TWL](https://github.com/openlibrecommunity/twl)), with subnet-level scoring and ISP info via [ipapi.is](https://ipapi.is)
- **Network info** — displays your IP, ASN, ISP (with favicon), and geolocation via [ipapi.is](https://ipapi.is)
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

## How IP Whitelist check works

Checks whether an IPv4 address is present in the [zarazaex/TWL](https://github.com/openlibrecommunity/twl) whitelist — a crowdsourced list of IPs accessible via Russian mobile internet during connectivity restrictions.

Three sources are checked in parallel:

| Source | Description | Max score |
| ------ | ----------- | --------- |
| `verified.txt` | Direct IP match in the verified list | 95% |
| `subnets.c.json` | IP falls within a verified subnet | up to 90% |
| `subnets.json` | IP falls within a raw (unverified) subnet | up to 70% |

Score formula for subnet matches: `maxScore × (base + 0.4 × subnet_fill%)`, where `base` is 0.5 for verified subnets and 0.3 for raw subnets. The final score is the maximum across all sources.

ISP information (org name, ASN, country, city) is fetched from [ipapi.is](https://ipapi.is).

## Site check statuses

| Status     | Meaning                                                                 |
| ---------- | ----------------------------------------------------------------------- |
| OK         | Accessible                                                              |
| Blocked    | Unreachable (connection failed or timed out after 3 attempts)           |
| DPI        | Host alive but POST 64KB timed out — DPI detected                       |
| Suspicious | Large URI request timed out — possible DPI                              |
| GeoBlocked | Reachable, but exit IP country is on the service's blocked-country list |

## Configuration

Sites and categories are defined in `src/shared/config/config.ts`. Each category has an optional `checker` field:

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
        name: 'ChatGPT',
        blockedIn: ['CN', 'RU', 'BY', 'KP', 'CU', 'IR', 'SY', 'VE', 'MM'],
      },
    ],
  },

  // DPI providers — uses TCP 16-20 checker
  {
    id: 'providers',
    en: 'Providers (TCP 16-20)',
    sites: [{ d: 'example.com', flag: 'US', name: 'Provider' }],
  },

  // All other categories — uses simple HTTP reachability checker
  {
    id: 'social_intl',
    en: 'Social Media (International)',
    ru: 'Соцсети (международные)',
    sites: [{ d: 'twitter.com', name: 'X / Twitter' }],
  },
];
```

### Checkers

| Category    | Checker                             | File                              |
| ----------- | ----------------------------------- | --------------------------------- |
| `providers` | TCP 16-20 DPI detection             | `src/shared/api/check-dpi-provider.ts` |
| `geoblock`  | `cdn-cgi/trace` + geo-block verdict | `src/shared/api/check-cdn-trace.ts`    |
| all others  | Simple HTTP fetch with 2 retries    | `src/shared/api/check-site.ts`         |

## Stack

- Next.js 16 / React 19
- Mantine UI v9
- next-intl (EN / RU, locale in URL: `/en/`, `/ru/`)
- TypeScript
