import { SlashCommandBuilder, PermissionsBitField, MessageFlags } from "discord.js";
import { createPatroliPanel } from "../../utils/patroliRenderer";
import {
  getPatroliMessageId,
  setPatroliMessageId,
} from "../../utils/patroliData";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("patroli-post")
    .setDescription("Post atau update panel Patroli"),
  async execute(interaction: any) {
    if (
      !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)
    ) {
      return interaction.reply({
        content: "Kamu tidak punya izin untuk menggunakan perintah ini.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const channelId = process.env.PATROLI_CHANNEL_ID;
    if (!channelId) {
      return interaction.reply({
        content: "PATROLI_CHANNEL_ID tidak dikonfigurasi.",
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
    const existingId = getPatroliMessageId();
    if (existingId) {
      try {
        message = await channel.messages.fetch(existingId);
      } catch {
        message = null;
      }
    }

    const payload: any = {
      components: [createPatroliPanel()],
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
      setPatroliMessageId(message.id);
    }

    return interaction.reply({
      content: "Panel Patroli telah dikirim atau diperbarui.",
      flags: MessageFlags.Ephemeral,
    });
  },
};
