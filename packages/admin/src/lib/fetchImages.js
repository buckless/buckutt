import { images } from 'config/admin';
import memoize from 'lodash.memoize';

const headers = {
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
    }
};

/**
 * Get an image from the image API
 * @param  {String} id   The id of the image
 * @return {Promise} The result as JSON
 */

export const getImage = memoize(id => {
    const opts = Object.assign({}, headers, {
        method: 'GET'
    });

    return fetch(`${images}/image/${id}?size=100`, opts).then(res => {
        if (res.status !== 200) {
            return Promise.reject(res);
        }

        return res.json();
    });
});

/**
 * Post an image to the imageAPI
 * @param  {String} id   The id of the image
 * @param  {String} image  The base64 image
 * @return {Promise} The result as JSON
 */

export const postImage = (id, image) => {
    const opts = Object.assign({}, headers, {
        method: 'POST',
        body: JSON.stringify({ image })
    });

    return fetch(`${images}/image/${id}`, opts).then(res => {
        if (res.status !== 200) {
            return Promise.reject(res);
        }

        getImage.cache.delete(id);

        return res.json();
    });
};
