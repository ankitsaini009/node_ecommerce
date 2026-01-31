const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");
const adminController = require("../controllers/adminController");
const BlogsController = require("../controllers/BlogsController");
const CategoryController = require("../controllers/CategoryController");
const SubCategoryController = require("../controllers/SubCategoryController");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

// Login Page
router.get("/login", adminController.loginPage);
// Login Submit
router.post("/loginsubmit", adminController.login);

// Dashboard (protected route)
router.get("/dashboard", auth, adminController.dashboard);

// Blog Routes
router.get("/blogs", auth, BlogsController.blogs);
router.get("/blogs-add", auth, BlogsController.blogs_add);
router.post("/blogs-add", auth, upload.single("blog_image"), BlogsController.blogs_add_submit);
router.get("/blogs-edit/:id", auth, BlogsController.blogs_edit);
router.post("/blogs-edit/:id", auth, upload.single("blog_image"), BlogsController.blogs_edit_submit);
router.get("/blogs-delete/:id", auth, BlogsController.blogs_delete);

// Site Setting Routes
router.get("/site-setting", auth, adminController.site_setting);
router.post("/site-setting", auth, upload.single("site_logo"), adminController.site_setting_update);

// Category Routes
router.get("/categories", auth, CategoryController.categories);
router.get("/categories-add", auth, CategoryController.category_add);
router.post("/categories-add", auth, upload.single("image"), CategoryController.category_add_submit);
router.get("/categories-edit/:id", auth, CategoryController.category_edit);
router.post("/categories-edit/:id", auth, upload.single("image"), CategoryController.category_edit_submit);
router.get("/categories-delete/:id", auth, CategoryController.category_delete);

// Sub Category Routes
router.get("/subcategories", auth, SubCategoryController.subcategories);
router.get("/subcategories-add", auth, SubCategoryController.subcategory_add);
router.post("/subcategories-add", auth, upload.single("image"), SubCategoryController.subcategory_add_submit);
router.get("/subcategories-edit/:id", auth, SubCategoryController.subcategory_edit);
router.post("/subcategories-edit/:id", auth, upload.single("image"), SubCategoryController.subcategory_edit_submit);
router.get("/subcategories-delete/:id", auth, SubCategoryController.subcategory_delete);

router.get("/admin-profile", auth, adminController.admin_profile);
router.get("/logout", auth, adminController.logout);
router.post(
  "/profile/update",
  auth,
  upload.single("profile_image"),
  adminController.update_profile
);

module.exports = router;
