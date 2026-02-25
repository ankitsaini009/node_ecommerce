const SubCategory = require("../models/SubCategory");
const Category = require("../models/Category");

module.exports = {
  // List all subcategories
  subcategories: async (req, res) => {
    try {
      const subcategories = await SubCategory.findAll({
        include: [{
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }],
        order: [["createdAt", "DESC"]],
      });

      res.render("admin/subcategories/list", {
        subcategories,
        message: req.flash("success"),
        error: req.flash("error"),
      });
    } catch (err) {
      console.error(err);
      req.flash("error", "Error loading subcategories");
      res.redirect("/admin/dashboard");
    }
  },

  // Show add subcategory form
  subcategory_add: async (req, res) => {
    try {
      const categories = await Category.findAll({
        where: { status: 'active' },
        order: [["name", "ASC"]],
      });

      res.render("admin/subcategories/add", {
        categories,
        message: req.flash("success"),
        error: req.flash("error"),
      });
    } catch (err) {
      console.error(err);
      req.flash("error", "Error loading form");
      res.redirect("/admin/subcategories");
    }
  },

  // Handle add subcategory
  subcategory_add_submit: async (req, res) => {
    try {
      const { name, slug, category_id, description, status, meta_title, meta_description } = req.body;

      let image = null;
      if (req.file) {
        image = req.file.filename;
      }

      await SubCategory.create({
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
        category_id,
        description,
        image,
        status,
        meta_title,
        meta_description,
      });

      req.flash("success", "Subcategory added successfully");
      res.redirect("/admin/subcategories");
    } catch (err) {
      console.error(err);
      req.flash("error", "Error adding subcategory");
      res.redirect("/admin/subcategories-add");
    }
  },

  // Show edit subcategory form
  subcategory_edit: async (req, res) => {
    try {
      const subcategory = await SubCategory.findByPk(req.params.id);
      const categories = await Category.findAll({
        where: { status: 'active' },
        order: [["name", "ASC"]],
      });

      if (!subcategory) {
        req.flash("error", "Subcategory not found");
        return res.redirect("/admin/subcategories");
      }

      res.render("admin/subcategories/edit", {
        subcategory,
        categories,
        message: req.flash("success"),
        error: req.flash("error"),
      });
    } catch (err) {
      console.error(err);
      req.flash("error", "Error loading subcategory");
      res.redirect("/admin/subcategories");
    }
  },

  // Handle edit subcategory
  subcategory_edit_submit: async (req, res) => {
    try {
      const { name, slug, category_id, description, status, meta_title, meta_description } = req.body;

      const subcategory = await SubCategory.findByPk(req.params.id);

      if (!subcategory) {
        req.flash("error", "Subcategory not found");
        return res.redirect("/admin/subcategories");
      }

      let updateData = {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
        category_id,
        description,
        status,
        meta_title,
        meta_description,
      };

      if (req.file) {
        updateData.image = req.file.filename;
      }

      await subcategory.update(updateData);

      req.flash("success", "Subcategory updated successfully");
      res.redirect("/admin/subcategories");
    } catch (err) {
      console.error(err);
      req.flash("error", "Error updating subcategory");
      res.redirect("/admin/subcategories-edit/" + req.params.id);
    }
  },

  // Delete subcategory
  subcategory_delete: async (req, res) => {
    try {
      const subcategory = await SubCategory.findByPk(req.params.id);

      if (!subcategory) {
        req.flash("error", "Subcategory not found");
        return res.redirect("/admin/subcategories");
      }

      await subcategory.destroy();

      req.flash("success", "Subcategory deleted successfully");
      res.redirect("/admin/subcategories");
    } catch (err) {
      console.error(err);
      req.flash("error", "Error deleting subcategory");
      res.redirect("/admin/subcategories");
    }
  },
};
