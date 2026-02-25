const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Coupon = sequelize.define("Coupon", {
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  discount_type: {
    type: DataTypes.ENUM("fixed", "percent"),
    allowNull: false,
  },

  discount_value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },

  min_purchase: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },

  max_discount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },

  usage_limit: {
    type: DataTypes.INTEGER,
    defaultValue: null,
  },

  usage_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },

  per_user_limit: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },

  valid_from: {
    type: DataTypes.DATE,
    allowNull: false,
  },

  valid_to: {
    type: DataTypes.DATE,
    allowNull: false,
  },

  status: {
    type: DataTypes.ENUM("active", "inactive"),
    defaultValue: "active",
  },
}, {
  timestamps: true,
  tableName: 'coupons',
});

module.exports = Coupon;
