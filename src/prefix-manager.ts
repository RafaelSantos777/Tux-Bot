
import fs from 'fs';
import guildPrefixesJSON from '../data/guild-prefixes.json' with {type: 'json'};
import { Message } from 'discord.js';

const PREFIX_REGEX = new RegExp(/^[\w/!?=+\-.,;:*#&^~%$@<>«»()\[\]{}]*$/);
const MAX_PREFIX_LENGTH = 10;
const guildPrefixes: Map<string, string> = new Map(Object.entries(guildPrefixesJSON));

export function getPrefix(guildId: string): string | undefined {
    return guildPrefixes.get(guildId);
}

export function setPrefix(guildId: string, prefix: string) {

    function validatePrefix() {
        if (!PREFIX_REGEX.test(prefix))
            throw new PrefixManagerError('That prefix contains invalid characters.');
        if (prefix.length > MAX_PREFIX_LENGTH)
            throw new PrefixManagerError(`That prefix is too big. The maximum length is ${MAX_PREFIX_LENGTH} characters.`);
    }

    validatePrefix();
    guildPrefixes.set(guildId, prefix);
    fs.writeFileSync('data/guild-prefixes.json', JSON.stringify(Object.fromEntries(guildPrefixes), null, 4));
}

export function extractCommandName(message: Message<true>): string | null {
    const prefix = guildPrefixes.get(message.guildId);
    if (!prefix || !message.content.startsWith(prefix))
        return null;
    const prefixAndCommandName = message.content.split(' ', 1)[0];
    return prefixAndCommandName.substring(prefix.length).toLowerCase();
}

export function extractCommandOptions(message: Message<true>): string {
    const splitMessage = message.content.split(' ');
    return splitMessage.slice(1).join(' ').trim();
}

export class PrefixManagerError extends Error { }
