const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Blog = sequelize.define("Blog", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  blog_image: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  content: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  status: {
    type: DataTypes.ENUM("active", "inactive"),
    defaultValue: "active",
  },
}, {
  timestamps: true,
});

module.exports = Blog;
