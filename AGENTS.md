# AGENTS.md

## Purpose
This repository is a Turkish digital invitation site for İrem & Ekrem. It renders the main invitation, event-specific QR landing pages, and guest photo/video upload pages backed by S3-compatible Object Storage presigned uploads.

This file is an operating guide for future humans and AI agents. It documents the architecture that exists now and defines default choices so new work stays consistent instead of introducing parallel patterns.

## Repository snapshot
- **Main technologies:** TypeScript, React, Next.js App Router, Tailwind CSS, S3-compatible Object Storage APIs.
- **Runtime(s):** Browser for interactive UI/upload flow; Node.js for the upload signing API route.
- **Framework(s):** Next.js `16.2.6`, React `19.2.4`, Tailwind CSS v4 via `@tailwindcss/postcss`.
- **Key dependencies:** `motion` for client animations; `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` for Object Storage presigned uploads.
- **Package manager:** `pnpm@10.29.3`.
- **Build/test/lint commands:**
  - `pnpm dev` - run the Next development server.
  - `pnpm build` - build the Next app.
  - `pnpm start` - serve a production build.
  - `pnpm lint` - run ESLint.
  - No test script exists. Use `pnpm exec tsc --noEmit` for an explicit type check when needed.
- **Deployment target:** Netlify is detectable through `netlify.toml`, with `pnpm build` and `.next` as the publish directory.
- **Persistence/integration:** Hetzner Object Storage, or another S3-compatible object store, is used as object storage; metadata is written as JSON sidecar objects in the same bucket.

## Current project structure
- `src/app/` - Next App Router entrypoints, route-level metadata, static params, and API routes.
- `src/app/layout.tsx` - global HTML/body shell, Turkish language setting, metadata sourced from `siteCopy`.
- `src/app/page.tsx` - main invitation route; composes sections from typed event config and invitation components.
- `src/app/qr/[eventKey]/page.tsx` - QR landing route for each event; validates `eventKey`, generates noindex metadata, delegates UI to `QrLandingPage`.
- `src/app/upload/[eventKey]/page.tsx` - upload page route for each event; validates `eventKey`, generates noindex metadata, delegates UI to `UploadPage`.
- `src/app/api/upload/sign/route.ts` - only API endpoint; validates upload signing requests, creates Object Storage presigned PUT URLs, writes upload metadata, and returns typed JSON responses.
- `src/app/globals.css` - Tailwind v4 import, invitation design tokens, theme bindings, global body styling, and reduced-motion defaults.
- `src/components/layout/` - reusable page frame and decorative layout primitives.
- `src/components/invitation/` - invitation-facing UI sections, event details, QR landing UI, countdown, location actions, upload calls to action, and music control.
- `src/components/upload/` - upload page UI and queue/dropzone behavior.
- `src/components/motion/` - small client-only motion primitives used by invitation and upload UI.
- `src/config/` - typed runtime-independent configuration for events, design tokens/assets, and upload limits.
- `src/content/copy.ts` - centralized Turkish UI and metadata copy.
- `src/lib/` - cross-cutting pure helpers, browser upload client, Object Storage access, metadata helpers, security helpers, and session helpers.
- `src/types/` - shared TypeScript contracts for events and upload request/response/metadata shapes.
- `public/assets/` - committed decorative image and SVG assets.
- `public/audio/` - committed invitation audio, including `background.mp3`.
- `public/robots.txt` - blocks `/upload` and `/qr`.
- `.env.example` - required Object Storage, upload-security, and public site URL environment variables.
- `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `.npmrc` - package, lockfile, and pnpm-specific setup.
- `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `tsconfig.json` - framework, Tailwind/PostCSS, lint, and TypeScript configuration.
- `netlify.toml` - Netlify build command and publish directory.

## Architecture overview
The app is a small feature-oriented Next.js App Router application rather than a layered enterprise backend. The durable boundaries are route entrypoints, feature component folders, typed config/content, shared contracts, and library helpers.

The product surface is intentionally narrow: invitation details, countdowns, maps, music, QR landing pages, and anonymous photo/video uploads. There is no RSVP, guest list, login, admin panel, public gallery, multilingual mode, schedule timeline, or contact workflow in the current app.

