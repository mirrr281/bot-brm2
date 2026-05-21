import dotenv from "dotenv";
dotenv.config();

import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  MessageFlags,
} from "discord.js";
import path from "node:path";
import fs from "node:fs";

const client = new Client({ intents: [GatewayIntentBits.Guilds] }) as Client & {
  commands: Collection<string, any>;
  components: Collection<string, any>;
};

client.commands = new Collection();
client.components = new Collection();

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);
for (const folder of commandFolders) {
  client.commands.clear();
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".ts"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
      );
    }
  }
}

// Load Components
const componentsPath = path.join(__dirname, "components");
// You might need a helper to recursively scan subdirectories (buttons/modals)
// For now, let's keep it simple assuming a flat structure or specific subfolders
const componentFolders = fs.readdirSync(componentsPath);
for (const folder of componentFolders) {
  const folderPath = path.join(componentsPath, folder);
  const componentFiles = fs
    .readdirSync(folderPath)
    .filter((file) => file.endsWith(".ts"));

  for (const file of componentFiles) {
    const filePath = path.join(folderPath, file);
    const component = require(filePath);
    if ("customId" in component && "execute" in component) {
      client.components.set(component.customId, component);
    }
  }
}

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".ts"));
for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.login(process.env.DISCORD_TOKEN);
