# Discord Bot

A Discord bot built with discord.js v14 featuring slash commands, event handling, moderation tools, and a live stats website.

## Overview

This bot provides moderation functionality including kick, ban, and timeout commands with configurable logging. It uses a modular structure with separate files for commands and events for easy extensibility. The bot also includes a stats website that displays real-time bot information.

Users receive DM notifications when they're kicked, banned, or timed out. Banned users can optionally receive a ban appeal link.

## Project Structure

```
.
├── src/
│   ├── index.js              # Main bot entry point
│   ├── deploy-commands.js    # Script to register slash commands
│   ├── server.js             # Express server for stats website
│   ├── database.js           # PostgreSQL database utilities
│   ├── commands/             # Slash commands
│   │   ├── ping.js
│   │   ├── help.js
│   │   ├── info.js
│   │   ├── setup.js
│   │   ├── kick.js
│   │   ├── ban.js
│   │   ├── timeout.js
│   │   └── unban.js
│   ├── events/              # Event handlers
│   │   ├── ready.js
│   │   └── interactionCreate.js
│   └── public/              # Website static files
│       ├── index.html
│       ├── styles.css
│       └── script.js
├── .env.example             # Environment variables template
├── package.json             # Dependencies
├── README.md                # Main documentation
├── SELF_HOSTING.md          # Self-hosting guide
└── LICENSE                  # MIT License
```

## Setup

### Required Environment Variables

- `DISCORD_BOT_TOKEN` - Your Discord bot token (required)
- `DISCORD_CLIENT_ID` - Your Discord application client ID (required for deploying commands)
- `DISCORD_GUILD_ID` - Optional: Guild ID for testing (faster command registration)
- `DATABASE_URL` - PostgreSQL connection string (auto-configured by Replit)

### Getting Your Bot Token

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application or select an existing one
3. Go to the "Bot" section and click "Add Bot"
4. Copy the bot token
5. Enable necessary intents (Server Members Intent for moderation)

### Deploying Slash Commands

Run the deploy script to register commands with Discord:
```
npm run deploy
```

### Running the Bot

```
npm start
```

This starts both the Discord bot and the stats website on port 5000.

## Commands

### Utility Commands
- `/ping` - Shows bot latency and API latency
- `/help` - Lists all available commands
- `/info` - Shows bot information (uptime, memory, server count, etc.)

### Moderation Commands
- `/setup logs <channel>` - Set the channel for moderation logs
- `/setup appeal <link>` - Set an optional ban appeal link (sent to banned users)
- `/setup view` - View the current moderation settings
- `/setup remove <setting>` - Remove a setting (logs or appeal)
- `/kick <user> [reason]` - Kick a member from the server
- `/ban <user> [reason] [delete_days]` - Ban a member from the server
- `/timeout <user> <duration> [reason]` - Timeout a member (1 min to 28 days)
- `/unban <userid> [reason]` - Unban a previously banned user

## Stats Website

The bot includes a real-time stats dashboard that shows:
- Bot name and avatar
- Number of servers, users, and channels
- Current ping/latency
- Uptime
- Memory usage
- Number of commands
- Discord.js version

The dashboard auto-updates every 5 seconds.

## Database

The bot uses PostgreSQL to store:
- Guild settings (log channel configuration, ban appeal link)
- Settings persist when the bot restarts

## User Notifications

When a moderation action is taken:
- **Kick**: User receives DM with kick reason
- **Ban**: User receives DM with ban reason + optional appeal link
- **Timeout**: User receives DM with timeout duration and reason

## Adding New Commands

1. Create a new file in `src/commands/`
2. Export an object with `data` (SlashCommandBuilder) and `execute` (function)
3. Run `npm run deploy` to register the new command

## Self-Hosting

For complete self-hosting instructions, see [SELF_HOSTING.md](SELF_HOSTING.md).

## Recent Changes

- Added user DM notifications for moderation actions
- Added optional ban appeal link feature
- Added unban command
- Created comprehensive self-hosting guide
- Fixed error handling in moderation commands
- Added .env.example for easy setup
- Created detailed README and documentation
