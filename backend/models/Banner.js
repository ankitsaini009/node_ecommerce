const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Banner = sequelize.define("Banner", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  link: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  type: {
    type: DataTypes.ENUM("home", "category", "product", "sale"),
    defaultValue: "home",
  },

  position: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },

  button_text: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  start_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  end_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  status: {
    type: DataTypes.ENUM("active", "inactive"),
    defaultValue: "active",
  },
}, {
  timestamps: true,
  tableName: 'banners',
});

module.exports = Banner;
