import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import { pathToFileURL } from 'url';
import { Client, Events, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from 'discord.js';
import { addTrackManager } from './track-manager.js';

const COMMAND_FOLDER_PATH = path.join(import.meta.dirname, 'commands');
const { BOT_TOKEN, APPLICATION_ID } = process.env;
const CLIENT_INTENTS = [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.MessageContent];
const client = new Client({ intents: CLIENT_INTENTS });
const commandMap = new Map();

export function getClient() {
    return client;
}

export async function setupClient() {

    async function setupCommands() {
        for (const fileName of fs.readdirSync(COMMAND_FOLDER_PATH)) {
            const fileURL = pathToFileURL(path.join(COMMAND_FOLDER_PATH, fileName));
            const command = (await import(fileURL)).default;
            if (!command.data instanceof SlashCommandBuilder || !command.execute instanceof Function)
                throw new Error(`${fileName} is not properly configured.`);
            commandMap.set(command.data.name, command);
        }
    }

    async function deployCommands() {
        const rest = new REST().setToken(BOT_TOKEN);
        await rest.put(
            Routes.applicationCommands(APPLICATION_ID),
            { body: (Array.from(commandMap.values()).map(value => value.data)) },
        );
    }

    function setupEventHandlers() {
        client.on(Events.InteractionCreate, async interaction => {
            if (!interaction.isChatInputCommand())
                return;
            const command = commandMap.get(interaction.commandName);
            if (!command)
                return;
            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred)
                    await interaction.followUp({ content: 'There was an unexpected error while executing this command!', ephemeral: true });
                else
                    await interaction.reply({ content: 'There was an unexpected error while executing this command!', ephemeral: true });
            }
        });
        client.on(Events.GuildCreate, (guild) => { addTrackManager(guild.id); });
    }

    await setupCommands();
    await deployCommands();
    setupEventHandlers();
}

export async function login() {
    await client.login(BOT_TOKEN);
}

export async function logout() {
    await client.destroy();
}
