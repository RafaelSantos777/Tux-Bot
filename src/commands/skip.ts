import { ChatInputCommandInteraction, InteractionContextType, Message, SlashCommandBuilder } from 'discord.js';
import { getTrackManager } from '../track-manager.js';
import { Command } from '../types/command.js';

export default {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skips the current track.')
        .setContexts([InteractionContextType.Guild]),
    aliases: ['s'],
    async execute(context: ChatInputCommandInteraction | Message<true>) {
        const trackManager = getTrackManager(context.guildId as string);
        const wasSkipped = trackManager.skip();
        await context.reply({ content: wasSkipped ? 'Track skipped.' : 'No track to skip.', ephemeral: !wasSkipped });
    },
} as Command;

