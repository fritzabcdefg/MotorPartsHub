require('dotenv').config();
const sequelize = require('../models/database');
const Part = require('../models/Part');
const { DataTypes } = require('sequelize');

// Define User model locally to match the server definition
const User = sequelize.define('User', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  active: { type: DataTypes.BOOLEAN, defaultValue: true },
  role: { type: DataTypes.STRING, defaultValue: 'user' },
  token: { type: DataTypes.STRING, allowNull: true }
});

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('DB connected — seeding data...');

    // Seed users (idempotent with findOrCreate)
    const users = [
      { name: 'Alice', email: 'alice@example.com', password: 'alicepass', role: 'admin' },
      { name: 'Bob', email: 'bob@example.com', password: 'bobpass' }
    ];

    for (const u of users) {
      const [user, created] = await User.findOrCreate({ where: { email: u.email }, defaults: u });
      console.log(`${created ? 'Created' : 'Exists'} user: ${user.email}`);
    }

    // Seed parts
    const parts = [
      { name: 'Brake Pad', price: 12.5 },
      { name: 'Oil Filter', price: 7.99 },
      { name: 'Air Filter', price: 15.0 }
    ];

    for (const p of parts) {
      const [part, created] = await Part.findOrCreate({ where: { name: p.name }, defaults: p });
      console.log(`${created ? 'Created' : 'Exists'} part: ${part.name}`);
    }

    console.log('Seeding complete.');
    await sequelize.close();
  } catch (e) {
    console.error('Seeding failed:', e.message);
    process.exitCode = 1;
  }
}

if (require.main === module) seed();
