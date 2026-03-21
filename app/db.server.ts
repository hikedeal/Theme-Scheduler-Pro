import { PrismaClient } from "@prisma/client";
import { pollSchedules } from "./models/scheduler.server";

declare global {
  var prismaGlobal: PrismaClient;
  var schedulerStarted: boolean;
}

if (process.env.NODE_ENV !== "production") {
  if (!global.prismaGlobal) {
    global.prismaGlobal = new PrismaClient();
  }
}

const prisma = global.prismaGlobal ?? new PrismaClient();

// Background Polling for Theme Schedules
if (!global.schedulerStarted) {
  global.schedulerStarted = true;
  console.log("[Scheduler] Starting background polling...");
  setInterval(() => {
    pollSchedules().catch((err) => console.error("[Scheduler] Polling error:", err));
  }, 60000); // 1 minute
}

export default prisma;
