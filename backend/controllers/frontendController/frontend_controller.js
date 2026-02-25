const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("connect-flash");

module.exports = {
  // Render Login Page

  home: (req, res) => {
    res.render("frontend/index");
  },
};
