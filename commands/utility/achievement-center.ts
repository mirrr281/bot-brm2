import { SlashCommandBuilder, PermissionsBitField, MessageFlags } from "discord.js";
import { renderAchievementHub } from "../../utils/achievementRenderer";
import {
  getAchievementCenterMessageId,
  setAchievementCenterMessageId,
} from "../../utils/achievementData";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("achievement-center-post")
    .setDescription("Post atau update PUSAT ACHIEVEMENT OPERATOR"),
  async execute(interaction: any) {
    if (
      !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)
    ) {
      return interaction.reply({
        content: "Kamu tidak punya izin untuk menggunakan perintah ini.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const channelId =
      process.env.ACHIEVEMENT_CENTER_CHANNEL_ID ||
      process.env.HALL_OF_HONOR_CHANNEL_ID;
    if (!channelId) {
      return interaction.reply({
        content:
          "ACHIEVEMENT_CENTER_CHANNEL_ID tidak dikonfigurasi. Hubungi Administrator.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const channel = interaction.guild?.channels.cache.get(channelId);
    if (!channel?.isTextBased()) {
      return interaction.reply({
        content: "Channel tidak ditemukan. Periksa konfigurasi.",
        flags: MessageFlags.Ephemeral,
      });
    }

    let message: any = null;
    const existingId = getAchievementCenterMessageId();
    if (existingId) {
      try {
        message = await channel.messages.fetch(existingId);
      } catch {
        message = null;
      }
    }

    const payload: any = {
      components: [renderAchievementHub()],
      flags: 1 << 15,
    };

    if (message) {
      try {
        await message.edit(payload);
      } catch {
        message = null;
      }
    }

    if (!message) {
      message = await channel.send(payload);
      setAchievementCenterMessageId(message.id);
    }

    return interaction.reply({
      content: "PUSAT ACHIEVEMENT OPERATOR telah dikirim atau diperbarui.",
      flags: MessageFlags.Ephemeral,
    });
  },
};
