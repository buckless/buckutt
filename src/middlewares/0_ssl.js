/**
 * Enforce client SSL certificate
 * @param  {Request}  req  Express request
 * @param  {Response} res  Express response
 * @param  {Function} next Next middleware
 * @return {Function} The next middleware
 */
module.exports = (req, res, next) => {
    /* istanbul ignore next */
    if (req.headers['x-certificate-fingerprint']) {
        req.fingerprint = req.headers['x-certificate-fingerprint'].toUpperCase();
        return next();
    }

    if (!req.client.authorized) {
        return res
            .status(401)
            .end('Unauthorized : missing client HTTPS certificate');
    }

    req.fingerprint = req.connection.getPeerCertificate().fingerprint.replace(/:/g, '').trim();

    return next();
};
