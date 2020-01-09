import { reducer } from '../reducer';

const state = {
    isFetching: false,
    error: null,
    userInfos: {
        firstName: '',
        lastName: '',
        mail: '',
        ticketNumber: '',
        physicalId: ''
    }
};

describe('SET_IS_FETCHING()', () => {
    describe('given an empty state', () => {
        reducer.SET_IS_FETCHING(state, true);

        it('updated the state', () => {
            expect(state.isFetching).toBe(true);
        });
    });
});

describe('SET_ERROR()', () => {
    describe('given an empty state', () => {
        reducer.SET_ERROR(state, new Error());

        it('updated the state', () => {
            expect(state.error).toBeInstanceOf(Error);
        });
    });
});

describe('SET_STEP()', () => {
    describe('given an empty state', () => {
        reducer.SET_STEP(state, 'card');

        it('updated the state', () => {
            expect(state.step).toBe('card');
        });
    });
});

describe('SET_FIRST_NAME()', () => {
    describe('given an empty state', () => {
        reducer.SET_FIRST_NAME(state, 'John');

        it('updated the state', () => {
            expect(state.userInfos.firstName).toBe('John');
        });
    });
});

describe('SET_LAST_NAME()', () => {
    describe('given an empty state', () => {
        reducer.SET_LAST_NAME(state, 'Doe');

        it('updated the state', () => {
            expect(state.userInfos.lastName).toBe('Doe');
        });
    });
});

describe('SET_MAIL()', () => {
    describe('given an empty state', () => {
        reducer.SET_MAIL(state, 'john@doe.com');

        it('updated the state', () => {
            expect(state.userInfos.mail).toBe('john@doe.com');
        });
    });
});

describe('SET_PASSWORD()', () => {
    describe('given an empty state', () => {
        reducer.SET_PASSWORD(state, 'Hello123');

        it('updated the state', () => {
            expect(state.userInfos.password).toBe('Hello123');
        });
    });
});

describe('SET_TICKET_NUMBER()', () => {
    describe('given an empty state', () => {
        reducer.SET_TICKET_NUMBER(state, 'T123');

        it('updated the state', () => {
            expect(state.userInfos.ticketNumber).toBe('T123');
        });
    });
});

describe('SET_PHYSICAL_ID()', () => {
    describe('given an empty state', () => {
        reducer.SET_PHYSICAL_ID(state, 'P123');

        it('updated the state', () => {
            expect(state.userInfos.physicalId).toBe('P123');
        });
    });
});
