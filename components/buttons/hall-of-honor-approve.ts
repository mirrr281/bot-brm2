import { MessageFlags, PermissionsBitField } from "discord.js";

module.exports = {
  customId: "approve_",
  async execute(interaction: any) {
    const targetUserId = interaction.customId.split("_")[1];

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: "Hanya Administrator yang dapat melakukan approve/reject.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const targetUser = interaction.guild?.members.cache.get(targetUserId)?.user;
    if (!targetUser) {
      return interaction.reply({
        content: "User tidak ditemukan di server.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const typeMatch = interaction.message.embeds[0]?.title?.match(/Pengajuan (.+) Baru/);
    const formType = typeMatch ? typeMatch[1] : "Sertifikat";

    const { EmbedBuilder } = await import("discord.js");
    const logEmbed = EmbedBuilder.from(interaction.message.embeds[0]);
    logEmbed.setColor(0x00ff00).setTitle(`${logEmbed.data.title} (DISETUJUI)`);

    await interaction.update({ embeds: [logEmbed], components: [] });

    const notifyEmbed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle("Pengajuan Disetujui!")
      .setDescription(
        `Selamat **${targetUser.displayName || targetUser.username}**, kamu mendapatkan **${formType}**!`,
      )
      .setTimestamp()
      .setFooter({ text: "KOPASSUS BRM" });

    const approvalChannelId =
      process.env.HALL_OF_HONOR_BOARD_CHANNEL_ID ||
      process.env.HALL_OF_HONOR_CHANNEL_ID;
    if (approvalChannelId) {
      const approvalChannel = interaction.guild?.channels.cache.get(approvalChannelId);
      if (approvalChannel?.isTextBased()) {
        await approvalChannel.send({ embeds: [notifyEmbed] });
      }
    }

    await interaction.followUp({
      content: `Pengajuan **${formType}** dari **${targetUser.tag}** telah disetujui.`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
