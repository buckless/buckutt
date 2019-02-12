const path = require('path');
const execa = require('execa');
const chalk = require('chalk').default;

module.exports = async () => {
    const packages = {
        admin: 'dev:calm',
        client: 'dev:calm',
        'image-server': 'dev',
        manager: 'dev:calm',
        server: 'dev'
    };

    const colors = {
        admin: 'green',
        client: 'green',
        'image-server': 'yellow',
        manager: 'green',
        server: 'blue'
    };

    for (let [ name, cmd ] of Object.entries(packages)) {
        const packagePath = path.join(__dirname, '../../packages/', name);

        const child = execa('yarn', [cmd], { cwd: packagePath });

        child.stderr.on('data', (data) => {
            const line = data.toString().trim();

            if (line.match(/^[\w-]+ - failed$/)) {
                console.log(`[${chalk.red(name)}] webpack build failed`);
            } else {
                console.log(`[${chalk.red(name)}] ${line}`);
            }
        });

        child.stdout.on('data', (data) => {
            const line = data.toString().trim();
            const chlk = chalk[colors[name]] || chalk.green;

            if (line.match(/^[\w-]+ - build$/)) {
                console.log(`[${chlk(name)}] webpack build succeed`);
            } else if (line.match(/^[\w-]+ - start$/)) {
                console.log(`[${chlk(name)}] webpack build started`);
            } else {
                console.log(`[${chlk(name)}] ${line}`);
            }
        });
    }
};
