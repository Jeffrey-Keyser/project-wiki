---
title: "Music Store Wiki Home"
description: "Overview of the music-store monorepo: Express API, React client, shared types, and the music-sync CLI."
---

# Music Store

Music Store is a cloud-backed music library service that stores MP3 files in S3 and provides a web UI for browsing, uploading, and managing tracks. It is designed for DJ use with RecordBox integration ([CLAUDE.md:L7](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/CLAUDE.md#L7)). The root package describes it as an Express API server, React client, shared types, and CLI sync tool ([package.json:L5](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/package.json#L5)).

## At a glance

- **API:** Express 5 server ([server/package.json:L30](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/server/package.json#L30)). Default port 3022 ([server/src/bin/www.ts:L9](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/server/src/bin/www.ts#L9)).
- **Client:** React 19 app ([client/package.json:L10](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/client/package.json#L10)). Vite dev port 3024 ([client/vite.config.ts:L8](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/client/vite.config.ts#L8)). The frontend unit serves `dist` on 3023 ([music-store-frontend.service:L9](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/music-store-frontend.service#L9)).
- **CLI:** `music-sync` binary ([cli/package.json:L7](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/cli/package.json#L7)).
- **Data:** PostgreSQL `music` schema ([server/database.json:L2](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/server/database.json#L2)) and S3 object storage ([server/src/services/storage.ts:L12-L14](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/server/src/services/storage.ts#L12-L14)).
- **Auth:** Pay service JWTs via the pay-auth pipeline ([server/src/middleware/auth.ts:L31-L42](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/server/src/middleware/auth.ts#L31-L42)).

## Who uses it

- **Library users** browse, search, rate, tag, and upload tracks in the web UI ([client/src/App.tsx:L85-L93](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/client/src/App.tsx#L85-L93)).
- **DJs syncing locally** use `music-sync pull` and `push` ([cli/src/index.ts:L110-L165](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/cli/src/index.ts#L110-L165)). The default sync folder is `~/Music/RecordBox` ([cli/src/config.ts:L49](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/cli/src/config.ts#L49)).
- **Contributors** work from the scripts described in [Iteration Loop](../iteration-loop/).

## Main flow

1. A client posts an MP3 to `POST /tracks/upload` ([server/src/routes/tracks.ts:L159](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/server/src/routes/tracks.ts#L159)).
2. The service validates size and MP3 content, extracts metadata, computes a SHA-256 checksum, rejects duplicates, uploads to S3, and inserts the row ([server/src/services/tracks.ts:L81-L115](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/server/src/services/tracks.ts#L81-L115)).
3. Audio analysis is scheduled after the response is sent ([server/src/routes/tracks.ts:L187-L191](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/server/src/routes/tracks.ts#L187-L191)).
4. The CLI fetches `/sync/manifest` and downloads files whose checksums differ ([cli/src/api.ts:L34-L48](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/cli/src/api.ts#L34-L48), [cli/src/sync.ts:L44-L45](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/cli/src/sync.ts#L44-L45)).

## Pages

- [Architecture](../architecture/)
- [Iteration Loop](../iteration-loop/)
- [Services and Dependencies](../services-and-dependencies/)
- [Operations](../operations/)
- [Glossary](../glossary/)
