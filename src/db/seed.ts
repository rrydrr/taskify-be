import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { tasks } from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

const sql = neon(databaseUrl);
const db = drizzle(sql);

const TOTAL_TASKS = 10_000;
const BATCH_SIZE = 500;

const statuses = ["pending", "in_progress", "completed"] as const;
const priorities = ["low", "medium", "high"] as const;

const titlePrefixes = [
  "Implement",
  "Fix",
  "Review",
  "Update",
  "Refactor",
  "Design",
  "Test",
  "Deploy",
  "Document",
  "Optimize",
  "Investigate",
  "Configure",
  "Migrate",
  "Create",
  "Remove",
];

const titleSubjects = [
  "user authentication",
  "database schema",
  "API endpoint",
  "frontend component",
  "CI/CD pipeline",
  "logging system",
  "error handling",
  "caching layer",
  "notification service",
  "payment integration",
  "search functionality",
  "file upload",
  "email templates",
  "dashboard widget",
  "data export",
  "rate limiting",
  "webhook handler",
  "background job",
  "health check",
  "monitoring alert",
];

const descriptions = [
  "This task requires careful planning and execution.",
  "High priority item that needs immediate attention.",
  "Follow up from the last sprint retrospective.",
  "Part of the Q4 roadmap initiative.",
  "Blocked by external dependency, monitor progress.",
  "Needs code review from senior engineer.",
  "Customer-reported issue, SLA deadline approaching.",
  "Technical debt reduction effort.",
  "Performance improvement opportunity identified in profiling.",
  "Security audit finding that needs remediation.",
  null,
  null,
  null,
];

function randomElement<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function generateRandomTitle(): string {
  const prefix = randomElement(titlePrefixes);
  const subject = randomElement(titleSubjects);
  const suffix =
    Math.random() > 0.5 ? ` #${Math.floor(Math.random() * 1000)}` : "";
  return `${prefix} ${subject}${suffix}`;
}

function generateRandomDate(): Date {
  const now = Date.now();
  const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000;
  return new Date(ninetyDaysAgo + Math.random() * (now - ninetyDaysAgo));
}

function generateTask() {
  const createdAt = generateRandomDate();
  return {
    title: generateRandomTitle(),
    description: randomElement(descriptions),
    status: randomElement(statuses),
    priority: randomElement(priorities),
    createdAt,
    updatedAt: createdAt,
  };
}

async function seed() {
  console.log(`Seeding ${TOTAL_TASKS} tasks in batches of ${BATCH_SIZE}...`);
  const startTime = performance.now();

  // Clear existing records
  console.log("Clearing existing task records...");
  await db.delete(tasks);
  console.log("Existing records cleared.");

  const totalBatches = Math.ceil(TOTAL_TASKS / BATCH_SIZE);

  for (let batch = 0; batch < totalBatches; batch++) {
    const batchTasks = Array.from(
      { length: Math.min(BATCH_SIZE, TOTAL_TASKS - batch * BATCH_SIZE) },
      () => generateTask(),
    );

    await db.insert(tasks).values(batchTasks);
    console.log(
      `Batch ${batch + 1}/${totalBatches} inserted (${(batch + 1) * BATCH_SIZE} tasks)`,
    );
  }

  const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
  console.log(
    `\nSeeding complete! ${TOTAL_TASKS} tasks inserted in ${elapsed}s`,
  );
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
