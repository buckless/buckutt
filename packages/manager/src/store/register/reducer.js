export const initialState = {
    isFetching: false,
    error: null,
    step: 'user',
    userInfos: {
        firstName: '',
        lastName: '',
        password: '',
        mail: '',
        ticketNumber: '',
        physicalId: ''
    }
};

export const reducer = {
    SET_IS_FETCHING(state, isFetching) {
        state.isFetching = isFetching;
    },

    SET_ERROR(state, error) {
        state.error = error;
    },

    SET_STEP(state, step) {
        state.step = step;
    },

    SET_FIRST_NAME(state, firstName) {
        state.userInfos.firstName = firstName;
    },

    SET_LAST_NAME(state, lastName) {
        state.userInfos.lastName = lastName;
    },

    SET_MAIL(state, mail) {
        state.userInfos.mail = mail;
    },

    SET_PASSWORD(state, password) {
        state.userInfos.password = password;
    },

    SET_TICKET_NUMBER(state, ticketNumber) {
        state.userInfos.ticketNumber = ticketNumber;
    },

    SET_PHYSICAL_ID(state, physicalId) {
        state.userInfos.physicalId = physicalId;
    }
};
