module.exports = {
    apps: [
        {
            name: 'buckless-server',
            script: 'app/index.js',
            instances: 'max',
            exec_mode: 'cluster',
            kill_timeout: 3000,
            listen_timeout: 3000,
            error_file: 'log/console.error.log',
            out_file: 'log/console.log',
            wait_ready: true,
            watch: process.env.NODE_ENV === 'development',
            ignore_watch: ['.git', 'log', 'migrations', 'node_modules', 'scripts', 'seeds', 'test'],
            env: {
                NODE_ENV: 'development'
            },
            env_production: {
                NODE_ENV: 'production'
            }
        }
    ]
};
