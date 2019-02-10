const mkdirp = require('mkdirp');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, colorize, prettyPrint, printf, splat } = format;
const WinstonTcpGraylog = require('winston-tcp-graylog');
const config = require('../../config');
const { pad2 } = require('./utils');

const MAX_LOG_FILE_SIZE = 10 * 1000 * 1000;

const timestampFormat = () => {
    const now = new Date();
    const date = `${pad2(now.getFullYear())}/${pad2(now.getMonth() + 1)}/${pad2(now.getDate())}`;
    const time = `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;

    return `[${date} ${time}]`;
};

module.exports = moduleToUse => {
    let path;

    if (typeof moduleToUse === 'string') {
        path = moduleToUse;
    } else {
        path = moduleToUse.filename;
    }

    path = path
        .split('/')
        .slice(-2)
        .join('/')
        .split('.js')[0];

    const activeTransports = [];

    if (config.log.console !== 'none') {
        const consoleTransport = new transports.Console({
            level: config.log.console.level,
            name: 'console',
            format: combine(
                splat(),
                label({ label: path }),
                timestamp({ format: timestampFormat }),
                colorize(),
                prettyPrint(),
                printf(info => `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`)
            )
        });

        activeTransports.push(consoleTransport);
    }

    /* istanbul ignore if */
    if (config.log.file !== 'none') {
        mkdirp.sync('./log');

        const fileTransport = new transports.File({
            timestamp,
            name: 'file',
            level: config.log.file.level,
            filename: './log/server.log',
            maxsize: MAX_LOG_FILE_SIZE,
            label: path,
            format: combine(splat(), timestamp({ format: timestampFormat }))
        });

        activeTransports.push(fileTransport);
    }

    // graylog2
    /* istanbul ignore if */
    if (config.log.graylog && config.log.graylog.gelfPro) {
        config.log.graylog.baseMsg = {
            host: config.app.name
        };

        const graylogTransport = new WinstonTcpGraylog(config.log.graylog);

        // debouce disconnect errors
        let lastError = Date.now();
        graylogTransport.on('error', error => {
            const now = Date.now();

            if (now - lastError >= 60 * 1000) {
                // eslint-disable-next-line no-console
                console.log(`Graylog error: ${error}`);
                lastError = now;
            }
        });

        activeTransports.push(graylogTransport);
    }

    const logger = createLogger({ transports: activeTransports });

    return logger;
};

module.exports.stream = {
    write(message) {
        module.exports('express').info(message);
    }
};
