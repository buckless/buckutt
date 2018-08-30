import axios from '@/utils/axios';
import { memoize } from 'lodash/function';

const cachedGetImage = memoize((id, token) => {
    return axios
        .get(`${config.images}/image/${id}?width=100&height=100`, token)
        .then(res => {
            if (res.data && res.data.image) {
                if (!window.database || !window.database.setImage) {
                    return res.data.image;
                }

                return window.database
                    .setImage(id, res.data.image)
                    .then(() => console.log(res.data.image))
                    .then(() => res.data.image);
            }

            return Promise.reject();
        })
        .catch(err => {
            if (!window.database || !window.database.getImage) {
                return Promise.reject(err);
            }

            return window.database.getImage(id).then(image => image.blob);
        });
});

export const getImage = (store, id) => {
    const token = store.getters.tokenHeaders;

    return cachedGetImage(id, token);
};
