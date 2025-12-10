const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("connect-flash");
const Blog = require("../models/Blog");

module.exports = {
  blogs: (req, res) => {
    res.render("admin/blogs");
  },

  blogs_add: (req, res) => {
    res.render("admin/blogs/blogs_add");
  },

  blogs_add_submit: async (req, res) => {
    try {
      const { title, content, description } = req.body;
      const blogImage = req.file ? req.file.filename : null;
      await Blog.create({
        title,
        content,
        description,
        image: blogImage,
      });
      req.flash("success", "Blog added successfully");
      res.redirect("/admin/blogs");
    } catch (error) {
      console.error("Error adding blog:", error);
      req.flash("error", "There was an error adding the blog");
      res.redirect("/admin/blogs-add");
    }
  },
};
