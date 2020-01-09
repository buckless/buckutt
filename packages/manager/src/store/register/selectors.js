export const getIsFetching = state => state.isFetching;

export const getError = state => state.error;

export const getRegisterFormData = state => ({
    firstname: state.userInfos.firstName,
    lastname: state.userInfos.lastName,
    password: state.userInfos.password,
    mail: state.userInfos.mail,
    ticketNumber: state.userInfos.ticketNumber,
    physicalId: state.userInfos.physicalId
});

export const getRegisterState = state => state.step;
