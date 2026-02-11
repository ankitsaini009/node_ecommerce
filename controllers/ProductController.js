const Product = require("../models/Product");
const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");
const ProductVariant = require("../models/ProductVariant");
const ProductGallery = require("../models/ProductGallery");
const { Op } = require("sequelize");

module.exports = {
  // List all products with variants
  products: async (req, res) => {
    try {
      const products = await Product.findAll({
        include: [
          { model: Category, as: 'category', attributes: ['id', 'name'] },
          { model: SubCategory, as: 'subcategory', attributes: ['id', 'name'] },
          { model: ProductVariant, as: 'variants', attributes: ['id', 'variant_name', 'size', 'color', 'variant_stock'] }
        ],
        order: [["createdAt", "DESC"]],
      });

      res.render("admin/products/list", {
        products,
        message: req.flash("success"),
        error: req.flash("error"),
      });
    } catch (err) {
      console.error(err);
      req.flash("error", "Error loading products");
      res.redirect("/admin/dashboard");
    }
  },

  // Show add product form
  product_add: async (req, res) => {
    try {
      const categories = await Category.findAll({
        where: { status: 'active' },
        order: [["name", "ASC"]],
      });

      res.render("admin/products/add", {
        categories,
        message: req.flash("success"),
        error: req.flash("error"),
      });
    } catch (err) {
      console.error(err);
      req.flash("error", "Error loading form");
      res.redirect("/admin/products");
    }
  },

  // Handle add product
  product_add_submit: async (req, res) => {
    try {
      const {
        name, slug, description, short_description, category_id, subcategory_id,
        price, cost_price, discount, discount_type, sku, stock, status, featured,
        meta_title, meta_description, meta_keywords
      } = req.body;

      let image = null;
      if (req.file) {
        image = req.file.filename;
      }

      await Product.create({
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
        description,
        short_description,
        category_id,
        subcategory_id: subcategory_id || null,
        price,
        cost_price,
        discount: discount || 0,
        discount_type,
        sku,
        stock,
        image,
        status,
        featured: featured === "on" ? true : false,
        meta_title,
        meta_description,
        meta_keywords,
      });

      req.flash("success", "Product added successfully");
      res.redirect("/admin/products");
    } catch (err) {
      console.error(err);
      req.flash("error", "Error adding product");
      res.redirect("/admin/products-add");
    }
  },

  // Show edit product form
  product_edit: async (req, res) => {
    try {
      const product = await Product.findByPk(req.params.id, {
        include: [
          { model: ProductVariant, as: 'variants' },
          { model: ProductGallery, as: 'galleries' }
        ]
      });

      const categories = await Category.findAll({
        where: { status: 'active' },
        order: [["name", "ASC"]],
      });

      if (!product) {
        req.flash("error", "Product not found");
        return res.redirect("/admin/products");
      }

      res.render("admin/products/edit", {
        product,
        categories,
        message: req.flash("success"),
        error: req.flash("error"),
      });
    } catch (err) {
      console.error(err);
      req.flash("error", "Error loading product");
      res.redirect("/admin/products");
    }
  },

  // Handle edit product
  product_edit_submit: async (req, res) => {
    try {
      const {
        name, slug, description, short_description, category_id, subcategory_id,
        price, cost_price, discount, discount_type, sku, stock, status, featured,
        meta_title, meta_description, meta_keywords
      } = req.body;

      const product = await Product.findByPk(req.params.id);

      if (!product) {
        req.flash("error", "Product not found");
        return res.redirect("/admin/products");
      }

      let updateData = {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
        description,
        short_description,
        category_id,
        subcategory_id: subcategory_id || null,
        price,
        cost_price,
        discount: discount || 0,
        discount_type,
        sku,
        stock,
        status,
        featured: featured === "on" ? true : false,
        meta_title,
        meta_description,
        meta_keywords,
      };

      if (req.file) {
        updateData.image = req.file.filename;
      }

      await product.update(updateData);

      req.flash("success", "Product updated successfully");
      res.redirect("/admin/products");
    } catch (err) {
      console.error(err);
      req.flash("error", "Error updating product");
      res.redirect("/admin/products-edit/" + req.params.id);
    }
  },

  // Delete product
  product_delete: async (req, res) => {
    try {
      const product = await Product.findByPk(req.params.id);

      if (!product) {
        req.flash("error", "Product not found");
        return res.redirect("/admin/products");
      }

      await product.destroy();

      req.flash("success", "Product deleted successfully");
      res.redirect("/admin/products");
    } catch (err) {
      console.error(err);
      req.flash("error", "Error deleting product");
      res.redirect("/admin/products");
    }
  },

  // Add product variant
  add_variant: async (req, res) => {
    try {
      const { product_id, variant_name, size, color, color_code, material, variant_sku, variant_price, variant_cost_price, variant_stock, status } = req.body;

      let variant_image = null;
      if (req.file) {
        variant_image = req.file.filename;
      }

      await ProductVariant.create({
        product_id,
        variant_name,
        size,
        color,
        color_code,
        material,
        variant_sku,
        variant_price: variant_price || null,
        variant_cost_price: variant_cost_price || null,
        variant_stock: variant_stock || 0,
        variant_image,
        status
      });

      req.flash("success", "Variant added successfully");
      res.redirect("/admin/products-edit/" + product_id);
    } catch (err) {
      console.error(err);
      req.flash("error", "Error adding variant");
      res.redirect("/admin/products-edit/" + req.body.product_id);
    }
  },

  // Edit variant
  edit_variant: async (req, res) => {
    try {
      const { variant_id, variant_name, size, color, color_code, material, variant_sku, variant_price, variant_cost_price, variant_stock, status } = req.body;

      const variant = await ProductVariant.findByPk(variant_id);

      if (!variant) {
        req.flash("error", "Variant not found");
        return res.redirect("back");
      }

      let updateData = {
        variant_name,
        size,
        color,
        color_code,
        material,
        variant_sku,
        variant_price: variant_price || null,
        variant_cost_price: variant_cost_price || null,
        variant_stock: variant_stock || 0,
        status
      };

      if (req.file) {
        updateData.variant_image = req.file.filename;
      }

      await variant.update(updateData);

      req.flash("success", "Variant updated successfully");
      res.redirect("/admin/products-edit/" + variant.product_id);
    } catch (err) {
      console.error(err);
      req.flash("error", "Error updating variant");
      res.redirect("back");
    }
  },

  // Delete variant
  delete_variant: async (req, res) => {
    try {
      const variant = await ProductVariant.findByPk(req.params.variant_id);

      if (!variant) {
        req.flash("error", "Variant not found");
        return res.redirect("back");
      }

      const productId = variant.product_id;
      await variant.destroy();

      req.flash("success", "Variant deleted successfully");
      res.redirect("/admin/products-edit/" + productId);
    } catch (err) {
      console.error(err);
      req.flash("error", "Error deleting variant");
      res.redirect("back");
    }
  },

  // Add gallery image
  add_gallery: async (req, res) => {
    try {
      const { product_id, alt_text, position } = req.body;

      if (!req.file) {
        req.flash("error", "Image is required");
        return res.redirect("/admin/products-edit/" + product_id);
      }

      await ProductGallery.create({
        product_id,
        image: req.file.filename,
        alt_text,
        position: position || 0
      });

      req.flash("success", "Gallery image added successfully");
      res.redirect("/admin/products-edit/" + product_id);
    } catch (err) {
      console.error(err);
      req.flash("error", "Error adding gallery image");
      res.redirect("/admin/products-edit/" + req.body.product_id);
    }
  },

  // Delete gallery image
  delete_gallery: async (req, res) => {
    try {
      const gallery = await ProductGallery.findByPk(req.params.gallery_id);

      if (!gallery) {
        req.flash("error", "Gallery image not found");
        return res.redirect("back");
      }

      const productId = gallery.product_id;
      await gallery.destroy();

      req.flash("success", "Gallery image deleted successfully");
      res.redirect("/admin/products-edit/" + productId);
    } catch (err) {
      console.error(err);
      req.flash("error", "Error deleting gallery image");
      res.redirect("back");
    }
  },

  // Get subcategories by category
  get_subcategories: async (req, res) => {
    try {
      const subcategories = await SubCategory.findAll({
        where: { category_id: req.params.category_id },
        order: [["name", "ASC"]],
      });

      res.json(subcategories);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error loading subcategories" });
    }
  },

  products_variants: async (req, res) => {
    try {
      const product = await Product.findByPk(req.params.id, {
        include: [
          { model: Category, as: 'category', attributes: ['id', 'name'] },
          { model: SubCategory, as: 'subcategory', attributes: ['id', 'name'] },
          { model: ProductVariant, as: 'variants', attributes: ['id', 'variant_name', 'size', 'color', 'variant_stock', 'variant_sku', 'variant_price', 'variant_cost_price', 'status', 'color_code'] },
          { model: ProductGallery, as: 'galleries' }
        ]
      });

      if (!product) {
        req.flash("error", "Product not found");
        return res.redirect("/admin/products");
      }

      res.render("admin/products/variants", {
        product,
        message: req.flash("success"),
        error: req.flash("error"),
      });
    } catch (err) {
      console.error(err);
      req.flash("error", "Error loading product variants");
      res.redirect("/admin/products");
    }
  }

};
