const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Category = require("./Category");

const SubCategory = sequelize.define("SubCategory", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id'
    }
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  status: {
    type: DataTypes.ENUM("active", "inactive"),
    defaultValue: "active",
  },

  meta_title: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  meta_description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'sub_categories',
});

// Define Relationship
SubCategory.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category'
});

Category.hasMany(SubCategory, {
  foreignKey: 'category_id',
  as: 'subcategories'
});

module.exports = SubCategory;
