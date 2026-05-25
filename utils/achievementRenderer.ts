import {
  ContainerBuilder,
  TextDisplayBuilder,
  SectionBuilder,
  SeparatorBuilder,
} from "@discordjs/builders";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { achievementsData, ACHIEVEMENTS_PER_PAGE } from "./achievementData";

function buildCategoryNavRow(catKey: string, page: number, totalPages: number) {
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("ach_back_home")
      .setLabel("← KEMBALI")
      .setStyle(ButtonStyle.Secondary),
  );
  if (page > 0) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`ach_page_${catKey}_${page - 1}`)
        .setLabel("◀ SEBELUMNYA")
        .setStyle(ButtonStyle.Primary),
    );
  }
  if (page < totalPages - 1) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`ach_page_${catKey}_${page + 1}`)
        .setLabel("BERIKUTNYA ▶")
        .setStyle(ButtonStyle.Primary),
    );
  }
  return row;
}

export function renderAchievementHub() {
  const container = new ContainerBuilder().setAccentColor(0x1a1a2e);
  container
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        "# 🏅 PUSAT ACHIEVEMENT OPERATOR\nSelesaikan misi taktis, buka medal, dan bangun rekam jejak operator.",
      ),
    )
    .addSeparatorComponents(new SeparatorBuilder())
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            "**DATABASE TERKLASIFIKASI**\nAkses katalog achievement melalui sesi operator privat.\n\n_Semua sesi browsing bersifat pribadi._",
          ),
        )
        .setButtonAccessory(
          new ButtonBuilder()
            .setCustomId("ach_open")
            .setLabel("BUKA PUSAT ACHIEVEMENT")
            .setStyle(ButtonStyle.Primary),
        ),
    );
  return container;
}

export function renderAchievementHome() {
  const container = new ContainerBuilder().setAccentColor(0x1a1a2e);
  container
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        "# 🏅 PUSAT ACHIEVEMENT OPERATOR\nJelajahi semua medal operasi taktis dan catatan achievement.",
      ),
    )
    .addSeparatorComponents(new SeparatorBuilder());
  for (const [key, cat] of Object.entries(achievementsData)) {
    container.addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `**${cat.name}**\n${cat.description}\n**${cat.achievements.length}** Achievement`,
          ),
        )
        .setButtonAccessory(
          new ButtonBuilder()
            .setCustomId(`ach_cat_${key}`)
            .setLabel("BUKA KATEGORI")
            .setStyle(ButtonStyle.Secondary),
        ),
    );
  }
  container.addActionRowComponents(
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("ach_close")
        .setLabel("TUTUP SESI")
        .setStyle(ButtonStyle.Danger),
    ),
  );
  return container;
}

export function renderAchievementCategory(catKey: string, page = 0) {
  const cat = achievementsData[catKey];
  if (!cat) return null;
  const totalPages = Math.ceil(cat.achievements.length / ACHIEVEMENTS_PER_PAGE);
  const safePage = Math.min(page, totalPages - 1);
  const start = safePage * ACHIEVEMENTS_PER_PAGE;
  const pageItems = cat.achievements.slice(start, start + ACHIEVEMENTS_PER_PAGE);

  const container = new ContainerBuilder().setAccentColor(cat.accent);
  container
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# 🎖 ${cat.name}\n${cat.description}\n━━━━━━━━━━━━━━━━━━━━━━\nHalaman ${safePage + 1}/${totalPages}`,
      ),
    )
    .addSeparatorComponents(new SeparatorBuilder());

  for (const ach of pageItems) {
    container.addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `**${ach.name}**\n${ach.desc}\n🟢 Layak`,
          ),
        )
        .setButtonAccessory(
          new ButtonBuilder()
            .setCustomId(`ach_detail_${catKey}_${ach.id}`)
            .setLabel("RINCIAN")
            .setStyle(ButtonStyle.Secondary),
        ),
    );
  }

  container.addActionRowComponents(
    buildCategoryNavRow(catKey, safePage, totalPages),
  );
  return container;
}

export function renderAchievementDetail(catKey: string, achId: string) {
  const cat = achievementsData[catKey];
  if (!cat) return null;
  const ach = cat.achievements.find((a) => a.id === achId);
  if (!ach) return null;

  const reqs = ach.requirements.map((r) => `• ${r}`).join("\n");
  const rules = ach.rules
    ? ach.rules.map((r) => `• ${r}`).join("\n")
    : "• Aturan standar berlaku";

  const container = new ContainerBuilder().setAccentColor(cat.accent);
  container
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `━━━━━━━━━━━━━━━━━━━━━━\n# 🎖 ${ach.name}\n━━━━━━━━━━━━━━━━━━━━━━\n\n**Kategori:** ${cat.name}\n\n**Tujuan:**\n${ach.desc}\n\n**Persyaratan:**\n${reqs}\n\n**Aturan:**\n${rules}\n\n**Kebutuhan Regu:**\n${ach.squad}\n\n**Kesulitan:**\n${ach.difficulty}\n\n**Status:**\n🟢 Layak`,
      ),
    )
    .addSeparatorComponents(new SeparatorBuilder())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        "*Pengajuan bukti melalui sistem request achievement.*",
      ),
    );

  const navRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`ach_back_cat_${catKey}`)
      .setLabel("← KEMBALI")
      .setStyle(ButtonStyle.Secondary),
  );
  container.addActionRowComponents(navRow);
  return container;
}
