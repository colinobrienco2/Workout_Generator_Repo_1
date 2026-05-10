import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { neon } from "@neondatabase/serverless"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, "..")

async function loadLocalDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL
  }

  const envLocalPath = path.join(repoRoot, ".env.local")

  try {
    const envLocal = await readFile(envLocalPath, "utf8")

    for (const rawLine of envLocal.split(/\r?\n/)) {
      const line = rawLine.trim()

      if (!line || line.startsWith("#")) {
        continue
      }

      const match = line.match(/^DATABASE_URL\s*=\s*(.*)$/)

      if (!match) {
        continue
      }

      const value = match[1].trim().replace(/^['"]|['"]$/g, "")

      if (value) {
        process.env.DATABASE_URL = value
        return value
      }
    }
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw error
    }
  }

  return process.env.DATABASE_URL
}

function splitSqlStatements(sqlText) {
  return sqlText
    .split(/;\s*(?:\r?\n|$)/)
    .map((statement) => statement.trim())
    .filter(Boolean)
}

console.log("Starting tracker metadata setup...")

try {
  const databaseUrl = await loadLocalDatabaseUrl()

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required.")
  }

  const sqlFilePath = path.join(repoRoot, "sql", "create-tracker-metadata.sql")
  const sqlFile = await readFile(sqlFilePath, "utf8")
  const statements = splitSqlStatements(sqlFile)
  const sql = neon(databaseUrl)

  for (const statement of statements) {
    await sql.query(statement)
  }

  console.log("tracker_metadata table ensured.")
  console.log("Setup complete.")
} catch (error) {
  const message =
    error instanceof Error && error.message
      ? error.message
      : "Unknown error during tracker metadata setup."

  console.error(`Tracker metadata setup failed: ${message}`)
  process.exit(1)
}
