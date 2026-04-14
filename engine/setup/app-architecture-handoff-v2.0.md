# App Architecture Handoff v2.1

## Goal
Build a deterministic workout app UI in v0 / Next.js that:
- reads weekly coaching outputs from Google Sheets through Apps Script
- displays workouts from local exercise libraries
- supports exercise swaps without changing the rest of the workout
- supports a guided help panel with preset categories and deterministic answers

## Read-only Sheets endpoint
Base URL:
`https://script.google.com/macros/s/AKfycbwzRuto6mQcCBGJKgGQEmPAkMFodYxGvMPwmMMR2tXypVewc_WtBIFpKPzFFWukYjVEng/exec`

Endpoints:
- `?resource=health`
- `?resource=weekly_latest`
- `?resource=weekly_all`
- `?resource=weekly_by_key&week_key=P1-W05` (available after using the included v1.1 Apps Script file)

## Canonical local data
- `library/master/master-exercise-library-v1.0.json`
- `library/split-files/*.json`
- `media/manifests/exercise-media-manifest-v1.0.json`

## Suggested v0 app structure
- dashboard shell
- weekly strategy banner
- workout session selector
- workout card list
- swap button on each card
- small demo link under each exercise image
- guided help drawer / modal

## Do not do in v0
- do not add OpenAI, chat completions, prompt files, or AI agents
- do not let the swap button regenerate the entire workout
- do not make Google Sheets writable from the app

## Recommended fetch pattern
1. fetch weekly strategy from `/api/weekly-latest`
2. select split + session length + equipment mode
3. choose exercises from local library using deterministic slot rules
4. render media and coaching notes
5. allow single-card swaps using substitution IDs and equipment constraints
