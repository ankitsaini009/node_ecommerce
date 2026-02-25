const express = require("express");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const sequelize = require("./config/db");
const User = require("./models/User");
const SiteSetting = require("./models/SiteSetting");
const globalMW = require("./middleware/globally");
const NamedRouter = require("named-routes");
const namedRouter = new NamedRouter();

require("dotenv").config();
const app = express();

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));
app.use(
  session({
    secret: "cmssecret",
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(flash());
app.use(globalMW); // 👈 NOW globally available

// View Engine
app.set("view engine", "ejs");

// Test DB Connection
sequelize
  .authenticate()
  .then(() => console.log("MySQL Connected Successfully ✔"))
  .catch((err) => console.log("DB Error: " + err));

sequelize.sync().then(() => {
  console.log("All Models Synced Successfully ✔");
});

// ✔ Add this middleware here
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// Routes
const adminRoutes = require("./routes/admin");
const frontendRoutes = require("./routes/frontend");
const aiRoutes = require("./routes/api/ai");

app.use("/admin", adminRoutes);
app.use("/", frontendRoutes);
app.use("/api/ai", aiRoutes);

namedRouter.extendExpress(app);
namedRouter.registerAppHelpers(app);

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
