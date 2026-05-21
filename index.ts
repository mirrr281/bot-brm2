import dotenv from "dotenv";
dotenv.config();

if (!process.env.DISCORD_TOKEN || !process.env.CHANNEL_ID) {
  console.error(
    "❌ Error: Missing required environment variables (DISCORD_TOKEN or CHANNEL_ID).",
  );
  process.exit(1);
}

import { Client, Collection, GatewayIntentBits } from "discord.js";
import { loadCommands, loadComponents, loadEvents } from "./loader";

const client = new Client({ intents: [GatewayIntentBits.Guilds] }) as Client & {
  commands: Collection<string, any>;
  components: Collection<string, any>;
};

client.commands = new Collection();
client.components = new Collection();

loadCommands(client);
loadComponents(client);
loadEvents(client);

client.login(process.env.DISCORD_TOKEN);
