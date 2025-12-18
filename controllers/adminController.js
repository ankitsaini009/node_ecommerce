const User = require("../models/User");
const siteSettings = require("../models/SiteSetting");
const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("connect-flash");
const { where } = require("sequelize");

module.exports = {
  // Render Login Page
  loginPage: (req, res) => {
    res.render("admin/login", { message: req.flash("error") });
  },

  // Handle Login
  login: async (req, res) => {
    // 1. Request body check
    console.log("Request Body:", req.body);

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      req.flash("error", "Invalid Email, User Not Found");
      return res.redirect("/admin/login");
    }

    let hashedPassword = user.password.replace(/^\$2y\$/, "$2b$");
    const match = await bcrypt.compare(password, hashedPassword);

    if (!match) {
      req.flash("error", "Invalid Email or Password");
      return res.redirect("/admin/login");
    }

    req.session.user = user;
    res.redirect("/admin/dashboard");
  },

  // Dashboard
  dashboard: (req, res) => {
    res.render("admin/index");
  },

  // logout
  logout: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.log("Session destroy error:", err);
      }
      res.redirect("/admin/login");
    });
  },

  // Admin profile
  admin_profile: async (req, res) => {
    try {
      const adminId = req.session.user.id;

      const admin = await User.findOne({
        where: { id: adminId, role: "admin" },
      });

      res.render("admin/admin-profile", { admin });
    } catch (err) {
      console.log(err);
      res.send("Error loading profile");
    }
  },

  update_profile: async (req, res) => {
    try {
      const adminId = req.session.user.id;

      const { name, email, password, confirm_password } = req.body;

      // Password check
      if (password && password !== confirm_password) {
        req.flash("error", "Passwords do not match");
        return res.redirect("/admin/admin-profile");
      }

      let updateData = {
        name,
        email,
      };

      // Password update
      if (password) {
        updateData.password = password;
      }

      // Image Upload handle
      if (req.file) {
        updateData.profile_img = req.file.filename;
      }

      await User.update(updateData, { where: { id: adminId } });
      const updatedAdmin = await User.findOne({ where: { id: adminId } });
      req.session.user = updatedAdmin;
      req.flash("success", "Profile updated successfully");
      res.redirect("/admin/admin-profile");
    } catch (err) {
      console.log(err);
      res.send("Error updating profile");
    }
  },

  site_setting: async (req, res) => {
    try {
      // Fetch current site settings from database or config file
      const siteSettingdata = await siteSettings.findOne({ where: { id: 1 } });

      res.render("admin/site-setting", { siteSettingdata, message: req.flash("success") });
    } catch (err) {
      console.log(err);
      res.send("Error loading site settings");
    }
  },

  site_setting_update: async (req, res) => {
    try {
      const {
        site_name,
        site_email,
        site_phone,
        site_address,
        facebook,
        instagram,
        twitter,
        youtube,
        meta_description,
        status
      } = req.body;

      // logo (multer)
      let site_logo = null;
      if (req.file) {
        site_logo = req.file.filename;
      }

      // find existing setting (single row)
      let setting = await SiteSetting.findOne();

      if (!setting) {
        // FIRST TIME CREATE
        await SiteSetting.create({
          site_name,
          site_email,
          site_phone,
          site_address,
          facebook,
          instagram,
          twitter,
          youtube,
          meta_description,
          status,
          site_logo
        });
      } else {
        // UPDATE
        await setting.update({
          site_name,
          site_email,
          site_phone,
          site_address,
          facebook,
          instagram,
          twitter,
          youtube,
          meta_description,
          status,
          ...(site_logo && { site_logo }) // update logo only if uploaded
        });
      }

      req.flash("success", "Site settings updated successfully");
      res.redirect("/admin/site-setting");

    } catch (err) {
      console.error(err);
      req.flash("error", "Something went wrong while updating site settings");
      res.redirect("/admin/site-setting");
    }
  }


};
