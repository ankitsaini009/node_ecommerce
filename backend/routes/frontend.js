const express = require("express");
const router = express.Router();
const frontend_controller = require("../controllers/frontendController/frontend_controller");

// Add your frontend routes here

router.get("/", frontend_controller.home);

module.exports = router;
