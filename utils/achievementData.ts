import fs from "node:fs";
import path from "node:path";

const ENV_PATH = path.join(__dirname, "../.env");

export function getAchievementCenterMessageId(): string | null {
  return process.env.ACHIEVEMENT_CENTER_MESSAGE_ID || null;
}

export function setAchievementCenterMessageId(id: string): void {
  process.env.ACHIEVEMENT_CENTER_MESSAGE_ID = id;
  let content = fs.readFileSync(ENV_PATH, "utf8");
  const regex = /^ACHIEVEMENT_CENTER_MESSAGE_ID=.*$/m;
  if (regex.test(content)) {
    content = content.replace(regex, `ACHIEVEMENT_CENTER_MESSAGE_ID=${id}`);
  } else {
    content += `\nACHIEVEMENT_CENTER_MESSAGE_ID=${id}`;
  }
  fs.writeFileSync(ENV_PATH, content);
}

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  requirements: string[];
  rules: string[];
  squad: string;
  difficulty: string;
}

export interface AchievementCategory {
  name: string;
  description: string;
  accent: number;
  achievements: Achievement[];
}

export interface AchievementsMap {
  [key: string]: AchievementCategory;
}

export const ACHIEVEMENTS_PER_PAGE = 5;

export const achievementsData: AchievementsMap = {
  limited: {
    name: "LIMITED",
    description: "Medal Event Langka",
    accent: 0x9b59b6,
    achievements: [
      {
        id: "the-liberators",
        name: "The Liberators",
        desc: "Complete Ronograd Openworld with a 4-player squad.",
        requirements: ["4-player squad", "Complete all objectives"],
        rules: ["Standard rules apply"],
        squad: "4 Players",
        difficulty: "🟣 Elite",
      },
      {
        id: "apex",
        name: "Apex",
        desc: "Obtain all achievements.",
        requirements: ["All other achievements completed"],
        rules: ["N/A"],
        squad: "N/A",
        difficulty: "🟠 Legendary",
      },
    ],
  },
  bunker: {
    name: "BUNKER",
    description: "Misi Tantangan",
    accent: 0xe67e22,
    achievements: [
      {
        id: "the-hard-ways",
        name: "The Hard Ways",
        desc: "Complete Bunker with 1-2 players without any vehicles or utilities.",
        requirements: ["1-2 players", "No vehicles", "No utilities"],
        rules: ["Standard rules apply"],
        squad: "1-2 Players",
        difficulty: "🔵 Advanced",
      },
      {
        id: "vanguard-4",
        name: "Vanguard-4",
        desc: "Complete Bunker with 4 players without vehicles or utilities.",
        requirements: ["4 players", "No vehicles", "No utilities"],
        rules: ["Standard rules apply"],
        squad: "4 Players",
        difficulty: "🔵 Advanced",
      },
      {
        id: "carnage",
        name: "Carnage",
        desc: "Complete Bunker with 1-2 players using melee, grenades, and cargo-only vehicles.",
        requirements: ["1-2 players", "Melee only", "Grenades only", "Cargo vehicles only"],
        rules: ["Standard rules apply"],
        squad: "1-2 Players",
        difficulty: "🟣 Elite",
      },
      {
        id: "juggernaut",
        name: "Juggernaut",
        desc: "Complete Bunker with 1-2 players using LMG only (M249 / PKM).",
        requirements: ["1-2 players", "LMG only (M249/PKM)"],
        rules: ["Standard rules apply"],
        squad: "1-2 Players",
        difficulty: "🔵 Advanced",
      },
      {
        id: "eco-round",
        name: "Eco-Round",
        desc: "Complete Bunker with 1-2 players using secondary weapon only.",
        requirements: ["1-2 players", "Secondary weapon only"],
        rules: ["Standard rules apply"],
        squad: "1-2 Players",
        difficulty: "🔵 Advanced",
      },
    ],
  },
  compounds: {
    name: "COMPOUNDS",
    description: "Operasi Taktis",
    accent: 0x2ecc71,
    achievements: [
      {
        id: "vector",
        name: "Vector",
        desc: "Complete Depot solo using SMG only. (1 life)",
        requirements: ["Solo", "SMG only", "1 life"],
        rules: ["Standard rules apply"],
        squad: "1 Operator",
        difficulty: "🔵 Advanced",
      },
      {
        id: "coldsteel",
        name: "Coldsteel",
        desc: "Complete Depot solo using melee only. (1 life)",
        requirements: ["Solo", "Melee only", "1 life"],
        rules: ["Standard rules apply"],
        squad: "1 Operator",
        difficulty: "🟣 Elite",
      },
      {
        id: "undergunned",
        name: "Undergunned",
        desc: "Complete Kozlovka solo using secondary weapon only. (1 life)",
        requirements: ["Solo", "Secondary weapon only", "1 life"],
        rules: ["Standard rules apply"],
        squad: "1 Operator",
        difficulty: "🔵 Advanced",
      },
      {
        id: "amen",
        name: "Amen",
        desc: "Complete Kozlovka with 1-2 players within 13 minutes. (1 life)",
        requirements: ["1-2 players", "Complete within 13 minutes", "1 life"],
        rules: ["Standard rules apply"],
        squad: "1-2 Operators",
        difficulty: "🔵 Advanced",
      },
      {
        id: "mayday",
        name: "Mayday",
        desc: "Complete Pushkino solo within 5 minutes. (1 life)",
        requirements: ["Solo", "Complete within 5 minutes", "1 life"],
        rules: ["Standard rules apply"],
        squad: "1 Operator",
        difficulty: "🟣 Elite",
      },
      {
        id: "overlook",
        name: "Overlook",
        desc: "Complete Sochraina City solo within 9 minutes. (1 life)",
        requirements: ["Solo", "Complete within 9 minutes", "1 life"],
        rules: ["Standard rules apply"],
        squad: "1 Operator",
        difficulty: "🔵 Advanced",
      },
      {
        id: "horizon",
        name: "Horizon",
        desc: "Complete Sochraina City with 2-3 players within 7 minutes. (1 life)",
        requirements: ["2-3 players", "Complete within 7 minutes", "1 life"],
        rules: ["Standard rules apply"],
        squad: "2-3 Operators",
        difficulty: "🟣 Elite",
      },
      {
        id: "lone-miner",
        name: "Lone Miner",
        desc: "Complete Quarry solo within 10 minutes. (1 life)",
        requirements: ["Solo", "Complete within 10 minutes", "1 life"],
        rules: ["Standard rules apply"],
        squad: "1 Operator",
        difficulty: "🔵 Advanced",
      },
      {
        id: "excavators",
        name: "Excavators",
        desc: "Complete Quarry with 2-3 players within 7 minutes. (1 life)",
        requirements: ["2-3 players", "Complete within 7 minutes", "1 life"],
        rules: ["Standard rules apply"],
        squad: "2-3 Operators",
        difficulty: "🔵 Advanced",
      },
      {
        id: "sunburn",
        name: "Sunburn",
        desc: "Complete Lesdolina solo during morning/daytime using stealth. (1 life)",
        requirements: ["Solo", "Morning/daytime", "Stealth only", "1 life"],
        rules: ["Standard rules apply"],
        squad: "1 Operator",
        difficulty: "🟣 Elite",
      },
      {
        id: "blitz",
        name: "Blitz",
        desc: "Complete Lesdolina solo within 5 minutes. (1 life)",
        requirements: ["Solo", "Complete within 5 minutes", "1 life"],
        rules: ["Standard rules apply"],
        squad: "1 Operator",
        difficulty: "🟣 Elite",
      },
      {
        id: "under-maintenance",
        name: "Under Maintenance",
        desc: "Complete DOU (Department of Utilities) with 1-2 players. (1 life)",
        requirements: ["1-2 players", "1 life"],
        rules: ["Standard rules apply"],
        squad: "1-2 Operators",
        difficulty: "⚪ Standard",
      },
      {
        id: "antenna-down",
        name: "Antenna Down",
        desc: "Complete Mountain Radar with a 1-4 player squad. (1 life)",
        requirements: ["1-4 players", "1 life"],
        rules: ["Standard rules apply"],
        squad: "1-4 Operators",
        difficulty: "⚪ Standard",
      },
      {
        id: "urban-reaper",
        name: "Urban Reaper",
        desc: "Complete Ronograd City with a 1-4 player squad using stealth. (1 life)",
        requirements: ["1-4 players", "Stealth only", "1 life"],
        rules: ["Standard rules apply"],
        squad: "1-4 Operators",
        difficulty: "🔵 Advanced",
      },
      {
        id: "deep-blue-phantom",
        name: "Deep Blue Phantom",
        desc: "Complete Naval Base with 1-2 players using stealth. (1 life)",
        requirements: ["1-2 players", "Stealth only", "1 life"],
        rules: ["Standard rules apply"],
        squad: "1-2 Operators",
        difficulty: "🟣 Elite",
      },
      {
        id: "harbor-sweep",
        name: "Harbor Sweep",
        desc: "Complete Naval Base with 3-4 player squad. (1 life)",
        requirements: ["3-4 players", "1 life"],
        rules: ["Standard rules apply"],
        squad: "3-4 Operators",
        difficulty: "⚪ Standard",
      },
      {
        id: "black-ice",
        name: "Black Ice",
        desc: "Complete Fort Ronograd with 1-2 players using stealth. (1 life)",
        requirements: ["1-2 players", "Stealth only", "1 life"],
        rules: ["Standard rules apply"],
        squad: "1-2 Operators",
        difficulty: "🟣 Elite",
      },
      {
        id: "frostbite",
        name: "Frostbite",
        desc: "Complete Fort Ronograd with 3-4 player squad. (1 life)",
        requirements: ["3-4 players", "1 life"],
        rules: ["Standard rules apply"],
        squad: "3-4 Operators",
        difficulty: "🔵 Advanced",
      },
      {
        id: "claustrophobic",
        name: "Claustrophobic",
        desc: "Complete Bunker 4 solo using stealth. (1 life)",
        requirements: ["Solo", "Stealth only", "1 life"],
        rules: ["Standard rules apply"],
        squad: "1 Operator",
        difficulty: "🟣 Elite",
      },
    ],
  },
};


