module.exports = {
  apps: [{
    name: 'publisher-radar',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/home/administrator/publisher-radar',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '2G',
    env: {
      NODE_ENV: 'production',
      PORT: '3007'
    },
    error_file: '/home/administrator/.pm2/logs/publisher-radar-error.log',
    out_file: '/home/administrator/.pm2/logs/publisher-radar-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
}
