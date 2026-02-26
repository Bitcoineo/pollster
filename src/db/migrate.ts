import { createClient } from "@libsql/client";
import { readMigrationFiles } from "drizzle-orm/migrator";

// Custom migration runner for Turso/libSQL compatibility.
// The built-in drizzle migrator uses "id SERIAL PRIMARY KEY" (Postgres syntax)
// which Turso rejects. This runner uses correct SQLite DDL.

const client = createClient({
  url: process.env.DATABASE_URL ?? "file:local.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

const MIGRATIONS_FOLDER = "./drizzle";
const MIGRATIONS_TABLE = "__drizzle_migrations";

async function main() {
  console.log("Running migrations...");
  console.log("DATABASE_URL:", process.env.DATABASE_URL ? "set" : "NOT SET (using file:local.db)");

  // Create migrations tracking table with correct SQLite DDL
  const createTableSQL = `CREATE TABLE IF NOT EXISTS \`${MIGRATIONS_TABLE}\` (\`id\` INTEGER PRIMARY KEY AUTOINCREMENT, \`hash\` TEXT NOT NULL, \`created_at\` INTEGER)`;
  await client.execute(createTableSQL);

  // Check last applied migration
  const applied = await client.execute(
    `SELECT \`id\`, \`hash\`, \`created_at\` FROM \`${MIGRATIONS_TABLE}\` ORDER BY \`created_at\` DESC LIMIT 1`
  );
  const lastMigration = applied.rows[0];
  if (lastMigration) {
    console.log(`Last applied: hash=${String(lastMigration.hash).slice(0, 8)}...`);
  } else {
    console.log("No migrations applied yet.");
  }

  // Read migration files from drizzle/ folder
  const migrations = readMigrationFiles({ migrationsFolder: MIGRATIONS_FOLDER });
  console.log(`Found ${migrations.length} migration file(s).`);

  let appliedCount = 0;
  for (const migration of migrations) {
    if (
      lastMigration &&
      Number(lastMigration.created_at) >= migration.folderMillis
    ) {
      continue; // already applied
    }

    const statements = migration.sql
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    console.log(`Applying migration (${migration.hash.slice(0, 8)}...) — ${statements.length} statement(s)`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      try {
        await client.execute(stmt);
      } catch (err) {
        console.error(`FAILED on statement ${i + 1}:`);
        console.error(`SQL: ${stmt}`);
        throw err;
      }
    }

    // Record the migration
    await client.execute({
      sql: `INSERT INTO \`${MIGRATIONS_TABLE}\` (\`hash\`, \`created_at\`) VALUES (?, ?)`,
      args: [migration.hash, migration.folderMillis],
    });

    appliedCount++;
  }

  if (appliedCount > 0) {
    console.log(`Applied ${appliedCount} migration(s).`);
  } else {
    console.log("No pending migrations.");
  }

  console.log("Migrations complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
