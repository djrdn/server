const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const fs = require("fs");
const cors = require("cors");

const app = express();
require("dotenv").config();

// Налаштування двигуна для перегляду
app.set("view engine", "pug");

// Підключення middleware
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Роздача статичних файлів з папки 'uploads'
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Підключення маршрутів
app.use("/api", require("./routes"));

// Створення каталогу 'uploads', якщо він не існує
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Обробка помилки 404
app.use(function (req, res, next) {
  next(createError(404));
});

// Обробка інших помилок
app.use(function (err, req, res, next) {
  // Перевірка режиму розробки
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Рендеринг сторінки помилки
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
