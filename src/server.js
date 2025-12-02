const express = require('express');
const path = require('path');

function createServer(client) {
    const app = express();
    const PORT = 5000;

    app.use(express.static(path.join(__dirname, 'public')));

    app.get('/api/stats', (req, res) => {
        if (!client.isReady()) {
            return res.status(503).json({ error: 'Bot is not ready' });
        }

        const uptime = client.uptime;
        const uptimeFormatted = formatUptime(uptime);
        const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

        const stats = {
            botName: client.user.tag,
            botAvatar: client.user.displayAvatarURL({ size: 256 }),
            status: 'Online',
            servers: client.guilds.cache.size,
            users: client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0),
            channels: client.channels.cache.size,
            uptime: uptimeFormatted,
            uptimeMs: uptime,
            memoryUsage: `${memoryUsage} MB`,
            ping: client.ws.ping,
            commands: client.commands.size,
            nodeVersion: process.version,
            discordJsVersion: require('discord.js').version
        };

        res.json(stats);
    });

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Stats website running at http://0.0.0.0:${PORT}`);
    });

    return app;
}

function formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}

module.exports = { createServer };
