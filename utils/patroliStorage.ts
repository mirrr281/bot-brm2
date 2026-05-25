import fs from "fs";
import path from "path";

const PATROLI_FILE = path.join(__dirname, "../patroli.json");

function getRecords(): Record<string, string> {
  if (!fs.existsSync(PATROLI_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(PATROLI_FILE, "utf-8"));
  } catch {
    return {};
  }
}

export function hasPatrolledToday(userId: string): boolean {
  const records = getRecords();
  const lastPatrolDate = records[userId];
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  return lastPatrolDate === today;
}

export function updatePatrolRecord(userId: string): void {
  const records = getRecords();
  const today = new Date().toISOString().split("T")[0];
  records[userId] = today;
  fs.writeFileSync(PATROLI_FILE, JSON.stringify(records, null, 2));
}
