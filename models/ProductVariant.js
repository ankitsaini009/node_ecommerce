const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Product = require("./Product");

const ProductVariant = sequelize.define("ProductVariant", {
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },

  variant_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  // Size variant
  size: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  // Color variant
  color: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  color_code: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  // Material variant
  material: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  // SKU specific to variant
  variant_sku: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true,
  },

  // Price specific to variant
  variant_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },

  // Cost price specific to variant
  variant_cost_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },

  // Stock for this variant
  variant_stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },

  // Variant image
  variant_image: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  status: {
    type: DataTypes.ENUM("active", "inactive"),
    defaultValue: "active",
  },
}, {
  timestamps: true,
  tableName: 'product_variants',
});

ProductVariant.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product'
});

Product.hasMany(ProductVariant, {
  foreignKey: 'product_id',
  as: 'variants'
});

module.exports = ProductVariant;
