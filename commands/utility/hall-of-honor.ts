import { SlashCommandBuilder, PermissionsBitField, MessageFlags, AttachmentBuilder } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import { createHallOfHonorPanel } from "../../utils/hallOfHonorRenderer";
import {
  getHallOfHonorMessageId,
  setHallOfHonorMessageId,
} from "../../utils/hallOfHonorData";

const BANNER_FILE = path.join(__dirname, "../../assets/hall-of-honor-banner.png");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hall-of-honor-post")
    .setDescription("Post atau update panel Hall of Honor"),
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
      process.env.HALL_OF_HONOR_CHANNEL_ID ||
      process.env.ACHIEVEMENT_CENTER_CHANNEL_ID;
    if (!channelId) {
      return interaction.reply({
        content: "HALL_OF_HONOR_CHANNEL_ID tidak dikonfigurasi.",
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
    const existingId = getHallOfHonorMessageId();
    if (existingId) {
      try {
        message = await channel.messages.fetch(existingId);
      } catch {
        message = null;
      }
    }

    const hasBanner = fs.existsSync(BANNER_FILE);
    let payload: any;

    if (hasBanner) {
      payload = {
        components: [createHallOfHonorPanel(`attachment://hall-of-honor-banner.png`)],
        flags: 1 << 15,
        files: [new AttachmentBuilder(BANNER_FILE)],
      };
      if (message) {
        try { await message.delete(); } catch {}
        message = null;
        setHallOfHonorMessageId(null);
      }
    } else {
      payload = {
        components: [createHallOfHonorPanel()],
        flags: 1 << 15,
      };
    }

    if (message) {
      try {
        await message.edit(payload);
      } catch {
        message = null;
      }
    }

    if (!message) {
      message = await channel.send(payload);
      setHallOfHonorMessageId(message.id);
    }

    return interaction.reply({
      content: "Panel Hall of Honor telah dikirim atau diperbarui.",
      flags: MessageFlags.Ephemeral,
    });
  },
};
