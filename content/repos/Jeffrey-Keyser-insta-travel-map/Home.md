---
title: "Insta Travel Map"
description: "Overview of the Insta Travel Map repo: a map-based travel request app with Pay-service auth, a React client, and an Express API on a self-hosted Beelink."
---

# Insta Travel Map

Insta Travel Map is a travel request web app. Signed-in users place a pin on a map and submit a note, optionally tied to an Instagram handle, and admins review the results ([README.md:L3](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/README.md#L3)). The README documents an Express backend run as a systemd unit on a Beelink mini PC, reached through a Cloudflare Tunnel, with the React frontend published to S3 and CloudFront ([README.md:L4](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/README.md#L4), [README.md:L8-L10](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/README.md#L8-L10)). These are documented deployment facts. This snapshot shows the wiring but does not verify live state.

## At a glance

- **Client**: React 19 and Vite, with Redux Toolkit and RTK Query for API calls ([client/package.json:L11](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/client/package.json#L11), [client/package.json:L29-L30](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/client/package.json#L29-L30)).
- **Server**: Express 5 and TypeScript, built through `createServerlessApp` from `@jeffrey-keyser/express-server-factory` ([server/package.json:L19](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/package.json#L19), [server/app.ts:L1-L4](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/app.ts#L1-L4)).
- **Auth**: `@jeffrey-keyser/pay-auth-integration` pinned to `^6.10.1`, with the external Pay service URL taken from config ([AGENTS.md:L7](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/AGENTS.md#L7), [server/app.ts:L93](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/app.ts#L93)).
- **Data**: PostgreSQL through `@jeffrey-keyser/database-base-config`. The schema defaults to `travel`, and travel requests are read from `travel.travel_requests` ([server/config/env.ts:L94](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/config/env.ts#L94), [server/services/TravelRequestService.ts:L40-L41](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/services/TravelRequestService.ts#L40-L41)).
- **API base**: Routes are mounted under `/api/v1` ([server/app.ts:L290](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/app.ts#L290)).
- **CI/CD**: Pull requests run a test suite. Pushes to `main` deploy the frontend and trigger the backend redeploy webhook ([.github/workflows/ci-cd-pipeline.yml:L11-L12](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/.github/workflows/ci-cd-pipeline.yml#L11-L12), [.github/workflows/ci-cd-pipeline.yml:L44-L45](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/.github/workflows/ci-cd-pipeline.yml#L44-L45)).

## Who uses it

- **Signed-in users** submit requests from the map panel. The form is only shown after authentication ([client/src/components/ActionBar.tsx:L175-L191](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/client/src/components/ActionBar.tsx#L175-L191)), and the POST route requires auth ([server/routes/travel-requests.ts:L55-L57](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/routes/travel-requests.ts#L55-L57)).
- **Admins** get an admin tab and admin pages behind a role check ([client/src/components/ActionBar.tsx:L101-L105](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/client/src/components/ActionBar.tsx#L101-L105), [client/src/App.tsx:L61-L69](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/client/src/App.tsx#L61-L69)). The admin travel-request API uses `requireAuth({ role: "admin" })` ([server/routes/admin/travel-requests.ts:L28-L30](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/routes/admin/travel-requests.ts#L28-L30)).
- **Prospective users** can submit access requests through public endpoints ([server/app.ts:L101-L102](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/app.ts#L101-L102), [server/routes/access-requests.ts:L53](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/routes/access-requests.ts#L53)).

## Main flow

1. A user signs in through the Pay provider configured in the client ([client/src/index.tsx:L17-L20](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/client/src/index.tsx#L17-L20), [client/src/index.tsx:L24-L38](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/client/src/index.tsx#L24-L38)).
2. The server validates the note and coordinates, then checks the Instagram handle against the Pay ACL ([server/services/TravelRequestService.ts:L124-L131](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/services/TravelRequestService.ts#L124-L131), [server/services/TravelRequestService.ts:L143-L146](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/services/TravelRequestService.ts#L143-L146)).
3. The request is inserted into the database ([server/services/TravelRequestService.ts:L148-L174](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/services/TravelRequestService.ts#L148-L174)).
4. Admins list all requests through the admin route ([server/routes/admin/travel-requests.ts:L33](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/routes/admin/travel-requests.ts#L33)).

The ACL admin screen is not yet live. It renders mock entries, and approve or block only changes local state ([client/src/containers/AdminAcl.tsx:L50-L51](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/client/src/containers/AdminAcl.tsx#L50-L51), [client/src/containers/AdminAcl.tsx:L89-L99](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/client/src/containers/AdminAcl.tsx#L89-L99)).

## Wiki pages

- [Architecture](../architecture/): components, contracts, and the request path.
- [Iteration Loop](../iteration-loop/): local commands, guardrails, and CI-driven delivery.
- [Services and Dependencies](../services-and-dependencies/): what this app depends on and who calls it.
- [Operations](../operations/): start, deploy, test, health, and logs.
- [Glossary](../glossary/): project-specific terms.
