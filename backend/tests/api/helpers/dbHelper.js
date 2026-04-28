const db = require('../../../src/models');

async function resetDatabase() {
    await db.sequelize.query('SET CONSTRAINTS ALL DEFERRED');
    const tables = Object.values(db.sequelize.models).map(model => model.tableName);
    for (const table of tables) {
        await db.sequelize.query(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`);
    }
}

module.exports = { resetDatabase };