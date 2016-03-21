import thinky from '../lib/thinky';

const type = thinky.type;

const Article = thinky.createModel('Article', {
    // Optional => not specified in bodies but generated by RethinkDB
    id         : type.string().optional(),
    name       : String,
    stock      : Number,
    // Alcohol amount (Alcool unit or just article maximum sells)
    alcohol    : type.number().default(0),
    // Optional VAT tax
    vat        : type.number().default(0),
    createdAt  : type.date().default(new Date()),
    editedAt   : Date,
    isRemoved  : type.boolean().default(false),
    // Force Thinky to show thoses additional fields that would be cut by enforce_extra
    Category_id: type.string().optional()
}, {
    enforce_missing: true,
    enforce_extra  : 'remove',
    enforce_type   : 'strict'
});

Article.pre('save', function (next) {
    this.editedAt = new Date();
    next();
});

Article.ensureIndex('name');
Article.ensureIndex('createdAt');
Article.ensureIndex('editedAt');

Article.associate = models => {
    models.Article.belongsTo(models.Category, 'category', 'Category_id', 'id');
    models.Article.hasAndBelongsToMany(models.Point, 'points', 'id', 'id');
    // n:n instead of 1:n to allow one set containing multiple times the same article
    models.Article.hasAndBelongsToMany(models.Set, 'sets', 'id', 'id');
    // n:n instead of 1:n to allow one promotion containing multiple times the same article
    models.Article.hasAndBelongsToMany(models.Promotion, 'promotions', 'id', 'id');
    models.Article.hasAndBelongsToMany(models.Purchase, 'purchases', 'id', 'id');
    models.Article.hasAndBelongsToMany(models.Price, 'prices', 'id', 'id');
};

export default Article;
