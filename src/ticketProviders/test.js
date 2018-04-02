module.exports = (ticketOrMail) => {
    if (ticketOrMail === 'fail') {
        return Promise.resolve(null);
    }

    if (ticketOrMail.indexOf('@') > -1) {
        return Promise.resolve({
            firstname: 'Foo',
            lastname : 'Bar',
            mail     : ticketOrMail,
            credit   : 500,
            ticketId : '123123123'
        });
    }
    return Promise.resolve({
        firstname: 'Foo',
        lastname : 'Bar',
        mail     : 'foo@bar.com',
        credit   : 500,
        ticketId : ticketOrMail
    });
};
