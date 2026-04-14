# Google Sheets connection guide v1.1

This package is now wired to your live Google Apps Script deployment.

## Live endpoint
- Deployment ID: `AKfycbwzRuto6mQcCBGJKgGQEmPAkMFodYxGvMPwmMMR2tXypVewc_WtBIFpKPzFFWukYjVEng`
- Base URL: `https://script.google.com/macros/s/AKfycbwzRuto6mQcCBGJKgGQEmPAkMFodYxGvMPwmMMR2tXypVewc_WtBIFpKPzFFWukYjVEng/exec`

## Expected sheet
- Spreadsheet ID: `17HzFyLOsrU6mHPYtNbrmEViV98kxvh1E7hTts9tWav0`
- Tab name: `Weekly Summary`

## What the endpoint returns
The Apps Script code normalizes the `Weekly Summary` headers into JSON-safe `snake_case` keys.

Example conversions:
- `Program Week Start` -> `program_week_start`
- `Program Week #` -> `program_week`
- `W/W Weight Change` -> `w_w_weight_change`
- `readiness_status` -> `readiness_status`

## Supported resources
- `?resource=health`
- `?resource=weekly_latest`
- `?resource=weekly_all`
- `?resource=weekly_by_key&week_key=P1-W03`

## Important
- You do **not** redeploy when sheet values change.
- You **do** redeploy if you edit the Apps Script code.

## Recommended app architecture
Do **not** fetch the Google Apps Script URL directly from client-side UI components.
Use a server route in your Vercel/Next.js app as a proxy layer.

Recommended flow:
1. Vercel route handler calls the Apps Script URL server-side
2. UI calls your own local `/api/...` endpoint
3. Your app uses the returned JSON to drive workout rendering and coaching display
