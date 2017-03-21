const thinky = require('../lib/thinky');

const type = thinky.type;

const MeanOfLogin = thinky.createModel('MeanOfLogin', {
    // Optional => not specified in bodies but generated by RethinkDB
    id       : type.string().optional(),
    type     : String,
    // String or Number
    data     : type.any(),
    blocked  : type.boolean().default(false),
    createdAt: type.date().default(() => new Date()),
    editedAt : Date,
    isRemoved: type.boolean().default(false),
    // Force Thinky to show thoses additional fields that would be cut by enforce_extra
    User_id  : type.string().optional()
}, {
    enforce_missing: true,
    enforce_extra  : 'remove',
    enforce_type   : 'strict'
});

MeanOfLogin.pre('save', function preSave(next) {
    this.editedAt = new Date();
    next();
});

MeanOfLogin.ensureIndex('type');
MeanOfLogin.ensureIndex('createdAt');
MeanOfLogin.ensureIndex('editedAt');

MeanOfLogin.associate = (models) => {
    models.MeanOfLogin.belongsTo(models.User, 'user', 'User_id', 'id');
};

module.exports = MeanOfLogin;
