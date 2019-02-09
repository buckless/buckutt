import crypto from 'crypto';

const authData = {
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Fingerprint': 'admin'
    }
};

export function generateSignature(method, url) {
    const path = url.split('?');
    const signaturePayload = `admin-${method}-/${path[0]}`;
    const hmac = crypto.createHmac('sha256', 'admin').update(signaturePayload);
    return hmac.digest('hex');
}

export function updateBearer(token) {
    if (token) {
        authData.headers.Authorization = `Bearer ${token}`;
    } else {
        delete authData.headers.Authorization;
    }
}

/**
 * Get a ressource from the API
 * @param  {String} url   The base URL
 * @param  {Object} opts_ Options to pass to fetch (headers are already there)
 * @return {Promise} The result as JSON
 */
export function get(url, opts_) {
    const opts = Object.assign(
        {},
        authData,
        {
            method: 'GET',
            credentials: 'include'
        },
        opts_
    );

    opts.headers['X-Signature'] = generateSignature('GET', url);

    return fetch(`${config.api}/${url}`, opts).then(res => {
        if (!res.ok) {
            return Promise.reject(new Error(res.statusText));
        }

        return res.json();
    });
}

/**
 * Post a ressource to the API
 * @param  {String} url   The base URL
 * @param  {Object} data  The data object
 * @param  {Object} opts_ Options to pass to fetch (headers, body and method are already there)
 * @return {Promise} The result as JSON
 */
export function post(url, data, opts_) {
    const opts = Object.assign(
        {},
        authData,
        {
            method: 'POST',
            body: JSON.stringify(data),
            credentials: 'include'
        },
        opts_
    );

    opts.headers['X-Signature'] = generateSignature('POST', url);

    return fetch(`${config.api}/${url}`, opts).then(res => {
        if (!res.ok) {
            return Promise.reject(new Error(res.statusText));
        }

        return res.json();
    });
}

/**
 * Put a ressource to the API
 * @param  {String} url   The base URL
 * @param  {Object} data  The data object
 * @param  {Object} opts_ Options to pass to fetch (headers, body and method are already there)
 * @return {Promise} The result as JSON
 */
export function put(url, data, opts_) {
    const opts = Object.assign(
        {},
        authData,
        {
            method: 'PUT',
            body: JSON.stringify(data),
            credentials: 'include'
        },
        opts_
    );

    opts.headers['X-Signature'] = generateSignature('PUT', url);

    return fetch(`${config.api}/${url}`, opts).then(res => {
        if (!res.ok) {
            return Promise.reject(new Error(res.statusText));
        }

        return res.json();
    });
}

/**
 * Delete a ressource from the API
 * @param  {String} url   The base URL
 * @param  {Object} opts_ Options to pass to fetch (headers are already there)
 * @return {Promise} The result as JSON
 */
export function del(url, opts_) {
    const opts = Object.assign(
        {},
        authData,
        {
            method: 'DELETE',
            credentials: 'include'
        },
        opts_
    );

    opts.headers['X-Signature'] = generateSignature('DELETE', url);

    return fetch(`${config.api}/${url}`, opts).then(res => {
        if (!res.ok) {
            return Promise.reject(new Error(res.statusText));
        }

        return res.json();
    });
}

/**
 * Download a ressource from the API
 * @param  {String} url   The base URL
 * @param  {Object} opts_ Options to pass to fetch (headers are already there)
 * @return {Promise} The result as blob
 */
export function download(url, opts_) {
    const opts = Object.assign(
        {},
        authData,
        {
            method: 'GET',
            credentials: 'include'
        },
        opts_
    );

    opts.headers['X-Signature'] = generateSignature('GET', url);

    return fetch(`${config.api}/${url}`, opts).then(res => {
        if (!res.ok) {
            return Promise.reject(new Error('Download failed'));
        }

        return res.blob();
    });
}
