var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var cors = require("cors");
var { init } = require("./db.js");

init();

var app = express();
app.use(cors());
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const kycRouter = require("./routes/kyc");
const educationRouter = require("./routes/education");
const addressRouter = require("./routes/address");
const accountDetailsRouter = require("./routes/accountDetails");
const adminRouter = require("./routes/admin");
const userRouter = require("./routes/user");
const managerRouter = require("./routes/manager");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.get("/test", (req, res) => {
  return res.send("Working fine.");
});
app.use("/kyc", kycRouter);
app.use("/admin", adminRouter);
app.use("/user", userRouter);
app.use("/education", educationRouter);
app.use("/address", addressRouter);
app.use("/accountDetails", accountDetailsRouter);
app.use("/manager", managerRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
