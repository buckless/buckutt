jest.mock('../../router', () => ({
    router: jest.fn()
}));

import { getBaseUrl } from '../index';

describe('getBaseUrl()', () => {
    describe('given a single slash', () => {
        const baseUrl = getBaseUrl({ BASE_URL: '/' });

        it('returns a valid axios base url', () => {
            expect(baseUrl).toBe('/');
        });
    });

    describe('given a domain ending with a trailing slash', () => {
        const baseUrl = getBaseUrl({ BASE_URL: 'http://localhost/' });

        it('returns a valid axios base url', () => {
            expect(baseUrl).toBe('http://localhost/');
        });
    });

    describe('given a domain ending without a trailing slash', () => {
        const baseUrl = getBaseUrl({ BASE_URL: 'http://localhost' });

        it('returns a valid axios base url', () => {
            expect(baseUrl).toBe('http://localhost/');
        });
    });
});
