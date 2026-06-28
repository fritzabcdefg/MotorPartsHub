require('dotenv').config();
const sequelize = require('../models/database');
const Part = require('../models/Part');

(async () => {
  try {
    console.log('Sequelize config:', {
      dialect: sequelize.getDialect(),
      host: sequelize.options.host,
      port: sequelize.options.port,
      database: sequelize.config ? sequelize.config.database : sequelize.options.database,
      user: sequelize.config ? sequelize.config.username : process.env.DB_USER
    });

    await sequelize.authenticate();
    console.log('Authenticated OK');

    console.log('Trying Part.findAll()');
    const parts = await Part.findAll();
    console.log('Parts count:', parts.length);

    console.log('Trying Part.create()');
    const p = await Part.create({ name: 'Direct Test Part', price: 4.5 });
    console.log('Created part id:', p.id);

    await sequelize.close();
  } catch (e) {
    console.error('Direct DB test failed:', e.stack || e.message);
    process.exitCode = 1;
  }
})();
