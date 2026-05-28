import fs from "node:fs";
import path from "node:path";

const ENV_PATH = path.join(__dirname, "../.env");

export function getPatroliMessageId(): string | null {
  return process.env.PATROLI_MESSAGE_ID || null;
}

export function setPatroliMessageId(id: string | null): void {
  if (id) {
    process.env.PATROLI_MESSAGE_ID = id;
  } else {
    delete process.env.PATROLI_MESSAGE_ID;
  }
  let content = fs.readFileSync(ENV_PATH, "utf8");
  const regex = /^PATROLI_MESSAGE_ID=.*$/m;
  if (id) {
    if (regex.test(content)) {
      content = content.replace(regex, `PATROLI_MESSAGE_ID=${id}`);
    } else {
      content += `\nPATROLI_MESSAGE_ID=${id}`;
    }
  } else {
    content = content.replace(regex, "");
  }
  fs.writeFileSync(ENV_PATH, content);
}
