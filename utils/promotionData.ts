import fs from "node:fs";
import path from "node:path";

const ENV_PATH = path.join(__dirname, "../.env");

export function getPromotionMessageId(): string | null {
  return process.env.PROMOTION_MESSAGE_ID || null;
}

export function setPromotionMessageId(id: string | null): void {
  if (id) {
    process.env.PROMOTION_MESSAGE_ID = id;
  } else {
    delete process.env.PROMOTION_MESSAGE_ID;
  }
  let content = fs.readFileSync(ENV_PATH, "utf8");
  const regex = /^PROMOTION_MESSAGE_ID=.*$/m;
  if (id) {
    if (regex.test(content)) {
      content = content.replace(regex, `PROMOTION_MESSAGE_ID=${id}`);
    } else {
      content += `\nPROMOTION_MESSAGE_ID=${id}`;
    }
  } else {
    content = content.replace(regex, "");
  }
  fs.writeFileSync(ENV_PATH, content);
}
