const fs            = require('fs');
const bookshelf     = require('../src/lib/bookshelf');
const { addDevice } = require('./addDevice');

const {
    Article,
    Category,
    Point,
    Wiket,
    Fundation,
    Price,
    Device,
    Period,
    Group
} = bookshelf.models;

const instances = {
    devices: {},
    wickets: {},
    articles: {},
    categories: {},
    fundations: {},
    points: {},
    prices: {}
};

async function fetchOrCreate(Model, body, related) {
    const tableName = Model.prototype.tableName;
    let inst = null;

    if (!instances[tableName][JSON.stringify(body)]) {
        // Fetch article or create it
        inst = await Model.where(body)
            .fetch({ withRelated: (related || []) }); // todo: withRelated

        if (!inst) {
            console.log(`Creating ${tableName} ${body.name || JSON.stringify(body)}`);
            inst = await new Model(body).save();
            instances[tableName][body.name] = inst;
        }
    } else {
        inst = instances[tableName][body.name];
    }

    return inst;
}

async function createDevicePoints() {
    const data = fs.readFileSync('./devicePoints.csv', 'utf8')
        .split('\n')
        .map(line => line.split(','))
        .slice(1, -1);

        const period = (await Period.where({ name: 'Défaut' })
        .fetch())
        .toJSON();

    for (let line of data) {
        const deviceName = line[0];
        const password   = line[1];
        const pointName  = line[2];

        if (await Device.where({ name: deviceName}).fetch()) {
            continue;
        }
        const point = await fetchOrCreate(Point, { name: pointName  });
        const opts = {
            pointId: point.id,
            periodId: period.id,
            isUser: true,
            deviceName,
            password
        };

        try {
            await addDevice(opts);
        } catch(err) {
            // ignore when the device is already created
        }
    }
}

async function createPrices() {
    const data = fs.readFileSync('./prices.csv', 'utf8')
        .split('\n')
        .map(line => line.split(','))
        .slice(1, -1);

    const period = (await Period.where({ name: 'Défaut' })
        .fetch())
        .toJSON();

    const group = (await Group.where({ name: 'Défaut' })
        .fetch())
        .toJSON();

    for (let line of data) {
        const articleName      = line[0];
        const TVA              = line[1];
        const amount           = line[2];
        const categoryName     = line[3];
        const fundationsPoints = line[4]
            .split(';')
            .map(line => {
                let lineSplit = line.split(':');
                return {
                    fundation: lineSplit[0],
                    points: lineSplit.slice(1)
                }
            });

        const article  = await fetchOrCreate(Article, { name : articleName }, ['categories']);
        const category = await fetchOrCreate(Category, { name: categoryName });

        // Article - category relation
        let alreadyAttached = article
            .related('categories')
            .toJSON()
            .filter(category_ => category_.id === category.id).length > 0;

        if (!alreadyAttached) {
            await article.categories().attach(category);
        }

        for (let fundationPoints of fundationsPoints) {
            let fundationName = fundationPoints.fundation;
            const fundation   = await fetchOrCreate(Fundation, { name: fundationName });

            let points = [];
            // Points already created by `createDevicePoints`, fetch them
            for (let i = 0; i < fundationPoints.points.length; ++i) {
                points.push(await Point.where({ name: fundationPoints.points[i] }).fetch({ withRelated: 'categories' }));

                // Point - category relation
                alreadyAttached = points[i]
                    .related('categories')
                    .toJSON()
                    .filter(category_ => category_.id === category.id).length > 0;

                if (!alreadyAttached) {
                    await points[i].categories().attach({
                        point_id: points[i].id,
                        category_id: category.id,
                        active: true
                    });
                }
            }

            // const points = (await Promise.all(
            //     fundationPoints.points
            //         .map(pointName => Point.where({ name: pointName }).fetch())
            // ));

            // Attach category to point if not already done

            // Create prices
            let prices = [];
            for (let point of points) {
                let price = fetchOrCreate(Price, {
                    active: true,
                    amount,
                    article_id: article.id,
                    fundation_id: fundation.id,
                    group_id: group.id,
                    period_id: period.id,
                    point_id: point.id,
                    promotion_id: null
                });
                prices.push(price);
            }

            try {
                prices = await Promise.all(prices);
            } catch(err) {
                console.error(err);
            }
        }
    }
}

async function main() {
    try {
        await bookshelf.waitForDb(2, 15);
    } catch(err) {
        console.error(err);
        process.exit();
    }

    await createDevicePoints();
    await createPrices();
    console.log('Ok');
    process.exit(1);
}

main();
