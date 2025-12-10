const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");
const adminController = require("../controllers/adminController");
const BlogsController = require("../controllers/BlogsController");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

// Login Page
router.get("/login", adminController.loginPage);
// Login Submit
router.post("/loginsubmit", adminController.login);

// Dashboard (protected route)
router.get("/dashboard", auth, adminController.dashboard);

router.get("/blogs", auth, BlogsController.blogs);
router.get("/blogs-add", auth, BlogsController.blogs_add);
router.post("/blogs-add", auth, upload.single("blog_image"), BlogsController.blogs_add_submit);

router.get("/admin-profile", auth, adminController.admin_profile);
router.get("/logout", auth, adminController.logout);
router.post(
  "/profile/update",
  auth,
  upload.single("profile_image"),
  adminController.update_profile
);

module.exports = router;
