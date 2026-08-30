module.exports = {
  apps: [
    {
      name: 'servitoken-dev',
      script: '/home/z/my-project/scripts/dev.sh',
      cwd: '/home/z/my-project',
      watch: false,
      env: {
        NODE_ENV: 'development',
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: '/home/z/my-project/logs/pm2-error.log',
      out_file: '/home/z/my-project/logs/pm2-out.log',
      merge_logs: true,
      max_restarts: 10,
      restart_delay: 3000,
      kill_timeout: 5000,
    },
  ],
};
