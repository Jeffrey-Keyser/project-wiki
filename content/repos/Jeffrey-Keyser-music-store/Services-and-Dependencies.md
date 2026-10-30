---
title: "Music Store Services and Dependencies"
description: "Runtime dependencies and consumers of music-store, separating confirmed callers in source from expected or unknown ones."
---

# Services and Dependencies

## Depends on

- **PostgreSQL.** The pool uses the `music` schema ([server/src/db/connection.ts:L5-L8](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/server/src/db/connection.ts#L5-L8)). Required database variables are checked at startup ([server/src/config/env.ts:L7](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/server/src/config/env.ts#L7)).
- **S3.** Uploads and downloads go through `@aws-sdk/client-s3` ([server/src/services/storage.ts:L1-L14](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/server/src/services/storage.ts#L1-L14)). The bucket comes from `S3_BUCKET` ([server/src/config/env.ts:L34](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/server/src/config/env.ts#L34)).
- **Pay service.** The auth pipeline uses `PAY_SERVICE_URL` ([server/src/middleware/auth.ts:L33](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/server/src/middleware/auth.ts#L33)).
- **GitHub error issues.** Middleware from `@jeffrey-keyser/github-error-issues` is mounted ([server/src/app.ts:L10](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/server/src/app.ts#L10), [L78](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/server/src/app.ts#L78)). Its env vars are listed in comments ([server/src/app.ts:L74-L77](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/server/src/app.ts#L74-L77)).
- **Essentia.js and audio-decode.** Used for analysis ([server/src/services/audio-analysis.ts:L6](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/server/src/services/audio-analysis.ts#L6), [L30](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/server/src/services/audio-analysis.ts#L30)).
- **music-metadata.** Parses ID3 tags ([server/src/services/metadata.ts:L1](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/server/src/services/metadata.ts#L1)).
- **Local temp directories.** Uploads use `/tmp/music-uploads` ([server/src/middleware/upload.ts:L6](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/server/src/middleware/upload.ts#L6)). Analysis uses `/tmp/music-analysis` ([server/src/services/analysis-job.ts:L10](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/server/src/services/analysis-job.ts#L10)).
- **yt-dlp (CLI only).** `add` requires it on the PATH. Availability is checked by running `yt-dlp --version` with `execFileSync`, not a shell ([cli/src/add.ts:L15-L17](https://github.com/Jeffrey-Keyser/music-store/blob/0a33e53a69072a2cd59f17bdc05f921fdef75009/cli/src/add.ts#L15-L17)). The search query is passed as a single argv entry (`ytsearch1:<query>`), so shell metacharacters in the query are not interpreted ([cli/src/add.ts:L22-L25](https://github.com/Jeffrey-Keyser/music-store/blob/0a33e53a69072a2cd59f17bdc05f921fdef75009/cli/src/add.ts#L22-L25)). Temp cleanup uses `rmdirSync`, not a shell `rmdir` ([cli/src/add.ts:L85](https://github.com/Jeffrey-Keyser/music-store/blob/0a33e53a69072a2cd59f17bdc05f921fdef75009/cli/src/add.ts#L85)).

## Consumed by

**Confirmed in source:**

- **Web client.** Uses `VITE_API_URL`, defaulting to localhost 3022 ([client/src/index.tsx:L14](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/client/src/index.tsx#L14)).
- **music-sync CLI.** Calls `/sync/manifest`, `/tracks/:id/download`, and `/tracks/upload` ([cli/src/api.ts:L40](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/cli/src/api.ts#L40), [L52](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/cli/src/api.ts#L52), [L84](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/cli/src/api.ts#L84)).
- **Browser origins.** The CORS allowlist includes `ORIGIN_BASE_URL` and localhost ports ([server/src/app.ts:L25-L31](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/server/src/app.ts#L25-L31)). This confirms allowed origins, not who is deployed.

**Expected or unknown (not confirmed by source):**

- **RecordBox.** The design targets it ([CLAUDE.md:L7](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/CLAUDE.md#L7)). Playlist M3U export exists for it ([client/src/containers/PlaylistDetailContainer.tsx:L71-L87](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/client/src/containers/PlaylistDetailContainer.tsx#L71-L87)). Its actual behavior is unknown.
- **Other API consumers.** Unknown. Only the in-repo clients are visible.
- **Pay service instance.** Its deployment and URL are unknown.

## Planning docs

`PHASE3.md` shows a `googleDriveFileId` manifest field ([PHASE3.md:L76](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/PHASE3.md#L76)). Current shared types use `storageKey` ([shared/types/index.ts:L61](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/shared/types/index.ts#L61)). The source wins.
