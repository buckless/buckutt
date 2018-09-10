module.exports = {
  apps : [{
    name      : 'buckless-server',
    script    : 'src/app.js',
    instances : 'max',
    exec_mode : 'cluster',
    kill_timeout: 3000,
    listen_timeout: 3000,
    error_file: 'log/console.error.log',
    out_file: 'log/console.log',
    wait_ready: true,
    watch: process.env.NODE_ENV === 'development',
    ignore_watch: [ 'log', 'migrations', 'seeds', 'test', '.git' ],
    env: {
      NODE_ENV: 'development'
    },
    env_production : {
      NODE_ENV: 'production'
    }
  }]
};
