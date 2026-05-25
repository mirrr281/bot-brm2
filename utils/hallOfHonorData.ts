import fs from "node:fs";
import path from "node:path";

const ENV_PATH = path.join(__dirname, "../.env");

export function getHallOfHonorMessageId(): string | null {
  return process.env.HALL_OF_HONOR_MESSAGE_ID || null;
}

export function setHallOfHonorMessageId(id: string | null): void {
  if (id) {
    process.env.HALL_OF_HONOR_MESSAGE_ID = id;
  } else {
    delete process.env.HALL_OF_HONOR_MESSAGE_ID;
  }
  let content = fs.readFileSync(ENV_PATH, "utf8");
  const regex = /^HALL_OF_HONOR_MESSAGE_ID=.*$/m;
  if (id) {
    if (regex.test(content)) {
      content = content.replace(regex, `HALL_OF_HONOR_MESSAGE_ID=${id}`);
    } else {
      content += `\nHALL_OF_HONOR_MESSAGE_ID=${id}`;
    }
  } else {
    content = content.replace(regex, "");
  }
  fs.writeFileSync(ENV_PATH, content);
}
