async function fetchStats() {
    try {
        const response = await fetch('/api/stats');
        
        if (!response.ok) {
            throw new Error('Bot is not ready');
        }
        
        const stats = await response.json();
        
        document.getElementById('bot-avatar').src = stats.botAvatar;
        document.getElementById('bot-name').textContent = stats.botName;
        
        const statusEl = document.getElementById('status');
        statusEl.textContent = stats.status;
        statusEl.className = 'status online';
        
        document.getElementById('servers').textContent = stats.servers.toLocaleString();
        document.getElementById('users').textContent = stats.users.toLocaleString();
        document.getElementById('channels').textContent = stats.channels.toLocaleString();
        document.getElementById('ping').textContent = `${stats.ping}ms`;
        document.getElementById('uptime').textContent = stats.uptime;
        document.getElementById('memory').textContent = stats.memoryUsage;
        document.getElementById('commands').textContent = stats.commands;
        document.getElementById('version').textContent = `v${stats.discordJsVersion}`;
        
    } catch (error) {
        console.error('Failed to fetch stats:', error);
        
        const statusEl = document.getElementById('status');
        statusEl.textContent = 'Offline';
        statusEl.className = 'status offline';
    }
}

fetchStats();

setInterval(fetchStats, 5000);
