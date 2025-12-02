const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function initDatabase() {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS guild_settings (
                guild_id VARCHAR(255) PRIMARY KEY,
                log_channel_id VARCHAR(255),
                ban_appeal_link VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        const columnCheck = await client.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'guild_settings' AND column_name = 'ban_appeal_link'
        `);
        
        if (columnCheck.rows.length === 0) {
            await client.query(`
                ALTER TABLE guild_settings ADD COLUMN ban_appeal_link VARCHAR(500)
            `);
        }
        
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
    } finally {
        client.release();
    }
}

async function setLogChannel(guildId, channelId) {
    const client = await pool.connect();
    try {
        await client.query(`
            INSERT INTO guild_settings (guild_id, log_channel_id, updated_at)
            VALUES ($1, $2, CURRENT_TIMESTAMP)
            ON CONFLICT (guild_id)
            DO UPDATE SET log_channel_id = $2, updated_at = CURRENT_TIMESTAMP
        `, [guildId, channelId]);
        return true;
    } catch (error) {
        console.error('Error setting log channel:', error);
        return false;
    } finally {
        client.release();
    }
}

async function getLogChannel(guildId) {
    const client = await pool.connect();
    try {
        const result = await client.query(
            'SELECT log_channel_id FROM guild_settings WHERE guild_id = $1',
            [guildId]
        );
        return result.rows[0]?.log_channel_id || null;
    } catch (error) {
        console.error('Error getting log channel:', error);
        return null;
    } finally {
        client.release();
    }
}

async function removeLogChannel(guildId) {
    const client = await pool.connect();
    try {
        await client.query(
            'UPDATE guild_settings SET log_channel_id = NULL, updated_at = CURRENT_TIMESTAMP WHERE guild_id = $1',
            [guildId]
        );
        return true;
    } catch (error) {
        console.error('Error removing log channel:', error);
        return false;
    } finally {
        client.release();
    }
}

async function setBanAppealLink(guildId, link) {
    const client = await pool.connect();
    try {
        await client.query(`
            INSERT INTO guild_settings (guild_id, ban_appeal_link, updated_at)
            VALUES ($1, $2, CURRENT_TIMESTAMP)
            ON CONFLICT (guild_id)
            DO UPDATE SET ban_appeal_link = $2, updated_at = CURRENT_TIMESTAMP
        `, [guildId, link]);
        return true;
    } catch (error) {
        console.error('Error setting ban appeal link:', error);
        return false;
    } finally {
        client.release();
    }
}

async function getBanAppealLink(guildId) {
    const client = await pool.connect();
    try {
        const result = await client.query(
            'SELECT ban_appeal_link FROM guild_settings WHERE guild_id = $1',
            [guildId]
        );
        return result.rows[0]?.ban_appeal_link || null;
    } catch (error) {
        console.error('Error getting ban appeal link:', error);
        return null;
    } finally {
        client.release();
    }
}

async function removeBanAppealLink(guildId) {
    const client = await pool.connect();
    try {
        await client.query(
            'UPDATE guild_settings SET ban_appeal_link = NULL, updated_at = CURRENT_TIMESTAMP WHERE guild_id = $1',
            [guildId]
        );
        return true;
    } catch (error) {
        console.error('Error removing ban appeal link:', error);
        return false;
    } finally {
        client.release();
    }
}

async function getGuildSettings(guildId) {
    const client = await pool.connect();
    try {
        const result = await client.query(
            'SELECT log_channel_id, ban_appeal_link FROM guild_settings WHERE guild_id = $1',
            [guildId]
        );
        return result.rows[0] || { log_channel_id: null, ban_appeal_link: null };
    } catch (error) {
        console.error('Error getting guild settings:', error);
        return { log_channel_id: null, ban_appeal_link: null };
    } finally {
        client.release();
    }
}

module.exports = {
    pool,
    initDatabase,
    setLogChannel,
    getLogChannel,
    removeLogChannel,
    setBanAppealLink,
    getBanAppealLink,
    removeBanAppealLink,
    getGuildSettings
};
