import {
  ButtonInteraction,
  MessageFlags,
  GuildMember,
  EmbedBuilder,
  TextChannel,
} from "discord.js";
import fs from "fs";
import path from "path";
import { getUserBalance, updateUserBalance } from "../../utils/unbelievaBoatApi";
import dotenv from "dotenv";

dotenv.config();
const LOG_CHANNEL_ID = process.env.LOG_PROMOTION_CHANNEL_ID;

const promotionData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../../promotion.json"), "utf-8"),
);

module.exports = {
  customId: "promotion:promote",
  async execute(interaction: ButtonInteraction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const member = interaction.member as GuildMember;
    const userId = member.id;

    // 1. Get current points
    const currentPoints = await getUserBalance(userId);

    // Find current rank and next rank
    let currentRankIndex = -1;
    let currentCatIndex = -1;
    let nextRank = null;
    let nextCategory: any = null;

    for (let catIdx = 0; catIdx < promotionData.length; catIdx++) {
      const cat = promotionData[catIdx];
      for (let i = 0; i < cat.LIST_PANGKAT.length; i++) {
        if (member.roles.cache.has(cat.LIST_PANGKAT[i].ROLE_ID)) {
          currentRankIndex = i;
          currentCatIndex = catIdx;

          if (i > 0) {
            nextRank = cat.LIST_PANGKAT[i - 1];
            nextCategory = cat;
          } else if (catIdx > 0) {
            const higherCat = promotionData[catIdx - 1];
            nextRank =
              higherCat.LIST_PANGKAT[higherCat.LIST_PANGKAT.length - 1];
            nextCategory = higherCat;
          }

          break;
        }
      }
      if (nextRank) break;
    }

    if (!nextRank) {
      return await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xe74c3c)
            .setTitle("❌ Tidak ada pangkat berikutnya")
            .setDescription(
              "Kamu sudah mencapai pangkat tertinggi atau tidak memiliki pangkat yang valid.",
            ),
        ],
      });
    }

    // 3. Check points
    if (currentPoints < nextRank.POINT) {
      return await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xe74c3c)
            .setTitle("❌ Poin tidak mencukupi")
            .addFields(
              { name: "Dibutuhkan", value: `${nextRank.POINT} poin`, inline: true },
              { name: "Poinmu", value: `${currentPoints} poin`, inline: true },
            ),
        ],
      });
    }

    // 4 & 5. Promote
    try {
      // Subtract points
      if (nextRank.POINT > 0) {
        await updateUserBalance(userId, -nextRank.POINT, "Promotion");

        const newBalance = await getUserBalance(userId);
        if (newBalance !== currentPoints - nextRank.POINT) {
          throw new Error("Point deduction verification failed");
        }
      }

      // Manage roles
      const currentCat = promotionData[currentCatIndex];
      await member.roles.remove(
        currentCat.LIST_PANGKAT[currentRankIndex].ROLE_ID,
      );
      await member.roles.add(nextRank.ROLE_ID);

      if (currentCat.KATEGORI !== nextCategory.KATEGORI) {
        await member.roles.remove(currentCat.ROLE_ID);
        await member.roles.add(nextCategory.ROLE_ID);
      } else {
        await member.roles.add(currentCat.ROLE_ID);
      }

      // Update nickname with new rank logo
      if (nextRank.LOGO) {
        try {
          const baseName = member.displayName.replace(/^\([^)]+\)\s*/, "");
          const newNick = `${nextRank.LOGO} ${baseName}`;
          await member.setNickname(newNick);
        } catch (nickErr) {
          console.error(`[promotion] Failed to set nickname:`, nickErr);
        }
      }

       const rankName = nextRank.PANGKAT.replace(/_/g, " ");
       
       // Log to channel
       if (LOG_CHANNEL_ID) {
         const logChannel = await interaction.client.channels.fetch(LOG_CHANNEL_ID);
         if (logChannel && logChannel.isTextBased()) {
           await (logChannel as TextChannel).send({
             embeds: [
               new EmbedBuilder()
                 .setColor(0x2ecc71)
                 .setTitle("📢 Promosi Pengguna")
                 .setDescription(`Pengguna <@${interaction.user.id}> telah dipromosikan ke **${rankName}**.`)
                 .addFields(
                   { name: "Pangkat Baru", value: `${nextRank.LOGO || ""} ${rankName}`, inline: true },
                   { name: "Kategori", value: nextCategory.KATEGORI, inline: true }
                 )
             ]
           });
         }
       }

       await interaction.editReply({
         embeds: [
           new EmbedBuilder()
             .setColor(0x2ecc71)
             .setTitle("✅ Promosi Berhasil!")
             .setDescription(
               `Selamat! Kamu telah dipromosikan ke **${rankName}**`,
             )
             .addFields(
               {
                 name: "Pangkat Baru",
                 value: `${nextRank.LOGO || ""} ${rankName}`,
                 inline: true,
               },
               {
                 name: "Kategori",
                 value: nextCategory.KATEGORI,
                 inline: true,
               },
               ...(nextRank.POINT > 0
                 ? [
                     {
                       name: "Poin Digunakan",
                       value: `${nextRank.POINT} poin`,
                       inline: true,
                     },
                   ]
                 : []),
             ),
         ],
       });
     } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xe74c3c)
            .setTitle("❌ Terjadi kesalahan")
            .setDescription("Gagal memproses promosi. Silakan coba lagi."),
        ],
      });
    }
  },
};
