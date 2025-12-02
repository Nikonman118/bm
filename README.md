# Discord Moderation Bot

A powerful Discord bot built with discord.js v14 featuring moderation tools, logging, and a real-time stats dashboard.

[![Node.js](https://img.shields.io/badge/Node.js-16.9.0+-green)](https://nodejs.org)
[![discord.js](https://img.shields.io/badge/discord.js-v14-blue)](https://discord.js.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-blue)](https://www.postgresql.org)

## Features

✨ **Moderation Tools**
- Kick members with reason
- Ban members (with message deletion options)
- Timeout members (temporary mutes)
- Unban users
- All actions logged to a designated channel

🔔 **User Notifications**
- Users receive DM notifications when kicked, banned, or timed out
- Optional ban appeal link sent to banned users

📊 **Statistics Dashboard**
- Real-time bot statistics
- Server count, user count, channel count
- Bot latency and uptime
- Memory usage monitoring
- Auto-updates every 5 seconds

⚙️ **Flexible Configuration**
- Per-server moderation log channel
- Optional ban appeal form link
- Easy setup commands
- Persistent settings stored in PostgreSQL

## Quick Start

### Replit Users
This bot is ready to run on Replit. Just add your Discord credentials and it will work instantly.

### Self-Hosting
For detailed self-hosting instructions, see [SELF_HOSTING.md](SELF_HOSTING.md).

## Requirements

- Node.js v16.9.0 or higher
- PostgreSQL 12 or higher
- Discord bot token

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd discord-bot

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
# DISCORD_BOT_TOKEN=your_token
# DATABASE_URL=postgresql://...

# Deploy commands
npm run deploy

# Start the bot
npm start
```

## Commands

### Utility
- `/ping` - Shows bot latency
- `/help` - Lists all commands
- `/info` - Displays bot information

### Moderation
- `/setup logs <channel>` - Set moderation log channel
- `/setup appeal <link>` - Set ban appeal link
- `/setup view` - View current settings
- `/setup remove <setting>` - Remove a setting
- `/kick <user> [reason]` - Kick a user
- `/ban <user> [reason] [delete_days]` - Ban a user
- `/timeout <user> <duration> [reason]` - Timeout a user (1-40320 minutes)
- `/unban <userid> [reason]` - Unban a user

## Project Structure

```
src/
├── index.js                 # Main bot entry point
├── deploy-commands.js       # Command registration
├── server.js                # Express stats server
├── database.js              # PostgreSQL utilities
├── commands/                # Slash command handlers
│   ├── ping.js
│   ├── help.js
│   ├── info.js
│   ├── setup.js
│   ├── kick.js
│   ├── ban.js
│   ├── timeout.js
│   └── unban.js
├── events/                  # Event handlers
│   ├── ready.js
│   └── interactionCreate.js
└── public/                  # Web dashboard
    ├── index.html
    ├── styles.css
    └── script.js
```

## Database

The bot uses PostgreSQL to store:
- Guild settings (log channel, ban appeal link)
- Moderation history (via logs)

Database automatically initializes on first run.

## Stats Dashboard

Access the stats dashboard at `http://localhost:5000` (or your server's IP:5000)

Shows:
- Bot avatar and name
- Server count
- Total members
- Channel count
- Bot latency
- Uptime
- Memory usage
- Discord.js version

## Configuration

All configuration is done through Discord slash commands:

1. **Setup log channel**: `/setup logs #channel`
2. **Setup ban appeals**: `/setup appeal https://forms.google.com/...`
3. **View settings**: `/setup view`
4. **Remove settings**: `/setup remove logs` or `/setup remove appeal`

## Logging

All moderation actions are logged to the designated channel with:
- User information (tag, ID, avatar)
- Moderator information
- Action details (reason, duration if applicable)
- Timestamp

## Environment Variables

```
DISCORD_BOT_TOKEN      # Your bot token
DISCORD_CLIENT_ID      # Your application ID
DISCORD_GUILD_ID       # (Optional) Guild ID for instant command testing
DATABASE_URL           # PostgreSQL connection string
PGHOST, PGPORT, etc    # Individual database credentials
NODE_ENV               # 'development' or 'production'
```

## Contributing

This is a project template. Feel free to:
- Add more moderation commands
- Customize the dashboard
- Add more features
- Fix bugs

## License

MIT License - feel free to use this for commercial or personal projects

## Support

For issues or questions:
1. Check the troubleshooting section in SELF_HOSTING.md
2. Verify all environment variables are set correctly
3. Check Discord Developer Portal settings
4. Review bot permissions in your server

## Credits

Built with [discord.js](https://discord.js.org) and [Express.js](https://expressjs.com)
