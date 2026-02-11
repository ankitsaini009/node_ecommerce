const Banner = require("../models/Banner");

module.exports = {
  // List all banners
  banners: async (req, res) => {
    try {
      const banners = await Banner.findAll({
        order: [["position", "ASC"], ["createdAt", "DESC"]],
      });

      res.render("admin/banners/list", {
        banners,
        message: req.flash("success"),
        error: req.flash("error"),
      });
    } catch (err) {
      console.error(err);
      req.flash("error", "Error loading banners");
      res.redirect("/admin/dashboard");
    }
  },

  // Show add banner form
  banner_add: (req, res) => {
    res.render("admin/banners/add", {
      message: req.flash("success"),
      error: req.flash("error"),
    });
  },

  // Handle add banner
  banner_add_submit: async (req, res) => {
    try {
      const {
        title, description, link, type, position, button_text,
        start_date, end_date, status
      } = req.body;

      let image = null;
      if (req.file) {
        image = req.file.filename;
      } else {
        req.flash("error", "Banner image is required");
        return res.redirect("/admin/banners-add");
      }

      await Banner.create({
        title,
        description,
        image,
        link,
        type,
        position,
        button_text,
        start_date,
        end_date,
        status,
      });

      req.flash("success", "Banner added successfully");
      res.redirect("/admin/banners");
    } catch (err) {
      console.error(err);
      req.flash("error", "Error adding banner");
      res.redirect("/admin/banners-add");
    }
  },

  // Show edit banner form
  banner_edit: async (req, res) => {
    try {
      const banner = await Banner.findByPk(req.params.id);

      if (!banner) {
        req.flash("error", "Banner not found");
        return res.redirect("/admin/banners");
      }

      res.render("admin/banners/edit", {
        banner,
        message: req.flash("success"),
        error: req.flash("error"),
      });
    } catch (err) {
      console.error(err);
      req.flash("error", "Error loading banner");
      res.redirect("/admin/banners");
    }
  },

  // Handle edit banner
  banner_edit_submit: async (req, res) => {
    try {
      const {
        title, description, link, type, position, button_text,
        start_date, end_date, status
      } = req.body;

      const banner = await Banner.findByPk(req.params.id);

      if (!banner) {
        req.flash("error", "Banner not found");
        return res.redirect("/admin/banners");
      }

      let updateData = {
        title,
        description,
        link,
        type,
        position,
        button_text,
        start_date,
        end_date,
        status,
      };

      if (req.file) {
        updateData.image = req.file.filename;
      }

      await banner.update(updateData);

      req.flash("success", "Banner updated successfully");
      res.redirect("/admin/banners");
    } catch (err) {
      console.error(err);
      req.flash("error", "Error updating banner");
      res.redirect("/admin/banners-edit/" + req.params.id);
    }
  },

  // Delete banner
  banner_delete: async (req, res) => {
    try {
      const banner = await Banner.findByPk(req.params.id);

      if (!banner) {
        req.flash("error", "Banner not found");
        return res.redirect("/admin/banners");
      }

      await banner.destroy();

      req.flash("success", "Banner deleted successfully");
      res.redirect("/admin/banners");
    } catch (err) {
      console.error(err);
      req.flash("error", "Error deleting banner");
      res.redirect("/admin/banners");
    }
  },
};
