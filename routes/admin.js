const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");
const adminController = require("../controllers/adminController");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

// Login Page
router.get("/login", adminController.loginPage);
// Login Submit
router.post("/loginsubmit", adminController.login);

// Dashboard (protected route)
router.get("/dashboard", auth, adminController.dashboard);
router.get("/blogs", auth, adminController.blogs);

router.get("/admin-profile", auth, adminController.admin_profile);
router.get("/logout", auth, adminController.logout);
router.post(
  "/profile/update",
  auth,
  upload.single("profile_image"),
  adminController.update_profile
);

module.exports = router;
