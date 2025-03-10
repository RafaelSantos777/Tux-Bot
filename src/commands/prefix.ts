import { InteractionContextType, Message, SlashCommandBuilder } from 'discord.js';
import { extractCommandOptions, getPrefix, PrefixManagerError, setPrefix } from '../prefix-manager.js';
import { Command, CommandContext } from '../types/command.js';

export default {
    data: new SlashCommandBuilder()
        .setName('prefix')
        .setDescription('Set my prefix for this server or check the current one.')
        .setContexts([InteractionContextType.Guild])
        .addStringOption(option => option
            .setName('prefix')
            .setDescription('My new prefix for this server. Leave blank to simply check the current prefix.')
            .setRequired(false)),
    async execute(context: CommandContext) {
        const selectedPrefix = context instanceof Message ? extractCommandOptions(context) : context.options.getString('prefix');
        const guildId = context.guildId as string;
        if (!selectedPrefix) {
            const currentPrefix = getPrefix(guildId);
            await context.reply(currentPrefix
                ? `My prefix for this server is: **${currentPrefix}**`
                : `My prefix for this server hasn't been defined yet.`);
            return;
        }
        try {
            setPrefix(guildId, selectedPrefix);
            await context.reply(`Set my prefix for this server to: **${getPrefix(guildId)}**`);
        } catch (error) {
            if (error instanceof PrefixManagerError) {
                await context.reply({ content: `${error.message}`, ephemeral: true });
                return;
            }
            throw error;
        }
    },
} as Command;
