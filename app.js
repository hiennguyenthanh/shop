const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");
const path = require("path");
const isAuth = require("./middleware/is-auth");

const productRoute = require("./routes/product");
const shopRoute = require("./routes/shop");
const authRoute = require("./routes/auth");
const errorController = require("./controllers/error");
const adminRoute = require("./routes/admin");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const User = require("./models/user");

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.mwbdzpd.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`;

const app = express();

const csrfProtection = csrf();

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

// app.use(csrfProtection);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.use("/images", express.static(path.join(__dirname, "images"))); //to serve images
app.use(express.static(path.join(__dirname, "public")));
app.use(flash());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store,
  })
);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    next();
  } else {
    User.findById(req.session.user._id)
      .then((user) => {
        if (!user) {
          return next();
        }
        req.user = user;
        next();
      })
      .catch((err) => {
        console.log("error in app.js");
        throw new Error(err);
      });
  }
});

app.use("/", authRoute);
app.use("/product", isAuth, productRoute);
app.use("/admin", isAuth, adminRoute);
app.use("/shop", isAuth, shopRoute);
app.use(errorController.get404);

mongoose
  .connect(MONGODB_URI)
  .then((res) => {
    app.listen(process.env.PORT);
  })
  .catch((error) => {
    console.log(error);
  });
