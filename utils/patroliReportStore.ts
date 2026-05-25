import fs from "node:fs";
import path from "node:path";

const STORE_PATH = path.join(__dirname, "../patroli-reports.json");

interface PatrolReport {
  memberMsgId: string;
  operator: string;
  waktu: string;
  lokasi: string;
  catatan: string;
}

function readStore(): Record<string, PatrolReport> {
  if (!fs.existsSync(STORE_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(STORE_PATH, "utf-8"));
  } catch {
    return {};
  }
}

function writeStore(data: Record<string, PatrolReport>): void {
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2));
}

export function savePatrolReport(userId: string, report: PatrolReport): void {
  const store = readStore();
  store[userId] = report;
  writeStore(store);
}

export function getPatrolReport(userId: string): PatrolReport | undefined {
  const store = readStore();
  return store[userId];
}
