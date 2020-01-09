jest.mock('../../../api', () => ({
    api: {
        post: jest.fn(),
        get: jest.fn()
    }
}));

jest.mock('../../../router', () => ({
    router: {
        push: jest.fn()
    }
}));

import { submitUserInfos, submitCardInfos, submitTicketInfos, register } from '../actions';

const commit = jest.fn();

const mail = 'john@doe.com';
const firstName = 'John';
const lastName = 'Doe';
const password = 'Hello123';

describe('submitUserInfos()', () => {
    describe('given user informations', () => {
        describe('when called', () => {
            submitUserInfos({ commit }, { mail, firstName, lastName, password });

            it('called all the mutations ', () => {
                expect(commit).toHaveBeenCalledWith('SET_STEP', 'card');
                expect(commit).toHaveBeenCalledWith('SET_MAIL', mail);
                expect(commit).toHaveBeenCalledWith('SET_FIRST_NAME', firstName);
                expect(commit).toHaveBeenCalledWith('SET_LAST_NAME', lastName);
                expect(commit).toHaveBeenCalledWith('SET_PASSWORD', password);
            });
        });
    });
});

describe('submitCardInfos()', () => {
    describe('given a physical id', () => {
        const physicalId = 'P01';

        describe('when called', () => {
            submitCardInfos({ commit }, { physicalId });

            it('called all the mutations ', () => {
                expect(commit).toHaveBeenCalledWith('SET_STEP', 'ticket');
                expect(commit).toHaveBeenCalledWith('SET_PHYSICAL_ID', physicalId);
            });
        });
    });
});

describe('submitTicketInfos()', () => {
    describe('given a tikcet number', () => {
        const ticketNumber = 'T01';

        describe('when called', () => {
            submitTicketInfos({ commit }, { ticketNumber });

            it('called all the mutations ', () => {
                expect(commit).toHaveBeenCalledWith('SET_TICKET_NUMBER', ticketNumber);
            });
        });
    });
});

describe('register()', () => {
    describe('when called', () => {
        const { api } = require('../../../api');

        api.post.mockImplementation(async () => ({
            data: {}
        }));

        const getters = {
            getRegisterFormData: {
                mail,
                firstname: firstName,
                lastname: lastName,
                password: password
            }
        };

        beforeAll(async () => {
            await register({ commit, getters });
        });

        it('called the post function with the correct parameters', async () => {
            expect(api.post).toHaveBeenCalledWith('auth/register', getters.getRegisterFormData);
        });

        it('called all the mutations', () => {
            expect(commit).toHaveBeenCalledWith('SET_IS_FETCHING', true);
            expect(commit).toHaveBeenCalledWith('SET_STEP', 'success');
            expect(commit).toHaveBeenCalledWith('SET_IS_FETCHING', false);
        });
    });
});
