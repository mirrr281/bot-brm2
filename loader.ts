import { Client, Collection } from "discord.js";
import path from "node:path";
import fs from "node:fs";

export function loadCommands(client: Client & { commands: Collection<string, any> }) {
  const foldersPath = path.join(__dirname, "commands");
  const commandFolders = fs.readdirSync(foldersPath);

  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".ts"));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);

      if (command?.data && command?.execute) {
        client.commands.set(command.data.name, command);
      }
    }
  }
}

export function loadComponents(client: Client & { components: Collection<string, any> }) {
  const componentsPath = path.join(__dirname, "components");
  const componentFolders = fs.readdirSync(componentsPath);

  for (const folder of componentFolders) {
    const folderPath = path.join(componentsPath, folder);
    const componentFiles = fs.readdirSync(folderPath).filter((file) => file.endsWith(".ts"));

    for (const file of componentFiles) {
      const filePath = path.join(folderPath, file);
      const component = require(filePath);

      if (component?.customId && component?.execute) {
        client.components.set(component.customId, component);
      }
    }
  }
}

export function loadEvents(client: Client) {
  const eventsPath = path.join(__dirname, "events");
  const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith(".ts"));

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }
}
