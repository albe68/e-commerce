const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const expressLayouts = require("express-ejs-layouts");
// DB connection
const db = require("./model/connection");
const userRouter = require("./routes/user");
const adminRouter = require("./routes/admin");
var session = require("express-session");
const app = express();
const ConnectMongoDBSession = require("connect-mongodb-session");
//var fileupload = require("express-fileupload");
var bodyParser = require('body-parser');
const mongoDbSesson = new ConnectMongoDBSession(session);
require('dotenv').config()
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(expressLayouts);
// app.use(logger("dev")); //route console is logged off
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));//change to static
app.use(express.static(path.join(__dirname, "public/admin-assets")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session
app.use(
  session({
    saveUninitialized: false,
    secret: "secretKeyIsSecret",
    resave: false,
    store: new mongoDbSesson({  
      uri: "mongodb://0.0.0.0:27017/store" ,
      collection: "session",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 10, // 10 days
    },
  })
);
//user and admin route
app.use("/", userRouter);
app.use("/admin", adminRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// app.use(auth.authInit);


// error handler
app.use(function (err, req, res, next) {
  res.locals.layout='blank-layout'
  
  
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;




