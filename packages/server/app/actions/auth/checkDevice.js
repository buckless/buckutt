const crypto = require('crypto');
const APIError = require('server/app/utils/APIError');
const config = require('server/app/config').client;

const generateKey = () =>
    new Promise((resolve, reject) => {
        crypto.randomBytes(64, function(err, buffer) {
            if (err) {
                reject(err);
            }

            resolve(buffer.toString('hex'));
        });
    });

const registerDevice = async ({ models }, fingerprint) => {
    const name = Math.floor(Math.random() * (999999 - 100000) + 100000);
    const newPrivateKey = await generateKey();

    try {
        await new models.Device({
            name,
            fingerprint: fingerprint,
            privateKey: newPrivateKey
        }).save();
    } catch (err) {
        throw new APIError(module, 401, 'Unauthorized device');
    }

    return {
        name,
        authorized: false
    };
};

const checkDevice = async ({ models }, device) => {
    if (!device) {
        throw new APIError(module, 404, 'Device not found');
    } else if (device.sendPrivateKey) {
        const newPrivateKey = await generateKey();

        await new models.Device({
            id: device.id
        }).save(
            {
                privateKey: newPrivateKey,
                sendPrivateKey: false
            },
            {
                patch: true
            }
        );

        return {
            name: device.name,
            authorized: device.authorized,
            newPrivateKey,
            config
        };
    }

    return {
        name: device.name,
        authorized: device.authorized
    };
};

module.exports = {
    registerDevice,
    checkDevice
};
