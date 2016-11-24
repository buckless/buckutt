const thinky = require('../lib/thinky');

const type = thinky.type;

const Category = thinky.createModel('Category', {
    // Optional => not specified in bodies but generated by RethinkDB
    id       : type.string().optional(),
    name     : String,
    priority : type.number().default(0),
    createdAt: type.date().default(new Date()),
    editedAt : Date,
    isRemoved: type.boolean().default(false)
}, {
    enforce_missing: true,
    enforce_extra  : 'remove',
    enforce_type   : 'strict'
});

Category.pre('save', function preSave(next) {
    this.editedAt = new Date();
    next();
});

Category.ensureIndex('name');
Category.ensureIndex('createdAt');
Category.ensureIndex('editedAt');

Category.associate = (models) => {
    models.Category.hasAndBelongsToMany(models.Article, 'articles', 'id', 'id');
    models.Category.hasAndBelongsToMany(models.Point, 'points', 'id', 'id');
};

module.exports = Category;
