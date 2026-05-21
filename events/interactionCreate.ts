import { Events, MessageFlags, Interaction } from "discord.js";

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction) {
    if (interaction.isChatInputCommand()) {
      // @ts-expect-error - Custom property on client
      const command = interaction.client.commands.get(interaction.commandName);

      console.log(`executed ${interaction.commandName}`);

      if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: "There was an error while executing this command!",
            flags: MessageFlags.Ephemeral,
          });
        } else {
          await interaction.reply({
            content: "There was an error while executing this command!",
            flags: MessageFlags.Ephemeral,
          });
        }
      }
    } else if (
      interaction.isButton() ||
      interaction.isModalSubmit() ||
      interaction.isStringSelectMenu()
    ) {
      // @ts-expect-error - Custom property on client
      const components = interaction.client.components;

      // Try exact match first, then prefix match
      const component =
        components.get(interaction.customId) ??
        components.find((_: any, key: string) => interaction.customId.startsWith(key));

      if (component) {
        try {
          await component.execute(interaction);
        } catch (err) {
          console.error(err);
        }
      }
    }
  },
};