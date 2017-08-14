"use strict";

const fs        = require("fs");
const path      = require("path");
const Sequelize = require("sequelize");

var db = false;

if (!process.env.DB_NAME || !process.env.DB_USER || !process.env.DB_PASS || !process.env.DB_CONFIG) {
  module.exports = db;
  return;
}

db = {};
var sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  JSON.parse(process.env.DB_CONFIG)
);

fs
  .readdirSync(__dirname)
  .filter((file) => {
    return (file.indexOf(".") !== 0) && (file !== "index.js");
  })
  .forEach((file) => {
    var model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
