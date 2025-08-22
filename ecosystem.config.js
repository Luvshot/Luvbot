module.exports = {
  apps: [{
    name: 'discord-bot',
    script: 'index.js',
    watch: true,
    ignore_watch: ['node_modules', 'stats.json', '.env'],
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};