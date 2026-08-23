module.exports = {
  apps: [
    {
      name: 'servitoken-dev',
      script: 'npx',
      args: 'next dev -p 3000',
      cwd: '/home/z/my-project',
      env: {},
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
    },
  ],
};
