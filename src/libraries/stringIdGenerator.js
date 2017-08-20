const randomstring = require("randomstring");
const Promise = require('bluebird');
const models = require('../models');

module.exports = function (model, field, createPromise) {
  let dbModel = model;
  if (typeof model === 'string') {
    dbModel = models[model];
  }

  let idDuplicateError = new Error('Identifier in use.');
  let length = model.attributes[field].type._length;

  let checkPromise = (id, transaction) => {
    let whereConditions = {};
    whereConditions[field] = { $eq: id };

    var options = {};
    options.logging = false;
    options.where = whereConditions;
    options.transaction = transaction;

    return dbModel.findOne(options)
      .then((result) => {
        if (result) {
          throw idDuplicateError;
        }
        return Promise.resolve();
      });
  };

  let generateAndCheckPromise = () => {
    let identifier = randomstring.generate(length);

    var options = {};
    options.logging = false;
    return models.sequelize
      .transaction(options, (transaction) => {
        return checkPromise(identifier, transaction)
          .then(() => {
            return createPromise(identifier, transaction);
          })
          .catch((err) => {
            if (err !== idDuplicateError) {
              throw err;
            }
            return generateAndCheckPromise();
          });
      });
  };

  return generateAndCheckPromise();
};
