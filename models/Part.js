const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Part = sequelize.define('Part', {
  name: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  price: { type: DataTypes.FLOAT, allowNull: false },
  quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
  images: { type: DataTypes.TEXT, allowNull: true }
});

module.exports = Part;
