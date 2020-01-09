exports.up = function(knex) {
    return knex.schema.table('events', t => {
        t.string('companyName')
            .notNullable()
            .defaultTo('Buckless');
        t.string('contactMail')
            .notNullable()
            .defaultTo('contact@buckless.com');
        t.string('companyAddress');
        t.string('companyPostal');
        t.string('companyCity');
        t.string('companyCountry');
        t.string('companyPhone');
        t.boolean('activateManager')
            .notNullable()
            .defaultTo(true);
        t.boolean('allowRegistration')
            .notNullable()
            .defaultTo(true);
        t.boolean('showInvoice')
            .notNullable()
            .defaultTo(false);
        t.boolean('allowCardLinking')
            .notNullable()
            .defaultTo(true);
        t.boolean('allowTicketLinking')
            .notNullable()
            .defaultTo(true);
        t.boolean('showQrCode')
            .notNullable()
            .defaultTo(true);
    });
};

exports.down = function(knex) {
    return knex.schema.table('events', t => {
        t.dropColumn('name');
        t.dropColumn('contactMail');
        t.dropColumn('companyAddress');
        t.dropColumn('companyPostal');
        t.dropColumn('companyCity');
        t.dropColumn('companyCountry');
        t.dropColumn('companyPhone');
        t.dropColumn('activateManager');
        t.dropColumn('allowRegistration');
        t.dropColumn('showInvoice');
        t.dropColumn('allowCardLinking');
        t.dropColumn('allowTicketLinking');
        t.dropColumn('showQrCode');
    });
};
