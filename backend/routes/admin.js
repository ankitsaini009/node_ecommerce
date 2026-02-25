const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");
const adminController = require("../controllers/adminController");
const BlogsController = require("../controllers/BlogsController");
const CategoryController = require("../controllers/CategoryController");
const SubCategoryController = require("../controllers/SubCategoryController");
const ProductController = require("../controllers/ProductController");
const CouponController = require("../controllers/CouponController");
const BannerController = require("../controllers/BannerController");
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

// Product Routes
router.get("/products", auth, ProductController.products);
router.get("/products-add", auth, ProductController.product_add);
router.post("/products-add", auth, upload.single("image"), ProductController.product_add_submit);
router.get("/products-edit/:id", auth, ProductController.product_edit);
router.post("/products-edit/:id", auth, upload.single("image"), ProductController.product_edit_submit);
router.get("/products-delete/:id", auth, ProductController.product_delete);
router.get("/get-subcategories/:category_id", auth, ProductController.get_subcategories);

// Product Variants Routes
router.get("/my-variants/:id", auth, ProductController.products_variants);

router.post("/add-variant", auth, upload.single("image"), ProductController.add_variant);
router.post("/edit-variant", auth, upload.single("image"), ProductController.edit_variant);
router.get("/delete-variant/:variant_id", auth, ProductController.delete_variant);

// Product Gallery Routes
router.post("/add-gallery", auth, upload.single("image"), ProductController.add_gallery);
router.get("/delete-gallery/:gallery_id", auth, ProductController.delete_gallery);


// Coupon Routes
router.get("/coupons", auth, CouponController.coupons);
router.get("/coupons-add", auth, CouponController.coupon_add);
router.post("/coupons-add", auth, CouponController.coupon_add_submit);
router.get("/coupons-edit/:id", auth, CouponController.coupon_edit);
router.post("/coupons-edit/:id", auth, CouponController.coupon_edit_submit);
router.get("/coupons-delete/:id", auth, CouponController.coupon_delete);

// Banner Routes
router.get("/banners", auth, BannerController.banners);
router.get("/banners-add", auth, BannerController.banner_add);
router.post("/banners-add", auth, upload.single("image"), BannerController.banner_add_submit);
router.get("/banners-edit/:id", auth, BannerController.banner_edit);
router.post("/banners-edit/:id", auth, upload.single("image"), BannerController.banner_edit_submit);
router.get("/banners-delete/:id", auth, BannerController.banner_delete);

router.get("/admin-profile", auth, adminController.admin_profile);
router.get("/logout", auth, adminController.logout);
router.post(
  "/profile/update",
  auth,
  upload.single("profile_image"),
  adminController.update_profile
);

module.exports = router;
