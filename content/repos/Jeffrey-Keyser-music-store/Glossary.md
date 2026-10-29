---
title: "Music Store Glossary"
description: "Project-specific terms used in music-store, each with source citations."
---

# Glossary

- **Artifact.** An audio upload streamed to an existing track through `POST /api/v1/artifacts/:trackId` ([server/src/routes/artifacts.ts:L8-L11](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/server/src/routes/artifacts.ts#L8-L11)).
- **Analysis batch.** Processes up to five un-analyzed tracks per run ([server/src/services/analysis-job.ts:L9](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/server/src/services/analysis-job.ts#L9), [L76-L93](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/server/src/services/analysis-job.ts#L76-L93)).
- **Bulk operation.** A track action applied in one transaction, such as tag or delete ([server/src/routes/bulk.ts:L26-L31](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/server/src/routes/bulk.ts#L26-L31)).
- **Camelot code.** A harmonic-mixing key code such as `8B`. Major keys use the B ring and minor keys use the A ring ([shared/types/camelot.ts:L3-L5](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/shared/types/camelot.ts#L3-L5)).
- **Checksum.** A `sha256:` prefixed hash used for duplicate detection ([server/src/services/tracks.ts:L97-L106](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/server/src/services/tracks.ts#L97-L106)).
- **Local manifest.** The CLI's per-track record of synced files, stored in the config directory ([cli/src/manifest.ts:L5-L18](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/cli/src/manifest.ts#L5-L18)).
- **Mood.** A label derived from energy, danceability, and scale ([server/src/services/audio-analysis.ts:L72-L85](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/server/src/services/audio-analysis.ts#L72-L85)).
- **Orphan.** A local file whose track ID is no longer in the remote library ([cli/src/sync.ts:L163-L177](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/cli/src/sync.ts#L163-L177)).
- **Pay auth pipeline.** The middleware chain that resolves Pay users to local users ([server/src/middleware/auth.ts:L31-L58](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/server/src/middleware/auth.ts#L31-L58)).
- **M3U export.** A playlist file listing tracks by filename ([server/src/services/playlists.ts:L13-L26](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/server/src/services/playlists.ts#L13-L26)). The export query only includes tracks whose `user_id` matches the playlist owner, so foreign tracks linked to a playlist are not listed ([server/src/dal/playlists.ts:L185](https://github.com/Jeffrey-Keyser/music-store/blob/7a806b90b6cc/server/src/dal/playlists.ts#L185)).
- **Smart playlist.** A ranked query over analyzed tracks with filters and a limit ([server/src/services/smart-playlist.ts:L4-L12](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/server/src/services/smart-playlist.ts#L4-L12)).
- **Storage key.** The S3 object path, shaped as `artists/{artist}/{album}/{file}` ([server/src/services/storage.ts:L77-L81](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/server/src/services/storage.ts#L77-L81), [shared/types/index.ts:L14](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/shared/types/index.ts#L14)).
- **Sync manifest.** The API response listing tracks for the CLI ([shared/types/index.ts:L58-L80](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/shared/types/index.ts#L58-L80)).
- **Upload limit.** The shared 50 MB maximum ([server/src/config/upload.ts:L9](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/server/src/config/upload.ts#L9)).
