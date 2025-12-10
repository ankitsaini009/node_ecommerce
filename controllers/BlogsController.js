const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("connect-flash");
module.exports = {

  blogs: (req, res) => {
    res.render("admin/blogs");
  },
}