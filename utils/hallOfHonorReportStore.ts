import fs from "node:fs";
import path from "node:path";

const STORE_PATH = path.join(__dirname, "../hall-of-honor-reports.json");

interface HoHReport {
  memberMsgId: string;
  memberChannelId: string;
  jenis: string;
  nama: string;
  pangkat: string;
  divisi: string;
}

function readStore(): Record<string, HoHReport> {
  if (!fs.existsSync(STORE_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(STORE_PATH, "utf-8"));
  } catch {
    return {};
  }
}

function writeStore(data: Record<string, HoHReport>): void {
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2));
}

export function saveHoHReport(userId: string, report: HoHReport): void {
  const store = readStore();
  store[userId] = report;
  writeStore(store);
}

export function getHoHReport(userId: string): HoHReport | undefined {
  const store = readStore();
  return store[userId];
}
