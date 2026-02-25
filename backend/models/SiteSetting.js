const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const SiteSetting = sequelize.define("SiteSetting", {
  site_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  site_logo: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  site_email: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  site_phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  site_address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  facebook: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  instagram: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  twitter: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  youtube: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  meta_description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  status: {
    type: DataTypes.ENUM("active", "inactive"),
    defaultValue: "active",
  },
});

module.exports = SiteSetting;
