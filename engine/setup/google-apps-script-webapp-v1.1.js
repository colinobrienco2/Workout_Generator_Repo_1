/**
 * Deterministic Workout App - Google Sheets Web App
 * Bound or standalone Apps Script endpoint for the Weekly Summary sheet.
 *
 * Current deployment URL:
 * https://script.google.com/macros/s/AKfycbwzRuto6mQcCBGJKgGQEmPAkMFodYxGvMPwmMMR2tXypVewc_WtBIFpKPzFFWukYjVEng/exec
 */

const SPREADSHEET_ID = "17HzFyLOsrU6mHPYtNbrmEViV98kxvh1E7hTts9tWav0";
const WEEKLY_SUMMARY_SHEET_NAME = "Weekly Summary";
const SYSTEM_VERSION = "rule_engine_v2";

function doGet(e) {
  const resource = (e && e.parameter && e.parameter.resource) ? String(e.parameter.resource) : "health";
  const weekKey = (e && e.parameter && e.parameter.week_key) ? String(e.parameter.week_key) : "";

  try {
    if (resource === "health") {
      return jsonResponse({
        status: "ok",
        system_version: SYSTEM_VERSION,
        spreadsheet_id: SPREADSHEET_ID,
        weekly_summary_sheet: WEEKLY_SUMMARY_SHEET_NAME
      });
    }

    const rows = readWeeklySummaryRows_();

    if (resource === "weekly_all") {
      return jsonResponse(rows);
    }

    if (resource === "weekly_latest") {
      return jsonResponse(rows.length ? rows[rows.length - 1] : {});
    }

    if (resource === "weekly_by_key") {
      if (!weekKey) {
        return jsonResponse({ error: "Missing required parameter: week_key" }, 400);
      }
      const match = rows.find((row) => row.program_week_key === weekKey);
      return jsonResponse(match || {});
    }

    return jsonResponse({ error: "Invalid resource" }, 400);
  } catch (error) {
    return jsonResponse({
      error: "Unhandled script error",
      message: String(error && error.message ? error.message : error)
    }, 500);
  }
}

function readWeeklySummaryRows_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(WEEKLY_SUMMARY_SHEET_NAME);

  if (!sheet) {
    throw new Error("Sheet not found: " + WEEKLY_SUMMARY_SHEET_NAME);
  }

  const values = sheet.getDataRange().getValues();
  if (!values || values.length < 2) {
    return [];
  }

  const headers = values[0].map((header) => normalizeHeader_(header));
  const dataRows = values.slice(1);

  return dataRows
    .filter((row) => row[0] !== "" && row[0] !== null)
    .map((row) => {
      const result = {};
      headers.forEach((header, index) => {
        result[header] = serializeValue_(row[index]);
      });
      return result;
    });
}

function normalizeHeader_(header) {
  const text = String(header || "").trim().toLowerCase();
  return text
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");
}

function serializeValue_(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  if (typeof value === "string") {
    return value.trim();
  }
  return value;
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
