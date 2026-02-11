const Coupon = require("../models/Coupon");

module.exports = {
  // List all coupons
  coupons: async (req, res) => {
    try {
      const coupons = await Coupon.findAll({
        order: [["createdAt", "DESC"]],
      });

      res.render("admin/coupons/list", {
        coupons,
        message: req.flash("success"),
        error: req.flash("error"),
      });
    } catch (err) {
      console.error(err);
      req.flash("error", "Error loading coupons");
      res.redirect("/admin/dashboard");
    }
  },

  // Show add coupon form
  coupon_add: (req, res) => {
    res.render("admin/coupons/add", {
      message: req.flash("success"),
      error: req.flash("error"),
    });
  },

  // Handle add coupon
  coupon_add_submit: async (req, res) => {
    try {
      const {
        code, description, discount_type, discount_value, min_purchase,
        max_discount, usage_limit, per_user_limit, valid_from, valid_to, status
      } = req.body;

      // Check if code already exists
      const existingCoupon = await Coupon.findOne({ where: { code } });
      if (existingCoupon) {
        req.flash("error", "Coupon code already exists");
        return res.redirect("/admin/coupons-add");
      }

      await Coupon.create({
        code,
        description,
        discount_type,
        discount_value,
        min_purchase,
        max_discount: max_discount || null,
        usage_limit: usage_limit || null,
        per_user_limit,
        valid_from,
        valid_to,
        status,
      });

      req.flash("success", "Coupon added successfully");
      res.redirect("/admin/coupons");
    } catch (err) {
      console.error(err);
      req.flash("error", "Error adding coupon");
      res.redirect("/admin/coupons-add");
    }
  },

  // Show edit coupon form
  coupon_edit: async (req, res) => {
    try {
      const coupon = await Coupon.findByPk(req.params.id);

      if (!coupon) {
        req.flash("error", "Coupon not found");
        return res.redirect("/admin/coupons");
      }

      res.render("admin/coupons/edit", {
        coupon,
        message: req.flash("success"),
        error: req.flash("error"),
      });
    } catch (err) {
      console.error(err);
      req.flash("error", "Error loading coupon");
      res.redirect("/admin/coupons");
    }
  },

  // Handle edit coupon
  coupon_edit_submit: async (req, res) => {
    try {
      const {
        code, description, discount_type, discount_value, min_purchase,
        max_discount, usage_limit, per_user_limit, valid_from, valid_to, status
      } = req.body;

      const coupon = await Coupon.findByPk(req.params.id);

      if (!coupon) {
        req.flash("error", "Coupon not found");
        return res.redirect("/admin/coupons");
      }

      // Check if new code is unique (excluding current coupon)
      const existingCoupon = await Coupon.findOne({
        where: { code, id: { [require("sequelize").Op.ne]: req.params.id } }
      });
      if (existingCoupon) {
        req.flash("error", "Coupon code already exists");
        return res.redirect("/admin/coupons-edit/" + req.params.id);
      }

      await coupon.update({
        code,
        description,
        discount_type,
        discount_value,
        min_purchase,
        max_discount: max_discount || null,
        usage_limit: usage_limit || null,
        per_user_limit,
        valid_from,
        valid_to,
        status,
      });

      req.flash("success", "Coupon updated successfully");
      res.redirect("/admin/coupons");
    } catch (err) {
      console.error(err);
      req.flash("error", "Error updating coupon");
      res.redirect("/admin/coupons-edit/" + req.params.id);
    }
  },

  // Delete coupon
  coupon_delete: async (req, res) => {
    try {
      const coupon = await Coupon.findByPk(req.params.id);

      if (!coupon) {
        req.flash("error", "Coupon not found");
        return res.redirect("/admin/coupons");
      }

      await coupon.destroy();

      req.flash("success", "Coupon deleted successfully");
      res.redirect("/admin/coupons");
    } catch (err) {
      console.error(err);
      req.flash("error", "Error deleting coupon");
      res.redirect("/admin/coupons");
    }
  },
};