Request flow:
- `/` renders `src/app/page.tsx`, which composes `InvitationShell`, invitation sections, and `MusicButton`.
- `/qr/[eventKey]` and `/upload/[eventKey]` use `generateStaticParams()` from `eventKeys`, validate params with `isEventKey()`, return `notFound()` for invalid event keys, and render feature components.
- `/api/upload/sign` accepts JSON upload metadata, validates it server-side, signs a direct Object Storage PUT URL, writes a metadata JSON object, and returns either `UploadSignSuccessResponse` or `UploadSignErrorResponse`.

Data flow:
- Event data lives in `src/config/events.ts`.
- Display copy lives in `src/content/copy.ts`.
- UI reads config/copy directly and passes typed `EventConfig` objects down to components.
- Upload UI validates files locally, requests a signing URL from the API, uploads directly to Object Storage with XHR for progress, and stores a session id in `sessionStorage`.
- S3-compatible Object Storage is the persistence layer. There is no database, ORM, migration system, queue, worker, or admin/download surface in the current tree.

State management is intentionally local. Client components use React hooks and refs for browser APIs, countdown timers, clipboard actions, music playback, and upload queue processing. There is no global store.

Business logic is split by portability:
- Pure calculations and validation belong in `src/lib/`.
- Route-specific server validation and response shaping currently live in the API route.
- Browser-only upload/session behavior belongs in client components or browser-oriented `src/lib/*` modules.
- Presentation belongs in feature components and should stay driven by typed config and centralized copy.

## Architectural decisions
- **Decision:** Events are a closed, typed registry.
  - **Evidence:** `EventKey` is `"henna" | "ceremony"`, `eventKeys` is the canonical route list, `events` is `Record<EventKey, EventConfig>`, and routes call `isEventKey()`.
  - **Implication:** Add or change events through `src/types/event.ts` and `src/config/events.ts`; do not hardcode event slugs independently in routes or components.

- **Decision:** Routes should be thin adapters.
  - **Evidence:** `page.tsx` files perform param validation, metadata generation, and component delegation; UI lives under `src/components/`.
  - **Implication:** New pages should keep route files focused on routing/metadata/data selection and put render complexity into feature components.

- **Decision:** UI copy is centralized.
  - **Evidence:** `siteCopy` supplies metadata, hero text, event labels, upload labels, QR copy, music labels, and final copy.
  - **Implication:** New user-facing Turkish text should normally be added to `src/content/copy.ts` and referenced from components.

- **Decision:** Client-only behavior is explicitly isolated.
  - **Evidence:** `Countdown`, `LocationActions`, `MusicButton`, `Reveal`, `ParallaxLayer`, and `UploadDropzone` use `"use client"` and browser APIs.
  - **Implication:** Keep components server-renderable by default. Add `"use client"` only at the smallest boundary that needs hooks, `window`, `document`, media, clipboard, drag/drop, or motion APIs.

- **Decision:** Uploads are direct-to-Object Storage, not proxied through Next.
  - **Evidence:** `/api/upload/sign` returns a presigned PUT URL; `upload-client.ts` sends the file directly with `XMLHttpRequest`.
  - **Implication:** Do not introduce server-side file buffering for normal uploads. Preserve signing, client PUT, and JSON metadata sidecar flow unless requirements materially change.

- **Decision:** Upload metadata is privacy-aware but minimal.
  - **Evidence:** Metadata records include event/session/upload ids, file descriptors, client metadata, user agent, and an HMAC IP hash using `UPLOAD_IP_HASH_SECRET`.
  - **Implication:** Do not store raw IP addresses or unnecessary personal data. New metadata fields must have a clear operational purpose.

- **Decision:** QR and upload pages should not be indexed.
  - **Evidence:** `createNoIndexMetadata()` is used by QR/upload routes, and `public/robots.txt` disallows `/upload` and `/qr`.
  - **Implication:** Keep private/event utility pages noindexed unless the product intent changes explicitly.

- **Decision:** Design is token-led but implemented with Tailwind utilities.
  - **Evidence:** `globals.css` defines invitation colors/radius/shadows/fonts as Tailwind theme tokens; components use semantic classes such as `bg-pearl`, `text-olive`, `rounded-invitation-card`, and local `as const` style maps.
  - **Implication:** Prefer existing tokens and local accent style maps over one-off hex values or unrelated visual systems.

