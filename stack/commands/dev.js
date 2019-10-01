const path = require('path');
const execa = require('execa');
const chalk = require('chalk').default;

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

const start = (name, cmd) => {
    const packagePath = path.join(__dirname, '../../packages/', name);

    const child = execa('yarn', [cmd], { cwd: packagePath });

    child.stderr.on('data', data => {
        const line = data.toString().trim();

        if (line.match(/^[\w-]+ - failed$/)) {
            console.log(`[${chalk.red(name)}] webpack build failed`);
        } else {
            console.log(`[${chalk.red(name)}] ${line}`);
        }
    });

    child.stdout.on('data', data => {
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

    return child;
};

module.exports = async () => {
    const children = {};

    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', data => {
        const str = data
            .toString()
            .trim()
            .toLowerCase();

        const reg = new RegExp(`rs (${Object.keys(packages).join('|')})`, 'g');
        const match = reg.exec(str);

        if (match && match.length === 2) {
            const name = match[1];
            const cmd = packages[name];

            children[match[1]].kill('SIGKILL');

            setTimeout(() => {
                children[match[1]] = start(name, cmd);
            }, 100);
        }
    });

    for (let [name, cmd] of Object.entries(packages)) {
        children[name] = start(name, cmd);
    }
};
