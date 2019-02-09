import samplesize from 'lodash.samplesize';

export function randString(x) {
    const chars = 'abcdefghijklmnopqrstufwxyzABCDEFGHIJKLMNOPQRSTUFWXYZ1234567890';
    return samplesize(chars, x || 12).join('');
}
