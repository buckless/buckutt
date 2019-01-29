import crypto from 'crypto';

export default (privateKey, fingerprint, method, url) => {
    if (!privateKey) {
        return;
    }

    const path = url.split('?');
    const signaturePayload = `${fingerprint}-${method}-/${path[0]}`;
    const hmac = crypto.createHmac('sha256', privateKey).update(signaturePayload);
    return hmac.digest('hex');
};
