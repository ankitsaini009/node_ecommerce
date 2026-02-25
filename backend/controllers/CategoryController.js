const Category = require("../models/Category");

module.exports = {
  // List all categories
  categories: async (req, res) => {
    try {
      const categories = await Category.findAll({
        order: [["createdAt", "DESC"]],
      });

      res.render("admin/categories/list", {
        categories,
        message: req.flash("success"),
        error: req.flash("error"),
      });
    } catch (err) {
      console.error(err);
      req.flash("error", "Error loading categories");
      res.redirect("/admin/dashboard");
    }
  },

  // Show add category form
  category_add: (req, res) => {
    res.render("admin/categories/add", {
      message: req.flash("success"),
      error: req.flash("error"),
    });
  },

  // Handle add category
  category_add_submit: async (req, res) => {
    try {
      const { name, slug, description, status, meta_title, meta_description } = req.body;

      let image = null;
      if (req.file) {
        image = req.file.filename;
      }

      await Category.create({
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
        description,
        image,
        status,
        meta_title,
        meta_description,
      });

      req.flash("success", "Category added successfully");
      res.redirect("/admin/categories");
    } catch (err) {
      console.error(err);
      req.flash("error", "Error adding category");
      res.redirect("/admin/categories-add");
    }
  },

  // Show edit category form
  category_edit: async (req, res) => {
    try {
      const category = await Category.findByPk(req.params.id);

      if (!category) {
        req.flash("error", "Category not found");
        return res.redirect("/admin/categories");
      }

      res.render("admin/categories/edit", {
        category,
        message: req.flash("success"),
        error: req.flash("error"),
      });
    } catch (err) {
      console.error(err);
      req.flash("error", "Error loading category");
      res.redirect("/admin/categories");
    }
  },

  // Handle edit category
  category_edit_submit: async (req, res) => {
    try {
      const { name, slug, description, status, meta_title, meta_description } = req.body;

      const category = await Category.findByPk(req.params.id);

      if (!category) {
        req.flash("error", "Category not found");
        return res.redirect("/admin/categories");
      }

      let updateData = {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
        description,
        status,
        meta_title,
        meta_description,
      };

      if (req.file) {
        updateData.image = req.file.filename;
      }

      await category.update(updateData);

      req.flash("success", "Category updated successfully");
      res.redirect("/admin/categories");
    } catch (err) {
      console.error(err);
      req.flash("error", "Error updating category");
      res.redirect("/admin/categories-edit/" + req.params.id);
    }
  },

  // Delete category
  category_delete: async (req, res) => {
    try {
      const category = await Category.findByPk(req.params.id);

      if (!category) {
        req.flash("error", "Category not found");
        return res.redirect("/admin/categories");
      }

      await category.destroy();

      req.flash("success", "Category deleted successfully");
      res.redirect("/admin/categories");
    } catch (err) {
      console.error(err);
      req.flash("error", "Error deleting category");
      res.redirect("/admin/categories");
    }
  },
};
