CREATE TABLE IF NOT EXISTS tracker_metadata (
  user_id TEXT PRIMARY KEY,
  email TEXT,
  tracker_connection_mode TEXT NOT NULL DEFAULT 'none',
  google_tracker_spreadsheet_id TEXT,
  manual_apps_script_url_fallback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT tracker_metadata_connection_mode_check
    CHECK (tracker_connection_mode IN ('none', 'manual', 'google'))
);

CREATE INDEX IF NOT EXISTS tracker_metadata_email_idx
ON tracker_metadata (email);
