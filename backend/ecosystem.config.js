module.exports = {
  apps: [
    {
      name: "posada-del-palomo",
      script: "dist/index.js",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
      },
      autorestart: true,
      max_restarts: 15,
      restart_delay: 3000,
      watch: false,
    },
  ],
};
