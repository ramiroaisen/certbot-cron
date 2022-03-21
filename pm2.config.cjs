module.exports = {
  apps: [{
    name: "certbot",
    script: "./cron.js",
    instances: 1,
    exec_mode: "fork",
    max_memory_restart: "200M",
    log_date_format: "YYYY-MM-DD HH:mm:SS UTC-3",
    merge_logs: true,
    kill_timeout: 5_000,
    env: {
      NODE_ENV: "production"
    }
  }]
}