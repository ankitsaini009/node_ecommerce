const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Product = require("./Product");

const ProductAttribute = sequelize.define("ProductAttribute", {
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },

  attribute_type: {
    type: DataTypes.ENUM("size", "color", "material", "brand"),
    allowNull: false,
  },

  attribute_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  attribute_value: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,
  tableName: 'product_attributes',
});

ProductAttribute.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product'
});

module.exports = ProductAttribute;
