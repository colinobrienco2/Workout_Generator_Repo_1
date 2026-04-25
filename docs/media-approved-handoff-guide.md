# Exercise Media Approved Handoff

This package contains the assumed-approved YouTube media manifest for the workout generator app.

## Files to copy into the repo

- `media/manifests/exercise-media-manifest-v1.0.json`
- `media/manifests/exercise-media-schema-v1.1.json`
- `lib/media/get-exercise-media.ts`
- `docs/exercise-media-approved-tracker.csv` (optional, for your records)

## Image handling

This package does not include downloaded image files. The app should render YouTube thumbnails from `thumbnail_url`, which follows this format:

`https://img.youtube.com/vi/{youtube_video_id}/hqdefault.jpg`

That means the "images" are provided as stable remote thumbnail URLs inside the manifest, not as local `.jpg` assets.

## Demo link handling

The "See Demo" button should open `tutorial_url` in a new tab when present.

## Approval assumption

All entries are marked:

- `status`: `approved_assumed`
- `review_required`: `false`

This means the project owner has decided to proceed with these media entries as acceptable for app integration.