- **Decision:** Tests and CI are not currently present.
  - **Evidence:** No test config, test files, or CI directory exists in the current tree.
  - **Implication:** Do not claim coverage exists. For risky logic, add focused tests and the minimal supporting test setup, or at least run lint/build/type checks before handoff.

## Default rules for future changes
- Prefer feature-oriented placement. Invitation UI belongs in `src/components/invitation/`, upload UI in `src/components/upload/`, layout primitives in `src/components/layout/`, and animation primitives in `src/components/motion/`.
- New route files under `src/app/` should validate params, generate metadata, choose config, and delegate rendering. Do not put large UI trees or upload orchestration directly in route files.
- Use `@/` imports for source-root imports. Relative imports are acceptable only for nearby sibling components inside the same feature folder.
- Keep components server components by default. Move `"use client"` down to the component that actually needs browser state or effects.
- Keep code identifiers, route slugs, files, and types in English. Keep user-facing copy in Turkish.
- Keep event keys as code values (`henna`, `ceremony`) and display labels as Turkish (`Kına`, `Kına Gecesi`, `Nikah`).
- Do not add RSVP, guest identity collection, authentication, admin panels, public galleries, language toggles, or contact workflows unless explicitly requested as new product scope.
- Put event facts in `src/config/events.ts`, design constants/assets in `src/config/design.ts`, upload limits in `src/config/upload.ts`, and UI copy in `src/content/copy.ts`.
- When adding an event, update `EventKey`, `eventKeys`, `events`, event-specific copy, metadata/title maps, style maps, and any upload/QR expectations in one change. Use `satisfies Record<EventKey, ...>` so TypeScript catches missing cases.
- Prefer `as const`, explicit union types, and `satisfies` for closed maps that must stay in sync with `EventKey` or upload error codes.
- Keep reusable pure logic in `src/lib/`. If a helper is only used by one component or route, keep it local until a second real use exists.
- Validation belongs on both sides when it protects UX and storage: client-side validation for immediate feedback, server-side validation for trust boundaries.
- API response shapes belong in `src/types/upload.ts`; API routes and clients should share those contracts instead of ad hoc JSON shapes.
- Server secrets must stay in server-only paths such as API routes and Object Storage/security helpers. Never expose Object Storage credentials or `UPLOAD_IP_HASH_SECRET` through client components or `NEXT_PUBLIC_*`.
- Preserve the Object Storage key pattern under `uploads/{event}/{sessionId}/files/` and `uploads/{event}/{sessionId}/metadata/` unless a migration plan is written.
- Use `NextResponse.json()` with explicit error codes for API failures. Keep client-facing errors stable enough for upload UI to handle.
- UI should remain mobile-first and invitation-shaped: a narrow `InvitationShell`, semantic sections, Turkish copy, accessible labels, focus-visible styles, and restrained token-based colors.
- Use `Reveal` and `ParallaxLayer` for scroll animation patterns and respect reduced motion. Do not add animation libraries when `motion` already covers the need.
- Add public assets under `public/` and reference them through config when they are design-level assets. Do not reference assets that are not committed.
- For upload changes, maintain queue safety: respect `MAX_PARALLEL_UPLOADS`, keep progress updates stable, and avoid unbounded parallel uploads.
- For new tests, start with pure logic (`src/lib/*`) and API validation, then add component/browser coverage only where behavior cannot be checked cheaply.
- Before finishing non-trivial changes, run `pnpm lint` and `pnpm build` when practical. Add `pnpm exec tsc --noEmit` when type-level contracts changed.

## Allowed patterns
- Typed registries keyed by `EventKey`, with `satisfies Record<EventKey, ...>` for exhaustive coverage.
- Small route adapters that import config, validate params, and delegate to feature components.
- Feature components that receive `EventConfig` rather than re-reading route params.
- Local style maps inside components for event accents and state-specific class names.
- Client components for browser APIs, media playback, drag/drop, upload progress, clipboard, timers, and motion.
- Pure helpers in `src/lib/` for countdown math, file validation, metadata helpers, Object Storage access, security hashing, and session/upload clients.
- Direct browser-to-Object Storage uploads using server-generated presigned URLs.
- JSON sidecar metadata objects for upload audit records.
- Tailwind utility classes backed by tokens from `globals.css`.

