const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Product = require("./Product");

const ProductGallery = sequelize.define("ProductGallery", {
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },

  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  alt_text: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  position: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },

  status: {
    type: DataTypes.ENUM("active", "inactive"),
    defaultValue: "active",
  },
}, {
  timestamps: true,
  tableName: 'product_galleries',
});

ProductGallery.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product'
});

Product.hasMany(ProductGallery, {
  foreignKey: 'product_id',
  as: 'galleries'
});

module.exports = ProductGallery;
