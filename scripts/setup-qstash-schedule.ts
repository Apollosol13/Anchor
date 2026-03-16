/**
 * Creates (or updates) the QStash cron schedule that triggers
 * the notification workflow every 15 minutes.
 *
 * Usage:
 *   bun run scripts/setup-qstash-schedule.ts
 *
 * Requires:
 *   QSTASH_TOKEN — set in .env.production.local or environment
 *   APP_URL      — the deployed app URL (e.g. https://anchrapp.io)
 */
import { Client } from "@upstash/qstash";

const QSTASH_TOKEN = process.env.QSTASH_TOKEN;
const APP_URL = process.env.APP_URL || "https://anchrapp.io";

if (!QSTASH_TOKEN) {
  console.error("QSTASH_TOKEN is required");
  process.exit(1);
}

const client = new Client({ token: QSTASH_TOKEN });

async function main() {
  const scheduleId = await client.schedules.create({
    scheduleId: "anchor-notifications",
    destination: `${APP_URL}/api/workflows/notifications`,
    cron: "*/15 * * * *", // every 15 minutes
  });

  console.log("QStash schedule created:");
  console.log(`  Schedule ID: ${scheduleId}`);
  console.log(`  Destination: ${APP_URL}/api/workflows/notifications`);
  console.log(`  Cron:        */15 * * * * (every 15 minutes)`);
}

main().catch((err) => {
  console.error("Failed to create schedule:", err);
  process.exit(1);
});