## Discouraged or legacy patterns
- **Legacy:** The previous docs, phase files, and prompts are deleted from the current working tree. This file replaces the prior tracked `AGENTS.md`; do not treat deleted planning files as authoritative unless they are intentionally restored.
- **Transitional:** Upload page titles are currently duplicated in the upload route and `UploadPage`. Do not add more duplicated title maps; centralize repeated event-specific copy when touching this area.
- **Exception-only:** Inline SVG icons exist in `MusicButton` because no icon library is installed. Do not expand a large inline icon set; if icon needs grow, introduce a consistent icon strategy.
- **Discouraged:** Hardcoded user-facing copy inside components when a `siteCopy` location is appropriate.
- **Discouraged:** New global state management for local upload, countdown, clipboard, or media state.
- **Discouraged:** Server-side upload proxying or buffering for normal guest uploads.
- **Discouraged:** New route-specific event slug lists outside `eventKeys`.
- **Discouraged:** One-off color hex values or new visual palettes outside `globals.css` and `src/config/design.ts`.
- **Discouraged:** Moving code into a generic `shared/` area. This repo uses `src/lib/`, `src/types/`, `src/config/`, and feature component folders instead.

## Feature addition playbook
1. Identify the feature boundary: route, invitation UI, upload UI, config/content, or library logic.
2. Add or update shared contracts in `src/types/` only if multiple modules need the shape.
3. Add static facts to `src/config/` and Turkish display copy to `src/content/copy.ts`.
4. Implement pure logic in `src/lib/` if it is reusable or test-worthy; otherwise keep helper functions local.
5. Add route entrypoints under `src/app/` only for new URLs. Keep them thin: params, metadata, config lookup, `notFound()`, and component delegation.
6. Add UI in the appropriate `src/components/*/` feature folder. Keep server components as the default and isolate client behavior.
7. For upload/API work, update `src/types/upload.ts`, server validation in `src/app/api/upload/sign/route.ts`, client behavior in `src/lib/upload-client.ts` or `UploadDropzone`, and upload constants in `src/config/upload.ts`.
8. For event additions, update `EventKey`, `eventKeys`, `events`, QR/upload copy, title/style maps, and route static params.
9. Add or update public assets under `public/` and reference design-level assets through `assetSlots`.
10. Run `pnpm lint` and `pnpm build`; run `pnpm exec tsc --noEmit` when contracts or route types changed.
11. If behavior is risky and no test harness exists, add the smallest appropriate test setup instead of relying only on manual inspection.

## Decision policy for ambiguous cases
- When there are multiple possible places for UI, choose the feature folder over a generic shared location.
- When there are multiple possible places for data, choose `config` for event/design/upload facts and `content` for user-facing copy.
- When a utility is used once, keep it near the caller. Move it to `src/lib/` only after it becomes cross-cutting or independently testable.
- When choosing between a new abstraction and a small local map/function, prefer the small local map/function until duplication becomes real.
- When adding browser behavior, isolate it in the smallest client component and keep parent composition server-renderable.
- When introducing storage, first see whether the existing Object Storage object/metadata conventions are enough. Do not add a database, queue, or worker by default.
- When making API changes, preserve typed request/response contracts and stable error codes over loosely shaped responses.
- When uncertain about privacy, store less data and prefer derived or hashed values.

## Open questions / uncertainty
- There is no ADR, CI config, or test setup in the working tree.
- README screenshots live under `docs/screenshots/` and should be regenerated when the visible page design meaningfully changes.
- Netlify deployment is configured minimally. Any required Netlify Next.js adapter/plugin behavior is not documented in the repo.
- Hetzner Object Storage bucket CORS, lifecycle policy, access policy, and owner download workflow are not represented in code.
- Upload signing validation is route-local. If more API endpoints appear, common API validation/error helpers may become worthwhile, but that abstraction does not exist yet.

## Maintenance note
Update `AGENTS.md` whenever the repository structure, route architecture, upload flow, deployment target, test strategy, or design system meaningfully changes.
