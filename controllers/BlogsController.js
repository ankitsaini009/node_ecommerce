const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("connect-flash");
const Blog = require("../models/Blog");

module.exports = {
  blogs: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const offset = (page - 1) * limit;

      const { count, rows } = await Blog.findAndCountAll({
        order: [["createdAt", "DESC"]],
        limit,
        offset,
      });

      const totalPages = Math.ceil(count / limit);

      res.render("admin/blogs/index", {
        blogs: rows,
        currentPage: page,
        totalPages,
        totalBlogs: count,
      });
    } catch (error) {
      console.error("Error fetching blogs:", error);
      res.render("admin/blogs/index", {
        blogs: [],
        success: [],
        error: ["Error loading blogs"],
        currentPage: 1,
        totalPages: 1,
        totalBlogs: 0,
      });
    }
  },

  blogs_add: (req, res) => {
    res.render("admin/blogs/blogs_form", { blog: null });
  },

  blogs_add_submit: async (req, res) => {
    try {
      const { title, content, status, } = req.body;
      const blogimage = req.file ? req.file.filename : null;

      await Blog.create({
        title,
        content,
        status,
        blog_image: blogimage,
      });
      req.flash("success", "Blog added successfully");
      res.redirect("/admin/blogs");
    } catch (error) {
      console.error("Error adding blog:", error);
      req.flash("error", "There was an error adding the blog");
      res.redirect("/admin/blogs-add");
    }
  },

  blogs_delete: async (req, res) => {
    try {
      const { id } = req.params;
      const blog = await Blog.findByPk(id);

      if (!blog) {
        req.flash("error", "Blog not found");
        return res.redirect("/admin/blogs");
      }

      await blog.destroy();
      req.flash("success", "Blog deleted successfully");
      res.redirect("/admin/blogs");
    } catch (error) {
      console.error("Error deleting blog:", error);
      req.flash("error", "There was an error deleting the blog");
      res.redirect("/admin/blogs");
    }
  },

  blogs_edit: async (req, res) => {
    try {
      const { id } = req.params;
      const blog = await Blog.findByPk(id);

      if (!blog) {
        req.flash("error", "Blog not found");
        return res.redirect("/admin/blogs");
      }

      res.render("admin/blogs/blogs_form", { blog });
    } catch (error) {
      console.error("Error fetching blog:", error);
      req.flash("error", "There was an error loading the blog");
      res.redirect("/admin/blogs");
    }
  },

  blogs_edit_submit: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, content, status } = req.body;
      const blog = await Blog.findByPk(id);

      if (!blog) {
        req.flash("error", "Blog not found");
        return res.redirect("/admin/blogs");
      }

      const updateData = {
        title,
        content,
        status,
      };

      // Only update image if a new file is uploaded
      if (req.file) {
        updateData.blog_image = req.file.filename;
      }

      await blog.update(updateData);
      req.flash("success", "Blog updated successfully");
      res.redirect("/admin/blogs");
    } catch (error) {
      console.error("Error updating blog:", error);
      req.flash("error", "There was an error updating the blog");
      res.redirect("/admin/blogs");
    }
  },
};

