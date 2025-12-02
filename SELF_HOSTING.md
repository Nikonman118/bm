# Self-Hosting Discord Bot

This guide will help you download and run this Discord bot on your own server.

## Prerequisites

- **Node.js**: v16.9.0 or higher ([Download](https://nodejs.org))
- **PostgreSQL**: v12 or higher ([Download](https://www.postgresql.org/download/))
- **Git**: ([Download](https://git-scm.com))
- A Discord bot token (see setup below)

## Step 1: Get Your Discord Bot Token

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" section and click "Add Bot"
4. Copy the bot token (click "Reset Token" if needed)
5. Go to "General Information" and copy your Client ID
6. Under "OAuth2" → "URL Generator":
   - Scopes: `bot`
   - Permissions: `Kick Members`, `Ban Members`, `Moderate Members`, `Send Messages`, `Embed Links`, `Read Message History`
   - Copy the generated URL and open it in your browser to add the bot to your server

## Step 2: Set Up PostgreSQL Database

### Option A: Local PostgreSQL (Windows/Mac/Linux)

1. Install PostgreSQL from the link above
2. During installation, remember the password you set for the `postgres` user
3. Open PostgreSQL Command Line (psql)
4. Create a new database:
   ```sql
   CREATE DATABASE discord_bot;
   ```
5. Create a new user:
   ```sql
   CREATE USER bot_user WITH PASSWORD 'your_secure_password';
   ```
6. Grant permissions:
   ```sql
   GRANT ALL PRIVILEGES ON DATABASE discord_bot TO bot_user;
   ```

### Option B: Cloud PostgreSQL (Recommended for Production)

- **Neon**: https://neon.tech (Free tier available)
- **Railway**: https://railway.app (Paid, but reliable)
- **ElephantSQL**: https://www.elephantsql.com (Free tier available)

Copy the database URL from your provider (looks like: `postgresql://user:password@host:port/database`)

## Step 3: Clone and Install

1. Clone the repository:
   ```bash
   git clone <repository-url> discord-bot
   cd discord-bot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Step 4: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and fill in your values:
   - `DISCORD_BOT_TOKEN`: Your bot token from Step 1
   - `DISCORD_CLIENT_ID`: Your Client ID from Step 1
   - `DATABASE_URL`: Your PostgreSQL connection string
   - Other database variables (PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE)

Example `.env` file:
```
DISCORD_BOT_TOKEN=MTk4NjIyNDgzNTYzNTI4OTEw.ClonedExample
DISCORD_CLIENT_ID=123456789012345678
DATABASE_URL=postgresql://bot_user:your_secure_password@localhost:5432/discord_bot
PGHOST=localhost
PGPORT=5432
PGUSER=bot_user
PGPASSWORD=your_secure_password
PGDATABASE=discord_bot
NODE_ENV=production
```

## Step 5: Deploy Slash Commands

Before running the bot, register all commands with Discord:

```bash
npm run deploy
```

You should see:
```
Started refreshing X application (/) commands.
Successfully reloaded X global commands.
```

## Step 6: Run the Bot

```bash
npm start
```

The bot will:
1. Connect to PostgreSQL and initialize the database
2. Load all commands and events
3. Start the Express stats website on port 5000
4. Connect to Discord

You should see:
```
Loaded command: ping
Loaded command: help
...
Database initialized successfully
Stats website running at http://0.0.0.0:5000
Ready! Logged in as YourBotName#1234
Serving X server(s)
```

## Access the Stats Website

Once running, open your browser and go to:
- Local: `http://localhost:5000`
- Remote: `http://your-server-ip:5000`

The dashboard shows real-time bot statistics and auto-updates every 5 seconds.

## Available Commands

### Utility
- `/ping` - Check bot latency
- `/help` - List all commands
- `/info` - Bot information and stats

### Moderation
- `/setup logs <channel>` - Set moderation log channel
- `/setup appeal <link>` - Set ban appeal link (optional)
- `/setup view` - View current settings
- `/setup remove <setting>` - Remove a setting
- `/kick <user> [reason]` - Kick a user (sends DM)
- `/ban <user> [reason] [delete_days]` - Ban a user (sends DM with appeal link if set)
- `/timeout <user> <duration> [reason]` - Timeout a user (sends DM)
- `/unban <userid> [reason]` - Unban a user

## Hosting Options

### Option 1: Your Local Machine
- Simple but requires 24/7 power
- Good for development and testing
- Best for: Small servers, testing

### Option 2: Cloud VPS
Popular providers:
- **DigitalOcean**: $5-6/month (great value)
- **Linode**: $5-10/month
- **AWS**: Pay-as-you-go
- **Heroku**: Free tier (limited)

Example setup on DigitalOcean:
1. Create a Droplet with Ubuntu 20.04
2. SSH into the server
3. Install Node.js: `curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs`
4. Install PostgreSQL: `sudo apt install postgresql postgresql-contrib`
5. Follow Steps 1-6 above
6. Keep the bot running with PM2:
   ```bash
   npm install -g pm2
   pm2 start npm --name "discord-bot" -- start
   pm2 startup
   pm2 save
   ```

### Option 3: Docker (Advanced)
Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t discord-bot .
docker run -e DISCORD_BOT_TOKEN=your_token discord-bot
```

## Troubleshooting

### Bot won't start
- Check `.env` file has all required variables
- Verify PostgreSQL is running
- Check the error message in console

### Commands not showing up
- Run `npm run deploy` again
- Wait up to 1 hour for global commands to sync
- Use `DISCORD_GUILD_ID` in `.env` to test with guild commands (instant)

### Database connection errors
- Check PostgreSQL is running
- Verify `DATABASE_URL` is correct
- Test connection: `psql postgresql://user:password@host:port/database`

### Bot goes offline
- Check internet connection
- Verify bot token is still valid
- Check Discord API status: https://status.discord.com

### Stats website shows "Offline"
- Check the website is on the correct port (default: 5000)
- Verify firewall allows incoming connections on port 5000
- Check Express server is running in console logs

## Updating the Bot

To get the latest updates:
```bash
git pull origin main
npm install
npm run deploy
```

Then restart the bot:
```bash
# If running manually: Ctrl+C then npm start
# If running with PM2: pm2 restart discord-bot
```

## Support & Issues

For issues, check:
1. Console logs for error messages
2. Discord Developer Portal bot settings
3. PostgreSQL database connection
4. Firewall/network settings
5. This troubleshooting section

## License

This project is licensed under the MIT License - see the LICENSE file for details.
