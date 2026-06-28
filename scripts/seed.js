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
    await sequelize.sync({ alter: true });
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
      { name: 'Brake Pad', category: 'Braking', description: 'High-friction brake pad for cars and trucks.', price: 1250.00, quantity: 120 },
      { name: 'Oil Filter', category: 'Engine', description: 'Replacement oil filter for most standard engines.', price: 799.00, quantity: 220 },
      { name: 'Air Filter', category: 'Engine', description: 'Premium air filter for better airflow and protection.', price: 1500.00, quantity: 180 },
      { name: 'Spark Plug', category: 'Ignition', description: 'Long-life spark plug for efficient combustion.', price: 550.00, quantity: 300 },
      { name: 'Drive Belt', category: 'Accessories', description: 'Durable drive belt for alternator and power-steering systems.', price: 2200.00, quantity: 95 }
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
