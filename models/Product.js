const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Category = require("./Category");
const SubCategory = require("./SubCategory");

const Product = sequelize.define("Product", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  short_description: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id'
    }
  },

  subcategory_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'sub_categories',
      key: 'id'
    }
  },

  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },

  cost_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },

  discount: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },

  discount_type: {
    type: DataTypes.ENUM("fixed", "percent"),
    defaultValue: "fixed",
  },

  sku: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true,
  },

  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },

  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  gallery: {
    type: DataTypes.JSON,
    defaultValue: [],
  },

  status: {
    type: DataTypes.ENUM("active", "inactive"),
    defaultValue: "active",
  },

  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  meta_title: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  meta_description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  meta_keywords: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'products',
});

Product.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category'
});

Product.belongsTo(SubCategory, {
  foreignKey: 'subcategory_id',
  as: 'subcategory'
});

module.exports = Product;
