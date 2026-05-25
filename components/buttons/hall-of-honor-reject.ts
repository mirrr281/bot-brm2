import { MessageFlags, PermissionsBitField } from "discord.js";

module.exports = {
  customId: "reject_",
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
    logEmbed.setColor(0xff0000).setTitle(`${logEmbed.data.title} (DITOLAK)`);

    await interaction.update({ embeds: [logEmbed], components: [] });

    await interaction.followUp({
      content: `Pengajuan **${formType}** dari **${targetUser.tag}** telah ditolak.`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
